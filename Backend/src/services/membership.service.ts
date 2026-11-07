import { Membership, Prisma } from "@prisma/client";

// Resultado de las operaciones del servicio: las rutas traducen el error a
// la respuesta HTTP sin conocer las reglas de negocio.
export type ResultadoMembresia =
  | { ok: true; membership: Membership }
  | { ok: false; status: number; error: string; message: string };

// Bloquea la fila del usuario hasta que termine la transacción. Si dos
// solicitudes del mismo usuario llegan al mismo tiempo (doble clic en
// "escoger plan", o dos admins activando), la segunda espera a que la
// primera termine y ya ve su resultado; sin esto ambas pasarían la
// verificación y se crearían dos membresías.
export async function bloquearUsuario(tx: Prisma.TransactionClient, userId: string) {
  await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${userId} FOR UPDATE`;
}

// Todavía no existe el job programado que marca las membresías vencidas, así
// que una membresía cuyo endDate ya pasó puede seguir con status "active".
// Antes de aplicar la regla de "solo una active" se ponen al día las de este
// usuario; si no, alguien con la membresía vencida nunca podría renovar.
export async function marcarVencidas(tx: Prisma.TransactionClient, userId: string) {
  await tx.membership.updateMany({
    where: { userId, status: "active", endDate: { lt: new Date() } },
    data: { status: "expired" },
  });
}

// Única regla de "escoger plan", la usan el registro y POST /api/memberships.
// Debe llamarse dentro de prisma.$transaction para que la verificación y la
// creación ocurran juntas.
export async function crearMembresiaPendiente(
  tx: Prisma.TransactionClient,
  userId: string,
  planId: string
): Promise<ResultadoMembresia> {
  const plan = await tx.membershipPlan.findUnique({ where: { id: planId } });
  if (!plan || !plan.active) {
    return {
      ok: false,
      status: 400,
      error: "PLAN_NO_DISPONIBLE",
      message: "Ese plan no está disponible. Escoge otro.",
    };
  }

  await bloquearUsuario(tx, userId);
  await marcarVencidas(tx, userId);

  const existente = await tx.membership.findFirst({
    where: { userId, status: { in: ["active", "pending"] } },
    select: { status: true },
  });
  if (existente) {
    return {
      ok: false,
      status: 409,
      error: existente.status === "pending" ? "MEMBRESIA_PENDIENTE" : "MEMBRESIA_ACTIVA",
      message:
        existente.status === "pending"
          ? "Ya escogiste un plan. Pasa a recepción para activarlo."
          : "Ya tienes una membresía activa.",
    };
  }

  // Sin fechas: se calculan cuando el admin la activa, no al escoger el plan.
  const membership = await tx.membership.create({
    data: { userId, planId, status: "pending" },
  });
  return { ok: true, membership };
}

// Activa una membresía pendiente después del pago en recepción. Las fechas se
// calculan aquí, no al escoger el plan, para que el miembro no pierda días
// entre que escoge el plan y que paga. No crea Payment: la auditoría del pago
// en recepción es activatedAt + activatedById.
export async function activarMembresia(
  tx: Prisma.TransactionClient,
  membershipId: string,
  adminId: string
): Promise<ResultadoMembresia> {
  const encontrada = await tx.membership.findUnique({
    where: { id: membershipId },
    select: { userId: true },
  });
  if (!encontrada) {
    return {
      ok: false,
      status: 404,
      error: "MEMBRESIA_NO_ENCONTRADA",
      message: "No encontramos esa membresía.",
    };
  }

  await bloquearUsuario(tx, encontrada.userId);

  // Se vuelve a leer después del bloqueo: si otro admin la activó mientras
  // tanto, aquí ya se ve como "active" y se rechaza.
  const membresia = await tx.membership.findUniqueOrThrow({
    where: { id: membershipId },
    include: { plan: true },
  });
  if (membresia.status !== "pending") {
    return {
      ok: false,
      status: 409,
      error: "MEMBRESIA_NO_PENDIENTE",
      message: "Esta membresía no está pendiente de activar.",
    };
  }

  await marcarVencidas(tx, membresia.userId);

  const otraActiva = await tx.membership.findFirst({
    where: { userId: membresia.userId, status: "active", id: { not: membershipId } },
    select: { id: true },
  });
  if (otraActiva) {
    return {
      ok: false,
      status: 409,
      error: "MEMBRESIA_ACTIVA",
      message: "Este miembro ya tiene una membresía activa.",
    };
  }

  const ahora = new Date();
  const endDate = new Date(ahora);
  endDate.setUTCDate(endDate.getUTCDate() + membresia.plan.durationDays);

  const membership = await tx.membership.update({
    where: { id: membershipId },
    data: {
      status: "active",
      startDate: ahora,
      endDate,
      activatedAt: ahora,
      activatedById: adminId,
    },
  });
  return { ok: true, membership };
}
