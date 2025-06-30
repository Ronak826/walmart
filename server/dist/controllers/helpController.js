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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResolveHelpRequest = exports.AcceptHelpRequest = exports.GetAllPendingHelps = exports.CreateHelp = void 0;
const client_1 = require("@prisma/client");
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const prisma = new client_1.PrismaClient();
// Create a new help request
const CreateHelp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { requesterId, issue, latitude, longitude, description } = req.body;
    console.log("heloooo");
    console.log(issue);
    console.log(latitude);
    console.log(description);
    const image = yield (0, cloudinary_1.default)((_a = req.file) === null || _a === void 0 ? void 0 : _a.path);
    console.log(image);
    const helpRequest = yield prisma.helpRequest.create({
        data: {
            requesterId: parseInt(requesterId),
            issue,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            description,
            image
        },
    });
    res.status(201).json({ message: "Help request created", helpRequest });
});
exports.CreateHelp = CreateHelp;
// Get all pending help requests
const GetAllPendingHelps = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requests = yield prisma.helpRequest.findMany({
            where: { status: "PENDING" },
            include: {
                requester: true,
                helper: true,
            },
        });
        res.status(200).json({ requests });
    }
    catch (error) {
        console.error("GetAllPendingHelps error:", error);
        res.status(500).json({ error: "Failed to fetch help requests" });
    }
});
exports.GetAllPendingHelps = GetAllPendingHelps;
// Accept a help request
const AcceptHelpRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const helpRequestId = parseInt(req.params.id);
    const { helperId } = (req.body);
    console.log(helpRequestId);
    console.log(helperId);
    try {
        const updated = yield prisma.helpRequest.update({
            where: { id: helpRequestId },
            data: {
                status: "ACCEPTED",
                helperId,
            },
            select: {
                helper: true,
                requester: true
            }
        });
        res.json({ message: "Help request accepted", updated });
    }
    catch (error) {
        console.error("AcceptHelpRequest error:", error);
        res.status(500).json({ error: "Failed to accept help request" });
    }
});
exports.AcceptHelpRequest = AcceptHelpRequest;
// Resolve a help request
const ResolveHelpRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const helpRequestId = parseInt(req.params.id);
    try {
        const updated = yield prisma.helpRequest.update({
            where: { id: helpRequestId },
            data: {
                status: "RESOLVED",
            },
        });
        res.json({ message: "Help request resolved", updated });
    }
    catch (error) {
        console.error("ResolveHelpRequest error:", error);
        res.status(500).json({ error: "Failed to resolve help request" });
    }
});
exports.ResolveHelpRequest = ResolveHelpRequest;
