import React, { useState } from "react";
import List from "./List";
import { DndContext } from "@dnd-kit/core";

// Generar un id único para cada tarea
function withId(arr) {
  return arr.map((t) => ({ ...t, id: crypto.randomUUID() }));
}

// Datos simulados de ejemplo para un proyecto
const initialLists = {
  pendientes: withId([
    { nombre: "Diseñar landing", expira: "2024-06-20" },
    { nombre: "Reunión con cliente", expira: "2024-06-22" },
  ]),
  enCurso: withId([{ nombre: "Desarrollar backend", expira: "2024-06-25" }]),
  terminadas: withId([
    { nombre: "Wireframes aprobados" },
    { nombre: "Dominio comprado" },
  ]),
};

function Lists() {
  const [lists, setLists] = useState(initialLists);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Buscar en qué lista y posición está el item arrastrado
    let sourceListKey = null;
    let sourceIndex = -1;
    Object.keys(lists).forEach((key) => {
      const idx = lists[key].findIndex((t) => t.id === active.id);
      if (idx !== -1) {
        sourceListKey = key;
        sourceIndex = idx;
      }
    });
    if (!sourceListKey) return;

    // Determinar si el drop fue sobre una tarea o sobre la lista
    let destListKey = null;
    let destIndex = -1;
    if (over.id.startsWith("list-")) {
      // Drop sobre la lista: obtener el nombre de la lista
      destListKey = over.id.replace("list-", "");
      destIndex = lists[destListKey].length; // al final
    } else {
      // Drop sobre una tarea: buscar la lista y el índice
      Object.keys(lists).forEach((key) => {
        const idx = lists[key].findIndex((t) => t.id === over.id);
        if (idx !== -1) {
          destListKey = key;
          destIndex = idx;
        }
      });
      if (destListKey === null) return;
    }

    // Si no cambió de lista y la posición es igual o adyacente, no hacer nada
    if (
      sourceListKey === destListKey &&
      (sourceIndex === destIndex || sourceIndex === destIndex - 1)
    ) {
      return;
    }

    if (sourceListKey === destListKey) {
      // Mover dentro de la misma lista
      const newList = [...lists[sourceListKey]];
      const [moved] = newList.splice(sourceIndex, 1);
      let insertAt = destIndex;
      if (sourceIndex < destIndex) {
        insertAt = destIndex - 1;
      }
      if (insertAt > newList.length) insertAt = newList.length;
      if (insertAt < 0) insertAt = 0;
      newList.splice(insertAt, 0, moved);
      setLists({ ...lists, [sourceListKey]: newList });
    } else {
      // Mover entre listas diferentes
      const sourceList = [...lists[sourceListKey]];
      const [moved] = sourceList.splice(sourceIndex, 1);
      const destList = [...lists[destListKey]];
      let insertAt = destIndex;
      if (insertAt > destList.length) insertAt = destList.length;
      if (insertAt < 0) insertAt = 0;
      destList.splice(insertAt, 0, moved);
      setLists({
        ...lists,
        [sourceListKey]: sourceList,
        [destListKey]: destList,
      });
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex gap-8 w-full mt-8 items-stretch h-full">
        <List title="Pendientes" items={lists.pendientes} showExpira={true} />
        <div className="w-px bg-gray-200 mx-2 self-stretch" />
        <List title="En curso" items={lists.enCurso} showExpira={true} />
        <div className="w-px bg-gray-200 mx-2 self-stretch" />
        <List title="Terminadas" items={lists.terminadas} showExpira={false} />
      </div>
    </DndContext>
  );
}

export default Lists;
