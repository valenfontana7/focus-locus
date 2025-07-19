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
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b">
          {title && (
            <h2 className="text-lg sm:text-xl font-semibold">{title}</h2>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl sm:text-2xl leading-none ml-auto"
          >
            ×
          </button>
        </div>
        <div className="p-4 sm:p-6">{children}</div>
        <div className="flex justify-end gap-2 p-4 sm:p-6 border-t">
          {actions}
        </div>
      </div>
    </div>
  );

  // Renderizar el modal fuera del DOM usando portal
  return createPortal(modalContent, document.body);
}

export default Modal;
