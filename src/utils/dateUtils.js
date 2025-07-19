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
 * Formatea una fecha de manera personalizada y amigable
 * @param {string|Date} fecha - Fecha a formatear
 * @returns {string} Fecha formateada
 */
export function formatearFechaPersonalizada(fecha) {
  if (!fecha) return "";

  const fechaObj = new Date(fecha);
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

  const fechaObj = new Date(fecha);
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

  const fechaObj = new Date(fecha);
  const hoy = new Date();

  return fechaObj.toDateString() === hoy.toDateString();
}

/**
 * Verifica si una fecha es mañana
 * @param {string|Date} fecha - Fecha a verificar
 * @returns {boolean} True si es mañana
 */
export function esManana(fecha) {
  if (!fecha) return false;

  const fechaObj = new Date(fecha);
  const manana = new Date();
  manana.setDate(manana.getDate() + 1);

  return fechaObj.toDateString() === manana.toDateString();
}

/**
 * Verifica si una fecha está vencida
 * @param {string|Date} fecha - Fecha a verificar
 * @returns {boolean} True si está vencida
 */
export function estaVencida(fecha) {
  if (!fecha) return false;

  const fechaObj = new Date(fecha);
  const hoy = new Date();

  // Resetear horas para comparar solo fechas
  const fechaSinHora = new Date(
    fechaObj.getFullYear(),
    fechaObj.getMonth(),
    fechaObj.getDate()
  );
  const hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

  return fechaSinHora < hoySinHora;
}
