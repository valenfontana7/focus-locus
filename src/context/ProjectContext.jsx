import { createContext, useContext, useEffect } from "react";
import useSupabaseProjects from "../hooks/useSupabaseProjects";
import useLocalStorage from "../hooks/useLocalStorage";

const ProjectContext = createContext();

export function ProjectProvider({ children }) {
  // Persistir el proyecto activo - iniciamos sin proyecto activo
  const [activeProject, setActiveProject] = useLocalStorage(
    "focusLocusActiveProject",
    null
  );

  // Usar el hook híbrido que maneja Supabase + localStorage
  const {
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
    getColor,
  } = useSupabaseProjects();

  // Establecer automáticamente el primer proyecto como activo cuando se crea
  useEffect(() => {
    if (projects.length > 0 && !activeProject) {
      setActiveProject(projects[0]);
    }
    // Si el proyecto activo no existe en la lista, resetear
    if (activeProject && !projects.includes(activeProject)) {
      setActiveProject(projects.length > 0 ? projects[0] : null);
    }
  }, [projects, activeProject, setActiveProject]);

  return (
    <ProjectContext.Provider
      value={{
        activeProject,
        setActiveProject,
        projects,
        addProject,
        deleteProject,
        renameProject,
        projectTasks,
        updateProjectTasks,
        addTaskToProject,
        setProjects,
        setProjectTasks,
        // Nuevas propiedades para Supabase
        loading,
        syncStatus,
        isOnline,
        syncData,
        getColor, // Función para obtener colores de proyectos
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjectContext() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error(
      "useProjectContext debe ser usado dentro de un ProjectProvider"
    );
  }
  return context;
}
