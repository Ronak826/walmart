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
exports.update = exports.GetHelpCount = exports.GetDrivers = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const GetDrivers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const drivers = yield prisma.driver.findMany({
            include: {
                requests: true,
                helps: true,
            },
        });
        res.status(200).json({ drivers });
    }
    catch (error) {
        console.error('Error fetching drivers:', error);
        res.status(500).json({ error: 'Failed to fetch drivers' });
    }
});
exports.GetDrivers = GetDrivers;
const GetHelpCount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("hiii");
    const id = parseInt(req.params.id);
    const driver = yield prisma.driver.findFirst({
        where: { id: id },
    });
    res.json({
        driver
    });
});
exports.GetHelpCount = GetHelpCount;
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    const updated = yield prisma.driver.update({
        where: { id },
        data: {
            helpsCount: {
                increment: 1
            }
        }
    });
    res.json({
        updated
    });
});
exports.update = update;
