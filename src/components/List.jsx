import React, { useState, useEffect } from "react";
import Task from "./Task";
import { useDroppable } from "@dnd-kit/core";
import Modal from "./Modal";
import TaskEditModal from "./TaskEditModal";
import { TaskActionContext } from "../context/TaskActionContext";
import Button from "./Button";
import "../styles/List.css";
/**
 * Componente para renderizar una lista de tareas.
 * @param {string} title - Título de la lista.
 * @param {Array} items - Array de tareas (cada una con nombre, id y opcionalmente expira).
 * @param {boolean} showExpira - Si debe mostrar la fecha de expiración.
 * @param {function} onRename - Función para renombrar una tarea (id, nuevoNombre)
 * @param {function} onDelete - Función para eliminar una tarea (id)
 */
function List({ title, items, showExpira, onRename, onDelete }) {
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    taskId: null,
    taskName: "",
  });
  const [editModal, setEditModal] = useState({
    open: false,
    task: null,
  });
  // Estado intermedio para edición robusta en iOS
  const [pendingEditTask, setPendingEditTask] = useState(null);

  // Droppable para la lista completa
  const { isOver: isOverList, setNodeRef: setListNodeRef } = useDroppable({
    id: `list-${title}`,
    data: {
      type: "list",
      listTitle: title,
    },
  });

  // Debug: Verificar el ID generado
  React.useEffect(() => {
    console.log(`List ${title} - Droppable ID: list-${title}`);
  }, [title]);

  const style = {
    color: isOverList ? "#6366f1" : undefined,
    background: isOverList ? "#f1f5f9" : undefined,
    transition: "background 0.15s",
  };

  const handleConfirmDelete = () => {
    if (onDelete && deleteModal.taskId) {
      onDelete(deleteModal.taskId);
    }
    setDeleteModal({ open: false, taskId: null, taskName: "" });
  };

  // useEffect para abrir el modal de edición después de cerrar el menú
  useEffect(() => {
    if (pendingEditTask) {
      setTimeout(() => {
        // Forzar reflow
        void document.body.offsetHeight;
        setEditModal({ open: true, task: pendingEditTask });
        setPendingEditTask(null);
      }, 200);
    }
  }, [pendingEditTask]);

  const handleConfirmEdit = (updatedTask) => {
    if (onRename && updatedTask) {
      onRename(updatedTask.id, updatedTask);
    }
    setEditModal({ open: false, task: null });
  };

  // Escuchar eventos globales para editar/eliminar tarea
  useEffect(() => {
    function handleEdit(e) {
      if (items.some((t) => t.id === e.detail.id)) {
        setPendingEditTask(e.detail);
      }
    }
    function handleDelete(e) {
      if (items.some((t) => t.id === e.detail.id)) {
        setDeleteModal({
          open: true,
          taskId: e.detail.id,
          taskName: e.detail.nombre,
        });
      }
    }
    window.addEventListener("task-edit", handleEdit);
    window.addEventListener("task-delete", handleDelete);
    return () => {
      window.removeEventListener("task-edit", handleEdit);
      window.removeEventListener("task-delete", handleDelete);
    };
  }, [items]);

  return (
    <TaskActionContext.Provider
      value={{
        triggerEdit: (task) => setPendingEditTask(task),
        triggerDelete: (task) =>
          setDeleteModal({
            open: true,
            taskId: task.id,
            taskName: task.nombre,
          }),
      }}
    >
      <div
        ref={setListNodeRef}
        style={style}
        className="list-container bg-white lg:rounded-lg shadow p-2 sm:p-2 md:p-2 lg:p-3 xl:p-3 flex flex-col flex-1 lg:mx-2 xl:mx-2 ios-safe-margin overflow-hidden min-h-0"
        data-list-title={title}
        data-droppable-id={`list-${title}`}
      >
        <div className="flex items-center gap-2 sm:gap-2 mb-2 sm:mb-2">
          <h3 className="text-sm sm:text-base md:text-lg font-bold flex-1">
            {title}
          </h3>
          <span className="bg-gray-200 text-gray-700 text-sm sm:text-xs px-2 sm:px-2 py-1 sm:py-1 rounded-full font-semibold">
            {items.length}
          </span>
        </div>
        <ul className="list__container space-y-0.5 sm:space-y-1 md:space-y-2 lg:space-y-3 xl:space-y-4 flex-1 min-h-0 overflow-y-auto">
          {items.map((tarea) => (
            <li key={tarea.id}>
              <Task
                id={tarea.id}
                nombre={tarea.nombre}
                expira={showExpira ? tarea.expira : undefined}
                fechaHora={tarea.fechaHora}
                prioridad={tarea.prioridad}
                descripcion={tarea.descripcion}
                taskObj={tarea}
              />
            </li>
          ))}
          {items.length === 0 && (
            <li className="text-gray-500 text-center py-1 sm:py-2 md:py-3 lg:py-4 xl:py-5 text-xs sm:text-sm md:text-base">
              No hay tareas
            </li>
          )}
          {items.length > 3 && (
            <li className="text-blue-500 text-center py-1 text-xs border-t border-gray-200 mt-2">
              ↑ Scroll para ver más tareas ↑
            </li>
          )}
        </ul>
        <Modal
          open={deleteModal.open}
          onClose={() =>
            setDeleteModal({ open: false, taskId: null, taskName: "" })
          }
          title="¿Eliminar tarea?"
          actions={
            <>
              <Button
                variant="cancel"
                onClick={() =>
                  setDeleteModal({ open: false, taskId: null, taskName: "" })
                }
                className="mr-2"
              >
                Cancelar
              </Button>
              <Button variant="danger" onClick={handleConfirmDelete}>
                Eliminar
              </Button>
            </>
          }
        >
          ¿Seguro que quieres eliminar la tarea "{deleteModal.taskName}"? Esta
          acción no se puede deshacer.
        </Modal>
        <TaskEditModal
          open={editModal.open}
          onClose={() => setEditModal({ open: false, task: null })}
          task={editModal.task}
          onSave={handleConfirmEdit}
        />
      </div>
    </TaskActionContext.Provider>
  );
}

export default List;
