import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. Obtener TODAS las máquinas (mapeando youtubeUrl en la raíz)
export const getAllMachines = async (req: Request, res: Response) => {
  try {
    const machines = await prisma.machine.findMany({
      include: {
        videos: true
      }
    });

    const formattedMachines = machines.map(m => ({
      ...m,
      youtubeUrl: m.videos?.[0]?.youtubeUrl || (m as any).youtubeUrl || null
    }));

    return res.json(formattedMachines);
  } catch (error) {
    console.error('Error al obtener máquinas:', error);
    return res.status(500).json({ error: 'Error al obtener la lista de máquinas' });
  }
};

// 2. Obtener máquina por ID/QR
export const getMachineById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const machine = await prisma.machine.findFirst({
      where: {
        OR: [
          { id: id },
          { qrCode: id }
        ]
      },
      include: {
        videos: true
      }
    });

    if (!machine) {
      return res.status(404).json({ message: 'Máquina no encontrada' });
    }

    const youtubeUrl = machine.videos?.[0]?.youtubeUrl || (machine as any).youtubeUrl || null;

    return res.json({
      ...machine,
      youtubeUrl
    });
  } catch (error) {
    console.error('Error al obtener máquina:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// 3. Crear máquina
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
        group: group || 'General',
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
      machine: {
        ...newMachine,
        youtubeUrl
      }
    });
  } catch (error: any) {
    console.error('Error al crear máquina:', error);
    return res.status(500).json({ error: 'Error interno al crear máquina' });
  }
};