import { getSupabaseClient, logSupabaseOperation } from "../lib/supabaseClient";

// Variable global para la configuración
let globalSupabaseConfig = null;

// Función para inicializar la configuración
export const initDatabase = (config) => {
  globalSupabaseConfig = config;
};

// Helper para obtener el cliente de Supabase
const getSupabase = () => {
  return getSupabaseClient(globalSupabaseConfig);
};

// Helper para verificar si Supabase está disponible
const isSupabaseConfigured = () => {
  return getSupabase() !== null;
};

// Clase para manejar operaciones de base de datos con fallback a localStorage
class DatabaseService {
  constructor() {
    this.localStoragePrefix = "focusLocus";
  }

  get supabase() {
    return getSupabase();
  }

  get useSupabase() {
    return isSupabaseConfigured();
  }

  // PROYECTOS
  async getProjects(userId = null) {
    if (this.useSupabase && userId) {
      try {
        const { data, error } = await this.supabase
          .from("projects")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: true });

        if (error) throw error;

        // Solo logear si hay proyectos o es la primera vez
        if (data.length > 0) {
          logSupabaseOperation(
            "getProjects",
            `${data.length} proyectos obtenidos`
          );
        }

        return data.map((project) => ({
          id: project.id,
          name: project.name,
          color: project.color,
          created_at: project.created_at,
          updated_at: project.updated_at,
        }));
      } catch (error) {
        logSupabaseOperation("getProjects", null, error);
        // Fallback a localStorage
        return this.getProjectsFromLocalStorage();
      }
    }

    // Modo offline o sin usuario
    return this.getProjectsFromLocalStorage();
  }

  async createProject(projectData, userId = null) {
    if (this.useSupabase && userId) {
      try {
        const { data, error } = await this.supabase
          .from("projects")
          .insert([
            {
              user_id: userId,
              name: projectData.name,
              color: projectData.color || "#6366f1",
            },
          ])
          .select()
          .single();

        if (error) throw error;

        logSupabaseOperation("createProject", `Proyecto "${data.name}" creado`);

        // También guardar en localStorage como backup
        this.saveProjectToLocalStorage({
          id: data.id,
          name: data.name,
          color: data.color,
        });

        return data;
      } catch (error) {
        logSupabaseOperation("createProject", null, error);
        // Fallback a localStorage
        return this.createProjectInLocalStorage(projectData);
      }
    }

    // Modo offline
    return this.createProjectInLocalStorage(projectData);
  }

  async updateProject(projectId, updates, userId = null) {
    if (this.useSupabase && userId) {
      try {
        const { data, error } = await this.supabase
          .from("projects")
          .update(updates)
          .eq("id", projectId)
          .eq("user_id", userId)
          .select()
          .single();

        if (error) throw error;

        logSupabaseOperation("updateProject", `Proyecto actualizado`);
        return data;
      } catch (error) {
        logSupabaseOperation("updateProject", null, error);
        // Fallback a localStorage
        return this.updateProjectInLocalStorage(projectId, updates);
      }
    }

    return this.updateProjectInLocalStorage(projectId, updates);
  }

  async deleteProject(projectId, userId = null) {
    if (this.useSupabase && userId) {
      try {
        const { error } = await this.supabase
          .from("projects")
          .delete()
          .eq("id", projectId)
          .eq("user_id", userId);

        if (error) throw error;

        logSupabaseOperation("deleteProject", `Proyecto eliminado`);

        // También eliminar de localStorage
        this.deleteProjectFromLocalStorage(projectId);

        return true;
      } catch (error) {
        logSupabaseOperation("deleteProject", null, error);
        return this.deleteProjectFromLocalStorage(projectId);
      }
    }

    return this.deleteProjectFromLocalStorage(projectId);
  }

  // TAREAS
  async getProjectTasks(projectId, userId = null) {
    if (this.useSupabase && userId) {
      try {
        const { data, error } = await this.supabase
          .from("tasks")
          .select("*")
          .eq("project_id", projectId)
          .eq("user_id", userId)
          .order("position", { ascending: true });

        if (error) throw error;

        // Agrupar tareas por estado
        const groupedTasks = {
          pendientes: [],
          enCurso: [],
          terminadas: [],
        };

        data.forEach((task) => {
          const formattedTask = {
            id: task.id,
            nombre: task.name,
            descripcion: task.description,
            expira: task.due_date,
            fechaHora: task.fecha_hora,
            prioridad: task.priority,
            position: task.position,
          };

          if (groupedTasks[task.status]) {
            groupedTasks[task.status].push(formattedTask);
          }
        });

        logSupabaseOperation(
          "getProjectTasks",
          `Tareas del proyecto obtenidas`
        );
        return groupedTasks;
      } catch (error) {
        logSupabaseOperation("getProjectTasks", null, error);
        return this.getProjectTasksFromLocalStorage(projectId);
      }
    }

    return this.getProjectTasksFromLocalStorage(projectId);
  }

  async createTask(taskData, userId = null) {
    if (this.useSupabase && userId) {
      try {
        // Limpiar valores de fecha - convertir strings vacíos a null
        const dueDateValue =
          taskData.expira && taskData.expira.trim() !== ""
            ? taskData.expira
            : null;
        const fechaHoraValue =
          taskData.fechaHora && taskData.fechaHora.trim() !== ""
            ? taskData.fechaHora
            : null;

        const { data, error } = await this.supabase
          .from("tasks")
          .insert([
            {
              project_id: taskData.project_id,
              user_id: userId,
              name: taskData.nombre,
              description: taskData.descripcion || "",
              status: taskData.status || "pendientes",
              priority: taskData.prioridad || "normal",
              due_date: dueDateValue,
              fecha_hora: fechaHoraValue,
              position: taskData.position || 0,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        logSupabaseOperation("createTask", `Tarea "${data.name}" creada`);
        return {
          id: data.id,
          nombre: data.name,
          descripcion: data.description,
          expira: data.due_date,
          fechaHora: data.fecha_hora,
          prioridad: data.priority,
          position: data.position,
        };
      } catch (error) {
        logSupabaseOperation("createTask", null, error);
        return this.createTaskInLocalStorage(taskData);
      }
    }

    return this.createTaskInLocalStorage(taskData);
  }

  async updateTask(taskId, updates, userId = null) {
    if (this.useSupabase && userId) {
      try {
        const dbUpdates = {};
        if (updates.nombre) dbUpdates.name = updates.nombre;
        if (updates.descripcion !== undefined)
          dbUpdates.description = updates.descripcion;
        if (updates.prioridad) dbUpdates.priority = updates.prioridad;
        // Manejar fechas correctamente - convertir strings vacíos a null
        if (updates.expira !== undefined) {
          dbUpdates.due_date =
            updates.expira && updates.expira.trim() !== ""
              ? updates.expira
              : null;
        }
        if (updates.fechaHora !== undefined) {
          dbUpdates.fecha_hora =
            updates.fechaHora && updates.fechaHora.trim() !== ""
              ? updates.fechaHora
              : null;
        }
        if (updates.status) dbUpdates.status = updates.status;
        if (updates.position !== undefined)
          dbUpdates.position = updates.position;

        const { data, error } = await this.supabase
          .from("tasks")
          .update(dbUpdates)
          .eq("id", taskId)
          .eq("user_id", userId)
          .select()
          .single();

        if (error) throw error;

        logSupabaseOperation("updateTask", `Tarea actualizada`);
        return data;
      } catch (error) {
        logSupabaseOperation("updateTask", null, error);
        return this.updateTaskInLocalStorage(taskId, updates);
      }
    }

    return this.updateTaskInLocalStorage(taskId, updates);
  }

  async deleteTask(taskId, userId = null) {
    if (this.useSupabase && userId) {
      try {
        const { error } = await this.supabase
          .from("tasks")
          .delete()
          .eq("id", taskId)
          .eq("user_id", userId);

        if (error) throw error;

        logSupabaseOperation("deleteTask", `Tarea eliminada`);
        return true;
      } catch (error) {
        logSupabaseOperation("deleteTask", null, error);
        return this.deleteTaskFromLocalStorage(taskId);
      }
    }

    return this.deleteTaskFromLocalStorage(taskId);
  }

  // MÉTODOS DE LOCALSTORAGE (FALLBACK)
  getProjectsFromLocalStorage() {
    const projects = JSON.parse(
      localStorage.getItem(`${this.localStoragePrefix}Projects`) || "[]"
    );
    return projects.map((name) => ({ id: name, name, color: "#6366f1" }));
  }

  createProjectInLocalStorage(projectData) {
    const projects = JSON.parse(
      localStorage.getItem(`${this.localStoragePrefix}Projects`) || "[]"
    );
    if (!projects.includes(projectData.name)) {
      projects.push(projectData.name);
      localStorage.setItem(
        `${this.localStoragePrefix}Projects`,
        JSON.stringify(projects)
      );
    }
    return {
      id: projectData.name,
      name: projectData.name,
      color: projectData.color || "#6366f1",
    };
  }

  saveProjectToLocalStorage(project) {
    // Este método es para sincronizar con localStorage cuando se usa Supabase
    const projects = JSON.parse(
      localStorage.getItem(`${this.localStoragePrefix}Projects`) || "[]"
    );
    if (!projects.includes(project.name)) {
      projects.push(project.name);
      localStorage.setItem(
        `${this.localStoragePrefix}Projects`,
        JSON.stringify(projects)
      );
    }
  }

  updateProjectInLocalStorage(projectId, updates) {
    // En localStorage, el ID es el nombre del proyecto
    const projects = JSON.parse(
      localStorage.getItem(`${this.localStoragePrefix}Projects`) || "[]"
    );
    const index = projects.indexOf(projectId);
    if (index !== -1 && updates.name) {
      projects[index] = updates.name;
      localStorage.setItem(
        `${this.localStoragePrefix}Projects`,
        JSON.stringify(projects)
      );

      // También actualizar las tareas si cambia el nombre
      if (updates.name !== projectId) {
        const allTasks = JSON.parse(
          localStorage.getItem(`${this.localStoragePrefix}ProjectTasks`) || "{}"
        );
        if (allTasks[projectId]) {
          allTasks[updates.name] = allTasks[projectId];
          delete allTasks[projectId];
          localStorage.setItem(
            `${this.localStoragePrefix}ProjectTasks`,
            JSON.stringify(allTasks)
          );
        }
      }
    }
    return {
      id: updates.name || projectId,
      name: updates.name || projectId,
      color: updates.color || "#6366f1",
    };
  }

  deleteProjectFromLocalStorage(projectId) {
    const projects = JSON.parse(
      localStorage.getItem(`${this.localStoragePrefix}Projects`) || "[]"
    );
    const filteredProjects = projects.filter((name) => name !== projectId);
    localStorage.setItem(
      `${this.localStoragePrefix}Projects`,
      JSON.stringify(filteredProjects)
    );

    // También eliminar las tareas del proyecto
    const allTasks = JSON.parse(
      localStorage.getItem(`${this.localStoragePrefix}ProjectTasks`) || "{}"
    );
    delete allTasks[projectId];
    localStorage.setItem(
      `${this.localStoragePrefix}ProjectTasks`,
      JSON.stringify(allTasks)
    );

    return true;
  }

  getProjectTasksFromLocalStorage(projectId) {
    const allTasks = JSON.parse(
      localStorage.getItem(`${this.localStoragePrefix}ProjectTasks`) || "{}"
    );
    return (
      allTasks[projectId] || { pendientes: [], enCurso: [], terminadas: [] }
    );
  }

  createTaskInLocalStorage(taskData) {
    const task = {
      id: crypto.randomUUID(),
      nombre: taskData.nombre,
      descripcion: taskData.descripcion || "",
      expira: taskData.expira,
      prioridad: taskData.prioridad || "normal",
    };

    const allTasks = JSON.parse(
      localStorage.getItem(`${this.localStoragePrefix}ProjectTasks`) || "{}"
    );
    if (!allTasks[taskData.project_id]) {
      allTasks[taskData.project_id] = {
        pendientes: [],
        enCurso: [],
        terminadas: [],
      };
    }

    const status = taskData.status || "pendientes";
    allTasks[taskData.project_id][status].push(task);
    localStorage.setItem(
      `${this.localStoragePrefix}ProjectTasks`,
      JSON.stringify(allTasks)
    );

    return task;
  }

  updateTaskInLocalStorage(taskId, updates) {
    // Implementación simplificada para localStorage
    // En la práctica, necesitarías buscar la tarea en todos los proyectos
    console.warn(
      `updateTaskInLocalStorage: Implementación simplificada para tarea ${taskId}`
    );
    return updates;
  }

  deleteTaskFromLocalStorage(taskId) {
    // Implementación simplificada para localStorage
    // En la práctica, necesitarías buscar la tarea en todos los proyectos
    console.warn(
      `deleteTaskFromLocalStorage: Implementación simplificada para tarea ${taskId}`
    );
    return true;
  }
}

// Exportar instancia singleton
export const dbService = new DatabaseService();
