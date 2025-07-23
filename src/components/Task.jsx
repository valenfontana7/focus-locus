import React, { useState, useRef } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { formatearFechaPersonalizada } from "../utils/dateUtils";
import { createPortal } from "react-dom";
import Button from "./Button";

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
      className="flex items-center justify-between group relative shadow-sm p-3 sm:p-4 md:p-4 lg:p-4 xl:p-5"
    >
      <div className="w-full">
        {/* Fila superior */}
        <div className="flex items-center w-full gap-2">
          {/* Icono de drag */}
          <span
            ref={setCombinedRef}
            className="cursor-move text-gray-400 hover:text-gray-600 flex-shrink-0 mr-1"
            style={{ touchAction: "none" }}
            title="Arrastrar tarea"
            tabIndex={-1}
            aria-label="Arrastrar tarea"
            {...(isOverlay ? {} : attributes)}
            {...(isOverlay ? {} : listeners)}
          >
            <DragIndicatorIcon className="text-2xl sm:text-xl" />
          </span>
          {/* Prioridad */}
          {prioridad && prioridad !== "normal" && (
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold mr-1 ${
                prioridad === "alta"
                  ? "bg-red-100 text-red-700"
                  : prioridad === "media"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {prioridad.charAt(0).toUpperCase() + prioridad.slice(1)}
            </span>
          )}
          {/* Nombre de la tarea */}
          <span className="font-semibold text-base sm:text-sm flex-1 break-words">
            {nombre}
          </span>
        </div>
        {/* Fila inferior: descripción y fecha de expiración */}
        {(descripcion || expira) && (
          <div className="flex flex-col mt-1 gap-1">
            {descripcion && (
              <span className="text-xs sm:text-sm text-gray-600 leading-tight line-clamp-2">
                {descripcion}
              </span>
            )}
            {expira && (
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <span role="img" aria-label="calendario">
                  📅
                </span>
                {formatearFechaPersonalizada(expira)}
              </div>
            )}
          </div>
        )}
      </div>
      {!isOverlay && (
        <div
          className="ml-0.5 sm:ml-1 md:ml-1 lg:ml-2 xl:ml-2 relative flex items-center"
          ref={dropdownRef}
        >
          <button
            className="flex items-center justify-center p-0.5 sm:p-1 md:p-1 lg:p-2 xl:p-2 rounded-full hover:bg-gray-200 focus:outline-none"
            onClick={open ? () => setOpen(false) : handleMenuOpen}
          >
            <MoreVertIcon fontSize="small" />
          </button>
          {open &&
            createPortal(
              <div
                ref={menuRef}
                className={`fixed z-[99999] bg-white rounded-lg shadow-lg py-2 border border-gray-200`}
                style={{
                  minWidth: menuWidth,
                  top: menuPosition.top,
                  left: menuPosition.left,
                }}
              >
                <Button
                  variant="secondary"
                  className="block w-full text-left px-5 py-3 text-lg rounded-t-lg"
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
                  ✏️ Editar
                </Button>
                <Button
                  variant="danger"
                  className="block w-full text-left px-5 py-3 text-lg rounded-b-lg"
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
                  🗑️ Eliminar
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
