import SearchBar from "./SearchBar.jsx";
import useProjects from "../hooks/useProjects";
import { useProjectContext } from "../context/ProjectContext.jsx";

function Navbar({ search, setSearch }) {
  const { activeProject } = useProjectContext();
  const { addTaskToProject, clearProjectTasks } = useProjects();
  // Función para limpiar todos los datos del proyecto actual
  const clearAllData = () => {
    if (
      window.confirm(
        "¿Estás seguro de que quieres eliminar todas las tareas de este proyecto? Esta acción no se puede deshacer."
      )
    ) {
      clearProjectTasks(activeProject);
    }
  };

  // Función para agregar una nueva tarea
  const addNewTask = () => {
    addTaskToProject(activeProject);
  };
  return (
    <nav className="navbar w-full h-18 rounded-tl-2xl rounded-tr-2xl flex items-center justify-between p-6">
      <SearchBar search={search} setSearch={setSearch} />
      {/* Botones de control */}
      <div className="flex gap-4 justify-end">
        <button
          onClick={addNewTask}
          className="px-4 py-2 bg-gray-950 text-white rounded-lg transition-colors"
        >
          + Agregar tarea
        </button>
        <button
          onClick={clearAllData}
          className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100 border border-black transition-colors"
        >
          🗑️ Limpiar tareas
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
