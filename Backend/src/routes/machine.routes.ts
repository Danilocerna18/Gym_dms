import { requireSession } from '../middleware/authorization';
import { Router } from 'express';
import { getMachineById, createMachine, getAllMachines, deleteMachine } from '../controllers/machine.controller';

const router = Router();

// 1. Obtener TODAS las máquinas (GET /api/machines)
router.get('/machines', getAllMachines);

// 2. Obtener una máquina por ID (GET /api/machines/:id)
router.get('/machines/:id', getMachineById);

// 3. Crear máquina (POST /api/machines)
router.post('/machines', requireSession('admin'), createMachine);

// 4. Eliminar máquina (DELETE /api/machines/:id)
router.delete('/machines/:id', requireSession('admin'), deleteMachine);

export default router;