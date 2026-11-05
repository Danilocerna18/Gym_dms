import { requireSession } from '../middleware/authorization';
import { Router } from 'express';
import { getMachineById, createMachine, getAllMachines } from '../controllers/machine.controller';

const router = Router();

// 1. Obtener TODAS las máquinas (GET /api/machines)
router.get('/machines', getAllMachines);

// 2. Obtener una máquina por ID (GET /api/machines/:id)
router.get('/machines/:id', getMachineById);

// 3. Crear máquina (POST /api/machines)
router.post('/machines', requireSession('admin'), createMachine);

export default router;