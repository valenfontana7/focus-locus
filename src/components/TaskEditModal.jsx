import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import DateTimePicker from "./DateTimePicker";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import ScheduleIcon from "@mui/icons-material/Schedule";
import DescriptionIcon from "@mui/icons-material/Description";
import Button from "./Button";

function TaskEditModal({ open, onClose, task, onSave }) {
  const [formData, setFormData] = useState({
    nombre: "",
    expira: "",
    fechaHora: "",
    prioridad: "normal",
    descripcion: "",
  });

  // Actualizar el formulario cuando cambie la tarea
  useEffect(() => {
    if (task) {
      setFormData({
        nombre: task.nombre || "",
        expira: task.expira || "",
        fechaHora: task.fechaHora || "",
        prioridad: task.prioridad || "normal",
        descripcion: task.descripcion || "",
      });
    }
  }, [task]);

  const handleSave = () => {
    if (formData.nombre.trim()) {
      onSave({
        ...task,
        ...formData,
        nombre: formData.nombre.trim(),
      });
      onClose();
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center">
          <span>Editar Tarea</span>
          <svg
            className="w-4 h-4 ml-2 text-gray-400 drag-icon"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M7 2a1 1 0 000 2h6a1 1 0 100-2H7zM7 8a1 1 0 000 2h6a1 1 0 100-2H7zM7 14a1 1 0 100 2h6a1 1 0 100-2H7z" />
          </svg>
        </div>
      }
      actions={
        <>
          <Button variant="cancel" onClick={onClose} className="mr-2">
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!formData.nombre.trim()}
          >
            Guardar
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        {/* Nombre de la tarea */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de la tarea *
          </label>
          <input
            type="text"
            value={formData.nombre}
            onChange={(e) => handleInputChange("nombre", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Escribe el nombre de la tarea"
            maxLength={100}
          />
          <div className="text-xs text-gray-500 mt-1">
            {formData.nombre.length}/100 caracteres
          </div>
        </div>

        {/* Fila con Fecha/Hora y Prioridad */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Fecha y hora de expiración */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <ScheduleIcon className="mr-1" fontSize="small" />
              Fecha y hora
            </label>
            <DateTimePicker
              value={formData.fechaHora || formData.expira}
              onChange={(datetime) => handleInputChange("fechaHora", datetime)}
              placeholder="Seleccionar fecha y hora"
              includeTime={true}
              timeLabel="Hora"
            />
          </div>

          {/* Prioridad */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <PriorityHighIcon className="mr-1" fontSize="small" />
              Prioridad
            </label>
            <div className="grid grid-cols-2 gap-1">
              {[
                {
                  value: "baja",
                  label: "Baja",
                  color: "bg-green-100 text-green-800",
                },
                {
                  value: "normal",
                  label: "Normal",
                  color: "bg-blue-100 text-blue-800",
                },
                {
                  value: "media",
                  label: "Media",
                  color: "bg-yellow-100 text-yellow-800",
                },
                {
                  value: "alta",
                  label: "Alta",
                  color: "bg-red-100 text-red-800",
                },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleInputChange("prioridad", option.value)}
                  className={`flex items-center justify-center w-full px-2 py-1.5 border rounded-md transition-all text-xs font-medium ${
                    formData.prioridad === option.value
                      ? option.color + " border-current ring-1 ring-black/20"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            <DescriptionIcon className="mr-1" fontSize="small" />
            Descripción
          </label>
          <textarea
            value={formData.descripcion}
            onChange={(e) => handleInputChange("descripcion", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Agrega una descripción opcional..."
            rows={2}
            maxLength={500}
          />
          <div className="text-xs text-gray-500 mt-1">
            {formData.descripcion.length}/500 caracteres
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default TaskEditModal;
