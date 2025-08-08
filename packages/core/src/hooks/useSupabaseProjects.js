import { useState, useEffect, useRef } from "react";
import { dbService, initDatabase } from "../services/database";
import { useAuth } from "./useAuth";
import { useSupabaseConfig } from "../context/SupabaseConfigContext";
import useLocalStorage from "./useLocalStorage";

// Colores disponibles para proyectos
const COLORS = [
  "#F87171", // rojo
  "#FBBF24", // amarillo
  "#34D399", // verde
  "#60A5FA", // azul
  "#A78BFA", // violeta
  "#F472B6", // rosa
  "#FCD34D", // dorado
  "#38BDF8", // celeste
];

function getRandomColor(usedColors = []) {
  const available = COLORS.filter((c) => !usedColors.includes(c));
  if (available.length === 0)
    return COLORS[Math.floor(Math.random() * COLORS.length)];
  return available[Math.floor(Math.random() * available.length)];
}

// Función para manejar colores de proyectos de forma estable
function manageProjectColors(projectNames) {
  const currentColors = JSON.parse(
    localStorage.getItem("focusLocusProjectColors") || "{}"
  );

  let updated = { ...currentColors };
  let hasChanges = false;

  // Asignar colores solo a proyectos que realmente no tienen color
  projectNames.forEach((name) => {
    if (!updated[name]) {
      const newColor = getRandomColor(Object.values(updated));
      updated[name] = newColor;
      hasChanges = true;
    }
  });

  // Limpiar proyectos eliminados
  Object.keys(updated).forEach((name) => {
    if (!projectNames.includes(name)) {
      delete updated[name];
      hasChanges = true;
    }
  });

  // Actualizar localStorage si hay cambios
  if (hasChanges) {
    localStorage.setItem("focusLocusProjectColors", JSON.stringify(updated));
  }

  return updated;
}

// Hook híbrido que usa Supabase cuando está disponible y localStorage como fallback
export default function useSupabaseProjects() {
  const { user, isOnline } = useAuth();
  const supabaseConfig = useSupabaseConfig();

  // Inicializar el servicio de base de datos con la configuración
  useEffect(() => {
    if (supabaseConfig) {
      initDatabase(supabaseConfig);
    }
  }, [supabaseConfig]);

  const [projects, setProjects] = useState([]);
  const [projectTasks, setProjectTasks] = useState({});
  const [projectColors, setProjectColors] = useState({});
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

  // Cargar colores iniciales del localStorage
  useEffect(() => {
    const initialColors = JSON.parse(
      localStorage.getItem("focusLocusProjectColors") || "{}"
    );
    setProjectColors(initialColors);
  }, []);

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

      setLoading(true);
      try {
        if (isOnline && user) {
          // Modo online con Supabase
          const projectsData = await dbService.getProjects(user?.id);

          if (!isMounted) return; // Evitar actualizar si se desmontó

          const projectNames = projectsData.map((p) => p.name); // Notificar que se está cargando desde Supabase para preservar colores
          window.dispatchEvent(new CustomEvent("supabase-loading-start"));

          // Manejar colores de proyectos de forma estable
          const updatedColors = manageProjectColors(projectNames);
          setProjectColors(updatedColors);

          setProjects(projectNames);

          // Cargar tareas para cada proyecto
          const tasksData = {};
          for (const project of projectsData) {
            if (!isMounted) return; // Verificar antes de cada operación async
            try {
              tasksData[project.name] = await dbService.getProjectTasks(
                project.id,
                user.id
              );
            } catch (error) {
              console.error(`Error loading tasks for ${project.name}:`, error);
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

          // Sincronizar con localStorage usando referencias directas
          localStorage.setItem(
            "focusLocusProjects",
            JSON.stringify(projectNames)
          );
          localStorage.setItem(
            "focusLocusProjectTasks",
            JSON.stringify(tasksData)
          );

          setSyncStatus("success");

          // Notificar que terminó la carga desde Supabase
          window.dispatchEvent(new CustomEvent("supabase-loading-end"));
        } else {
          // Modo offline - usar localStorage directamente sin llamadas a la base de datos
          console.log("🔌 Loading data in offline mode from localStorage");

          const currentLocalProjects = JSON.parse(
            localStorage.getItem("focusLocusProjects") || "[]"
          );
          const currentLocalTasks = JSON.parse(
            localStorage.getItem("focusLocusProjectTasks") || "{}"
          );

          console.log("📦 Local projects loaded:", currentLocalProjects);
          console.log("📦 Local tasks loaded:", currentLocalTasks);

          setProjects(currentLocalProjects);
          setProjectTasks(currentLocalTasks);

          // También cargar colores en modo offline
          const currentColors = manageProjectColors(currentLocalProjects);
          setProjectColors(currentColors);

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
          setLoading(false);
        }
      }
    };

    // Solo cargar si hay cambios importantes
    loadData();

    return () => {
      isMounted = false; // Cleanup
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isOnline]); // Solo depender de valores estables

  // Función para cargar proyectos (ahora separada para reutilización)
  const loadProjects = async () => {
    setLoading(true);
    try {
      if (isOnline && user) {
        // Modo online con Supabase
        const projectsData = await dbService.getProjects(user?.id);
        setProjects(projectsData.map((p) => p.name));

        // Cargar tareas para cada proyecto
        const tasksData = {};
        for (const project of projectsData) {
          console.log(
            `📋 Loading tasks for project: ${project.name} (ID: ${project.id})`
          );
          try {
            tasksData[project.name] = await dbService.getProjectTasks(
              project.id,
              user.id
            );
            console.log(
              `✅ Tasks loaded for ${project.name}:`,
              tasksData[project.name]
            );
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
        setProjectTasks(tasksData);

        // Sincronizar con localStorage
        setLocalProjects(projectsData.map((p) => p.name));
        setLocalProjectTasks(tasksData);

        setSyncStatus("success");
      } else {
        // Modo offline - usar localStorage directamente sin llamadas a la base de datos
        console.log("🔌 Loading projects in offline mode from localStorage");

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
      console.error("Error cargando proyectos:", error);
      // Fallback a localStorage en caso de error
      const fallbackProjects = JSON.parse(
        localStorage.getItem("focusLocusProjects") || "[]"
      );
      const fallbackTasks = JSON.parse(
        localStorage.getItem("focusLocusProjectTasks") || "{}"
      );

      setProjects(fallbackProjects);
      setProjectTasks(fallbackTasks);
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

      // Manejar colores para el nuevo proyecto
      const updatedColors = manageProjectColors(newProjects);
      setProjectColors(updatedColors);

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

      // Manejar colores (eliminar color del proyecto eliminado)
      const updatedColors = manageProjectColors(newProjects);
      setProjectColors(updatedColors);

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

      // Manejar cambio de colores para el proyecto renombrado
      const updatedColors = { ...projectColors };
      if (updatedColors[oldName]) {
        updatedColors[trimmedNewName] = updatedColors[oldName];
        delete updatedColors[oldName];
        setProjectColors(updatedColors);
        localStorage.setItem(
          "focusLocusProjectColors",
          JSON.stringify(updatedColors)
        );
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
      // 🚀 OPTIMISTIC UPDATE: Actualizar estado local INMEDIATAMENTE
      const newProjectTasks = { ...projectTasks, [projectName]: newTasks };
      setProjectTasks(newProjectTasks);
      setLocalProjectTasks(newProjectTasks);

      // Actualizar localStorage inmediatamente para persistencia
      localStorage.setItem(
        "focusLocusProjectTasks",
        JSON.stringify(newProjectTasks)
      );

      // 🔄 BACKGROUND SYNC: Sincronizar con Supabase en segundo plano
      setSyncStatus("syncing");

      // Si estamos online, sincronizar cambios importantes con Supabase
      if (isOnline && user) {
        try {
          // Buscar el proyecto en Supabase para obtener su ID
          const projectsData = await dbService.getProjects(user.id);
          const project = projectsData.find((p) => p.name === projectName);

          if (project) {
            // Obtener tareas actuales de Supabase para comparar
            const currentSupabaseTasks = await dbService.getProjectTasks(
              project.id,
              user.id
            );

            // Convertir las tareas nuevas a formato plano para comparar
            const allNewTasks = [
              ...newTasks.pendientes.map((t) => ({
                ...t,
                status: "pendientes",
              })),
              ...newTasks.enCurso.map((t) => ({ ...t, status: "enCurso" })),
              ...newTasks.terminadas.map((t) => ({
                ...t,
                status: "terminadas",
              })),
            ];

            // Obtener tareas actuales de Supabase en formato plano
            const allCurrentTasks = [
              ...currentSupabaseTasks.pendientes.map((t) => ({
                ...t,
                status: "pendientes",
              })),
              ...currentSupabaseTasks.enCurso.map((t) => ({
                ...t,
                status: "enCurso",
              })),
              ...currentSupabaseTasks.terminadas.map((t) => ({
                ...t,
                status: "terminadas",
              })),
            ];

            // Identificar tareas a eliminar (están en Supabase pero no en el nuevo estado)
            const tasksToDelete = allCurrentTasks.filter(
              (currentTask) =>
                !allNewTasks.find((newTask) => newTask.id === currentTask.id)
            );

            // Identificar tareas a crear (están en el nuevo estado pero no en Supabase)
            const tasksToCreate = allNewTasks.filter(
              (newTask) =>
                !allCurrentTasks.find(
                  (currentTask) => currentTask.id === newTask.id
                )
            );

            // Identificar tareas a actualizar (están en ambos pero con diferencias)
            const tasksToUpdate = allNewTasks.filter((newTask) => {
              const currentTask = allCurrentTasks.find(
                (ct) => ct.id === newTask.id
              );
              if (!currentTask) return false;

              // Comparar campos importantes para detectar cambios
              return (
                newTask.nombre !== currentTask.nombre ||
                newTask.descripcion !== currentTask.descripcion ||
                newTask.expira !== currentTask.expira ||
                newTask.fechaHora !== currentTask.fechaHora ||
                newTask.prioridad !== currentTask.prioridad ||
                newTask.status !== currentTask.status ||
                newTask.position !== currentTask.position
              );
            });

            // Ejecutar operaciones en Supabase
            await Promise.all([
              // Eliminar tareas
              ...tasksToDelete.map((task) =>
                dbService.deleteTask(task.id, user.id)
              ),

              // Crear tareas nuevas
              ...tasksToCreate.map((task) =>
                dbService.createTask(
                  {
                    project_id: project.id,
                    nombre: task.nombre,
                    descripcion: task.descripcion || "",
                    expira: task.expira,
                    fechaHora: task.fechaHora,
                    prioridad: task.prioridad,
                    status: task.status,
                    position: task.position || 0,
                  },
                  user.id
                )
              ),

              // Actualizar tareas modificadas
              ...tasksToUpdate.map((task) =>
                dbService.updateTask(
                  task.id,
                  {
                    nombre: task.nombre,
                    descripcion: task.descripcion || "",
                    expira: task.expira,
                    fechaHora: task.fechaHora,
                    prioridad: task.prioridad,
                    status: task.status,
                    position: task.position || 0,
                  },
                  user.id
                )
              ),
            ]);

            console.log(
              `✅ Sincronizadas tareas del proyecto "${projectName}":`,
              {
                eliminadas: tasksToDelete.length,
                creadas: tasksToCreate.length,
                actualizadas: tasksToUpdate.length,
              }
            );
          }
        } catch (error) {
          console.error("Error sincronizando tareas con Supabase:", error);
          // Continuar aunque falle Supabase - el usuario ya vio el cambio optimista
        }
      }

      setSyncStatus("success");
    } catch (error) {
      console.error("Error actualizando tareas:", error);
      setSyncStatus("error");

      // 🔁 ROLLBACK: En caso de error crítico, podrían revertirse los cambios
      // Por ahora mantenemos el optimistic update incluso en errores para mejor UX
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

      // Sincronizar también con localStorage directamente
      localStorage.setItem(
        "focusLocusProjectTasks",
        JSON.stringify(newProjectTasks)
      );

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

  // Función para obtener el color de un proyecto
  const getColor = (projectName) => {
    return projectColors[projectName] || COLORS[0];
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
    getColor, // Nueva función para obtener colores
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
