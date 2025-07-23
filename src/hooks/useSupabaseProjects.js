import { useState, useEffect, useRef } from "react";
import { dbService } from "../services/database";
import { useAuth } from "./useAuth";
import useLocalStorage from "./useLocalStorage";

// Hook híbrido que usa Supabase cuando está disponible y localStorage como fallback
export default function useSupabaseProjects() {
  const { user, isOnline } = useAuth();
  const [projects, setProjects] = useState([]);
  const [projectTasks, setProjectTasks] = useState({});
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState("idle"); // 'idle', 'syncing', 'error', 'success'

  // Mantener localStorage como backup/cache
  const [localProjects, setLocalProjects] = useLocalStorage(
    "focusLocusProjects",
    []
  );
  const [localProjectTasks, setLocalProjectTasks] = useLocalStorage(
    "focusLocusProjectTasks",
    {}
  );
  const [activeProject, setActiveProject] = useLocalStorage(
    "focusLocusActiveProject",
    null
  );

  // Ref para controlar si ya se cargaron los datos
  const hasInitialLoadRef = useRef(false);
  const currentUserIdRef = useRef(null);

  // Cargar datos iniciales - optimizado para evitar loops
  useEffect(() => {
    // Solo cargar si es un usuario nuevo o es la primera carga
    const isNewUser = user?.id !== currentUserIdRef.current;
    if (!isNewUser && hasInitialLoadRef.current) {
      return; // Ya se cargaron los datos para este usuario
    }

    let isMounted = true;
    currentUserIdRef.current = user?.id;
    hasInitialLoadRef.current = true;

    const loadData = async () => {
      if (!isMounted) return;

      console.log("🔄 Loading projects...", { user: !!user, isOnline });
      setLoading(true);
      try {
        const projectsData = await dbService.getProjects(user?.id);

        if (!isMounted) return; // Evitar actualizar si se desmontó

        if (isOnline && user) {
          // Modo online con Supabase
          console.log(
            "📡 Online mode - projects from Supabase:",
            projectsData.length
          );
          setProjects(projectsData.map((p) => p.name));

          // Cargar tareas para cada proyecto
          const tasksData = {};
          for (const project of projectsData) {
            if (!isMounted) return; // Verificar antes de cada operación async
            console.log(`📋 Loading tasks for project: ${project.name} (ID: ${project.id})`);
            try {
              tasksData[project.name] = await dbService.getProjectTasks(
                project.id,
                user.id
              );
              console.log(`✅ Tasks loaded for ${project.name}:`, tasksData[project.name]);
            } catch (error) {
              console.error(`❌ Error loading tasks for ${project.name}:`, error);
              // Asegurar que al menos hay un objeto vacío para evitar errores
              tasksData[project.name] = {
                pendientes: [],
                enCurso: [],
                terminadas: [],
              };
            }
          }

          if (!isMounted) return;

          setProjectTasks(tasksData);

          // Sincronizar con localStorage
          setLocalProjects(projectsData.map((p) => p.name));
          setLocalProjectTasks(tasksData);

          setSyncStatus("success");
        } else {
          // Modo offline - usar localStorage directamente
          console.log("💾 Offline mode - using localStorage");
          const currentLocalProjects = JSON.parse(
            localStorage.getItem("focusLocusProjects") || "[]"
          );
          const currentLocalTasks = JSON.parse(
            localStorage.getItem("focusLocusProjectTasks") || "{}"
          );

          setProjects(currentLocalProjects);
          setProjectTasks(currentLocalTasks);
          setSyncStatus("offline");
        }
      } catch (error) {
        if (!isMounted) return;
        console.error("Error cargando proyectos:", error);
        // Fallback a localStorage en caso de error
        const currentLocalProjects = JSON.parse(
          localStorage.getItem("focusLocusProjects") || "[]"
        );
        const currentLocalTasks = JSON.parse(
          localStorage.getItem("focusLocusProjectTasks") || "{}"
        );

        setProjects(currentLocalProjects);
        setProjectTasks(currentLocalTasks);
        setSyncStatus("error");
      } finally {
        if (isMounted) {
          console.log("✅ Loading complete");
          setLoading(false);
        }
      }
    };

    // Solo cargar si hay cambios importantes
    console.log("🔍 useEffect trigger:", {
      user: !!user,
      userDefined: user !== undefined,
      isOnline,
      onlineDefined: isOnline !== undefined,
      shouldLoad: isNewUser,
    });

    loadData();

    return () => {
      isMounted = false; // Cleanup
    };
  }, [user, isOnline, setLocalProjects, setLocalProjectTasks]); // Incluir todas las dependencias necesarias

  // Función para cargar proyectos (ahora separada para reutilización)
  const loadProjects = async () => {
    setLoading(true);
    try {
      const projectsData = await dbService.getProjects(user?.id);

      if (isOnline && user) {
        // Modo online con Supabase
        setProjects(projectsData.map((p) => p.name));

        // Cargar tareas para cada proyecto
        const tasksData = {};
        for (const project of projectsData) {
          tasksData[project.name] = await dbService.getProjectTasks(
            project.id,
            user.id
          );
        }
        setProjectTasks(tasksData);

        // Sincronizar con localStorage
        setLocalProjects(projectsData.map((p) => p.name));
        setLocalProjectTasks(tasksData);

        setSyncStatus("success");
      } else {
        // Modo offline - usar localStorage
        setProjects(localProjects);
        setProjectTasks(localProjectTasks);
        setSyncStatus("offline");
      }
    } catch (error) {
      console.error("Error cargando proyectos:", error);
      // Fallback a localStorage en caso de error
      setProjects(localProjects);
      setProjectTasks(localProjectTasks);
      setSyncStatus("error");
    }
    setLoading(false);
  };

  // Función para agregar proyecto
  const addProject = async (projectName) => {
    if (!projectName?.trim()) return false;

    const trimmedName = projectName.trim();

    // Verificar duplicados
    if (projects.includes(trimmedName)) return false;

    try {
      setSyncStatus("syncing");

      if (isOnline && user) {
        // Crear en Supabase
        await dbService.createProject({ name: trimmedName }, user.id);
      }

      // Actualizar estado local
      const newProjects = [...projects, trimmedName];
      setProjects(newProjects);
      setLocalProjects(newProjects);

      // Crear estructura inicial de tareas
      const initialTasks = createInitialTaskLists(trimmedName);
      const newProjectTasks = { ...projectTasks, [trimmedName]: initialTasks };
      setProjectTasks(newProjectTasks);
      setLocalProjectTasks(newProjectTasks);

      setSyncStatus("success");
      return true;
    } catch (error) {
      console.error("Error agregando proyecto:", error);
      setSyncStatus("error");
      return false;
    }
  };

  // Función para eliminar proyecto
  const deleteProject = async (projectName) => {
    try {
      setSyncStatus("syncing");

      if (isOnline && user) {
        // Buscar el proyecto en Supabase para obtener su ID
        const projectsData = await dbService.getProjects(user.id);
        const project = projectsData.find((p) => p.name === projectName);
        if (project) {
          await dbService.deleteProject(project.id, user.id);
        }
      }

      // Actualizar estado local
      const newProjects = projects.filter((p) => p !== projectName);
      setProjects(newProjects);
      setLocalProjects(newProjects);

      // Eliminar tareas del proyecto
      const newProjectTasks = { ...projectTasks };
      delete newProjectTasks[projectName];
      setProjectTasks(newProjectTasks);
      setLocalProjectTasks(newProjectTasks);

      // Si era el proyecto activo, cambiar a otro
      if (activeProject === projectName) {
        const newActive = newProjects.length > 0 ? newProjects[0] : null;
        setActiveProject(newActive);
      }

      setSyncStatus("success");
      return true;
    } catch (error) {
      console.error("Error eliminando proyecto:", error);
      setSyncStatus("error");
      return false;
    }
  };

  // Función para renombrar proyecto
  const renameProject = async (oldName, newName) => {
    const trimmedNewName = newName.trim();

    if (!trimmedNewName || trimmedNewName === oldName) return false;
    if (projects.includes(trimmedNewName)) return false;

    try {
      setSyncStatus("syncing");

      if (isOnline && user) {
        // Actualizar en Supabase
        const projectsData = await dbService.getProjects(user.id);
        const project = projectsData.find((p) => p.name === oldName);
        if (project) {
          await dbService.updateProject(
            project.id,
            { name: trimmedNewName },
            user.id
          );
        }
      }

      // Disparar evento para preservar colores
      window.dispatchEvent(
        new CustomEvent("project-renamed", {
          detail: { oldName, newName: trimmedNewName },
        })
      );

      // Actualizar estado local
      const newProjects = projects.map((p) =>
        p === oldName ? trimmedNewName : p
      );
      setProjects(newProjects);
      setLocalProjects(newProjects);

      // Mover tareas al nuevo nombre
      if (projectTasks[oldName]) {
        const newProjectTasks = { ...projectTasks };
        newProjectTasks[trimmedNewName] = newProjectTasks[oldName];
        delete newProjectTasks[oldName];
        setProjectTasks(newProjectTasks);
        setLocalProjectTasks(newProjectTasks);
      }

      // Actualizar proyecto activo si es necesario
      if (activeProject === oldName) {
        setActiveProject(trimmedNewName);
      }

      setSyncStatus("success");
      return true;
    } catch (error) {
      console.error("Error renombrando proyecto:", error);
      setSyncStatus("error");
      return false;
    }
  };

  // Función para actualizar tareas de un proyecto
  const updateProjectTasks = async (projectName, newTasks) => {
    try {
      setSyncStatus("syncing");

      // Si estamos online, sincronizar cambios importantes con Supabase
      if (isOnline && user) {
        // Para mantener simplicidad, por ahora solo actualizamos localmente
        // En una implementación completa, aquí sincronizarías cada tarea modificada
        console.log("TODO: Sincronizar tareas específicas con Supabase");
      }

      // Actualizar estado local
      const newProjectTasks = { ...projectTasks, [projectName]: newTasks };
      setProjectTasks(newProjectTasks);
      setLocalProjectTasks(newProjectTasks);

      setSyncStatus("success");
    } catch (error) {
      console.error("Error actualizando tareas:", error);
      setSyncStatus("error");
    }
  };

  // Función para agregar tarea
  const addTaskToProject = async (projectName) => {
    try {
      setSyncStatus("syncing");

      const newTask = {
        id: crypto.randomUUID(),
        nombre: "Nueva tarea",
        expira: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        prioridad: "normal",
        descripcion: "",
      };

      if (isOnline && user) {
        // Buscar ID del proyecto en Supabase
        const projectsData = await dbService.getProjects(user.id);
        const project = projectsData.find((p) => p.name === projectName);

        if (project) {
          await dbService.createTask(
            {
              project_id: project.id,
              ...newTask,
              status: "pendientes",
            },
            user.id
          );
        }
      }

      // Actualizar estado local
      const currentTasks =
        projectTasks[projectName] || createInitialTaskLists();
      const newProjectTasks = {
        ...projectTasks,
        [projectName]: {
          ...currentTasks,
          pendientes: [...currentTasks.pendientes, newTask],
        },
      };

      setProjectTasks(newProjectTasks);
      setLocalProjectTasks(newProjectTasks);

      setSyncStatus("success");
    } catch (error) {
      console.error("Error agregando tarea:", error);
      setSyncStatus("error");
    }
  };

  // Función para sincronizar manualmente
  const syncData = async () => {
    if (!isOnline || !user) return;

    setSyncStatus("syncing");
    try {
      await loadProjects();
      setSyncStatus("success");
    } catch (error) {
      console.error("Error sincronizando:", error);
      setSyncStatus("error");
    }
  };

  return {
    projects,
    projectTasks,
    loading,
    syncStatus,
    isOnline,
    addProject,
    deleteProject,
    renameProject,
    updateProjectTasks,
    addTaskToProject,
    syncData,
    setProjects,
    setProjectTasks,
  };
}

// Función auxiliar para crear listas iniciales
const createInitialTaskLists = (projectName) => {
  if (projectName === "Mi Primer Proyecto") {
    return {
      pendientes: [
        {
          id: crypto.randomUUID(),
          nombre: "¡Bienvenido a FocusLocus!",
          expira: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          prioridad: "baja",
          descripcion:
            "Esta es tu primera tarea. Puedes editarla, moverla entre listas o eliminarla.",
        },
      ],
      enCurso: [],
      terminadas: [],
    };
  } else {
    return {
      pendientes: [],
      enCurso: [],
      terminadas: [],
    };
  }
};
