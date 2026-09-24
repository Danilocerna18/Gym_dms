import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// 1. ENDPOINT: Perfil y QR único
router.get('/users/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { memberships: { take: 1, orderBy: { createdAt: 'desc' } } }
    });

    if (user) {
      return res.json({ ok: true, user });
    }
  } catch (dbError) {
    console.warn('Base de datos no disponible, enviando respuesta simulada (Perfil).');
  }

  // Fallback / Respuesta simulada si la BD no responde o no existe el usuario
  return res.json({
    ok: true,
    user: { 
      id, 
      name: 'Usuario Demo', 
      email: 'demo@gym.com', 
      qrCode: 'USER-84920', 
      status: 'active' 
    }
  });
});

// 2. ENDPOINT: Escáner de QR
router.post('/users/scan', async (req: Request, res: Response) => {
  const { qrCode } = req.body;

  try {
    const user = await prisma.user.findFirst({ where: { qrCode } });
    if (user) {
      return res.json({ ok: true, user });
    }
  } catch (dbError) {
    console.warn('Base de datos no disponible, enviando respuesta simulada (Scan).');
  }

  // Fallback si la BD no está conectada
  return res.json({
    ok: true,
    user: {
      id: 'demo-user-id',
      name: 'Usuario Escaneado',
      email: 'escaneado@gym.com',
      qrCode: qrCode || 'USER-84920',
      status: 'active'
    }
  });
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