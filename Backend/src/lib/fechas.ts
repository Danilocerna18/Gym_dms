// Coincide con el aviso de vencimiento de US-07 (5 días antes).
export const DIAS_AVISO_VENCIMIENTO = 5;
export const MS_POR_DIA = 24 * 60 * 60 * 1000;

// Guatemala es UTC-6 todo el año (sin horario de verano). El servidor corre
// en UTC, así que "hoy" no puede salir del inicio del día del servidor: a las
// 7 pm en Guatemala ya sería "mañana" en UTC y los accesos de la tarde se
// contarían en el día equivocado.
export const OFFSET_GUATEMALA_HORAS = -6;

// Inicio del día de hoy en Guatemala, expresado como instante UTC.
export function inicioDelDiaGuatemala(ahora: Date): Date {
  const offsetMs = OFFSET_GUATEMALA_HORAS * 60 * 60 * 1000;
  // Se corre el reloj a la hora de Guatemala, se toma la medianoche de esa
  // fecha y se regresa a UTC.
  const enGuatemala = new Date(ahora.getTime() + offsetMs);
  const medianoche = Date.UTC(
    enGuatemala.getUTCFullYear(),
    enGuatemala.getUTCMonth(),
    enGuatemala.getUTCDate()
  );
  return new Date(medianoche - offsetMs);
}

// Inicio del mes actual en Guatemala, expresado como instante UTC. Misma
// técnica que el inicio del día: el mes se decide con la fecha de Guatemala,
// no con la del servidor (el último día del mes en la noche ya es mes nuevo en UTC).
export function inicioDelMesGuatemala(ahora: Date): Date {
  const offsetMs = OFFSET_GUATEMALA_HORAS * 60 * 60 * 1000;
  const enGuatemala = new Date(ahora.getTime() + offsetMs);
  const primerDia = Date.UTC(enGuatemala.getUTCFullYear(), enGuatemala.getUTCMonth(), 1);
  return new Date(primerDia - offsetMs);
}
