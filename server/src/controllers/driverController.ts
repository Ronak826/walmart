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

export const GetHelpCount=async(req:any,res:any)=>{
  console.log("hiii")
  const id=parseInt(req.params.id);

  const driver=await prisma.driver.findFirst({
    where:{id:id},
  })

  res.json({
    driver
  })
}

export const update=async(req:any,res:any)=>{
  const id=parseInt(req.params.id);

  const updated=await prisma.driver.update({
    where:{id},
    data:{
      helpsCount:{
        increment:1
      }
    }
  })
  res.json({
    updated
  })
}