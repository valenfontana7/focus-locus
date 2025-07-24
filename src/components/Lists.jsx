import React, { useEffect, useCallback, useMemo, useRef } from "react";
import List from "./List";
import { useDroppable } from "@dnd-kit/core";
import { useProjectContext } from "../context/ProjectContext";
import "../styles/Lists.css";

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
        return;
      }

      isDragOperationInProgress.current = true;

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

  // Listener para eventos de drag desde Home.jsx
  useEffect(() => {
    const handleDragEndEvent = (event) => {
      const { activeId, overId } = event.detail;

      if (!overId || !activeId) {
        return;
      }

      // Extraer el nombre de la lista del overId (quitar prefijo "list-" si existe)
      const rawListName = overId.startsWith("list-")
        ? overId.replace("list-", "")
        : overId;

      // Convertir a minúsculas para comparación y normalizar espacios
      const listName = rawListName.toLowerCase().replace(/\s+/g, "");
      const validLists = ["pendientes", "encurso", "terminadas"];

      // Si se suelta sobre una lista
      if (validLists.includes(listName)) {
        // Mapear de vuelta al nombre real de la lista
        const listNameMapping = {
          pendientes: "pendientes",
          encurso: "enCurso",
          terminadas: "terminadas",
        };
        const realListName = listNameMapping[listName];

        // Determinar de qué lista viene la tarea
        let fromList = null;
        for (const [currentListName, tasks] of Object.entries(localTasks)) {
          if (tasks.some((task) => task.id === activeId)) {
            fromList = currentListName;
            break;
          }
        }

        if (fromList && fromList !== realListName) {
          handleMoveTask(activeId, fromList, realListName);
        }
      }
      // Si se suelta sobre una tarea
      else {
        // Primero determinar en qué lista está la tarea que se está arrastrando
        let sourceList = null;
        for (const [currentListName, tasks] of Object.entries(localTasks)) {
          if (tasks.some((task) => task.id === activeId)) {
            sourceList = currentListName;
            break;
          }
        }

        // Determinar en qué lista está la tarea objetivo
        let targetList = null;
        let targetIndex = 0;

        for (const [currentListName, tasks] of Object.entries(localTasks)) {
          const index = tasks.findIndex((task) => task.id === overId);
          if (index !== -1) {
            targetList = currentListName;
            targetIndex = index;
            break;
          }
        }

        if (sourceList && targetList) {
          // Si las listas son diferentes, es un movimiento entre listas
          if (sourceList !== targetList) {
            handleMoveTask(activeId, sourceList, targetList);
          }
          // Si es la misma lista, es reordenamiento
          else {
            handleReorderTask(activeId, targetList, targetIndex);
          }
        }
      }
    };

    window.addEventListener("drag-end", handleDragEndEvent);
    return () => window.removeEventListener("drag-end", handleDragEndEvent);
  }, [localTasks, handleMoveTask, handleReorderTask]);

  // Configurar event listener para add-task
  useEffect(() => {
    const handleAddTask = (event) => {
      const { project } = event.detail;
      if (project === activeProject) {
        // Crear nueva tarea con valores por defecto
        const newTask = {
          id: `task-${Date.now()}`, // ID temporal
          nombre: "Nueva tarea",
          prioridad: "media",
          categoria: "personal",
          expira: null,
          fechaHora: null,
        };

        // Obtener las tareas actuales y agregar la nueva a pendientes
        const currentTasks = localTasks;
        const updatedTasks = {
          ...currentTasks,
          pendientes: [...currentTasks.pendientes, newTask],
        };

        // Usar updateProjectTasks directamente
        updateProjectTasks(activeProject, updatedTasks);
      }
    };

    window.addEventListener("add-task", handleAddTask);
    return () => window.removeEventListener("add-task", handleAddTask);
  }, [activeProject, localTasks, updateProjectTasks]);

  // Configuración para el droppable
  const { setNodeRef } = useDroppable({
    id: "lists-container",
    data: {
      type: "container",
    },
  });

  const handleRename = useCallback(
    (taskId, updatedTaskData) => {
      const updatedTasks = { ...localTasks };
      let found = false;

      Object.keys(updatedTasks).forEach((listName) => {
        const taskIndex = updatedTasks[listName].findIndex(
          (task) => task.id === taskId
        );
        if (taskIndex !== -1) {
          // Si updatedTaskData es un string, es solo cambio de nombre (para compatibilidad)
          if (typeof updatedTaskData === "string") {
            updatedTasks[listName][taskIndex] = {
              ...updatedTasks[listName][taskIndex],
              nombre: updatedTaskData,
            };
          } else {
            // Si es un objeto, actualizar toda la tarea
            updatedTasks[listName][taskIndex] = {
              ...updatedTasks[listName][taskIndex],
              ...updatedTaskData,
            };
          }
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
    <div ref={setNodeRef} className="lists-container">
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
