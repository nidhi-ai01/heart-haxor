import express, { Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    'https://heart-haxor-three.vercel.app/', 
    'http://localhost:3000'
  ],
  credentials: true
}));
app.use(express.json());

import characterRoutes from './routes/characterRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import authRoutes from './routes/authRoutes.js';
import chatbotSettingsRoutes from './routes/chatbotSettingsRoutes.js';

app.use('/api/characters', characterRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/chatbot-settings', chatbotSettingsRoutes);

// Serve uploads
app.use('/uploads', express.static('uploads'));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      'https://heart-haxor-three.vercel.app/', 
      'http://localhost:3000'
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});


import { registerChatHandlers } from './socket/chatHandler.js';
import { registerVoiceHandlers } from './socket/voiceHandler.js';

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
