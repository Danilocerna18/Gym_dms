import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getMachineById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const machine = await prisma.machine.findUnique({
      where: { id: id },
      include: {
        videos: true // Trae la lista de InstructionVideo asociados
      }
    });

    if (!machine) {
      return res.status(404).json({ message: 'Máquina no encontrada' });
    }

    return res.json(machine);
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener la máquina' });
  }
};