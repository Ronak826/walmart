import { Server, Socket } from "socket.io";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const socketHandler = (io: Server, socket: Socket) => {

  socket.on("send-help-request", async ({ helpRequestId}) => {
    try {
      console.log(helpRequestId);
      // Find requester details from DB
      const helpRequest = await prisma.helpRequest.findUnique({
        where: { id: parseInt(helpRequestId) },
        include: {
          requester: true, 
        },
      });
    //  console.log(helpRequest)
      if (!helpRequest) {
        return socket.emit("error", { message: "Help request not found" });
      }

      // Broadcast to all OTHER clients
      socket.broadcast.emit("receive-help-request", {
        helpRequestId: (helpRequest.id),
        requesterId: helpRequest.requester.id,
        requesterName: helpRequest.requester.name,
        requesterEmail: helpRequest.requester.email,
        issue: helpRequest.issue,
        description:helpRequest.description,
        location: {
          latitude: helpRequest.latitude,
          longitude: helpRequest.longitude,
        },
        createdAt: helpRequest.createdAt,
      });

      console.log("Help request broadcasted successfully");
    } catch (err) {
      console.error("Error in send-help-request:", err);
      socket.emit("error", { message: "Server error while broadcasting help request" });
    }
  });
  
  socket.on("accept-help", async ({ helpRequestId, helperId }) => {
  try {
    const helpRequest = await prisma.helpRequest.findUnique({
      where: { id: helpRequestId },
      include: {
        helper: true,
        requester: true,
      },
    });
    console.log("hii")
    console.log(helperId)
    console.log(helpRequest)
    if (!helpRequest) return;

    // Broadcast to all clients
    socket.broadcast.emit("help-accepted", {
      helpRequestId: helpRequest.id,
      helperId: helperId,
      helperName: helpRequest.helper?.name,
      requesterId: helpRequest.requester.id,
      requesterName: helpRequest.requester.name,
      issue: helpRequest.issue,
      description:helpRequest.description,
      location: {
        latitude: helpRequest.helper?.latitude,
        longitude: helpRequest.helper?.longitude,
      },
      updatedAt: helpRequest.updatedAt,
    });

    console.log("🟢 Help accepted and broadcasted");
  } catch (err) {
    console.error("❌ Socket error on accept-help:", err);
    socket.emit("error", { message: "Broadcast failed after accept" });
  }
});

socket.on("help-resolved", async ({ helpRequestId }) => {
  try {
    const helpRequest = await prisma.helpRequest.findUnique({
      where: { id: helpRequestId },
      include: {
        helper: true,
        requester: true,
      },
    });

    if (!helpRequest) {
      return socket.emit("error", { message: "Help request not found" });
    }

    // Broadcast to all other clients (excluding sender)
    socket.broadcast.emit("help-resolved", {
      helpRequestId: helpRequest.id,
      requesterId: helpRequest.requester.id,
      helperId: helpRequest.helper?.id,
      issue: helpRequest.issue,
      resolvedAt: new Date()
    });

    console.log("✅ Help request resolved broadcasted");

  } catch (err) {
    console.error("❌ Error in help-resolved:", err);
    socket.emit("error", { message: "Failed to broadcast help resolved" });
  }
});

};
