import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. NUEVA FUNCIÓN: Obtener TODAS las máquinas para el catálogo del usuario
export const getAllMachines = async (req: Request, res: Response) => {
  try {
    const machines = await prisma.machine.findMany({
      include: {
        videos: true
      }
    });
    return res.json(machines);
  } catch (error) {
    console.error('Error al obtener máquinas:', error);
    return res.status(500).json({ error: 'Error al obtener la lista de máquinas' });
  }
};

// Obtener máquina con sus InstructionVideo asociados por ID
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
    const { id, name, qrCode, youtubeUrl, videoTitle, group } = req.body;

    if (!id || !name || !youtubeUrl) {
      return res.status(400).json({ message: 'Los campos ID, Nombre y URL de YouTube son obligatorios.' });
    }

    const newMachine = await prisma.machine.create({
      data: {
        id,
        name,
        group: group || 'General', // <-- Persiste el grupo muscular seleccionado
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
    return res.status(500).json({ error: 'Error interno al crear máquina' });
  }
};