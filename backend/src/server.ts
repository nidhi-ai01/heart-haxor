import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

import characterRoutes from './routes/characterRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import authRoutes from './routes/authRoutes.js';
import chatbotSettingsRoutes from './routes/chatbotSettingsRoutes.js';
import { registerChatHandlers } from './socket/chatHandler.js';
import { registerVoiceHandlers } from './socket/voiceHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'https://hearthaxor.com',
  'https://www.hearthaxor.com',
  'https://heart-haxor-git-main-nidhis-projects-cdd74adb.vercel.app',
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());

app.use('/api/characters', characterRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/chatbot-settings', chatbotSettingsRoutes);

app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

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

const preferredPort = Number(process.env.PORT) || 10000;
const maxAttempts = 20;
let listenPort = preferredPort;
let attempts = 0;

function startListen() {
  attempts += 1;
  if (attempts > maxAttempts) {
    console.error(
      `[startup] Could not bind after ${maxAttempts} tries (from port ${preferredPort}). Free a port or set PORT in .env.`
    );
    process.exit(1);
  }

  const onError = (err: NodeJS.ErrnoException) => {
    server.removeListener('error', onError);
    if (err.code === 'EADDRINUSE') {
      console.warn(`[startup] Port ${listenPort} is already in use, trying ${listenPort + 1}...`);
      listenPort += 1;
      startListen();
    } else {
      console.error('[startup] Server error:', err);
      process.exit(1);
    }
  };

  server.once('error', onError);

  server.listen(listenPort, () => {
    server.removeListener('error', onError);
    console.log(`Heart Haxor Backend running on port ${listenPort}`);
    if (listenPort !== preferredPort) {
      console.warn(
        `[startup] Configured PORT was ${preferredPort}; using ${listenPort} instead. Update NEXT_PUBLIC_API_URL on the frontend if needed.`
      );
    }
  });
}

startListen();
