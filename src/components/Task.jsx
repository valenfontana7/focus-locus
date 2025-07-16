import React, { useState, useRef, useEffect } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useDraggable, useDroppable } from "@dnd-kit/core";

/**
 * Componente para renderizar una tarea individual.
 * @param {string} id - Id único de la tarea.
 * @param {string} nombre - Nombre de la tarea.
 * @param {string} [expira] - Fecha de expiración (opcional).
 */
function Task({ id, nombre, expira }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    transform,
    isDragging,
  } = useDraggable({
    id,
  });
  const { isOver, setNodeRef: setDropRef } = useDroppable({
    id,
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

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div
      ref={setCombinedRef}
      {...listeners}
      {...attributes}
      style={style}
      className="flex items-center justify-between group relative shadow-sm p-4"
    >
      <div className="flex flex-col">
        <span className="font-medium">{nombre}</span>
        {expira && (
          <span className="text-xs text-gray-500">Expira: {expira}</span>
        )}
      </div>
      <div className="ml-2 relative" ref={dropdownRef}>
        <button
          className="flex items-center p-2 rounded-full hover:bg-gray-200 focus:outline-none"
          onClick={() => setOpen((v) => !v)}
        >
          <MoreVertIcon fontSize="small" />
        </button>
        {open && (
          <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow z-10">
            <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
              Editar
            </button>
            <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
              Eliminar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Task;
