import http from 'http';
import express from "express"
import authRoute from "./routes/authRoute"
import driverRoute from "./routes/driverRoute"
import HelpRoute from "./routes/helpRoute"
import { Server, Socket } from 'socket.io';
import { socketHandler } from './socketHandler/socketHandler';
import cors from "cors"
const app=express();
app.use(cors())
app.use(express.json())

app.use("/api/auth",authRoute);
app.use("/api/drivers",driverRoute);
app.use("/api/request",HelpRoute)

app.get("/",(req,res)=>{
    res.send("Hi I am Ronak")
})

const server=http.createServer(app)

const io = new Server(server, {
  cors: { 
    origin: ['http://localhost:5173','https://walmart-five.vercel.app/'], // ✅ exact Vite dev server origin
    methods: ['GET', 'POST'],
    credentials: true
  },
  
});



io.on('connection', (socket:Socket) => {
  console.log('Socket connected:', socket.id);
  socketHandler(io,socket); 
});


server.listen(3000,()=>{
    console.log("server is running on port 3000")
});