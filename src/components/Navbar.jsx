import SearchBar from "./SearchBar.jsx";
import { useProjectContext } from "../context/ProjectContext.jsx";
import Modal from "./Modal";
import { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import Button from "./Button";

function Navbar({ search, setSearch, onMenuClick, showMenuButton = true }) {
  const { activeProject, projects } = useProjectContext();
  const [clearModal, setClearModal] = useState({ open: false });

  // Función para agregar tarea
  const handleAddTask = () => {
    window.dispatchEvent(
      new CustomEvent("add-task", {
        detail: { project: activeProject },
      })
    );
  };

  // Función para limpiar todos los datos del proyecto actual
  const clearAllData = () => {
    setClearModal({ open: true });
  };

  const handleConfirmClear = () => {
    // Disparar evento para limpiar tareas
    window.dispatchEvent(new CustomEvent("clear-tasks"));
    setClearModal({ open: false });
  };

  return (
    <nav className="navbar w-full h-12 sm:h-14 md:h-16 lg:h-18 rounded-tl-2xl rounded-tr-2xl flex items-center justify-between p-1.5 sm:p-2 md:p-3 lg:p-4 xl:p-6 relative z-10">
      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 flex-1 min-w-0">
        {/* Botón de menú para móviles */}
        {showMenuButton && (
          <Button
            variant="secondary"
            onClick={onMenuClick}
            className="lg:hidden p-0.5 sm:p-1.5 md:p-2 flex-shrink-0 min-w-0 min-h-0 w-8 h-8 sm:w-auto sm:h-auto flex items-center justify-center"
            title="Menú"
          >
            <MenuIcon className="text-base sm:text-lg" />
          </Button>
        )}
        <SearchBar search={search} setSearch={setSearch} />
      </div>
      {/* Botones de control */}
      <div className="flex gap-1 sm:gap-1.5 md:gap-2 lg:gap-3 xl:gap-4 justify-end flex-shrink-0 ml-2 sm:ml-3 md:ml-4 lg:ml-6">
        <Button
          onClick={handleAddTask}
          disabled={projects.length === 0}
          variant="primary"
          className="px-0.5 sm:px-2.5 md:px-3 lg:px-4 xl:px-4.5 py-0.5 sm:py-1 md:py-1 lg:py-1.5 text-xs sm:text-sm md:text-sm lg:text-base min-w-[24px] sm:min-w-[70px] md:min-w-[75px] lg:min-w-[80px] h-7 sm:h-auto border flex items-center justify-center"
          title={
            projects.length === 0
              ? "No hay proyectos disponibles"
              : "Agregar nueva tarea"
          }
        >
          <span className="hidden sm:inline">+ Agregar tarea</span>
          <span className="sm:hidden text-sm">+</span>
        </Button>
        <Button
          onClick={clearAllData}
          disabled={projects.length === 0}
          variant="secondary"
          className="px-0.5 sm:px-2.5 md:px-3 lg:px-4 xl:px-4.5 py-0.5 sm:py-1 md:py-1 lg:py-1.5 text-xs sm:text-sm md:text-sm lg:text-base min-w-[24px] sm:min-w-[70px] md:min-w-[75px] lg:min-w-[80px] h-7 sm:h-auto border flex items-center justify-center"
          title={
            projects.length === 0
              ? "No hay proyectos disponibles"
              : "Limpiar todas las tareas"
          }
        >
          <span className="hidden sm:inline">🗑️ Limpiar tareas</span>
          <span className="sm:hidden text-sm">🗑️</span>
        </Button>
      </div>
      {/* Modal para confirmar limpiar todas las tareas */}
      <Modal
        open={clearModal.open}
        onClose={() => setClearModal({ open: false })}
        title="¿Limpiar todas las tareas?"
        actions={
          <>
            <Button
              variant="cancel"
              onClick={() => setClearModal({ open: false })}
              className="mr-2"
            >
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleConfirmClear}>
              Limpiar
            </Button>
          </>
        }
      >
        ¿Estás seguro de que quieres eliminar todas las tareas de este proyecto?
        Esta acción no se puede deshacer.
      </Modal>
    </nav>
  );
}

export default Navbar;
