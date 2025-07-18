import { createContext, useContext, useState } from "react";

const ProjectContext = createContext();

export function ProjectProvider({ children }) {
  const [activeProject, setActiveProject] = useState("Freelance Web");

  return (
    <ProjectContext.Provider value={{ activeProject, setActiveProject }}>
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
