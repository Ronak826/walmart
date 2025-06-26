import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Create a new help request
export const CreateHelp = async (req: any, res: any) => {
  const { requesterId, issue, latitude, longitude,description} = req.body;
  console.log(req.body)
  try {
    const helpRequest = await prisma.helpRequest.create({
      data: {
        requesterId,
        issue,
        latitude,
        longitude,
        description,
      },
    });

    res.status(201).json({ message: "Help request created", helpRequest });
    
  } catch (error) {
    console.error("CreateHelp error:", error);
    res.status(500).json({ error: "Failed to create help request" });
  }
};

// Get all pending help requests
export const GetAllPendingHelps = async (req: any, res: any) => {
  try {
    const requests = await prisma.helpRequest.findMany({
      where: { status: "PENDING" },
      include: {
        requester: true,
        helper: true,
      },
    });

    res.status(200).json({ requests });
  } catch (error) {
    console.error("GetAllPendingHelps error:", error);
    res.status(500).json({ error: "Failed to fetch help requests" });
  }
};

// Accept a help request
export const AcceptHelpRequest = async (req: any, res: any) => {
  const helpRequestId = parseInt(req.params.id);
  const { helperId } = (req.body);
  console.log(helpRequestId)
  console.log(helperId)
  try {
    const updated = await prisma.helpRequest.update({
      where: { id: helpRequestId },
      data: {
        status: "ACCEPTED",
        helperId,
      },
      select:{
        helper:true,
        requester:true
      }
      
    });

    res.json({ message: "Help request accepted", updated });
  } catch (error) {
    console.error("AcceptHelpRequest error:", error);
    res.status(500).json({ error: "Failed to accept help request" });
  }
};

// Resolve a help request

export const ResolveHelpRequest = async (req: any, res: any) => {
  const helpRequestId = parseInt(req.params.id);

  try {
    const updated = await prisma.helpRequest.update({
      where: { id: helpRequestId },
      data: {
        status: "RESOLVED",
      },
    });

    res.json({ message: "Help request resolved", updated });
  } catch (error) {
    console.error("ResolveHelpRequest error:", error);
    res.status(500).json({ error: "Failed to resolve help request" });
  }
};
