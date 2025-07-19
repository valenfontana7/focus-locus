import AppLayout from "../components/AppLayout.jsx";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import Lists from "../components/Lists.jsx";
import Modal from "../components/Modal.jsx";
import { useProjectContext } from "../context/ProjectContext";
import { useState, useEffect, useRef } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import { DndContext, DragOverlay, closestCenter } from "@dnd-kit/core";
import {
  TouchSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import Task from "../components/Task";

function Home() {
  const {
    activeProject,
    projects,
    projectTasks,
    addProject,
    setActiveProject,
    deleteProject,
    setProjects,
    setProjectTasks,
  } = useProjectContext();
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [heightAdjusted, setHeightAdjusted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const contentMainRef = useRef(null);
  const [resetKey, setResetKey] = useState(0);
  const [editingProject, setEditingProject] = useState(false);
  const [projectNameInput, setProjectNameInput] = useState(activeProject);

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
    // Actualiza el array de proyectos
    const updatedProjects = projects.map((p) =>
      p === activeProject ? newName : p
    );
    setProjects(updatedProjects);
    setActiveProject(newName);
    setEditingProject(false);
  };

  // Función helper para calcular alturas del header
  const getHeaderDimensions = () => {
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

    return { headerHeight, headerMargin };
  };

  // Función helper para calcular altura disponible
  const calculateAvailableHeight = () => {
    const viewportHeight = window.innerHeight;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari =
      /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

    const { headerHeight, headerMargin } = getHeaderDimensions();
    const headerHeightPx = headerHeight * 16; // Convertir rem a px
    const headerMarginPx = headerMargin * 16; // Convertir rem a px
    const appLayoutPadding = 0.25 * 16; // 0.25rem en px

    // Si no hay proyectos, usar más espacio disponible pero respetando header
    if (projects.length === 0 && isIOS && isSafari) {
      // Usar menos espacio reservado cuando no hay Navbar
      const reservedSpace = 40; // Reducido de 80 a 40

      const totalReservedSpace =
        headerHeightPx + headerMarginPx + appLayoutPadding + reservedSpace;
      const availableHeight = viewportHeight - totalReservedSpace;
      const purpleHeight = availableHeight; // Sin margen para el contenido

      return { availableHeight, purpleHeight };
    }

    // Ajustar espacio reservado para iOS Safari
    let reservedSpace;
    if (isIOS && isSafari) {
      // Para iOS Safari, usar menos espacio reservado
      reservedSpace = 20; // Reducido de 40 a 20 para más altura
    } else {
      reservedSpace = 80;
    }

    const totalReservedSpace =
      headerHeightPx + headerMarginPx + appLayoutPadding + reservedSpace;
    const availableHeight = viewportHeight - totalReservedSpace;
    const purpleHeight = availableHeight - 20;

    return { availableHeight, purpleHeight };
  };

  // Configurar sensors para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 10,
      },
    })
  );

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Función para manejar la creación de proyecto desde el call-to-action
  const handleCreateProject = () => {
    localStorage.removeItem("focusLocusProjects");
    localStorage.removeItem("focusLocusProjectTasks");
    localStorage.removeItem("focusLocusActiveProject");
    window.location.reload();
  };

  // Listener para el evento add-project desde el call-to-action
  useEffect(() => {
    const handleAddProjectEvent = () => {
      handleCreateProject();
    };

    window.addEventListener("add-project", handleAddProjectEvent);
    return () =>
      window.removeEventListener("add-project", handleAddProjectEvent);
  }, []);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
    // Prevenir scroll durante el drag
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active && over && active.id !== over.id) {
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

  // Aplicar estilos inmediatamente al montar
  useEffect(() => {
    const { availableHeight, purpleHeight } = calculateAvailableHeight();

    // Aplicar estilos inmediatamente al body
    document.body.style.setProperty("overflow-x", "hidden", "important");
    document.body.style.setProperty("overflow-y", "hidden", "important");
    document.body.style.setProperty("touch-action", "pan-x", "important");

    // Aplicar padding superior al AppLayout
    const appLayoutElement = document.querySelector(".app-layout");
    if (appLayoutElement) {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isSafari =
        /Safari/.test(navigator.userAgent) &&
        !/Chrome/.test(navigator.userAgent);

      if (isIOS && isSafari) {
        appLayoutElement.style.setProperty(
          "padding-top",
          "0.0625rem",
          "important"
        ); // Reducido aún más para iOS Safari
      } else {
        appLayoutElement.style.setProperty(
          "padding-top",
          "0.25rem",
          "important"
        );
      }
    }

    // Aplicar estilos a todos los elementos necesarios
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari =
      /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    const isIOSSafari = isIOS && isSafari;

    const style = document.createElement("style");
    style.textContent = `
      .app-layout {
        padding-top: ${isIOSSafari ? "0.0625rem" : "0.25rem"} !important;
        height: 100vh !important;
        height: -webkit-fill-available !important;
      }
      @media (min-width: 640px) {
        .app-layout {
          padding-top: ${isIOSSafari ? "0.125rem" : "0.5rem"} !important;
        }
      }
      @media (min-width: 768px) {
        .app-layout {
          padding-top: ${isIOSSafari ? "0.1875rem" : "0.75rem"} !important;
        }
      }
      @media (min-width: 1024px) {
        .app-layout {
          padding-top: ${isIOSSafari ? "0.25rem" : "1rem"} !important;
        }
      }
      @media (min-width: 1280px) {
        .app-layout {
          padding-top: ${isIOSSafari ? "0.3125rem" : "1.25rem"} !important;
        }
      }
      @media (min-width: 1536px) {
        .app-layout {
          padding-top: ${isIOSSafari ? "0.375rem" : "1.5rem"} !important;
        }
      }
      .home {
        height: ${availableHeight}px !important;
        max-height: ${availableHeight}px !important;
        min-height: ${availableHeight}px !important;
        height: -webkit-fill-available !important;
        overflow: hidden !important;
      }
      .home__content {
        height: 100% !important;
        max-height: 100% !important;
        min-height: 100% !important;
        height: -webkit-fill-available !important;
        overflow: hidden !important;
      }
      .home__content-main {
        height: ${purpleHeight}px !important;
        min-height: ${purpleHeight}px !important;
        max-height: ${purpleHeight}px !important;
        height: -webkit-fill-available !important;
        overflow: hidden !important;
      }
    `;
    document.head.appendChild(style);

    // Aplicar padding directamente al elemento si existe
    if (contentMainRef.current) {
      contentMainRef.current.style.setProperty(
        "padding-top",
        "0.25rem",
        "important"
      );
      contentMainRef.current.style.setProperty(
        "padding-bottom",
        "2rem",
        "important"
      );
    }

    setIsLoading(false);
    setHeightAdjusted(true);

    return () => {
      document.head.removeChild(style);
    };
  }, [projects.length]);

  // Ajustar altura para todas las resoluciones (resize y orientación)
  useEffect(() => {
    const adjustHeight = () => {
      // No ajustar altura durante el drag and drop
      if (activeId) return;

      if (contentMainRef.current && heightAdjusted) {
        const { availableHeight, purpleHeight } = calculateAvailableHeight();

        // Solo ajustar si no estamos en drag
        if (!activeId) {
          // Ajustar el contenedor principal (.home) - usar la altura disponible
          const homeElement = contentMainRef.current.closest(".home");
          if (homeElement) {
            homeElement.style.setProperty(
              "height",
              `${availableHeight}px`,
              "important"
            );
            homeElement.style.setProperty(
              "max-height",
              `${availableHeight}px`,
              "important"
            );
            homeElement.style.setProperty(
              "min-height",
              `${availableHeight}px`,
              "important"
            );
            homeElement.style.setProperty("overflow", "hidden", "important");
          }

          // Ajustar el contenedor de contenido (.home__content) para que tome la altura del padre
          const contentElement =
            contentMainRef.current.closest(".home__content");
          if (contentElement) {
            contentElement.style.setProperty("height", "100%", "important");
            contentElement.style.setProperty("max-height", "100%", "important");
            contentElement.style.setProperty("min-height", "100%", "important");
            contentElement.style.setProperty("overflow", "hidden", "important");
          }

          // Ajustar el contenedor principal - usar casi toda la altura disponible
          contentMainRef.current.style.setProperty(
            "height",
            `${purpleHeight}px`,
            "important"
          );
          contentMainRef.current.style.setProperty(
            "min-height",
            `${purpleHeight}px`,
            "important"
          );
          contentMainRef.current.style.setProperty(
            "max-height",
            `${purpleHeight}px`,
            "important"
          );
          contentMainRef.current.style.setProperty(
            "overflow",
            "hidden",
            "important"
          );
        }
      }
    };

    // Solo ejecutar si ya se ajustó la altura inicial
    if (heightAdjusted) {
      // Event listeners solo para resize y orientación
      window.addEventListener("resize", adjustHeight);
      window.addEventListener("orientationchange", adjustHeight);

      return () => {
        window.removeEventListener("resize", adjustHeight);
        window.removeEventListener("orientationchange", adjustHeight);
      };
    }
  }, [activeId, heightAdjusted, projects.length]); // Agregar heightAdjusted y projects.length como dependencias

  // Restaurar altura cuando termine el drag
  useEffect(() => {
    if (!activeId && contentMainRef.current) {
      // Pequeño delay para asegurar que el drag haya terminado completamente
      const timeoutId = setTimeout(() => {
        const { availableHeight, purpleHeight } = calculateAvailableHeight();

        // Restaurar altura del contenedor principal
        const homeElement = contentMainRef.current.closest(".home");
        if (homeElement) {
          homeElement.style.setProperty(
            "height",
            `${availableHeight}px`,
            "important"
          );
          homeElement.style.setProperty(
            "max-height",
            `${availableHeight}px`,
            "important"
          );
          homeElement.style.setProperty(
            "min-height",
            `${availableHeight}px`,
            "important"
          );
        }

        // Restaurar altura del contenedor de contenido
        const contentElement = contentMainRef.current.closest(".home__content");
        if (contentElement) {
          contentElement.style.setProperty("height", "100%", "important");
          contentElement.style.setProperty("max-height", "100%", "important");
          contentElement.style.setProperty("min-height", "100%", "important");
        }

        // Restaurar altura del contenedor principal
        contentMainRef.current.style.setProperty(
          "height",
          `${purpleHeight}px`,
          "important"
        );
        contentMainRef.current.style.setProperty(
          "min-height",
          `${purpleHeight}px`,
          "important"
        );
        contentMainRef.current.style.setProperty(
          "max-height",
          `${purpleHeight}px`,
          "important"
        );
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [activeId, projects.length]);

  // Limpiar estilos del body si el componente se desmonta durante un drag
  useEffect(() => {
    return () => {
      if (activeId) {
        document.body.style.overflow = "";
        document.body.style.touchAction = "";
      }
    };
  }, [activeId]);

  // Control de scroll global - deshabilitar scroll vertical excepto en listas
  useEffect(() => {
    // Deshabilitar scroll vertical en el body
    document.body.style.overflowX = "hidden";
    document.body.style.overflowY = "hidden";
    document.body.style.touchAction = "pan-x"; // Solo permitir scroll horizontal

    // Permitir scroll en contenedores de listas
    const listContainers = document.querySelectorAll(".list__container");
    listContainers.forEach((container) => {
      container.style.overflowY = "auto";
      container.style.touchAction = "pan-y";
      container.style.webkitOverflowScrolling = "touch";
    });

    return () => {
      // Restaurar scroll al desmontar
      document.body.style.overflowX = "";
      document.body.style.overflowY = "";
      document.body.style.touchAction = "";
    };
  }, []);

  // Asegurar que las listas tengan scroll habilitado cuando se rendericen
  useEffect(() => {
    const enableListScroll = () => {
      const listContainers = document.querySelectorAll(".list__container");
      listContainers.forEach((container) => {
        container.style.overflowY = "auto";
        container.style.touchAction = "pan-y";
        container.style.webkitOverflowScrolling = "touch";
        container.style.maxHeight = "100%";
      });
    };

    // Ejecutar inmediatamente
    enableListScroll();

    // Ejecutar después de un delay para asegurar que las listas estén renderizadas
    const timeoutId = setTimeout(enableListScroll, 100);

    // Observer para detectar cuando se agregan nuevas listas
    const observer = new MutationObserver(enableListScroll);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, []);

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
    <AppLayout key={resetKey}>
      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        sensors={sensors}
        measuring={{
          droppable: {
            strategy: "always",
          },
        }}
      >
        <div
          className={`home bg-white rounded-2xl flex flex-col overflow-hidden h-full ${
            isLoading ? "opacity-0" : "opacity-100"
          } transition-opacity duration-200 ${
            projects.length === 0 ? "justify-center no-projects" : ""
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
          <div className="home__content flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden h-full">
            {/* Sidebar - con animación de deslizamiento */}
            {projects.length > 0 && (
              <div
                className={`lg:block ${
                  sidebarOpen ? "block" : "hidden"
                } lg:relative lg:w-auto h-full fixed lg:static top-0 left-0 z-[999999] lg:z-[100]`}
              >
                <div
                  className={`sidebar-container h-full ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                  } lg:translate-x-0 transition-transform duration-300 ease-in-out`}
                >
                  <Sidebar
                    search={search}
                    setSearch={setSearch}
                    onClose={closeSidebar}
                  />
                </div>
              </div>
            )}

            <div
              ref={contentMainRef}
              className={`home__content-main w-full bg-gray-100 rounded-br-2xl flex flex-col flex-1 min-h-0 overflow-hidden h-full ${
                projects.length === 0
                  ? "rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl p-0 shadow-none no-projects"
                  : "px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 md:py-5 lg:py-6 xl:py-8 border-b-4 border-gray-300"
              }`}
            >
              {projects.length === 0 ? (
                // Call-to-action cuando no hay proyectos
                <div className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
                  <div className="max-w-md mx-auto">
                    <div className="mb-6">
                      <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">📋</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
                        ¡Bienvenido a FocusLocus!
                      </h2>
                      <p className="text-gray-600 text-lg mb-6">
                        Organiza tus tareas y proyectos de manera eficiente.
                        Comienza creando tu primer proyecto.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <button
                        onClick={() => {
                          // Disparar evento para abrir modal de nuevo proyecto
                          window.dispatchEvent(new CustomEvent("add-project"));
                        }}
                        className="w-full bg-gray-950 text-white py-4 px-6 rounded-xl text-lg font-semibold hover:bg-gray-800 transition-colors"
                      >
                        ✨ Crear mi primer proyecto
                      </button>

                      <div className="text-sm text-gray-500">
                        <p>Organiza tus tareas en proyectos</p>
                        <p>Mueve tareas entre listas con drag & drop</p>
                        <p>Establece prioridades y fechas de vencimiento</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Contenido normal cuando hay proyectos
                <>
                  <div className="home__content-main-header flex-shrink-0 mb-3 sm:mb-4 md:mb-5 lg:mb-6 xl:mb-8 mt-6 sm:mt-3 md:mt-4 lg:mt-5 xl:mt-6">
                    {editingProject ? (
                      <input
                        id="project-name-input"
                        className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold px-2 py-1 rounded focus:ring-2 focus:ring-blue-500 w-full max-w-xs"
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
                      <span
                        className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold cursor-pointer px-2 py-1 rounded hover:bg-gray-200 transition-colors"
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
                    )}
                  </div>
                  <div className="flex-1 min-h-0 overflow-hidden h-full">
                    <Lists />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Overlay para cerrar sidebar en móviles - fuera del contenedor principal */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-20 z-10 lg:hidden sidebar-overlay"
            onClick={closeSidebar}
          />
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
    </AppLayout>
  );
}

export default Home;
