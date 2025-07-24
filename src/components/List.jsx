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
    <div className="list-wrapper">
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
          className="list-container bg-white rounded-lg shadow p-3 flex flex-col"
          data-list-title={title}
        >
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-base md:text-lg font-bold flex-1">{title}</h3>
            <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full font-semibold">
              {items.length}
            </span>
          </div>
          <ul className="list__container flex-1 min-h-0 overflow-y-auto space-y-2">
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
              <li className="text-gray-500 text-center py-4 text-sm">
                No hay tareas
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
    </div>
  );
}

export default List;
