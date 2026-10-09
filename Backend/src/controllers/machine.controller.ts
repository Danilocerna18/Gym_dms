import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Obtener máquina con sus InstructionVideo asociados
export const getMachineById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const machine = await prisma.machine.findUnique({
      where: { id },
      include: {
        videos: true
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

// Crear máquina e insertar la URL del video de YouTube en una sola transacción
export const createMachine = async (req: Request, res: Response) => {
  try {
    const { id, name, qrCode, youtubeUrl, videoTitle } = req.body;

    if (!id || !name || !youtubeUrl) {
      return res.status(400).json({ message: 'Los campos ID, Nombre y URL de YouTube son obligatorios.' });
    }

    const newMachine = await prisma.machine.create({
      data: {
        id,
        name,
        qrCode: qrCode || id,
        videos: {
          create: [
            {
              youtubeUrl,
              title: videoTitle || `Tutorial de ${name}`
            }
          ]
        }
      },
      include: {
        videos: true
      }
    });

    return res.status(201).json({
      message: 'Máquina y video guardados con éxito',
      machine: newMachine
    });
  } catch (error: any) {
    console.error('Error al crear máquina:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Ya existe una máquina registrada con este ID o Código QR.' });
    }
    return res.status(500).json({ error: 'Error interno del servidor al crear la máquina.' });
  }
};