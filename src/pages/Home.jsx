import AppLayout from "../components/AppLayout.jsx";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import Lists from "../components/Lists.jsx";
import Modal from "../components/Modal.jsx";
import DraggableFloatingButtonResponsive from "../components/DraggableFloatingButtonResponsive.jsx";
import DraggableFloatingButtonDemo from "../components/DraggableFloatingButtonDemo.jsx";
import { useProjectContext } from "../context/ProjectContext";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { DndContext, DragOverlay, closestCorners } from "@dnd-kit/core";
import {
  TouchSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import Task from "../components/Task";
import "../styles/Home.css";
import "../styles/Utilities.css";

function Home() {
  const {
    activeProject,
    projects,
    projectTasks,
    setActiveProject,
    renameProject,
    loading,
  } = useProjectContext();

  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const contentMainRef = useRef(null);
  const [editingProject, setEditingProject] = useState(false);
  const [projectNameInput, setProjectNameInput] = useState(activeProject);
  const [mobileActionsOpen, setMobileActionsOpen] = useState(false);

  useEffect(() => {
    setProjectNameInput(activeProject);
  }, [activeProject]);

  const handleProjectNameEdit = () => {
    setEditingProject(true);
    setTimeout(() => {
      const input = document.getElementById("project-name-input");
      if (input) input.focus();
    }, 50);
  };

  const handleProjectNameChange = (e) => {
    setProjectNameInput(e.target.value);
  };

  const handleProjectNameConfirm = () => {
    const newName = projectNameInput.trim();
    if (!newName || newName === activeProject) {
      setProjectNameInput(activeProject);
      setEditingProject(false);
      return;
    }

    // Usar la función renameProject que maneja tareas y validaciones
    const success = renameProject(activeProject, newName);

    if (success) {
      setActiveProject(newName);
    } else {
      // Si falla (nombre duplicado), revertir
      setProjectNameInput(activeProject);
    }

    setEditingProject(false);
  };

  // Funciones para navegación de proyectos en mobile
  const navigateToNextProject = () => {
    const currentIndex = projects.indexOf(activeProject);
    const nextIndex = (currentIndex + 1) % projects.length;
    setActiveProject(projects[nextIndex]);
  };

  const navigateToPrevProject = () => {
    const currentIndex = projects.indexOf(activeProject);
    const prevIndex =
      currentIndex === 0 ? projects.length - 1 : currentIndex - 1;
    setActiveProject(projects[prevIndex]);
  };

  // Funciones para acciones móviles (replicando Navbar)
  const handleMobileAddTask = () => {
    window.dispatchEvent(
      new CustomEvent("add-task", {
        detail: { project: activeProject },
      })
    );
  };

  const toggleMobileActions = () => {
    setMobileActionsOpen(!mobileActionsOpen);
  };

  // Configurar sensors para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Reducido para ser más sensible
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150, // Reducido de 200ms
        tolerance: 8, // Reducido para ser más sensible
      },
    })
  );

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
    // Prevenir scroll durante el drag
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active && over) {
      // Disparar evento con toda la información del drag
      window.dispatchEvent(
        new CustomEvent("drag-end", {
          detail: {
            activeId: active.id,
            overId: over.id,
            active: active,
            over: over,
          },
        })
      );
    }

    setActiveId(null);
    // Restaurar scroll después del drag
    document.body.style.overflow = "";
    document.body.style.touchAction = "";
  };

  useEffect(() => {
    const enableListScroll = () => {
      const listContainers = document.querySelectorAll(".list__container");
      listContainers.forEach((container) => {
        container.style.overflowY = "auto";
        container.style.touchAction = "pan-y";
        container.style.webkitOverflowScrolling = "touch";
      });
    };
    enableListScroll();
  }, [projectTasks]);

  const getActiveTask = () => {
    if (!activeId) return null;
    const allTasks = [
      ...(projectTasks?.[activeProject]?.pendientes || []),
      ...(projectTasks?.[activeProject]?.enCurso || []),
      ...(projectTasks?.[activeProject]?.terminadas || []),
    ];
    return allTasks.find((t) => t.id === activeId) || null;
  };
  const activeTask = getActiveTask();

  return (
    <AppLayout onMenuClick={toggleSidebar}>
      <DndContext
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        sensors={sensors}
        measuring={{
          droppable: {
            strategy: "always",
          },
        }}
        autoScroll={{
          enabled: false, // Deshabilitar auto-scroll para mejor control
        }}
      >
        <div
          className={`home ${
            !loading && projects.length === 0 ? "no-projects" : ""
          }`}
        >
          {projects.length > 0 && (
            <Navbar
              search={search}
              setSearch={setSearch}
              onMenuClick={toggleSidebar}
              showMenuButton={projects.length > 0}
            />
          )}
          <div className="home__content">
            {/* Sidebar en desktop - dentro del flujo normal, solo si hay proyectos */}
            {projects.length > 0 && (
              <div className="hidden lg:block">
                <Sidebar
                  search={search}
                  setSearch={setSearch}
                  onClose={closeSidebar}
                />
              </div>
            )}

            <div
              ref={contentMainRef}
              className={`home__content-main ${
                !loading && projects.length === 0 ? "no-projects" : ""
              }`}
            >
              {loading ? (
                // Pantalla de carga
                <div className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 min-h-full py-4 sm:py-6 md:py-8 lg:py-10 xl:py-12">
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
                    </div>
                    <p className="text-gray-600 text-lg">
                      Cargando tus proyectos...
                    </p>
                  </div>
                </div>
              ) : !loading && projects.length === 0 ? (
                // Call-to-action cuando no hay proyectos
                <div className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 min-h-full py-4 sm:py-6 md:py-8 lg:py-10 xl:py-12">
                  <div className="max-w-md mx-auto">
                    <div className="mb-6 sm:mb-8">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                        <span className="text-3xl sm:text-4xl">📋</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl xl:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">
                        ¡Bienvenido a FocusLocus!
                      </h2>
                      <p className="text-lg sm:text-xl md:text-lg lg:text-xl mb-6 sm:mb-8">
                        Organiza tus tareas y proyectos de manera eficiente.
                        Comienza creando tu primer proyecto.
                      </p>
                    </div>

                    <div className="space-y-4 sm:space-y-6">
                      <button
                        onClick={() => {
                          // Disparar evento para abrir modal de nuevo proyecto
                          window.dispatchEvent(new CustomEvent("add-project"));
                        }}
                        className="w-full bg-gray-950 text-white py-4 sm:py-5 px-6 sm:px-8 rounded-xl text-lg sm:text-xl font-semibold hover:bg-gray-800 transition-colors shadow-lg"
                      >
                        ✨ Crear mi primer proyecto
                      </button>

                      <div className="text-sm sm:text-base text-gray-600 space-y-1 sm:space-y-2">
                        <p>📁 Organiza tus tareas en proyectos</p>
                        <p>🔄 Mueve tareas entre listas con drag & drop</p>
                        <p>⭐ Establece prioridades y fechas de vencimiento</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Contenido normal cuando hay proyectos
                <>
                  <div className="home__content-main-header flex-shrink-0 mb-1 mt-1 sm:mb-2 sm:mt-1 md:mb-2 md:mt-1 lg:mb-2 lg:mt-1 xl:mb-3 xl:mt-0 px-3 lg:px-0">
                    {editingProject ? (
                      <input
                        id="project-name-input"
                        className="text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold px-2 py-1 rounded focus:ring-2 focus:ring-blue-500 w-full max-w-xs"
                        value={projectNameInput}
                        onChange={handleProjectNameChange}
                        onBlur={handleProjectNameConfirm}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleProjectNameConfirm();
                          if (e.key === "Escape") {
                            setProjectNameInput(activeProject);
                            setEditingProject(false);
                          }
                        }}
                        autoFocus
                        inputMode="text"
                        maxLength={40}
                        aria-label="Editar nombre del proyecto"
                      />
                    ) : (
                      <div className="flex items-center justify-between lg:justify-start w-full">
                        {/* Botón anterior - solo visible en mobile si hay múltiples proyectos */}
                        {projects.length > 1 && (
                          <button
                            onClick={navigateToPrevProject}
                            className="lg:hidden flex items-center justify-center p-2 rounded-full hover:bg-gray-200 transition-colors flex-shrink-0"
                            title="Proyecto anterior"
                            aria-label="Proyecto anterior"
                          >
                            <ChevronLeftIcon
                              className="text-gray-600"
                              fontSize="medium"
                            />
                          </button>
                        )}

                        {/* Nombre del proyecto - centrado en mobile, alineado a la izquierda en desktop */}
                        <span
                          className={`text-xl sm:text-2xl md:text-2xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-bold cursor-pointer px-2 py-2 rounded hover:bg-gray-200 transition-colors flex items-center justify-center lg:justify-start text-center lg:text-left min-h-[2.5rem] w-auto`}
                          tabIndex={0}
                          onClick={handleProjectNameEdit}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ")
                              handleProjectNameEdit();
                          }}
                          title="Editar nombre del proyecto"
                          aria-label="Editar nombre del proyecto"
                        >
                          📌 {activeProject}
                        </span>

                        {/* Botón siguiente - solo visible en mobile si hay múltiples proyectos */}
                        {projects.length > 1 && (
                          <button
                            onClick={navigateToNextProject}
                            className="lg:hidden flex items-center justify-center p-2 rounded-full hover:bg-gray-200 transition-colors flex-shrink-0"
                            title="Siguiente proyecto"
                            aria-label="Siguiente proyecto"
                          >
                            <ChevronRightIcon
                              className="text-gray-600"
                              fontSize="medium"
                            />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 min-h-0 overflow-hidden lg:px-0">
                    <Lists />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar móvil - solo en mobile, fuera del flujo principal para máximo z-index */}
        <div
          className={`lg:hidden ${
            !loading && projects.length === 0
              ? "fixed -top-full opacity-0 pointer-events-none z-[9999999]" // Oculto fuera de vista cuando no hay proyectos, pero los modales siguen funcionando
              : `${
                  sidebarOpen ? "block" : "hidden"
                } h-full fixed top-0 left-0 z-[9999999]`
          }`}
        >
          <div
            className={`sidebar-container h-full ${
              !loading && projects.length === 0
                ? "" // Sin animación cuando no hay proyectos
                : `${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                  } transition-transform duration-300 ease-in-out`
            }`}
          >
            <Sidebar
              search={search}
              setSearch={setSearch}
              onClose={closeSidebar}
            />
          </div>
        </div>

        {/* Overlay para cerrar sidebar en móviles - fuera del contenedor principal */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-20 lg:hidden sidebar-overlay"
            onClick={closeSidebar}
          />
        )}

        {/* Botón flotante para acciones en mobile - solo cuando hay proyectos */}
        {projects.length > 0 && (
          <DraggableFloatingButtonResponsive
            storageKey="actions-btn"
            defaultPosition={{ bottom: 16, left: 16 }}
            enabled={true}
            showDragHandle={true}
          >
            <div className="sm:hidden">
              {/* Botón principal flotante */}
              <button
                onClick={() => {
                  toggleMobileActions();
                }}
                className="w-16 h-16 bg-gray-950 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-800 transition-colors"
                title="Acciones"
              >
                <span className="text-2xl font-bold">
                  {mobileActionsOpen ? "✕" : "+"}
                </span>
              </button>
              {/* Portal para overlay y menú de acciones */}
              {mobileActionsOpen &&
                typeof window !== "undefined" &&
                createPortal(
                  <>
                    {/* Overlay para cerrar menu al tocar fuera */}
                    <div
                      className="fixed inset-0"
                      style={{ zIndex: 99998 }}
                      onClick={() => setMobileActionsOpen(false)}
                    />
                    {/* Menú de acciones desplegable */}
                    <div
                      className="fixed bottom-32 left-4 bg-white rounded-lg shadow-lg border border-gray-200 w-48 overflow-hidden"
                      style={{ zIndex: 99999 }}
                    >
                      <div
                        onClick={() => {
                          handleMobileAddTask();
                          setMobileActionsOpen(false);
                        }}
                        className="w-full px-5 py-4 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 cursor-pointer"
                      >
                        <span className="text-xl">+</span>
                        <span className="font-medium text-base">
                          Agregar tarea
                        </span>
                      </div>
                      <div
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent("clear-tasks"));
                          setMobileActionsOpen(false);
                        }}
                        className="w-full px-5 py-4 text-left hover:bg-gray-50 flex items-center gap-3 text-red-600 cursor-pointer"
                      >
                        <span className="text-xl">🗑️</span>
                        <span className="font-medium text-base">
                          Limpiar tareas
                        </span>
                      </div>
                    </div>
                  </>,
                  document.body
                )}
            </div>
          </DraggableFloatingButtonResponsive>
        )}

        <DragOverlay dropAnimation={null} zIndex={1}>
          {activeTask ? (
            <Task
              id={activeTask.id}
              nombre={activeTask.nombre}
              expira={activeTask.expira}
              prioridad={activeTask.prioridad}
              descripcion={activeTask.descripcion}
              isOverlay={true}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Demo component for testing draggable buttons */}
      <DraggableFloatingButtonDemo />
    </AppLayout>
  );
}

export default Home;
