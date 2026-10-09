import { Router } from "express";
import { prisma } from "../lib/prisma";

export const clientesRouter = Router();

// Coincide con el aviso de vencimiento de US-07 (5 días antes).
const DIAS_AVISO_VENCIMIENTO = 5;
const MS_POR_DIA = 24 * 60 * 60 * 1000;

// Guatemala es UTC-6 todo el año (sin horario de verano). El servidor corre
// en UTC, así que "hoy" no puede salir del inicio del día del servidor: a las
// 7 pm en Guatemala ya sería "mañana" en UTC y los accesos de la tarde se
// contarían en el día equivocado.
const OFFSET_GUATEMALA_HORAS = -6;

// Sin paginación por ahora: se devuelven los primeros 50 por nombre.
// Agregar skip/take con parámetros cuando haya más miembros que eso.
const LIMITE_CLIENTES = 50;

// Inicio del día de hoy en Guatemala, expresado como instante UTC.
function inicioDelDiaGuatemala(ahora: Date): Date {
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

// TODO(seguridad): este endpoint expone datos personales y debe ser solo
// para admin (PRD sección 6, Privacidad). Hoy no hay sesión de admin, así
// que está abierto hasta que exista el login de Danilo.
clientesRouter.get("/", async (_req, res, next) => {
  try {
    const ahora = new Date();
    const limiteAviso = new Date(ahora.getTime() + DIAS_AVISO_VENCIMIENTO * MS_POR_DIA);

    // No basta con status: "active": si el job que marca membresías vencidas
    // todavía no corrió, endDate ya pudo pasar. Se valida la fecha real.
    const vigente = { status: "active" as const, endDate: { gte: ahora } };

    const miembros = await prisma.user.findMany({
      where: { role: "member" },
      orderBy: { name: "asc" },
      take: LIMITE_CLIENTES,
      select: {
        id: true,
        name: true,
        email: true,
        qrCode: true,
        // Solo la membresía vigente con la fecha de fin más lejana
        memberships: {
          where: vigente,
          orderBy: { endDate: "desc" },
          take: 1,
          select: { endDate: true },
        },
      },
    });

    // Una sola consulta agrupada para todos los miembros de la lista, en vez
    // de dos consultas por cliente (N+1). Solo eventos "granted", que son los
    // que cuentan para el aforo.
    const ultimosAccesos = await prisma.accessLog.groupBy({
      by: ["userId", "type"],
      where: {
        userId: { in: miembros.map((m) => m.id) },
        type: { in: ["entry", "exit"] },
        result: "granted",
      },
      _max: { createdAt: true },
    });

    const ultimoPorUsuario = new Map<string, { entry: Date | null; exit: Date | null }>();
    for (const fila of ultimosAccesos) {
      const actual = ultimoPorUsuario.get(fila.userId) ?? { entry: null, exit: null };
      if (fila.type === "entry") actual.entry = fila._max.createdAt;
      if (fila.type === "exit") actual.exit = fila._max.createdAt;
      ultimoPorUsuario.set(fila.userId, actual);
    }

    // El resumen cuenta sobre todos los miembros, no solo sobre los 50 de la lista.
    const [miembrosActivos, porVencer, accesosHoy] = await Promise.all([
      prisma.user.count({
        where: { role: "member", memberships: { some: vigente } },
      }),
      prisma.user.count({
        where: {
          role: "member",
          memberships: { some: { ...vigente, endDate: { gte: ahora, lte: limiteAviso } } },
        },
      }),
      prisma.accessLog.count({
        where: {
          type: "entry",
          result: "granted",
          createdAt: { gte: inicioDelDiaGuatemala(ahora) },
        },
      }),
    ]);

    const clientes = miembros.map((m) => {
      const fechaVencimiento = m.memberships[0]?.endDate ?? null;
      const estado = !fechaVencimiento
        ? "vencido"
        : fechaVencimiento <= limiteAviso
          ? "por_vencer"
          : "activo";
      const accesos = ultimoPorUsuario.get(m.id);

      return {
        id: m.id,
        name: m.name,
        email: m.email,
        qrCode: m.qrCode,
        estado,
        fechaVencimiento: fechaVencimiento?.toISOString() ?? null,
        ultimaEntrada: accesos?.entry?.toISOString() ?? null,
        ultimaSalida: accesos?.exit?.toISOString() ?? null,
      };
    });

    return res.json({
      resumen: { miembrosActivos, accesosHoy, porVencer },
      clientes,
    });
  } catch (err) {
    next(err);
  }
});
