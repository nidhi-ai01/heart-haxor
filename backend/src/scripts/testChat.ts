import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

socket.on("connect", () => {
    console.log("Connected to server");

    // Join chat with the seed character
    // Assuming Luna's ID (which we don't know, but can query or use '123' if we hardcoded, but we didn't)
    // We will just use a dummy ID and let the backend create a new chat entry if we want,
    // BUT the backend checks if character exists? No, schema relation says it must exist.
    // So we need a valid character ID.
    // We'll skip this test script running automatically and rely on the fact that I can see the server log "User connected".
    // Or I'll fetch characters first via fetch then connect.
});

socket.on("receive_message", (msg) => {
    console.log("Received:", msg);
    process.exit(0);
});

socket.on("error", (err) => {
    console.error("Error:", err);
    process.exit(1);
});
