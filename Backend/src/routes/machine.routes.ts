import { Router } from 'express';
import { getMachineById } from '../controllers/machine.controller';

const router = Router();

// Define el endpoint que recibirá la petición
router.get('/machines/:id', getMachineById);

export default router;