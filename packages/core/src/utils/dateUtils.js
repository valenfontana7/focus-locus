/**
 * Utilidades para formatear fechas de manera personalizada
 */

const DIAS_SEMANA = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

const MESES = [
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

/**
 * Crea un objeto Date a partir de una fecha string en formato YYYY-MM-DD
 * evitando problemas de zona horaria
 * @param {string|Date} fecha - Fecha en formato string o objeto Date
 * @returns {Date} Objeto Date en zona horaria local
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

/**
 * Formatea una fecha de manera personalizada y amigable
 * @param {string|Date} fecha - Fecha a formatear
 * @returns {string} Fecha formateada
 */
export function formatearFechaPersonalizada(fecha) {
  if (!fecha) return "";

  const fechaObj = parsearFechaLocal(fecha);
  const hoy = new Date();
  const manana = new Date(hoy);
  manana.setDate(hoy.getDate() + 1);

  // Resetear horas para comparar solo fechas
  const fechaSinHora = new Date(
    fechaObj.getFullYear(),
    fechaObj.getMonth(),
    fechaObj.getDate()
  );
  const hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const mananaSinHora = new Date(
    manana.getFullYear(),
    manana.getMonth(),
    manana.getDate()
  );

  const diaSemana = DIAS_SEMANA[fechaObj.getDay()];
  const dia = fechaObj.getDate();
  const mes = MESES[fechaObj.getMonth()];
  const año = fechaObj.getFullYear();

  // Si es hoy
  if (fechaSinHora.getTime() === hoySinHora.getTime()) {
    return "Hoy";
  }

  // Si es mañana
  if (fechaSinHora.getTime() === mananaSinHora.getTime()) {
    return "Mañana";
  }

  // Si es esta semana (próximos 7 días)
  const diferenciaDias = Math.ceil(
    (fechaSinHora - hoySinHora) / (1000 * 60 * 60 * 24)
  );
  if (diferenciaDias > 0 && diferenciaDias <= 7) {
    return `El ${diaSemana}`;
  }

  // Si es la próxima semana (8-14 días)
  if (diferenciaDias > 7 && diferenciaDias <= 14) {
    return `El próximo ${diaSemana}`;
  }

  // Si es este año pero no esta semana
  if (año === hoy.getFullYear()) {
    return `${diaSemana} ${dia} de ${mes}`;
  }

  // Si es otro año
  return `${diaSemana} ${dia} de ${mes} ${año}`;
}

/**
 * Formatea una fecha de manera más compacta
 * @param {string|Date} fecha - Fecha a formatear
 * @returns {string} Fecha formateada de manera compacta
 */
export function formatearFechaCompacta(fecha) {
  if (!fecha) return "";

  const fechaObj = parsearFechaLocal(fecha);
  const hoy = new Date();

  const fechaSinHora = new Date(
    fechaObj.getFullYear(),
    fechaObj.getMonth(),
    fechaObj.getDate()
  );
  const hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

  const diaSemana = DIAS_SEMANA[fechaObj.getDay()];
  const dia = fechaObj.getDate();
  const mes = MESES[fechaObj.getMonth()];
  const año = fechaObj.getFullYear();

  // Si es hoy
  if (fechaSinHora.getTime() === hoySinHora.getTime()) {
    return "Hoy";
  }

  // Si es mañana
  const manana = new Date(hoy);
  manana.setDate(hoy.getDate() + 1);
  const mananaSinHora = new Date(
    manana.getFullYear(),
    manana.getMonth(),
    manana.getDate()
  );
  if (fechaSinHora.getTime() === mananaSinHora.getTime()) {
    return "Mañana";
  }

  // Si es esta semana
  const diferenciaDias = Math.ceil(
    (fechaSinHora - hoySinHora) / (1000 * 60 * 60 * 24)
  );
  if (diferenciaDias > 0 && diferenciaDias <= 7) {
    return `${diaSemana} ${dia}`;
  }

  // Si es este año
  if (año === hoy.getFullYear()) {
    return `${diaSemana} ${dia} de ${mes}`;
  }

  // Si es otro año
  return `${dia} ${mes} ${año}`;
}

/**
 * Verifica si una fecha es hoy
 * @param {string|Date} fecha - Fecha a verificar
 * @returns {boolean} True si es hoy
 */
export function esHoy(fecha) {
  if (!fecha) return false;

  const fechaObj = parsearFechaLocal(fecha);
  const hoy = new Date();

  const fechaSinHora = new Date(
    fechaObj.getFullYear(),
    fechaObj.getMonth(),
    fechaObj.getDate()
  );
  const hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

  return fechaSinHora.getTime() === hoySinHora.getTime();
}

/**
 * Verifica si una fecha es mañana
 * @param {string|Date} fecha - Fecha a verificar
 * @returns {boolean} True si es mañana
 */
export function esManana(fecha) {
  if (!fecha) return false;

  const fechaObj = parsearFechaLocal(fecha);
  const manana = new Date();
  manana.setDate(manana.getDate() + 1);

  const fechaSinHora = new Date(
    fechaObj.getFullYear(),
    fechaObj.getMonth(),
    fechaObj.getDate()
  );
  const mananaSinHora = new Date(
    manana.getFullYear(),
    manana.getMonth(),
    manana.getDate()
  );

  return fechaSinHora.getTime() === mananaSinHora.getTime();
}

/**
 * Verifica si una fecha está vencida
 * @param {string|Date} fecha - Fecha a verificar
 * @returns {boolean} True si está vencida
 */
export function estaVencida(fecha) {
  if (!fecha) return false;

  const fechaObj = parsearFechaLocal(fecha);
  const hoy = new Date();

  // Si la fecha incluye hora, comparar con hora exacta
  if (typeof fecha === "string" && fecha.includes("T")) {
    return fechaObj < hoy;
  }

  // Resetear horas para comparar solo fechas
  const fechaSinHora = new Date(
    fechaObj.getFullYear(),
    fechaObj.getMonth(),
    fechaObj.getDate()
  );
  const hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

  return fechaSinHora < hoySinHora;
}

/**
 * Formatea una fecha con hora de manera amigable
 * @param {string|Date} fecha - Fecha con hora a formatear
 * @returns {string} Fecha formateada con hora
 */
export function formatearFechaConHora(fecha) {
  if (!fecha) return "";

  const fechaObj = parsearFechaLocal(fecha);
  const fechaFormateada = formatearFechaPersonalizada(fecha);

  // Verificar si la fecha tiene componente de hora (no es exactamente medianoche)
  const tieneHora = fechaObj.getHours() !== 0 || fechaObj.getMinutes() !== 0;

  // Si tiene hora específica, mostrarla
  if (tieneHora) {
    const hora = fechaObj.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${fechaFormateada} a las ${hora}`;
  }

  return fechaFormateada;
}

/**
 * Verifica si una fecha está próxima a vencer (dentro de las próximas 24 horas)
 * @param {string|Date} fecha - Fecha a verificar
 * @returns {boolean} true si está próxima a vencer
 */
export function estaProximaAVencer(fecha) {
  if (!fecha) return false;

  const fechaObj = parsearFechaLocal(fecha);
  const ahora = new Date();
  const en24Horas = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);

  // Si la fecha incluye hora, usar comparación exacta
  if (typeof fecha === "string" && fecha.includes("T")) {
    return fechaObj > ahora && fechaObj <= en24Horas;
  }

  // Para fechas sin hora, considerar próximo si es mañana
  const fechaSinHora = new Date(
    fechaObj.getFullYear(),
    fechaObj.getMonth(),
    fechaObj.getDate()
  );
  const mananaSinHora = new Date(
    ahora.getFullYear(),
    ahora.getMonth(),
    ahora.getDate() + 1
  );

  return fechaSinHora.getTime() === mananaSinHora.getTime();
}
