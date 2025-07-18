import ProjectItem from "./ProjectItem";
import Button from "./Button";
import AddIcon from "@mui/icons-material/Add";
import useProjects from "../hooks/useProjects";
import { useProjectContext } from "../context/ProjectContext";
import useProjectColors from "../hooks/useProjectColors";

function Sidebar({ search }) {
  const { projects, addProject, deleteProject } = useProjects();
  const { activeProject, setActiveProject } = useProjectContext();
  const { getColor } = useProjectColors(projects);

  // Función para agregar un nuevo proyecto
  const addNewProject = () => {
    const projectName = prompt("Ingresa el nombre del nuevo proyecto:");
    if (projectName && projectName.trim()) {
      addProject(projectName);
    }
  };

  // Función para eliminar un proyecto
  const handleDeleteProject = (projectName) => {
    if (
      window.confirm(
        `¿Estás seguro de que quieres eliminar el proyecto "${projectName}"?`
      )
    ) {
      deleteProject(projectName);
    }
  };

  // Filtrar proyectos según búsqueda
  const filteredProjects = projects.filter((project) =>
    project.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="sidebar bg-white h-full w-80 pt-8 pl-6 pr-6 pb-6 rounded-bl-2xl flex flex-col justify-between">
      <div>
        <h2 className="text-2xl font-medium">Mis proyectos</h2>
        <ul className="sidebar__list mt-4">
          {filteredProjects.length === 0 && (
            <li className="text-gray-400 italic">No hay proyectos</li>
          )}
          {filteredProjects.map((project) => (
            <ProjectItem
              key={project}
              projectName={project}
              color={getColor(project)}
              onDelete={() => handleDeleteProject(project)}
              onClick={() => setActiveProject(project)}
              isActive={activeProject === project}
            />
          ))}
        </ul>
      </div>

      <Button
        icon={<AddIcon />}
        type="button"
        variant="transparent"
        onClick={addNewProject}
      >
        Nuevo proyecto
      </Button>
    </div>
  );
}

export default Sidebar;
