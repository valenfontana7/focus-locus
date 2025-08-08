import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

/**
 * Crea un objeto Date a partir de una fecha string en formato YYYY-MM-DD
 * evitando problemas de zona horaria
 */
function parsearFechaLocal(fecha) {
  if (!fecha) return null;
  if (fecha instanceof Date) return fecha;

  // Si es un string en formato YYYY-MM-DD, parsearlo manualmente
  if (typeof fecha === "string" && fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [año, mes, dia] = fecha.split("-").map(Number);
    return new Date(año, mes - 1, dia); // mes - 1 porque Date usa base 0 para meses
  }

  // Si es un string con fecha y hora (ISO format)
  if (typeof fecha === "string") {
    return new Date(fecha);
  }

  return new Date(fecha);
}

function DateTimePicker({
  value,
  onChange,
  placeholder = "Seleccionar fecha",
  includeTime = false,
  timeLabel = "Hora",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(
    value ? parsearFechaLocal(value) : null
  );
  const [selectedTime, setSelectedTime] = useState(() => {
    if (value && includeTime) {
      const date = parsearFechaLocal(value);
      if (date) {
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        return `${hours}:${minutes}`;
      }
    }
    return "09:00"; // Hora por defecto
  });
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });

  const pickerRef = useRef(null);
  const calendarRef = useRef(null);

  // Actualizar selectedDate cuando cambie el value
  useEffect(() => {
    const newDate = value ? parsearFechaLocal(value) : null;
    setSelectedDate(newDate);

    if (newDate && includeTime) {
      const hours = newDate.getHours().toString().padStart(2, "0");
      const minutes = newDate.getMinutes().toString().padStart(2, "0");
      setSelectedTime(`${hours}:${minutes}`);
    }
  }, [value, includeTime]);

  // Cerrar el picker cuando se hace clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      // Verificar si el clic fue dentro del input o dentro del calendario
      const isClickInsideInput =
        pickerRef.current && pickerRef.current.contains(event.target);
      const isClickInsideCalendar =
        calendarRef.current && calendarRef.current.contains(event.target);

      if (!isClickInsideInput && !isClickInsideCalendar) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Obtener los días del mes
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Obtener el día de la semana del primer día (0 = domingo, 1 = lunes, etc.)
    const startDayOfWeek = firstDay.getDay();

    // Calcular cuántos días del mes anterior mostrar
    const startPadding = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    const days = [];

    // Días del mes anterior
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startPadding - 1; i >= 0; i--) {
      const day = prevMonth.getDate() - i;
      days.push({
        date: new Date(year, month - 1, day),
        isCurrentMonth: false,
      });
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: new Date(year, month, day),
        isCurrentMonth: true,
      });
    }

    // Días del mes siguiente para completar la grilla
    const totalCells = Math.ceil(days.length / 7) * 7;
    let nextMonthDay = 1;
    while (days.length < totalCells) {
      days.push({
        date: new Date(year, month + 1, nextMonthDay),
        isCurrentMonth: false,
      });
      nextMonthDay++;
    }

    return days;
  };

  // Navegar al mes anterior
  const goToPrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  // Navegar al mes siguiente
  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  // Seleccionar una fecha
  const selectDate = (date) => {
    if (date) {
      const newDate = new Date(date);

      // Si incluye tiempo, aplicar la hora seleccionada
      if (includeTime) {
        const [hours, minutes] = selectedTime.split(":").map(Number);
        newDate.setHours(hours, minutes, 0, 0);
        setSelectedDate(newDate);
        onChange(newDate.toISOString());
      } else {
        setSelectedDate(newDate);
        onChange(newDate.toISOString().split("T")[0]);
        setIsOpen(false);
      }
    }
  };

  // Manejar cambio de hora
  const handleTimeChange = (time) => {
    setSelectedTime(time);

    if (selectedDate) {
      const newDate = new Date(selectedDate);
      const [hours, minutes] = time.split(":").map(Number);
      newDate.setHours(hours, minutes, 0, 0);
      setSelectedDate(newDate);
      onChange(newDate.toISOString());
    }
  };

  // Verificar si una fecha es hoy
  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Verificar si una fecha está seleccionada
  const isSelected = (date) => {
    if (!date || !selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  // Verificar si una fecha es del pasado
  const isPast = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Formatear fecha para mostrar
  const formatDisplayDate = () => {
    if (!selectedDate) return placeholder;

    const dateStr = selectedDate.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    if (includeTime) {
      return `${dateStr} ${selectedTime}`;
    }

    return dateStr;
  };

  // Función para abrir/cerrar el picker y calcular posición
  const togglePicker = () => {
    if (!isOpen && pickerRef.current) {
      const rect = pickerRef.current.getBoundingClientRect();
      setPickerPosition({
        top: rect.bottom + window.scrollY + 4, // 4px de margen
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
    setIsOpen(!isOpen);
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="relative" ref={pickerRef}>
      <div
        className="flex items-center justify-between border border-gray-300 rounded-lg px-3 py-2 cursor-pointer hover:border-gray-400 transition-colors"
        onClick={togglePicker}
      >
        <span className={selectedDate ? "text-gray-900" : "text-gray-500"}>
          {formatDisplayDate()}
        </span>
        <div className="flex items-center space-x-1">
          {includeTime && (
            <AccessTimeIcon className="text-gray-400" fontSize="small" />
          )}
          <CalendarTodayIcon className="text-gray-400" fontSize="small" />
        </div>
      </div>

      {isOpen &&
        createPortal(
          <div
            ref={calendarRef}
            className="fixed bg-white border border-gray-300 rounded-lg shadow-lg z-[99999] p-3 w-72 max-h-80 overflow-y-auto"
            style={{
              top: pickerPosition.top,
              left: pickerPosition.left,
              minWidth: Math.max(pickerPosition.width || 256, 288), // Asegurar ancho mínimo
            }}
          >
            {/* Header del calendario */}
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={goToPrevMonth}
                className="p-0.5 hover:bg-gray-100 rounded"
              >
                <ChevronLeftIcon fontSize="small" />
              </button>
              <h3 className="text-sm font-semibold">
                {currentDate.toLocaleDateString("es-ES", {
                  month: "long",
                  year: "numeric",
                })}
              </h3>
              <button
                onClick={goToNextMonth}
                className="p-0.5 hover:bg-gray-100 rounded"
              >
                <ChevronRightIcon fontSize="small" />
              </button>
            </div>

            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {["L", "M", "X", "J", "V", "S", "D"].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-gray-500 py-0.5 h-6 w-6 flex items-center justify-center"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Días del mes */}
            <div className="grid grid-cols-7 gap-0.5 mb-2">
              {days.map((day, index) => (
                <button
                  key={index}
                  onClick={() => selectDate(day.date)}
                  disabled={isPast(day.date)}
                  className={`
                  py-1 px-0.5 text-xs rounded hover:bg-blue-100 transition-colors h-6 w-6 flex items-center justify-center
                  ${day.isCurrentMonth ? "text-gray-900" : "text-gray-400"}
                  ${
                    isSelected(day.date)
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : ""
                  }
                  ${
                    isToday(day.date) && !isSelected(day.date)
                      ? "bg-blue-50 text-blue-600 font-semibold"
                      : ""
                  }
                  ${
                    isPast(day.date)
                      ? "text-gray-300 cursor-not-allowed hover:bg-transparent"
                      : ""
                  }
                `}
                >
                  {day.date.getDate()}
                </button>
              ))}
            </div>

            {/* Selector de hora */}
            {includeTime && (
              <div className="border-t pt-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {timeLabel}
                </label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={() => setIsOpen(false)}
                className="px-2 py-0.5 text-xs text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              {includeTime && selectedDate && (
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-2 py-0.5 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Confirmar
                </button>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

export default DateTimePicker;
