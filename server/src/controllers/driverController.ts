import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const GetDrivers = async (req: any, res: any) => {
  try {
    const drivers = await prisma.driver.findMany({
      include: {
        requests: true,
        helps: true,
      },
    });

    res.status(200).json({ drivers });
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({ error: 'Failed to fetch drivers' });
  }
};
