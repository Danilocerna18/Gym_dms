import { requireSession } from '../middleware/authorization';
import { Router } from 'express';
import { getMachineById, createMachine, getAllMachines } from '../controllers/machine.controller';

const router = Router();

// 1. Obtener TODAS las máquinas (para la biblioteca/home del usuario)
router.get('/machines', getAllMachines);

// 2. Obtener una máquina por su ID (para el escáner o detalle)
router.get('/machines/:id', getMachineById);

// 3. Crear máquina (exclusivo Administrador)
router.post('/machines', requireSession('admin'), createMachine);

export default router;