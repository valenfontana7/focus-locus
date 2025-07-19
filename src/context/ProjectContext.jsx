import { createContext, useContext } from "react";
import useProjects from "../hooks/useProjects";
import useLocalStorage from "../hooks/useLocalStorage";

const ProjectContext = createContext();

export function ProjectProvider({ children }) {
  // Persistir el proyecto activo
  const [activeProject, setActiveProject] = useLocalStorage(
    "focusLocusActiveProject",
    "Mi Primer Proyecto"
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
