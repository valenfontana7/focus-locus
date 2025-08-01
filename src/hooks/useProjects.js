import useLocalStorage from "./useLocalStorage";

// Generar un id único para cada tarea
function withId(arr) {
  return arr.map((t) => ({ ...t, id: crypto.randomUUID() }));
}

// Crear estructura inicial de tareas para un proyecto
export const createInitialTaskLists = (projectName) => {
  if (projectName === "Mi Primer Proyecto") {
    return {
      pendientes: withId([
        {
          nombre: "¡Bienvenido a FocusLocus!",
          expira: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          prioridad: "baja",
          descripcion:
            "Esta es tu primera tarea. Puedes editarla, moverla entre listas o eliminarla.",
        },
      ]),
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

function useProjects() {
  // Estado de proyectos - iniciamos con array vacío para mostrar welcome screen
  const [projects, setProjects] = useLocalStorage("focusLocusProjects", []);

  // Estado de tareas por proyecto - iniciamos vacío
  const [projectTasks, setProjectTasks] = useLocalStorage(
    "focusLocusProjectTasks",
    {}
  );

  // Función para agregar un nuevo proyecto
  const addProject = (projectName) => {
    if (projectName && projectName.trim()) {
      const trimmedName = projectName.trim();
      setProjects((prevProjects) =>
        prevProjects.includes(trimmedName)
          ? prevProjects
          : [...prevProjects, trimmedName]
      );
      setProjectTasks((prevTasks) => {
        if (prevTasks[trimmedName]) return prevTasks;
        return {
          ...prevTasks,
          [trimmedName]: createInitialTaskLists(trimmedName),
        };
      });
    }
  };

  // Función para eliminar un proyecto
  const deleteProject = (projectName) => {
    setProjects((prevProjects) =>
      prevProjects.filter((p) => p !== projectName)
    );
    setProjectTasks((prevTasks) => {
      const newTasks = { ...prevTasks };
      delete newTasks[projectName];
      return newTasks;
    });
  };
  // Función para renombrar un proyecto manteniendo sus tareas
  const renameProject = (oldName, newName) => {
    const trimmedNewName = newName.trim();

    // Validaciones
    if (!trimmedNewName || trimmedNewName === oldName) {
      return false;
    }

    // Verificar si el nuevo nombre ya existe
    if (projects.includes(trimmedNewName)) {
      return false;
    }

    // Disparar evento ANTES de actualizar los estados para preservar colores
    window.dispatchEvent(
      new CustomEvent("project-renamed", {
        detail: { oldName, newName: trimmedNewName },
      })
    );

    // Actualizar array de proyectos
    setProjects((prevProjects) =>
      prevProjects.map((p) => (p === oldName ? trimmedNewName : p))
    );

    // Mover las tareas del nombre anterior al nuevo
    setProjectTasks((prevTasks) => {
      const updatedTasks = { ...prevTasks };

      // Si existen tareas bajo el nombre anterior, moverlas al nuevo nombre
      if (updatedTasks[oldName]) {
        updatedTasks[trimmedNewName] = updatedTasks[oldName];
        delete updatedTasks[oldName];
      }

      return updatedTasks;
    });

    return true;
  };

  // Función para obtener las tareas de un proyecto
  const getProjectTasks = (projectName) => {
    // Solo usar el valor inicial si no existe el proyecto en projectTasks
    if (Object.prototype.hasOwnProperty.call(projectTasks, projectName)) {
      return projectTasks[projectName];
    }
    return createInitialTaskLists(projectName);
  };

  // Función para actualizar las tareas de un proyecto
  const updateProjectTasks = (projectName, newTasks) => {
    setProjectTasks((prevTasks) => ({
      ...prevTasks,
      [projectName]: newTasks,
    }));
  };

  // Función para agregar una nueva tarea a un proyecto
  const addTaskToProject = (projectName) => {
    const newTask = {
      id: crypto.randomUUID(),
      nombre: "Nueva tarea",
      expira: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      prioridad: "normal",
      descripcion: "",
    };
    setProjectTasks((prevTasks) => {
      const currentTasks = prevTasks[projectName] || createInitialTaskLists();
      return {
        ...prevTasks,
        [projectName]: {
          ...currentTasks,
          pendientes: [...currentTasks.pendientes, newTask],
        },
      };
    });
  };

  // Función para limpiar todas las tareas de un proyecto
  const clearProjectTasks = (projectName) => {
    updateProjectTasks(projectName, createInitialTaskLists(projectName));
  };

  return {
    projects,
    projectTasks,
    addProject,
    deleteProject,
    renameProject,
    getProjectTasks,
    updateProjectTasks,
    addTaskToProject,
    clearProjectTasks,
    setProjects,
    setProjectTasks,
  };
}

export default useProjects;
