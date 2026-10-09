import { Router } from "express";
import { prisma } from "../lib/prisma";
import {
  DIAS_AVISO_VENCIMIENTO,
  MS_POR_DIA,
  inicioDelDiaGuatemala,
  inicioDelMesGuatemala,
} from "../lib/fechas";

export const dashboardRouter = Router();

const LIMITE_ALERTAS = 10;

// Cada tipo trae como máximo este número de candidatos. Como un miembro solo
// puede salir en una alerta (se descartan los repetidos antes de recortar a
// LIMITE_ALERTAS), se piden más filas de las que se muestran.
const CANDIDATOS_POR_TIPO = 50;

type TipoAlerta = "fallido" | "vencido" | "por_caducar";

interface Alerta {
  tipo: TipoAlerta;
  miembro: { id: string; name: string };
  plan: string;
  detalle: string;
  fecha: string;
}

// TODO(seguridad): este endpoint expone datos personales y datos de pagos
// y debe ser solo para admin (PRD sección 6, Privacidad). Hoy no hay sesión
// de admin, así que está abierto hasta que exista el login de Danilo.
dashboardRouter.get("/", async (_req, res, next) => {
  try {
    const ahora = new Date();
    const limiteAviso = new Date(ahora.getTime() + DIAS_AVISO_VENCIMIENTO * MS_POR_DIA);

    // No basta con status: "active": si el job que marca membresías vencidas
    // todavía no corrió, endDate ya pudo pasar. Se valida la fecha real.
    const vigente = { status: "active" as const, endDate: { gte: ahora } };

    const [
      totalMiembros,
      nuevosEsteMes,
      entradasHoy,
      pagosFallidos,
      membresiasVencidas,
      membresiasPorCaducar,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "member" } }),
      prisma.user.count({
        where: { role: "member", createdAt: { gte: inicioDelMesGuatemala(ahora) } },
      }),
      // Un miembro que entró tres veces hoy cuenta una sola vez, por eso se
      // agrupa por usuario. Solo eventos "granted", los que cuentan para el aforo.
      prisma.accessLog.groupBy({
        by: ["userId"],
        where: {
          type: "entry",
          result: "granted",
          createdAt: { gte: inicioDelDiaGuatemala(ahora) },
          user: { role: "member" },
        },
      }),
      // include trae el miembro, el plan y los pagos completados de la misma
      // membresía en una sola consulta, para decidir sin consultar por cliente.
      prisma.payment.findMany({
        where: {
          status: "failed",
          membership: { user: { role: "member" } },
        },
        orderBy: { createdAt: "desc" },
        take: CANDIDATOS_POR_TIPO,
        include: {
          membership: {
            include: {
              user: { select: { id: true, name: true } },
              plan: { select: { name: true } },
              payments: {
                where: { status: "completed" },
                select: { createdAt: true, paidAt: true },
              },
            },
          },
        },
      }),
      // Vencido = sin membresía vigente y con una vencida (por fecha o por
      // status). Ordenada por endDate descendente, la primera fila de cada
      // miembro es su membresía más reciente.
      prisma.membership.findMany({
        where: {
          user: { role: "member", memberships: { none: vigente } },
          OR: [{ endDate: { lt: ahora } }, { status: "expired" }],
        },
        orderBy: { endDate: "desc" },
        take: CANDIDATOS_POR_TIPO,
        include: {
          user: { select: { id: true, name: true } },
          plan: { select: { name: true } },
        },
      }),
      prisma.membership.findMany({
        where: {
          status: "active",
          endDate: { gte: ahora, lte: limiteAviso },
          user: { role: "member" },
        },
        // Ascendente: la que vence antes es la más urgente.
        orderBy: { endDate: "asc" },
        take: CANDIDATOS_POR_TIPO,
        include: {
          user: { select: { id: true, name: true } },
          plan: { select: { name: true } },
        },
      }),
    ]);

    const fallidas: Alerta[] = pagosFallidos
      // Un cobro fallido deja de ser alerta cuando la misma membresía tiene
      // después un pago completado (el reintento funcionó).
      .filter((pago) => {
        const reintentoExitoso = pago.membership.payments.some(
          (ok) => (ok.paidAt ?? ok.createdAt) > pago.createdAt
        );
        return !reintentoExitoso;
      })
      .map((pago) => ({
        tipo: "fallido" as const,
        miembro: pago.membership.user,
        plan: pago.membership.plan.name,
        detalle: "Pago fallido",
        fecha: pago.createdAt.toISOString(),
      }));

    const vencidas: Alerta[] = membresiasVencidas.map((m) => ({
      tipo: "vencido" as const,
      miembro: m.user,
      plan: m.plan.name,
      detalle: "Membresía vencida",
      fecha: m.endDate.toISOString(),
    }));

    const porCaducar: Alerta[] = membresiasPorCaducar.map((m) => {
      const dias = Math.ceil((m.endDate.getTime() - ahora.getTime()) / MS_POR_DIA);
      return {
        tipo: "por_caducar" as const,
        miembro: m.user,
        plan: m.plan.name,
        detalle: dias <= 1 ? "Caduca hoy o mañana" : `Caduca en ${dias} días`,
        fecha: m.endDate.toISOString(),
      };
    });

    // Un miembro sale una sola vez: el orden de la concatenación (fallido,
    // vencido, por caducar) hace que gane la alerta más grave.
    const yaIncluidos = new Set<string>();
    const alertas = [...fallidas, ...vencidas, ...porCaducar]
      .filter((alerta) => {
        if (yaIncluidos.has(alerta.miembro.id)) return false;
        yaIncluidos.add(alerta.miembro.id);
        return true;
      })
      .slice(0, LIMITE_ALERTAS);

    return res.json({
      resumen: {
        totalMiembros,
        nuevosEsteMes,
        activosHoy: entradasHoy.length,
      },
      alertas,
    });
  } catch (err) {
    next(err);
  }
});
