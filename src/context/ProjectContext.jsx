import { createContext, useContext, useEffect } from "react";
import useProjects from "../hooks/useProjects";
import useLocalStorage from "../hooks/useLocalStorage";

const ProjectContext = createContext();

export function ProjectProvider({ children }) {
  // Persistir el proyecto activo - iniciamos sin proyecto activo
  const [activeProject, setActiveProject] = useLocalStorage(
    "focusLocusActiveProject",
    null
  );

  // Usar el hook useProjects que tiene persistencia
  const {
    projects,
    projectTasks,
    addProject,
    deleteProject,
    updateProjectTasks,
    addTaskToProject,
    setProjects,
    setProjectTasks,
  } = useProjects();

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
        projectTasks,
        updateProjectTasks,
        addTaskToProject,
        setProjects,
        setProjectTasks,
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
