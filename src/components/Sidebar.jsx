import ProjectItem from "./ProjectItem";
import Button from "./Button";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { useProjectContext } from "../context/ProjectContext";
import useProjectColors from "../hooks/useProjectColors";
import Modal from "./Modal";
import { useState, useEffect, useRef } from "react";

function Sidebar({ search, onClose }) {
  const {
    activeProject,
    setActiveProject,
    projects,
    addProject,
    deleteProject,
  } = useProjectContext();
  const { getColor } = useProjectColors(projects);
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    projectName: "",
  });
  const [createModal, setCreateModal] = useState({
    open: false,
    projectName: "",
  });

  // Función para agregar un nuevo proyecto
  const addNewProject = () => {
    setCreateModal({ open: true, projectName: "" });
  };

  const handleConfirmCreate = () => {
    if (createModal.projectName && createModal.projectName.trim()) {
      addProject(createModal.projectName.trim());
      setCreateModal({ open: false, projectName: "" });
    }
  };

  // Función para eliminar un proyecto
  const handleDeleteProject = (projectName) => {
    setDeleteModal({ open: true, projectName });
    if (onClose) onClose(); // Cierra el sidebar en mobile
  };

  const handleConfirmDelete = () => {
    if (deleteModal.projectName) {
      deleteProject(deleteModal.projectName);
      setDeleteModal({ open: false, projectName: "" });
    }
  };

  const sidebarRef = useRef(null);

  // Calcular altura del sidebar dinámicamente usando la misma lógica que Home
  useEffect(() => {
    const calculateSidebarHeight = () => {
      if (sidebarRef.current) {
        const viewportHeight = window.innerHeight;

        // Usar la misma lógica de cálculo que Home
        const width = window.innerWidth;
        let headerHeight, headerMargin;

        if (width >= 1280) {
          headerHeight = 6; // 6rem
          headerMargin = 1.5; // 1.5rem
        } else if (width >= 1024) {
          headerHeight = 5.5; // 5.5rem
          headerMargin = 1.25; // 1.25rem
        } else if (width >= 768) {
          headerHeight = 5; // 5rem
          headerMargin = 1; // 1rem
        } else if (width >= 640) {
          headerHeight = 4.5; // 4.5rem
          headerMargin = 0.75; // 0.75rem
        } else {
          headerHeight = 4; // 4rem
          headerMargin = 0.5; // 0.5rem
        }

        const headerHeightPx = headerHeight * 16; // Convertir rem a px
        const headerMarginPx = headerMargin * 16; // Convertir rem a px
        const appLayoutPadding = 0.25 * 16; // 0.25rem en px

        // Espacio reservado para el header y padding
        const reservedSpace = 80;

        const totalReservedSpace =
          headerHeightPx + headerMarginPx + appLayoutPadding + reservedSpace;
        const availableHeight = viewportHeight - totalReservedSpace;

        // Para el sidebar, usar altura completa del viewport en mobile
        const isMobile = window.innerWidth < 1024;
        const sidebarHeight = isMobile
          ? window.innerHeight
          : availableHeight - 64;

        sidebarRef.current.style.setProperty(
          "height",
          `${sidebarHeight}px`,
          "important"
        );
      }
    };

    calculateSidebarHeight();
    window.addEventListener("resize", calculateSidebarHeight);

    return () => window.removeEventListener("resize", calculateSidebarHeight);
  }, []);

  // Fallback JS para browsers que no soportan 100svh
  useEffect(() => {
    function updateSidebarHeight() {
      if (sidebarRef.current) {
        const vh = window.visualViewport
          ? window.visualViewport.height
          : window.innerHeight;
        sidebarRef.current.style.height = vh + "px";
        sidebarRef.current.style.maxHeight = vh + "px";
      }
    }
    updateSidebarHeight();
    window.addEventListener("resize", updateSidebarHeight);
    window.addEventListener("orientationchange", updateSidebarHeight);
    return () => {
      window.removeEventListener("resize", updateSidebarHeight);
      window.removeEventListener("orientationchange", updateSidebarHeight);
    };
  }, []);

  // Función para seleccionar un proyecto y cerrar el sidebar en móviles
  const handleProjectSelect = (project) => {
    setActiveProject(project);
    // Cerrar sidebar solo en móviles
    if (onClose) {
      onClose();
    }
  };

  // Listener para el evento add-project desde el call-to-action
  useEffect(() => {
    const handleAddProjectEvent = () => {
      addNewProject();
    };

    window.addEventListener("add-project", handleAddProjectEvent);
    return () =>
      window.removeEventListener("add-project", handleAddProjectEvent);
  }, []);

  return (
    <div
      ref={sidebarRef}
      className="sidebar bg-white w-80 lg:w-80 xl:w-96 pt-8 pl-6 pr-6 pb-6 rounded-bl-2xl flex flex-col min-h-0 lg:relative fixed lg:static top-0 left-0 z-50 lg:z-auto"
    >
      <div className="flex-1 overflow-y-auto min-h-0 px-2 pt-4 pb-20 sm:pb-8 md:pb-4 flex flex-col">
        {/* Botón de cerrar para móviles */}
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="Cerrar menú"
        >
          <CloseIcon />
        </button>

        <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-medium flex-shrink-0 mb-8">
          Mis proyectos
        </h2>
        <Button
          icon={<AddIcon />}
          onClick={() => {
            setCreateModal((prev) => ({ ...prev, open: true }));
            if (onClose) onClose();
          }}
          className="w-full justify-center mb-2"
        >
          Nuevo proyecto
        </Button>
        <ul className="sidebar__list flex-1 min-h-0 overflow-y-auto">
          {(projects || [])
            .filter(
              (project) =>
                !search || project.toLowerCase().includes(search.toLowerCase())
            )
            .map((project) => (
              <ProjectItem
                key={project}
                projectName={project}
                color={getColor(project)}
                isActive={activeProject === project}
                onClick={() => handleProjectSelect(project)}
                onDelete={() => handleDeleteProject(project)}
              />
            ))}
        </ul>
        <div className="mt-12 mb-32 sm:mb-16 md:mb-8 lg:mb-20 xl:mb-24">
          <Modal
            open={createModal.open}
            onClose={() => setCreateModal({ open: false, projectName: "" })}
            title="Nuevo proyecto"
            actions={
              <>
                <Button
                  variant="cancel"
                  onClick={() =>
                    setCreateModal({ open: false, projectName: "" })
                  }
                  className="mr-2"
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={handleConfirmCreate}
                  disabled={!createModal.projectName.trim()}
                >
                  Crear
                </Button>
              </>
            }
          >
            <input
              type="text"
              value={createModal.projectName}
              onChange={(e) =>
                setCreateModal((prev) => ({
                  ...prev,
                  projectName: e.target.value,
                }))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nombre del proyecto"
              maxLength={40}
              autoFocus
            />
          </Modal>
        </div>
      </div>

      {/* Modal para eliminar proyecto */}
      <Modal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, projectName: "" })}
        title="¿Eliminar proyecto?"
        actions={
          <>
            <Button
              variant="cancel"
              onClick={() => setDeleteModal({ open: false, projectName: "" })}
              className="mr-2"
            >
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              Eliminar
            </Button>
          </>
        }
      >
        ¿Estás seguro de que quieres eliminar el proyecto "
        {deleteModal.projectName}"? Esta acción no se puede deshacer.
      </Modal>
    </div>
  );
}

export default Sidebar;
