import { prisma } from "../lib/prisma";
import { inicioDelDiaGuatemala } from "../lib/fechas";

// Capacidad máxima de la sala. Único lugar donde se define: el porcentaje y
// el estado se calculan siempre contra este número.
export const CAPACIDAD_GIMNASIO = 55;

// Límites del estado, en porcentaje de ocupación.
const LIMITE_CONCURRIDO = 70;
const LIMITE_LLENO = 90;

export type EstadoAforo = "optimo" | "concurrido" | "lleno";

export interface Aforo {
  personasAdentro: number;
  capacidad: number;
  porcentaje: number;
  estado: EstadoAforo;
}

// AccessLog es la única fuente del aforo: no existe un contador aparte que
// se pueda desincronizar. Una persona está adentro si su último registro de
// hoy (hora de Guatemala) es una entrada concedida. Se ignoran machine_scan y
// los rechazados, porque no mueven a nadie dentro ni fuera de la sala.
export async function calcularAforo(ahora = new Date()): Promise<Aforo> {
  // Una sola consulta agrupada: la hora más reciente de entrada y de salida
  // de cada usuario hoy, en vez de consultar persona por persona.
  const ultimos = await prisma.accessLog.groupBy({
    by: ["userId", "type"],
    where: {
      type: { in: ["entry", "exit"] },
      result: "granted",
      createdAt: { gte: inicioDelDiaGuatemala(ahora) },
    },
    _max: { createdAt: true },
  });

  const porUsuario = new Map<string, { entry?: Date; exit?: Date }>();
  for (const fila of ultimos) {
    const actual = porUsuario.get(fila.userId) ?? {};
    const fecha = fila._max.createdAt ?? undefined;
    if (fila.type === "entry") actual.entry = fecha;
    if (fila.type === "exit") actual.exit = fecha;
    porUsuario.set(fila.userId, actual);
  }

  let personasAdentro = 0;
  for (const { entry, exit } of porUsuario.values()) {
    if (entry && (!exit || entry > exit)) personasAdentro++;
  }

  const porcentaje = Math.round((personasAdentro / CAPACIDAD_GIMNASIO) * 100);
  const estado: EstadoAforo =
    porcentaje >= LIMITE_LLENO ? "lleno" : porcentaje >= LIMITE_CONCURRIDO ? "concurrido" : "optimo";

  return { personasAdentro, capacidad: CAPACIDAD_GIMNASIO, porcentaje, estado };
}
