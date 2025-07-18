import React, { useState, useRef, useEffect } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { useDraggable, useDroppable } from "@dnd-kit/core";

/**
 * Componente para renderizar una tarea individual.
 * @param {string} id - Id único de la tarea.
 * @param {string} nombre - Nombre de la tarea.
 * @param {string} [expira] - Fecha de expiración (opcional).
 * @param {function} [onRename] - Función para renombrar la tarea.
 * @param {boolean} [isOverlay] - Si es el overlay de drag, deshabilita edición y menú.
 */
function Task({ id, nombre, expira, onRename, isOverlay = false, onDelete }) {
  const [open, setOpen] = useState(false);
  const [menuUp, setMenuUp] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(nombre);
  const [mouseDownPos, setMouseDownPos] = useState(null);
  const [menuMouseDownPos, setMenuMouseDownPos] = useState(null);
  const inputRef = useRef(null);
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
    disabled: editing || isOverlay, // Deshabilita el drag and drop mientras se edita o si es overlay
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

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  // Detectar si hay espacio suficiente hacia abajo para el menú (usando el contenedor de la lista)
  useEffect(() => {
    if (open && menuRef.current && dropdownRef.current) {
      const checkMenuPosition = () => {
        const buttonRect = dropdownRef.current.getBoundingClientRect();
        const menuHeight = menuRef.current.offsetHeight || 90;
        // Buscar el contenedor de la lista
        const listContainer = dropdownRef.current.closest(".list-container");
        let spaceBelow, spaceAbove;
        if (listContainer) {
          const listRect = listContainer.getBoundingClientRect();
          spaceBelow = listRect.bottom - buttonRect.bottom;
          spaceAbove = buttonRect.top - listRect.top;
        } else {
          // Fallback al viewport
          spaceBelow = window.innerHeight - buttonRect.bottom;
          spaceAbove = buttonRect.top;
        }
        setMenuUp(spaceBelow < menuHeight && spaceAbove > menuHeight);
      };
      checkMenuPosition();
      window.addEventListener("resize", checkMenuPosition);
      window.addEventListener("scroll", checkMenuPosition, true);
      return () => {
        window.removeEventListener("resize", checkMenuPosition);
        window.removeEventListener("scroll", checkMenuPosition, true);
      };
    }
  }, [open, menuRef.current, dropdownRef.current]);

  const handleRename = () => {
    if (editValue.trim() && editValue !== nombre) {
      onRename && onRename(editValue.trim());
    }
    setEditing(false);
  };

  const handleDeleteTask = () => {
    if (window.confirm("¿Seguro que quieres eliminar esta tarea?")) {
      onDelete && onDelete();
    }
  };

  // Workaround: click único para editar solo si no hay drag
  const handleMouseDown = (e) => {
    setMouseDownPos({ x: e.clientX, y: e.clientY });
  };
  const handleMouseUp = (e) => {
    if (!mouseDownPos) return;
    const dx = Math.abs(e.clientX - mouseDownPos.x);
    const dy = Math.abs(e.clientY - mouseDownPos.y);
    const DRAG_THRESHOLD = 5; // píxeles
    if (dx < DRAG_THRESHOLD && dy < DRAG_THRESHOLD) {
      setEditing(true);
    }
    setMouseDownPos(null);
  };

  // Workaround para el menú de los 3 puntos
  const handleMenuMouseDown = (e) => {
    setMenuMouseDownPos({ x: e.clientX, y: e.clientY });
  };
  const handleMenuMouseUp = (e) => {
    if (!menuMouseDownPos) return;
    const dx = Math.abs(e.clientX - menuMouseDownPos.x);
    const dy = Math.abs(e.clientY - menuMouseDownPos.y);
    const DRAG_THRESHOLD = 5;
    if (dx < DRAG_THRESHOLD && dy < DRAG_THRESHOLD) {
      setOpen((v) => !v);
    }
    setMenuMouseDownPos(null);
  };

  return (
    <div
      ref={setCombinedRef}
      style={style}
      className="flex items-center justify-between group relative shadow-sm p-4"
    >
      {/* Drag handle */}
      {!isOverlay && (
        <span
          className="drag-handle mr-2 cursor-grab text-gray-400 hover:text-gray-600 active:cursor-grabbing"
          {...listeners}
          {...attributes}
          tabIndex={-1}
          title="Arrastrar tarea"
        >
          <DragIndicatorIcon fontSize="small" />
        </span>
      )}
      <div className="flex flex-col flex-1">
        {editing && !isOverlay ? (
          <input
            ref={inputRef}
            className="font-medium bg-white border-b border-blue-400 outline-none px-1 py-0.5"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRename();
              if (e.key === "Escape") setEditing(false);
            }}
          />
        ) : (
          <span
            className={`font-medium ${
              !isOverlay ? "cursor-pointer hover:underline" : ""
            }`}
            onMouseDown={!isOverlay ? handleMouseDown : undefined}
            onMouseUp={!isOverlay ? handleMouseUp : undefined}
            title={!isOverlay ? "Haz clic para editar" : undefined}
          >
            {nombre}
          </span>
        )}
        {expira && (
          <span className="text-xs text-gray-500">Expira: {expira}</span>
        )}
      </div>
      {!isOverlay && (
        <div className="ml-2 relative" ref={dropdownRef}>
          <button
            className="flex items-center p-2 rounded-full hover:bg-gray-200 focus:outline-none"
            onMouseDown={handleMenuMouseDown}
            onMouseUp={handleMenuMouseUp}
          >
            <MoreVertIcon fontSize="small" />
          </button>
          {open && (
            <div
              ref={menuRef}
              className={`absolute right-0 w-40 bg-white border rounded shadow-lg z-50 ${
                menuUp ? "bottom-full mb-2" : "top-full mt-2"
              }`}
              style={{ minWidth: 120 }}
            >
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                Editar
              </button>
              <button
                onClick={handleDeleteTask}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Eliminar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Task;
