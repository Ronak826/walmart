"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const authRoute_1 = __importDefault(require("./routes/authRoute"));
const driverRoute_1 = __importDefault(require("./routes/driverRoute"));
const helpRoute_1 = __importDefault(require("./routes/helpRoute"));
const socket_io_1 = require("socket.io");
const socketHandler_1 = require("./socketHandler/socketHandler");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api/auth", authRoute_1.default);
app.use("/api/drivers", driverRoute_1.default);
app.use("/api/request", helpRoute_1.default);
app.get("/", (req, res) => {
    res.send("Hi I am Ronak");
});
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: ['http://localhost:5173', 'https://walmart-five.vercel.app/'], // ✅ exact Vite dev server origin
        methods: ['GET', 'POST'],
        credentials: true
    },
    transports: ['websocket']
});
io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);
    (0, socketHandler_1.socketHandler)(io, socket);
});
server.listen(3000, () => {
    console.log("server is running on port 3000");
});
