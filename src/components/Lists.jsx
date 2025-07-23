import React, { useState, useEffect, useCallback, useMemo } from "react";
import List from "./List";
import { useDroppable } from "@dnd-kit/core";
import { useProjectContext } from "../context/ProjectContext";

function Lists() {
  const { activeProject, projectTasks, updateProjectTasks } =
    useProjectContext();
  const [taskCounter, setTaskCounter] = useState(0);

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

  // Función atómica para agregar tarea
  const addTaskAtomically = useCallback(
    (taskName) => {
      // Solo agregar tarea si hay un proyecto activo
      if (!activeProject) return;

      const newTask = {
        id: Date.now().toString(),
        nombre: taskName,
        prioridad: "normal",
        descripcion: "",
      };

      const updatedTasks = {
        pendientes: [...localTasks.pendientes, newTask],
        enCurso: [...localTasks.enCurso],
        terminadas: [...localTasks.terminadas],
      };

      updateProjectTasks(activeProject, updatedTasks);
      setTaskCounter((prev) => prev + 1);
    },
    [activeProject, localTasks, updateProjectTasks]
  );

  // Event listeners
  useEffect(() => {
    const handleAddTask = () => {
      addTaskAtomically(`Tarea ${taskCounter + 1}`);
    };

    const handleClearTasks = () => {
      const clearedTasks = {
        pendientes: [],
        enCurso: [],
        terminadas: [],
      };
      updateProjectTasks(activeProject, clearedTasks);
      setTaskCounter(0);
    };

    const handleDragEnd = (event) => {
      const { activeId, overId } = event.detail;

      if (activeId && overId) {
        // Determinar la lista de origen
        let fromList = null;
        if (localTasks.pendientes.find((task) => task.id === activeId)) {
          fromList = "pendientes";
        } else if (localTasks.enCurso.find((task) => task.id === activeId)) {
          fromList = "enCurso";
        } else if (localTasks.terminadas.find((task) => task.id === activeId)) {
          fromList = "terminadas";
        }

        // Determinar la lista de destino
        let toList = null;

        // Si se suelta sobre una lista
        if (overId === "list-Pendientes") {
          toList = "pendientes";
        } else if (overId === "list-En Curso") {
          toList = "enCurso";
        } else if (overId === "list-Terminadas") {
          toList = "terminadas";
        } else {
          // Si se suelta sobre una tarea, determinar a qué lista pertenece
          const taskInPendientes = localTasks.pendientes.find(
            (task) => task.id === overId
          );
          const taskInEnCurso = localTasks.enCurso.find(
            (task) => task.id === overId
          );
          const taskInTerminadas = localTasks.terminadas.find(
            (task) => task.id === overId
          );

          if (taskInPendientes) {
            toList = "pendientes";
          } else if (taskInEnCurso) {
            toList = "enCurso";
          } else if (taskInTerminadas) {
            toList = "terminadas";
          }
        }

        // Mover la tarea si las listas son diferentes o reordenar si es la misma lista
        if (fromList && toList) {
          if (fromList !== toList) {
            handleMoveTask(activeId, fromList, toList);
          } else {
            handleReorderTask(activeId, overId, fromList);
          }
        }
      }
    };

    window.addEventListener("add-task", handleAddTask);
    window.addEventListener("clear-tasks", handleClearTasks);
    window.addEventListener("drag-end", handleDragEnd);

    return () => {
      window.removeEventListener("add-task", handleAddTask);
      window.removeEventListener("clear-tasks", handleClearTasks);
      window.removeEventListener("drag-end", handleDragEnd);
    };
  }, [
    addTaskAtomically,
    taskCounter,
    localTasks,
    activeProject,
    updateProjectTasks,
  ]);

  // Actualizar contador cuando cambie el proyecto
  useEffect(() => {
    const totalTasks =
      localTasks.pendientes.length +
      localTasks.enCurso.length +
      localTasks.terminadas.length;
    setTaskCounter(totalTasks);
  }, [activeProject, localTasks]);

  // Droppable para el contenedor principal
  const { setNodeRef } = useDroppable({
    id: "lists-container",
  });

  const handleRename = (taskId, updatedTask) => {
    const updatedTasks = {
      pendientes: localTasks.pendientes.map((task) =>
        task.id === taskId ? { ...task, ...updatedTask } : task
      ),
      enCurso: localTasks.enCurso.map((task) =>
        task.id === taskId ? { ...task, ...updatedTask } : task
      ),
      terminadas: localTasks.terminadas.map((task) =>
        task.id === taskId ? { ...task, ...updatedTask } : task
      ),
    };
    updateProjectTasks(activeProject, updatedTasks);
  };

  const handleDelete = (taskId) => {
    const updatedTasks = {
      pendientes: localTasks.pendientes.filter((task) => task.id !== taskId),
      enCurso: localTasks.enCurso.filter((task) => task.id !== taskId),
      terminadas: localTasks.terminadas.filter((task) => task.id !== taskId),
    };
    updateProjectTasks(activeProject, updatedTasks);
  };

  const handleMoveTask = async (taskId, fromList, toList) => {
    const task = [
      ...localTasks[fromList],
      ...localTasks[toList],
      ...localTasks.terminadas,
    ].find((t) => t.id === taskId);

    if (!task) return;

    // 🚀 OPTIMISTIC UPDATE: Calcular nuevo estado inmediatamente
    const optimisticTasks = {
      pendientes:
        fromList === "pendientes"
          ? localTasks.pendientes.filter((t) => t.id !== taskId)
          : toList === "pendientes"
          ? [...localTasks.pendientes, task]
          : localTasks.pendientes,
      enCurso:
        fromList === "enCurso"
          ? localTasks.enCurso.filter((t) => t.id !== taskId)
          : toList === "enCurso"
          ? [...localTasks.enCurso, task]
          : localTasks.enCurso,
      terminadas:
        fromList === "terminadas"
          ? localTasks.terminadas.filter((t) => t.id !== taskId)
          : toList === "terminadas"
          ? [...localTasks.terminadas, task]
          : localTasks.terminadas,
    };

    // 💨 ACTUALIZACIÓN INMEDIATA: El usuario ve el cambio al instante
    // Esto actualiza el contexto inmediatamente
    updateProjectTasks(activeProject, optimisticTasks);

    // 🔄 SYNC EN BACKGROUND: Intentar sincronización real en segundo plano
    // Nota: La función updateProjectTasks ya maneja la sincronización con Supabase
    // Si falla, el hook useSupabaseProjects debería manejar el rollback
    // Esta implementación da prioridad a la experiencia del usuario
  };

  const handleReorderTask = (activeTaskId, overTaskId, listName) => {
    const currentList = localTasks[listName];
    const activeIndex = currentList.findIndex(
      (task) => task.id === activeTaskId
    );
    const overIndex = currentList.findIndex((task) => task.id === overTaskId);

    if (activeIndex === -1 || overIndex === -1) return;

    // Crear una nueva lista con la tarea reordenada
    const newList = [...currentList];
    const [movedTask] = newList.splice(activeIndex, 1);
    newList.splice(overIndex, 0, movedTask);

    const updatedTasks = {
      ...localTasks,
      [listName]: newList,
    };

    // 💨 OPTIMISTIC UPDATE: Reordenar también usa actualización inmediata
    updateProjectTasks(activeProject, updatedTasks);
  };

  return (
    <div
      ref={setNodeRef}
      className="lists-container flex flex-col sm:flex-row gap-0.5 sm:gap-0.5 md:gap-0.5 lg:gap-0.5 xl:gap-0.5 p-1 sm:p-2 md:p-3 lg:p-2 xl:p-1 h-full max-h-full min-h-0 overflow-hidden"
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
