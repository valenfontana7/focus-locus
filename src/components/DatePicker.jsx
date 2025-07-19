import React, { useState, useEffect, useRef } from "react";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

function DatePicker({ value, onChange, placeholder = "Seleccionar fecha" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(
    value ? new Date(value) : null
  );
  const pickerRef = useRef(null);

  // Cerrar el picker cuando se hace clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
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

  // Generar días del mes
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];

    // Agregar días vacíos al inicio
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Agregar días del mes
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  // Nombres de los meses
  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  // Nombres de los días de la semana
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  // Navegar al mes anterior
  const goToPreviousMonth = () => {
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
      setSelectedDate(date);
      onChange(date.toISOString().split("T")[0]);
      setIsOpen(false);
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

  const days = getDaysInMonth(currentDate);

  return (
    <div className="relative" ref={pickerRef}>
      <div
        className="flex items-center justify-between border border-gray-300 rounded-lg px-3 py-2 cursor-pointer hover:border-gray-400 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedDate ? "text-gray-900" : "text-gray-500"}>
          {selectedDate
            ? selectedDate.toLocaleDateString("es-ES", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : placeholder}
        </span>
        <CalendarTodayIcon className="text-gray-400" />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-[280px]">
          {/* Header del calendario */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            <button
              onClick={goToPreviousMonth}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronLeftIcon />
            </button>
            <h3 className="font-semibold">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <button
              onClick={goToNextMonth}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronRightIcon />
            </button>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1 p-2">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-gray-500 py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Días del mes */}
          <div className="grid grid-cols-7 gap-1 p-2">
            {days.map((day, index) => (
              <button
                key={index}
                onClick={() => selectDate(day)}
                disabled={!day || isPast(day)}
                className={`
                  p-2 text-sm rounded-lg transition-colors
                  ${!day ? "invisible" : ""}
                  ${
                    isPast(day)
                      ? "text-gray-300 cursor-not-allowed"
                      : "hover:bg-gray-100 cursor-pointer"
                  }
                  ${
                    isToday(day)
                      ? "bg-blue-100 text-blue-600 font-semibold"
                      : ""
                  }
                  ${
                    isSelected(day)
                      ? "bg-blue-600 text-white font-semibold hover:bg-blue-700"
                      : ""
                  }
                  ${
                    !isSelected(day) && !isToday(day) && !isPast(day)
                      ? "text-gray-700"
                      : ""
                  }
                `}
              >
                {day ? day.getDate() : ""}
              </button>
            ))}
          </div>

          {/* Botones de acción */}
          <div className="flex justify-between p-3 border-t border-gray-200">
            <button
              onClick={() => {
                setSelectedDate(null);
                onChange("");
                setIsOpen(false);
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Limpiar
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DatePicker;
