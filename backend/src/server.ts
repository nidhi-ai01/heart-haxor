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


const allowedProductionDomains = [
  'https://hearthaxor.com',
  'https://www.hearthaxor.com'
];


const isOriginAllowed = (origin: string | undefined): boolean => {
  if (!origin) return true;

 
  // This prevents spoofing like "http://localhost.malicious.com"
  const localhostRegex = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
  if (localhostRegex.test(origin)) return true;

  if (allowedProductionDomains.includes(origin)) return true;


  if (origin.endsWith('.vercel.app')) return true;

  // If nothing matches, block it
  return false;
};

//  Define Express CORS options
const corsOptions = {
  origin: (origin: string | undefined, callback: Function) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS Error: Origin ${origin} not allowed`));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

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
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS Error: Origin ${origin} not allowed`));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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

const PORT = Number(process.env.PORT) || 5000;

server.listen(PORT, () => {
  console.log(`Heart Haxor Backend running on port ${PORT}`);
});