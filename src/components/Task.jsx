import React, { useState, useRef } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { formatearFechaPersonalizada } from "../utils/dateUtils";
import { createPortal } from "react-dom";
import Button from "./Button";
import "../styles/Task.css";

/**
 * Componente para renderizar una tarea individual.
 * @param {string} id - Id único de la tarea.
 * @param {string} nombre - Nombre de la tarea.
 * @param {string} [expira] - Fecha de expiración (opcional).
 * @param {string} [prioridad] - Prioridad de la tarea (baja, normal, media, alta).
 * @param {string} [descripcion] - Descripción de la tarea.
 * @param {function} [onRename] - Función para renombrar la tarea.
 * @param {boolean} [isOverlay] - Si es el overlay de drag, deshabilita edición y menú.
 */
function Task({
  id,
  nombre,
  expira,
  prioridad = "normal",
  descripcion,
  isOverlay = false,
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    transform,
    isDragging,
  } = useDraggable({
    id,
    disabled: isOverlay, // Deshabilita el drag and drop si es overlay
  });
  const { isOver, setNodeRef: setDropRef } = useDroppable({
    id,
    data: {
      type: "task",
      taskId: id,
    },
  });

  // Combinar refs para draggable y droppable
  function setCombinedRef(node) {
    setDragRef(node);
    setDropRef(node);
  }

  const style = {
    ...(transform
      ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
      : {}),
    opacity: isDragging ? 0.5 : 1,
    background: isOver ? "#e0e7ff" : "#f9fafb",
    transition: "background 0.15s",
  };

  // useEffect(() => {
  //   function handleClickOutside(event) {
  //     if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
  //       setOpen(false);
  //     }
  //   }
  //   if (open) {
  //     document.addEventListener("mousedown", handleClickOutside);
  //   } else {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   }
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, [open]);

  const menuWidth = 220; // Ancho fijo del menú en px (igual que minWidth)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const handleMenuOpen = () => {
    setOpen(true);
    // Calcular la posición del botón para el portal
    setTimeout(() => {
      if (dropdownRef.current) {
        const rect = dropdownRef.current.getBoundingClientRect();
        let left = rect.left + window.scrollX;
        // Si el menú se sale del viewport derecho, lo alineo a la izquierda
        if (left + menuWidth > window.innerWidth) {
          left = rect.right + window.scrollX - menuWidth;
        }
        setMenuPosition({
          top: rect.bottom + window.scrollY,
          left,
          width: rect.width,
        });
      }
    }, 0);
  };

  return (
    <div
      ref={setCombinedRef}
      style={style}
      className={`task-container flex items-start justify-between group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-4 sm:p-4 md:p-5 lg:p-5 xl:p-6 border border-gray-100 hover:border-gray-200 ${
        isDragging ? "task-dragging" : ""
      } ${isOver ? "task-drop-zone" : ""}`}
    >
      <div className="w-full">
        {/* Fila superior */}
        <div className="flex items-start w-full gap-3">
          {/* Icono de drag con mejor diseño */}
          <span
            ref={setCombinedRef}
            className="drag-handle cursor-move text-gray-300 hover:text-gray-500 flex-shrink-0 transition-colors duration-200"
            style={{ touchAction: "none" }}
            title="Arrastrar tarea"
            tabIndex={-1}
            aria-label="Arrastrar tarea"
            {...(isOverlay ? {} : attributes)}
            {...(isOverlay ? {} : listeners)}
          >
            <DragIndicatorIcon className="text-xl sm:text-lg opacity-60 hover:opacity-100 transition-opacity" />
          </span>

          <div className="flex-1 min-w-0">
            {/* Encabezado con prioridad y nombre */}
            <div className="flex items-center gap-2 mb-2">
              {/* Prioridad con mejor diseño */}
              {prioridad && prioridad !== "normal" && (
                <div className="flex items-center gap-1.5">
                  <div
                    className={`priority-indicator w-2 h-2 rounded-full ${
                      prioridad === "alta"
                        ? "bg-red-400"
                        : prioridad === "media"
                        ? "bg-yellow-400"
                        : "bg-green-400"
                    }`}
                  />
                  <span
                    className={`priority-badge px-2.5 py-1 rounded-full text-xs font-medium ${
                      prioridad === "alta"
                        ? "bg-red-50 text-red-700 ring-1 ring-red-200"
                        : prioridad === "media"
                        ? "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200"
                        : "bg-green-50 text-green-700 ring-1 ring-green-200"
                    }`}
                  >
                    {prioridad === "alta"
                      ? "🔥 Alta"
                      : prioridad === "media"
                      ? "⚡ Media"
                      : "🌱 Baja"}
                  </span>
                </div>
              )}
            </div>

            {/* Nombre de la tarea con mejor tipografía */}
            <h3 className="task-title font-semibold text-gray-900 text-base sm:text-base md:text-lg leading-tight mb-2 break-words">
              {nombre}
            </h3>

            {/* Descripción con mejor formato */}
            {descripcion && (
              <p className="task-description text-sm text-gray-600 leading-relaxed line-clamp-2 mb-3">
                {descripcion}
              </p>
            )}

            {/* Fecha de expiración con mejor diseño */}
            {expira && (
              <div className="date-container inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg text-xs text-gray-600 border">
                <span className="text-blue-500">📅</span>
                <span className="font-medium">
                  {formatearFechaPersonalizada(expira)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      {!isOverlay && (
        <div className="flex items-start" ref={dropdownRef}>
          <button
            className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200 opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
            onClick={open ? () => setOpen(false) : handleMenuOpen}
            title="Opciones de tarea"
          >
            <MoreVertIcon
              className="text-gray-400 hover:text-gray-600"
              fontSize="small"
            />
          </button>
          {open &&
            createPortal(
              <div
                ref={menuRef}
                className={`dropdown-menu fixed z-[99999] bg-white rounded-xl shadow-xl py-2 border border-gray-200 backdrop-blur-sm`}
                style={{
                  minWidth: menuWidth,
                  top: menuPosition.top,
                  left: menuPosition.left,
                }}
              >
                <Button
                  variant="secondary"
                  className="menu-button block w-full text-left px-4 py-3 text-sm font-medium rounded-t-xl hover:bg-gray-50 transition-colors duration-150"
                  onClick={() => {
                    setOpen(false);
                    setTimeout(() => {
                      window.dispatchEvent(
                        new CustomEvent("task-edit", {
                          detail: {
                            id,
                            nombre,
                            expira,
                            prioridad,
                            descripcion,
                          },
                        })
                      );
                    }, 0);
                  }}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-blue-500">✏️</span>
                    <span>Editar tarea</span>
                  </span>
                </Button>
                <Button
                  variant="danger"
                  className="menu-button danger block w-full text-left px-4 py-3 text-sm font-medium rounded-b-xl hover:bg-red-50 transition-colors duration-150"
                  onClick={() => {
                    setOpen(false);
                    setTimeout(() => {
                      window.dispatchEvent(
                        new CustomEvent("task-delete", {
                          detail: {
                            id,
                            nombre,
                            expira,
                            prioridad,
                            descripcion,
                          },
                        })
                      );
                    }, 0);
                  }}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-red-500">🗑️</span>
                    <span>Eliminar tarea</span>
                  </span>
                </Button>
              </div>,
              document.body
            )}
        </div>
      )}
    </div>
  );
}

export default Task;
