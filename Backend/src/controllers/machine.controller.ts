import { Request, Response, NextFunction } from 'express';
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
    const { id, name, qrCode, youtubeUrl, videoTitle, group, instructions } = req.body;

    if (!name || !youtubeUrl) {
      return res.status(400).json({ message: 'Los campos Nombre y URL de YouTube son obligatorios.' });
    }

    const machineId = id || `MAC-${Math.floor(100 + Math.random() * 900)}`;

    const newMachine = await prisma.machine.create({
      data: {
        id: machineId,
        name,
        group: group || 'General',
        qrCode: qrCode || machineId,
        instructions: instructions ? instructions.trim() : null,
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
    console.error('Error detallado al crear máquina:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'El ID o código QR de la máquina ya existe en la base de datos.' });
    }

    return res.status(500).json({ error: 'Error interno al crear máquina' });
  }
};

export const deleteMachine = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // 1. Eliminar primero los videos de instrucción asociados para evitar fallos de llaves foráneas
    await prisma.instructionVideo.deleteMany({
      where: { machineId: id }
    });

    // 2. Eliminar la máquina de Prisma
    await prisma.machine.delete({
      where: { id }
    });

    return res.json({ message: "Máquina eliminada correctamente" });
  } catch (err) {
    next(err);
  }
};