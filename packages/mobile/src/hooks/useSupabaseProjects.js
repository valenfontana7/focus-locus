import { useState, useEffect, useCallback } from "react";
import { supabase } from "../config/supabase";

export const useSupabaseProjects = (userId) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar proyectos del usuario
  const fetchProjects = useCallback(async () => {
    if (!userId) {
      setProjects([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (projectsError) throw projectsError;

      // Cargar tareas para cada proyecto
      const projectsWithTasks = await Promise.all(
        projectsData.map(async (project) => {
          const { data: tasksData, error: tasksError } = await supabase
            .from("tasks")
            .select("*")
            .eq("project_id", project.id)
            .order("created_at", { ascending: true });

          if (tasksError) throw tasksError;

          // Organizar tareas por estado (mapear desde la DB a la estructura de la app)
          const tasks = {
            pending: tasksData.filter((task) => task.status === "pendientes"),
            inProgress: tasksData.filter((task) => task.status === "enCurso"),
            completed: tasksData.filter((task) => task.status === "terminadas"),
          };

          return {
            id: project.id,
            name: project.name,
            tasks,
            created_at: project.created_at,
          };
        })
      );

      setProjects(projectsWithTasks);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]); // Dependencies for useCallback

  // Crear nuevo proyecto
  const createProject = async (name) => {
    if (!userId || !name?.trim()) return { error: "Datos inválidos" };

    try {
      const { data, error } = await supabase
        .from("projects")
        .insert([
          {
            name: name.trim(),
            user_id: userId,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Agregar proyecto con estructura de tareas vacía
      const newProject = {
        id: data.id,
        name: data.name,
        tasks: {
          pending: [],
          inProgress: [],
          completed: [],
        },
        created_at: data.created_at,
      };

      setProjects((prev) => [newProject, ...prev]);
      return { data: newProject, error: null };
    } catch (err) {
      console.error("Error creating project:", err);
      return { data: null, error: err.message };
    }
  };

  // Crear nueva tarea
  const createTask = async (projectId, title, description, status) => {
    if (!userId || !projectId || !title?.trim()) {
      return { error: "Datos inválidos" };
    }

    try {
      // Mapear status de la app a la DB - usar valores del schema correcto
      let dbStatus;
      if (status === "pending") {
        dbStatus = "pendientes";
      } else if (status === "inProgress") {
        dbStatus = "enCurso";
      } else if (status === "completed") {
        dbStatus = "terminadas";
      } else {
        dbStatus = status;
      }

      const { data, error } = await supabase
        .from("tasks")
        .insert([
          {
            name: title.trim(), // Cambiar de 'title' a 'name'
            description: description?.trim() || "",
            status: dbStatus,
            project_id: projectId,
            user_id: userId,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Crear objeto tarea mapeado para el estado local
      const mappedTask = {
        ...data,
        status: status, // Usar el status de la app, no el de la DB
      };

      // Actualizar estado local
      setProjects((prev) =>
        prev.map((project) =>
          project.id === projectId
            ? {
                ...project,
                tasks: {
                  ...project.tasks,
                  [status]: [...project.tasks[status], mappedTask],
                },
              }
            : project
        )
      );

      return { data, error: null };
    } catch (err) {
      console.error("Error creating task:", err);
      return { data: null, error: err.message };
    }
  };

  // Actualizar estado de tarea
  const updateTaskStatus = async (taskId, fromStatus, toStatus, projectId) => {
    try {
      // Mapear status de la app a la DB - usar valores del schema correcto
      let dbStatus;
      if (toStatus === "pending") {
        dbStatus = "pendientes";
      } else if (toStatus === "inProgress") {
        dbStatus = "enCurso";
      } else if (toStatus === "completed") {
        dbStatus = "terminadas";
      } else {
        dbStatus = toStatus;
      }

      const { data, error } = await supabase
        .from("tasks")
        .update({ status: dbStatus })
        .eq("id", taskId)
        .select()
        .single();

      if (error) throw error;

      // Actualizar estado local
      setProjects((prev) =>
        prev.map((project) => {
          if (project.id !== projectId) return project;

          const taskToMove = project.tasks[fromStatus].find(
            (t) => t.id === taskId
          );
          if (!taskToMove) return project;

          return {
            ...project,
            tasks: {
              ...project.tasks,
              [fromStatus]: project.tasks[fromStatus].filter(
                (t) => t.id !== taskId
              ),
              [toStatus]: [
                ...project.tasks[toStatus],
                { ...taskToMove, status: toStatus }, // Usar status de la app, no de la DB
              ],
            },
          };
        })
      );

      return { data, error: null };
    } catch (err) {
      console.error("Error updating task:", err);
      return { data: null, error: err.message };
    }
  };

  // Eliminar tarea
  const deleteTask = async (taskId, status, projectId) => {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);

      if (error) throw error;

      // Actualizar estado local
      setProjects((prev) =>
        prev.map((project) =>
          project.id === projectId
            ? {
                ...project,
                tasks: {
                  ...project.tasks,
                  [status]: project.tasks[status].filter(
                    (t) => t.id !== taskId
                  ),
                },
              }
            : project
        )
      );

      return { error: null };
    } catch (err) {
      console.error("Error deleting task:", err);
      return { error: err.message };
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]); // Ahora fetchProjects está en useCallback

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    createTask,
    updateTaskStatus,
    deleteTask,
  };
};

export default useSupabaseProjects;
