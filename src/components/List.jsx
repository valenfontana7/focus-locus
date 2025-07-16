import React from "react";
import Task from "./Task";
import { useDroppable } from "@dnd-kit/core";
/**
 * Componente para renderizar una lista de tareas.
 * @param {string} title - Título de la lista.
 * @param {Array} items - Array de tareas (cada una con nombre, id y opcionalmente expira).
 * @param {boolean} showExpira - Si debe mostrar la fecha de expiración.
 */
function List({ title, items, showExpira }) {
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
      className="bg-white rounded-lg shadow p-4 flex-1"
    >
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <ul className="space-y-4">
        {items.map((tarea) => (
          <li key={tarea.id}>
            <Task
              id={tarea.id}
              nombre={tarea.nombre}
              expira={showExpira ? tarea.expira : undefined}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default List;
