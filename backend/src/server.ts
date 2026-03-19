import express, { Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

// Route Imports
import characterRoutes from './routes/characterRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import authRoutes from './routes/authRoutes.js';
import chatbotSettingsRoutes from './routes/chatbotSettingsRoutes.js';
import { registerChatHandlers } from './socket/chatHandler.js';
import { registerVoiceHandlers } from './socket/voiceHandler.js';

dotenv.config();

const app = express();

// --- START OF UPDATED CORS BLOCK ---
const allowedOrigins = [
  "http://localhost:3000",
  "https://hearthaxor.com",
  "https://www.hearthaxor.com",
  "https://heart-haxor-git-main-nidhis-projects-cdd74adb.vercel.app"
];


app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
// --- END OF UPDATED CORS BLOCK ---

app.use(express.json());

// Routes
app.use('/api/characters', characterRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/chatbot-settings', chatbotSettingsRoutes);

// Serve uploads
app.use('/uploads', express.static('uploads'));

const server = http.createServer(app);

// --- START OF UPDATED SOCKET BLOCK ---
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});
// --- END OF UPDATED SOCKET BLOCK ---

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  registerChatHandlers(io, socket);
  registerVoiceHandlers(io, socket);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'Heart Haxor Backend' });
});

const PORT = process.env.PORT || 10000;

server.listen(PORT, () => {
  console.log(`Heart Haxor Backend running on port ${PORT}`);
});