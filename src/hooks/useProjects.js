import useLocalStorage from "./useLocalStorage";

// Generar un id único para cada tarea
function withId(arr) {
  return arr.map((t) => ({ ...t, id: crypto.randomUUID() }));
}

// Crear estructura inicial de tareas para un proyecto
export const createInitialTaskLists = () => ({
  pendientes: withId([
    { nombre: "Diseñar landing", expira: "2024-06-20" },
    { nombre: "Reunión con cliente", expira: "2024-06-22" },
  ]),
  enCurso: withId([{ nombre: "Desarrollar backend", expira: "2024-06-25" }]),
  terminadas: withId([
    { nombre: "Wireframes aprobados" },
    { nombre: "Dominio comprado" },
  ]),
});

// Constantes fuera del hook
export const initialProjects = ["Freelance Web", "Tesis", "Personal"];
export const initialProjectTasks = {
  "Freelance Web": {
    pendientes: [
      { id: "fw-1", nombre: "Diseñar landing", expira: "2024-06-20" },
      { id: "fw-2", nombre: "Reunión con cliente", expira: "2024-06-22" },
    ],
    enCurso: [
      { id: "fw-3", nombre: "Desarrollar backend", expira: "2024-06-25" },
    ],
    terminadas: [
      { id: "fw-4", nombre: "Wireframes aprobados" },
      { id: "fw-5", nombre: "Dominio comprado" },
    ],
  },
  Tesis: {
    pendientes: [
      { id: "te-1", nombre: "Revisión bibliográfica", expira: "2024-07-01" },
    ],
    enCurso: [
      { id: "te-2", nombre: "Redacción capítulo 1", expira: "2024-07-10" },
    ],
    terminadas: [{ id: "te-3", nombre: "Propuesta aprobada" }],
  },
  Personal: {
    pendientes: [
      { id: "pe-1", nombre: "Comprar libros", expira: "2024-06-30" },
    ],
    enCurso: [],
    terminadas: [{ id: "pe-2", nombre: "Renovar DNI" }],
  },
};

function useProjects() {
  // Estado de proyectos
  const [projects, setProjects] = useLocalStorage(
    "focusLocusProjects",
    initialProjects
  );

  // Estado de tareas por proyecto
  const [projectTasks, setProjectTasks] = useLocalStorage(
    "focusLocusProjectTasks",
    initialProjectTasks
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
          [trimmedName]: createInitialTaskLists(),
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

  // Función para obtener las tareas de un proyecto
  const getProjectTasks = (projectName) => {
    // Solo usar el valor inicial si no existe el proyecto en projectTasks
    if (Object.prototype.hasOwnProperty.call(projectTasks, projectName)) {
      return projectTasks[projectName];
    }
    return createInitialTaskLists();
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
    updateProjectTasks(projectName, createInitialTaskLists());
  };

  return {
    projects,
    projectTasks,
    addProject,
    deleteProject,
    getProjectTasks,
    updateProjectTasks,
    addTaskToProject,
    clearProjectTasks,
  };
}

export default useProjects;
