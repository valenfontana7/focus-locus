import ProjectItem from "./ProjectItem";
import Button from "./Button";
import AddIcon from "@mui/icons-material/Add";

function Sidebar() {
  return (
    <div className="sidebar bg-white h-full w-80 pt-8 pl-6 pr-6 pb-6 rounded-bl-2xl flex flex-col justify-between">
      <div>
        <h2 className="text-2xl font-medium">Mis proyectos</h2>
        <ul className="sidebar__list mt-4">
          {["Freelance Web", "Tesis", "Personal"].map((project) => (
            <ProjectItem key={project} projectName={project} />
          ))}
        </ul>
      </div>

      <Button icon={<AddIcon />} type="button" variant="transparent">
        Nuevo proyecto
      </Button>
    </div>
  );
}

export default Sidebar;
