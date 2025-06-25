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
exports.signin = exports.signup = void 0;
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const JWT_SECRET = 'Ronak'; // Use environment variable in production
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, latitude, longitude } = req.body;
    console.log(req.body);
    try {
        // Check if user already exists
        const existingUser = yield prisma.driver.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }
        // Create new driver
        const newDriver = yield prisma.driver.create({
            data: {
                name,
                email,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
            },
        });
        // Generate JWT
        const token = jsonwebtoken_1.default.sign({ userid: newDriver.id, name: name }, JWT_SECRET);
        res.status(201).json({ message: 'Signup successful', token });
    }
    catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Signup failed' });
    }
});
exports.signup = signup;
// ------------------- SIGNIN -------------------
const signin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        const user = yield prisma.driver.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // If email found, issue token (no password in your schema)
        const token = jsonwebtoken_1.default.sign({ userid: user.id, name: user.name }, JWT_SECRET);
        res.json({ message: 'Signin successful', token });
    }
    catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({ error: 'Signin failed' });
    }
});
exports.signin = signin;
