"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketHandler = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const socketHandler = (io, socket) => {
    socket.on("send-help-request", (_a) => __awaiter(void 0, [_a], void 0, function* ({ helpRequestId }) {
        try {
            console.log(helpRequestId);
            // Find requester details from DB
            const helpRequest = yield prisma.helpRequest.findUnique({
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
                location: {
                    latitude: helpRequest.latitude,
                    longitude: helpRequest.longitude,
                },
                createdAt: helpRequest.createdAt,
            });
            console.log("Help request broadcasted successfully");
        }
        catch (err) {
            console.error("Error in send-help-request:", err);
            socket.emit("error", { message: "Server error while broadcasting help request" });
        }
    }));
    socket.on("accept-help", (_a) => __awaiter(void 0, [_a], void 0, function* ({ helpRequestId, helperId }) {
        var _b, _c, _d;
        try {
            const helpRequest = yield prisma.helpRequest.findUnique({
                where: { id: helpRequestId },
                include: {
                    helper: true,
                    requester: true,
                },
            });
            console.log("hii");
            console.log(helperId);
            console.log(helpRequest);
            if (!helpRequest)
                return;
            // Broadcast to all clients
            socket.broadcast.emit("help-accepted", {
                helpRequestId: helpRequest.id,
                helperId: helperId,
                helperName: (_b = helpRequest.helper) === null || _b === void 0 ? void 0 : _b.name,
                requesterId: helpRequest.requester.id,
                requesterName: helpRequest.requester.name,
                issue: helpRequest.issue,
                location: {
                    latitude: (_c = helpRequest.helper) === null || _c === void 0 ? void 0 : _c.latitude,
                    longitude: (_d = helpRequest.helper) === null || _d === void 0 ? void 0 : _d.longitude,
                },
                updatedAt: helpRequest.updatedAt,
            });
            console.log("🟢 Help accepted and broadcasted");
        }
        catch (err) {
            console.error("❌ Socket error on accept-help:", err);
            socket.emit("error", { message: "Broadcast failed after accept" });
        }
    }));
    socket.on("help-resolved", (_a) => __awaiter(void 0, [_a], void 0, function* ({ helpRequestId }) {
        var _b;
        try {
            const helpRequest = yield prisma.helpRequest.findUnique({
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
                helperId: (_b = helpRequest.helper) === null || _b === void 0 ? void 0 : _b.id,
                issue: helpRequest.issue,
                resolvedAt: new Date()
            });
            console.log("✅ Help request resolved broadcasted");
        }
        catch (err) {
            console.error("❌ Error in help-resolved:", err);
            socket.emit("error", { message: "Failed to broadcast help resolved" });
        }
    }));
};
exports.socketHandler = socketHandler;
