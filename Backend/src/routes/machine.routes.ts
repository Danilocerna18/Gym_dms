import { Router } from 'express';
import { getMachineById, createMachine } from '../controllers/machine.controller';

const router = Router();

// Endpoint para que el cliente consulte la máquina por ID
router.get('/machines/:id', getMachineById);

// Endpoint para que el Administrador registre una nueva máquina con su video
router.post('/machines', createMachine);

export default router;