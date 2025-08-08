import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useDraggable } from "@focus-locus/core";
import "../styles/DraggableModal.css";

/**
 * Modal reutilizable con fondo blur, animación y funcionalidad de arrastre.
 * @param {boolean} open - Si el modal está abierto.
 * @param {function} onClose - Callback para cerrar el modal.
 * @param {string} [title] - Título del modal.
 * @param {React.ReactNode} children - Contenido del modal.
 * @param {React.ReactNode} [actions] - Botones de acción (ej: Confirmar/Cancelar).
 * @param {boolean} [draggable=true] - Si el modal se puede arrastrar.
 */
function Modal({ open, onClose, title, children, actions, draggable = true }) {
  const overlayRef = useRef(null);

  // Hook para funcionalidad de arrastre
  const {
    elementRef,
    handleRef,
    isDragging,
    resetPosition,
    dragHandlers,
    style: dragStyle,
  } = useDraggable({
    enabled: draggable && open,
    onDragStart: () => {
      document.body.classList.add("dragging-cursor");
    },
    onDragEnd: () => {
      document.body.classList.remove("dragging-cursor");
    },
  });

  // Resetear posición cuando se abre/cierra el modal
  useEffect(() => {
    if (open) {
      resetPosition();
    }
  }, [open, resetPosition]);

  useEffect(() => {
    if (!open) return;

    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Cleanup en caso de que el modal se cierre mientras se arrastra
  useEffect(() => {
    return () => {
      document.body.classList.remove("dragging-cursor");
    };
  }, []);

  if (!open) return null;

  const modalContent = (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/30 backdrop-blur-sm transition-all p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        ref={elementRef}
        className={`draggable-modal bg-white rounded-lg shadow-xl max-w-md w-full max-h-[95vh] flex flex-col transition-transform ${
          isDragging ? "is-dragging" : ""
        }`}
        style={{
          ...dragStyle,
          position: draggable ? "relative" : "static",
        }}
      >
        <div
          ref={handleRef}
          className={`modal-drag-handle flex items-center justify-between p-3 sm:p-4 border-b flex-shrink-0 ${
            draggable ? "select-none" : ""
          }`}
          {...(draggable ? dragHandlers : {})}
        >
          {title && (
            <h2 className="text-base sm:text-lg font-semibold pointer-events-none">
              {title}
            </h2>
          )}
          {draggable && !title && (
            <div className="flex items-center text-gray-400 drag-help-text pointer-events-none">
              <svg
                className="w-4 h-4 mr-1 drag-icon"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
              Arrastrar para mover
            </div>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none ml-auto pointer-events-auto hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
          >
            ×
          </button>
        </div>
        <div className="p-3 sm:p-4 overflow-y-auto flex-1">{children}</div>
        {actions && (
          <div className="flex justify-end gap-2 p-3 sm:p-4 border-t flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );

  // Renderizar el modal fuera del DOM usando portal
  return createPortal(modalContent, document.body);
}

export default Modal;
