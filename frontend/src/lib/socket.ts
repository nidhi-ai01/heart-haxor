import { io } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://heart-haxor-backend-sa1m.onrender.com"; // Updated fallback

const socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ["websocket"],
  withCredentials: true, // Added this for CORS support
});


export default socket;