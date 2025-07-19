import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import DatePicker from "./DatePicker";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import ScheduleIcon from "@mui/icons-material/Schedule";
import DescriptionIcon from "@mui/icons-material/Description";
import { formatearFechaPersonalizada } from "../utils/dateUtils";

function TaskEditModal({ open, onClose, task, onSave }) {
  const [formData, setFormData] = useState({
    nombre: "",
    expira: "",
    prioridad: "normal",
    descripcion: "",
  });

  // Actualizar el formulario cuando cambie la tarea
  useEffect(() => {
    if (task) {
      setFormData({
        nombre: task.nombre || "",
        expira: task.expira || "",
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

  const getPriorityColor = (prioridad) => {
    switch (prioridad) {
      case "alta":
        return "text-red-600 bg-red-100";
      case "media":
        return "text-yellow-600 bg-yellow-100";
      case "normal":
        return "text-blue-600 bg-blue-100";
      case "baja":
        return "text-green-600 bg-green-100";
      default:
        return "text-blue-600 bg-blue-100";
    }
  };

  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Editar Tarea"
      actions={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!formData.nombre.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Guardar
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Nombre de la tarea */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
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

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <DescriptionIcon className="mr-1" fontSize="small" />
            Descripción
          </label>
          <textarea
            value={formData.descripcion}
            onChange={(e) => handleInputChange("descripcion", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Agrega una descripción opcional..."
            rows={3}
            maxLength={500}
          />
          <div className="text-xs text-gray-500 mt-1">
            {formData.descripcion.length}/500 caracteres
          </div>
        </div>

        {/* Fecha de expiración */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <ScheduleIcon className="mr-1" fontSize="small" />
            Fecha de expiración
          </label>
          <DatePicker
            value={formData.expira}
            onChange={(date) => handleInputChange("expira", date)}
            placeholder="Seleccionar fecha de expiración"
          />
        </div>

        {/* Prioridad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <PriorityHighIcon className="mr-1" fontSize="small" />
            Prioridad
          </label>
          <div className="grid grid-cols-2 gap-2">
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
                onClick={() => handleInputChange("prioridad", option.value)}
                className={`
                  p-2 rounded-lg border transition-all
                  ${
                    formData.prioridad === option.value
                      ? `${option.color} border-current`
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                  }
                `}
              >
                <div className="flex items-center justify-center">
                  <span className="text-sm font-medium">{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Vista previa */}
        {formData.nombre && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Vista previa:
            </h4>
            <div className="space-y-2">
              <div className="font-medium">{formData.nombre}</div>
              {formData.descripcion && (
                <div className="text-sm text-gray-600">
                  {formData.descripcion}
                </div>
              )}
              <div className="flex items-center space-x-4 text-xs">
                {formData.expira && (
                  <div className="text-sm text-gray-600 mt-2">
                    {formatearFechaPersonalizada(formData.expira)}
                  </div>
                )}
                <div
                  className={`text-xs px-2 py-1 rounded-full font-semibold ${getPriorityColor(
                    formData.prioridad
                  )}`}
                >
                  {formData.prioridad.charAt(0).toUpperCase() +
                    formData.prioridad.slice(1)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default TaskEditModal;
