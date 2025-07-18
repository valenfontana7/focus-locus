import React from "react";
import Task from "./Task";
import { useDroppable } from "@dnd-kit/core";
/**
 * Componente para renderizar una lista de tareas.
 * @param {string} title - Título de la lista.
 * @param {Array} items - Array de tareas (cada una con nombre, id y opcionalmente expira).
 * @param {boolean} showExpira - Si debe mostrar la fecha de expiración.
 * @param {function} onRename - Función para renombrar una tarea (id, nuevoNombre)
 * @param {function} onDelete - Función para eliminar una tarea (id)
 */
function List({ title, items, showExpira, onRename, onDelete }) {
  // Droppable para la lista completa
  const { isOver: isOverList, setNodeRef: setListNodeRef } = useDroppable({
    id: `list-${title}`,
  });

  const style = {
    color: isOverList ? "#6366f1" : undefined,
    background: isOverList ? "#f1f5f9" : undefined,
    transition: "background 0.15s",
  };

  return (
    <div
      ref={setListNodeRef}
      style={style}
      className="list-container bg-white rounded-lg shadow p-4 flex-1"
    >
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <ul className="list__container space-y-4">
        {items.map((tarea) => (
          <li key={tarea.id}>
            <Task
              id={tarea.id}
              nombre={tarea.nombre}
              expira={showExpira ? tarea.expira : undefined}
              onRename={
                onRename
                  ? (nuevoNombre) => onRename(tarea.id, nuevoNombre)
                  : undefined
              }
              onDelete={onDelete ? () => onDelete(tarea.id) : undefined}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default List;
