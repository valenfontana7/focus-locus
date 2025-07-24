import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

/**
 * Modal reutilizable con fondo blur y animación.
 * @param {boolean} open - Si el modal está abierto.
 * @param {function} onClose - Callback para cerrar el modal.
 * @param {string} [title] - Título del modal.
 * @param {React.ReactNode} children - Contenido del modal.
 * @param {React.ReactNode} [actions] - Botones de acción (ej: Confirmar/Cancelar).
 */
function Modal({ open, onClose, title, children, actions }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const modalContent = (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/30 backdrop-blur-sm transition-all p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[95vh] flex flex-col">
        <div className="flex items-center justify-between p-3 sm:p-4 border-b flex-shrink-0">
          {title && (
            <h2 className="text-base sm:text-lg font-semibold">{title}</h2>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none ml-auto"
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
