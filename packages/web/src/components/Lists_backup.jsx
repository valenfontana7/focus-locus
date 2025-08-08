import React, { useEffect, useCallback, useMemo, useRef } from "react";
import List from "./List";
import { useDroppable } from "@dnd-kit/core";
import { useProjectContext } from "@focus-locus/core";

function Lists() {
  const context = useProjectContext();
  const { activeProject, projectTasks, updateProjectTasks } = context;

  // Ref para prevenir operaciones concurrentes
  const isDragOperationInProgress = useRef(false);

  // Obtener las tareas del proyecto activo - manejar caso cuando no hay proyecto activo
  const localTasks = useMemo(() => {
    return (
      (activeProject && projectTasks[activeProject]) || {
        pendientes: [],
        enCurso: [],
        terminadas: [],
      }
    );
  }, [activeProject, projectTasks]);

  const handleMoveTask = useCallback(
    async (taskId, fromList, toList) => {
      // Prevenir operaciones concurrentes
      if (isDragOperationInProgress.current) {
        console.warn("Operación de drag ya en progreso, ignorando:", {
          taskId,
          fromList,
          toList,
        });
        return;
      }

      isDragOperationInProgress.current = true;
      console.log("handleMoveTask called:", { taskId, fromList, toList });

      try {
        // Obtener el estado más actual del contexto
        const currentTasks = projectTasks[activeProject] || {
          pendientes: [],
          enCurso: [],
          terminadas: [],
        };

        // Encontrar la tarea a mover
        const taskIndex = currentTasks[fromList].findIndex(
          (t) => t.id === taskId
        );

        if (taskIndex === -1) {
          console.error("Task no encontrada:", { taskId, fromList });
          isDragOperationInProgress.current = false;
          return;
        }

        const taskToMove = currentTasks[fromList][taskIndex];

        // Crear copia del estado con la tarea movida
        const updatedTasks = {
          ...currentTasks,
          [fromList]: currentTasks[fromList].filter((t) => t.id !== taskId),
          [toList]: [...currentTasks[toList], taskToMove],
        };

        // Actualizar el estado optimísticamente
        updateProjectTasks(activeProject, updatedTasks);

        // Breve bloqueo para evitar operaciones rápidas
        setTimeout(() => {
          isDragOperationInProgress.current = false;
        }, 100);
      } catch (error) {
        console.error("Error en handleMoveTask:", error);
        isDragOperationInProgress.current = false;
      }
    },
    [activeProject, projectTasks, updateProjectTasks]
  );

  const handleReorderTask = useCallback(
    (taskId, targetListName, newIndex) => {
      if (isDragOperationInProgress.current) {
        console.warn("Operación de reorder ya en progreso, ignorando");
        return;
      }

      isDragOperationInProgress.current = true;

      const currentTasks = projectTasks[activeProject] || {
        pendientes: [],
        enCurso: [],
        terminadas: [],
      };

      const targetList = [...currentTasks[targetListName]];
      const taskIndex = targetList.findIndex((t) => t.id === taskId);

      if (taskIndex === -1) {
        console.error("Task no encontrada para reordenar:", taskId);
        isDragOperationInProgress.current = false;
        return;
      }

      // Remover la tarea de su posición actual
      const [taskToMove] = targetList.splice(taskIndex, 1);

      // Insertar en la nueva posición
      targetList.splice(newIndex, 0, taskToMove);

      const updatedTasks = {
        ...currentTasks,
        [targetListName]: targetList,
      };

      updateProjectTasks(activeProject, updatedTasks);

      setTimeout(() => {
        isDragOperationInProgress.current = false;
      }, 100);
    },
    [activeProject, projectTasks, updateProjectTasks]
  );

  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event;

      if (!over || !active) {
        console.log("❌ No hay over o active válido");
        return;
      }

      const activeId = active.id;
      const overId = over.id;

      console.log("🎯 Drag end:", { activeId, overId });

      // Si se suelta sobre una lista
      if (["pendientes", "enCurso", "terminadas"].includes(overId)) {
        // Determinar de qué lista viene la tarea
        let fromList = null;
        for (const [listName, tasks] of Object.entries(localTasks)) {
          if (tasks.some((task) => task.id === activeId)) {
            fromList = listName;
            break;
          }
        }

        if (fromList && fromList !== overId) {
          console.log("📦 Moviendo entre listas");
          handleMoveTask(activeId, fromList, overId);
        }
      }
      // Si se suelta sobre una tarea
      else {
        // Determinar en qué lista está la tarea objetivo
        let targetList = null;
        let targetIndex = 0;

        for (const [listName, tasks] of Object.entries(localTasks)) {
          const index = tasks.findIndex((task) => task.id === overId);
          if (index !== -1) {
            targetList = listName;
            targetIndex = index;
            break;
          }
        }

        if (targetList) {
          console.log("🔄 Reordenando dentro de lista");
          handleReorderTask(activeId, targetList, targetIndex);
        }
      }
    },
    [localTasks, handleMoveTask, handleReorderTask]
  );

  // Configuración para el droppable
  const { setNodeRef } = useDroppable({
    id: "lists-container",
    data: {
      type: "container",
    },
  });

  const handleRename = useCallback(
    (taskId, newName) => {
      const updatedTasks = { ...localTasks };
      let found = false;

      Object.keys(updatedTasks).forEach((listName) => {
        const taskIndex = updatedTasks[listName].findIndex(
          (task) => task.id === taskId
        );
        if (taskIndex !== -1) {
          updatedTasks[listName][taskIndex] = {
            ...updatedTasks[listName][taskIndex],
            name: newName,
          };
          found = true;
        }
      });

      if (found) {
        updateProjectTasks(activeProject, updatedTasks);
      }
    },
    [localTasks, activeProject, updateProjectTasks]
  );

  const handleDelete = useCallback(
    (taskId) => {
      const updatedTasks = { ...localTasks };
      let found = false;

      Object.keys(updatedTasks).forEach((listName) => {
        const originalLength = updatedTasks[listName].length;
        updatedTasks[listName] = updatedTasks[listName].filter(
          (task) => task.id !== taskId
        );
        if (updatedTasks[listName].length < originalLength) {
          found = true;
        }
      });

      if (found) {
        updateProjectTasks(activeProject, updatedTasks);
      }
    },
    [localTasks, activeProject, updateProjectTasks]
  );

  return (
    <div
      ref={setNodeRef}
      className="lists-container flex flex-col sm:flex-row gap-0.5 sm:gap-0.5 md:gap-0.5 lg:gap-0.5 xl:gap-0.5 p-1 sm:p-2 md:p-3 lg:p-2 xl:p-1 flex-1 min-h-0 overflow-hidden"
    >
      <List
        title="Pendientes"
        items={localTasks.pendientes}
        showExpira={true}
        onRename={handleRename}
        onDelete={handleDelete}
        onMoveTask={(taskId) => handleMoveTask(taskId, "pendientes", "enCurso")}
      />
      <List
        title="En Curso"
        items={localTasks.enCurso}
        showExpira={true}
        onRename={handleRename}
        onDelete={handleDelete}
        onMoveTask={(taskId) => handleMoveTask(taskId, "enCurso", "terminadas")}
      />
      <List
        title="Terminadas"
        items={localTasks.terminadas}
        showExpira={false}
        onRename={handleRename}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default Lists;
