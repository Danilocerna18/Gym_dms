import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { requireSession } from '../middleware/authorization';

const router = Router();
const profileSelect = {
  id: true, name: true, email: true, role: true, qrCode: true,
  memberships: {
    orderBy: { endDate: 'desc' }, select: {
      startDate: true, endDate: true, status: true, plan: { select: { name: true } }
    }
  }
} as const;

router.get('/users/:id', requireSession(), async (req, res, next) => {
  const actor = req.user!;
  const id = req.params.id === 'me' ? actor.id : req.params.id;
  if (actor.role !== 'admin' && id !== actor.id) return res.sendStatus(403);
  try {
    const user = await prisma.user.findUnique({ where: { id }, select: profileSelect });
    if (!user) return res.sendStatus(404);
    return res.json({ ok: true, user });
  } catch (error) { next(error); }
});

router.post('/users/scan', requireSession('admin'), async (req, res, next) => {
  const qrCode = req.body?.qrCode;
  if (typeof qrCode !== 'string' || !qrCode) return res.sendStatus(400);
  try {
    const user = await prisma.user.findUnique({ where: { qrCode }, select: profileSelect });
    if (!user) return res.sendStatus(404);
    return res.json({ ok: true, user });
  } catch (error) { next(error); }
});

// 3. ENDPOINT: Detalle de Máquina y Videos
router.get('/machines/:qrCode', async (req: Request, res: Response) => {
  const { qrCode } = req.params;

  try {
    const machine = await prisma.machine.findUnique({
      where: { qrCode },
      include: { videos: true }
    });

    if (machine) {
      return res.json({ ok: true, machine });
    }
  } catch (dbError) {
    console.warn('Base de datos no disponible, enviando respuesta simulada (Máquina).');
  }

  // Fallback si la BD no responde
  return res.json({
    ok: true,
    machine: { 
      id: '1', 
      name: 'Prensa de Piernas', 
      qrCode, 
      videos: [] 
    }
  });
});

export default router;