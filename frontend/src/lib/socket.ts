import { io } from "socket.io-client";

// Connect to the backend server
const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001", {
    autoConnect: true,
});

export default socket;
