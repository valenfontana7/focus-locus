import React, { useState } from "react";
import List from "./List";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import useProjects, { createInitialTaskLists } from "../hooks/useProjects";
import { useProjectContext } from "../context/ProjectContext";
import Task from "./Task";

function Lists() {
  const { activeProject } = useProjectContext();
  const { projectTasks, updateProjectTasks } = useProjects();

  const [activeDragId, setActiveDragId] = useState(null);
  const lists = projectTasks[activeProject] || createInitialTaskLists();

  // Función para renombrar una tarea
  const handleRenameTask = (listKey, taskId, newName) => {
    const newLists = { ...lists };
    newLists[listKey] = newLists[listKey].map((t) =>
      t.id === taskId ? { ...t, nombre: newName } : t
    );
    updateProjectTasks(activeProject, newLists);
  };

  // Función para eliminar una tarea
  const handleDeleteTask = (listKey, taskId) => {
    const newLists = { ...lists };
    newLists[listKey] = newLists[listKey].filter((t) => t.id !== taskId);
    updateProjectTasks(activeProject, newLists);
  };

  const handleDragStart = (event) => {
    setActiveDragId(event.active.id);
  };

  const handleDragEnd = (event) => {
    setActiveDragId(null);
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
      const listName = over.id.replace("list-", "");
      const listKeyMap = {
        Pendientes: "pendientes",
        "En curso": "enCurso",
        Terminadas: "terminadas",
      };
      destListKey = listKeyMap[listName];
      if (!destListKey || !lists[destListKey]) {
        console.error("Lista de destino no encontrada:", listName);
        return;
      }
      destIndex = lists[destListKey].length;
    } else {
      Object.keys(lists).forEach((key) => {
        const idx = lists[key].findIndex((t) => t.id === over.id);
        if (idx !== -1) {
          destListKey = key;
          destIndex = idx;
        }
      });
      if (destListKey === null) return;
    }

    if (!destListKey || !lists[destListKey]) {
      console.error("Lista de destino inválida:", destListKey);
      return;
    }

    if (sourceListKey === destListKey && sourceIndex === destIndex) {
      return;
    }

    let newLists = { ...lists };
    if (sourceListKey === destListKey) {
      const newList = [...lists[sourceListKey]];
      const [moved] = newList.splice(sourceIndex, 1);
      newList.splice(destIndex, 0, moved);
      newLists[sourceListKey] = newList;
    } else {
      const sourceList = [...lists[sourceListKey]];
      const [moved] = sourceList.splice(sourceIndex, 1);
      const destList = [...lists[destListKey]];
      let insertAt = destIndex;
      if (insertAt > destList.length) insertAt = destList.length;
      if (insertAt < 0) insertAt = 0;
      destList.splice(insertAt, 0, moved);
      newLists[sourceListKey] = sourceList;
      newLists[destListKey] = destList;
    }
    updateProjectTasks(activeProject, newLists);
  };

  // Buscar la tarea activa para el overlay
  let activeTask = null;
  if (activeDragId) {
    for (const key of Object.keys(lists)) {
      const found = lists[key].find((t) => t.id === activeDragId);
      if (found) {
        activeTask = found;
        break;
      }
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
      <div className="flex flex-col gap-4 w-full mt-8">
        {/* Listas */}
        <div className="flex gap-8 items-stretch h-full">
          <List
            title="Pendientes"
            items={lists.pendientes}
            showExpira={true}
            onRename={(taskId, newName) =>
              handleRenameTask("pendientes", taskId, newName)
            }
            onDelete={(taskId) => handleDeleteTask("pendientes", taskId)}
          />
          <div className="w-px bg-gray-200 mx-2 self-stretch" />
          <List
            title="En curso"
            items={lists.enCurso}
            showExpira={true}
            onRename={(taskId, newName) =>
              handleRenameTask("enCurso", taskId, newName)
            }
            onDelete={(taskId) => handleDeleteTask("enCurso", taskId)}
          />
          <div className="w-px bg-gray-200 mx-2 self-stretch" />
          <List
            title="Terminadas"
            items={lists.terminadas}
            showExpira={false}
            onRename={(taskId, newName) =>
              handleRenameTask("terminadas", taskId, newName)
            }
            onDelete={(taskId) => handleDeleteTask("terminadas", taskId)}
          />
        </div>
      </div>
      <DragOverlay>
        {activeTask && (
          <Task
            id={activeTask.id}
            nombre={activeTask.nombre}
            expira={activeTask.expira}
            isOverlay={true}
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}

export default Lists;
