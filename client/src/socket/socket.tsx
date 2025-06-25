import { io } from "socket.io-client";

const socket = io("https://walmart-xjjd.onrender.com", {
  withCredentials: true,
  transports: ['websocket'], // Optional but helps on Render
});

export default socket;
