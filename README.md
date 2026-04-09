<<<<<<< HEAD
# Heart Haxor AI - AI Companion Platform

Heart Haxor is a full-stack AI companion platform that enables users to chat with customizable AI characters. Each character has its own personality, backstory, and communication style powered by large language models. The platform supports text chat, voice messages, and an immersive visual experience.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Directory Structure](#directory-structure)
5. [Features](#features)
6. [Installation](#installation)
7. [Configuration](#configuration)
8. [Running the Application](#running-the-application)
9. [API Reference](#api-reference)
10. [Database Schema](#database-schema)
11. [Character System](#character-system)
12. [Voice Pipeline](#voice-pipeline)
13. [Contributing](#contributing)

---

## Overview

Heart Haxor provides an immersive chat experience where users can interact with AI-powered characters. Each character is designed with:

- A unique personality and communication style
- A detailed backstory that influences their responses
- Visual representation through high-quality images
- Categorized intimacy levels and themes

The platform uses real-time communication via WebSockets for instant message delivery and supports voice input through speech-to-text integration.

---

## Architecture

The application follows a three-tier architecture:

```
[Frontend (Next.js)]  <-->  [Backend (Express + Socket.io)]  <-->  [Database (SQLite/Prisma)]
                                      |
                                      v
                            [External Services]
                            - Groq LLM API (Chat)
                            - Groq Whisper API (STT)
                            - Voice Service (Python/FastAPI)
```

### Data Flow

1. User sends a message (text or voice) from the React frontend
2. Message is transmitted via Socket.io to the Express backend
3. Backend retrieves character context and chat history from the database
4. A system prompt is constructed and sent to the Groq LLM API
5. The AI response is saved to the database and emitted back to the client
6. For voice messages, audio is transcribed via Groq Whisper before processing

---

## Technology Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| Next.js 16 | React framework with App Router |
| TypeScript | Type-safe JavaScript |
| Tailwind CSS | Utility-first CSS framework |
| Socket.io Client | Real-time WebSocket communication |
| Lucide React | Icon library |

### Backend

| Technology | Purpose |
|------------|---------|
| Node.js | JavaScript runtime |
| Express.js | HTTP server framework |
| Socket.io | Real-time bidirectional communication |
| Prisma | ORM for database access |
| SQLite | Embedded relational database |
| Groq SDK | LLM and Whisper API client |
| TypeScript | Type-safe JavaScript |

### Voice Service (Optional)

| Technology | Purpose |
|------------|---------|
| Python 3.10+ | Runtime |
| FastAPI | Async HTTP framework |
| OpenAI Whisper | Local speech-to-text (optional) |
| Coqui TTS | Text-to-speech synthesis (optional) |

### External APIs

| Service | Purpose |
|---------|---------|
| Groq API | LLM inference (Llama 3.3 70B) |
| Groq Whisper | Cloud-based speech-to-text |

---

## Directory Structure

```
PookieAI/
├── backend/                    # Express.js server
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── dev.db              # SQLite database file
│   ├── src/
│   │   ├── controllers/        # HTTP route handlers
│   │   ├── lib/                # Shared utilities (Prisma client)
│   │   ├── middleware/         # Express middleware
│   │   ├── routes/             # API route definitions
│   │   ├── scripts/            # Database seeding and utilities
│   │   ├── services/           # Business logic layer
│   │   │   ├── chatService.ts  # Chat and message management
│   │   │   ├── characterService.ts # Character CRUD
│   │   │   ├── llmService.ts   # Groq LLM integration
│   │   │   └── voiceService.ts # Speech-to-text integration
│   │   ├── socket/             # Socket.io event handlers
│   │   │   ├── chatHandler.ts  # Text chat events
│   │   │   └── voiceHandler.ts # Voice message events
│   │   ├── utils/              # Helper functions
│   │   │   └── prompt.ts       # System prompt builder
│   │   └── server.ts           # Application entry point
│   ├── .env                    # Environment variables
│   └── package.json
│
├── frontend/                   # Next.js application
│   ├── app/
│   │   ├── chat/[id]/page.tsx  # Dynamic chat page
│   │   ├── page.tsx            # Home page (character grid)
│   │   ├── layout.tsx          # Root layout with sidebar
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx     # Navigation sidebar
│   │   │   └── MainContent.tsx # Main content wrapper
│   │   └── ui/
│   │       └── Logo.tsx        # SVG logo component
│   ├── contexts/
│   │   └── SidebarContext.tsx  # Sidebar state management
│   ├── lib/
│   │   ├── socket.ts           # Socket.io client instance
│   │   └── utils.ts            # Utility functions
│   ├── public/
│   │   └── characters/         # Character image assets
│   └── package.json
│
├── voice-service/              # Python voice processing (optional)
│   ├── main.py                 # FastAPI application
│   ├── requirements.txt        # Python dependencies
│   └── Dockerfile
│
└── README.md
```

---

## Features

### Core Features

- **AI Chat**: Real-time conversations with AI characters powered by Llama 3.3 70B via Groq
- **Character System**: 12 pre-built characters with unique personalities across Fantasy, Sci-Fi, Anime, and Realistic categories
- **Voice Messages**: Record voice messages that are transcribed and processed as text
- **Chat History**: Persistent conversation storage with automatic context loading
- **Responsive Design**: Mobile-friendly interface with collapsible sidebar

### UI Features

- **Immersive Chat Interface**: Full-screen character background with glassmorphism effects
- **Character Info Panel**: Slide-out panel showing character details, backstory, and metadata
- **Call Modal**: Visual call interface (UI demonstration)
- **Dynamic Theming**: Neon pink/violet gradient accents

### Technical Features

- **Real-time Communication**: Socket.io for instant message delivery
- **Optimistic UI Updates**: Messages appear immediately before server confirmation
- **System Prompt Engineering**: Characters maintain consistent personalities through structured prompts
- **Database Migrations**: Prisma manages schema evolution

---

## Installation

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Python 3.10+ (optional, for local voice service)
- Git



### Install Backend Dependencies

```bash
cd backend
npm install
```

### Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### Install Voice Service Dependencies (Optional)

```bash
cd ../voice-service
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
```

---

## Configuration

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
DATABASE_URL="file:./dev.db"
GROQ_API_KEY="your_groq_api_key_here"
VOICE_SERVICE_URL="http://localhost:8000"
PORT=3001
```

| Variable | Description |
|----------|-------------|
| DATABASE_URL | SQLite database file path |
| GROQ_API_KEY | API key from console.groq.com |
| VOICE_SERVICE_URL | URL of the Python voice service |
| PORT | Backend server port |

### Database Setup

```bash
cd backend
npx prisma db push
npx prisma generate
```

### Seed the Database

```bash
npx tsx src/scripts/seed.ts
```

This creates 12 system characters with images and metadata.

---

## Running the Application

### Development Mode

Open three terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - Voice Service (Optional):**
```bash
cd voice-service
venv\Scripts\uvicorn main:app --port 8000
```

### Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Voice Service: http://localhost:8000

---

## API Reference

### REST Endpoints

#### Characters

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/characters | List all characters |
| GET | /api/characters/:id | Get character by ID |
| POST | /api/characters | Create new character |

#### Chats

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/chats/user/:userId | Get user's chat list |
| GET | /api/chats/:chatId/history | Get chat message history |

#### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Service health check |

### Socket.io Events

#### Client to Server

| Event | Payload | Description |
|-------|---------|-------------|
| join_chat | { userId, characterId } | Join/create a chat room |
| send_message | { userId, characterId, content } | Send text message |
| send_audio | { userId, characterId, audioData } | Send voice message |

#### Server to Client

| Event | Payload | Description |
|-------|---------|-------------|
| chat_history | Message[] | Previous messages on join |
| receive_message | Message | New message from AI |
| typing | { characterId } | AI is generating response |
| transcription | { text, role } | Voice message transcribed |
| receive_audio | { audio, text } | TTS audio response |
| error | string | Error message |

---

## Database Schema

### Models

#### User
```prisma
model User {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())
  chats     Chat[]
}
```

#### Character
```prisma
model Character {
  id            String   @id @default(uuid())
  name          String
  role          String
  description   String
  backstory     String
  imageUrl      String
  intimacyLevel String   @default("normal")
  isSystem      Boolean  @default(false)
  createdAt     DateTime @default(now())
  chats         Chat[]
}
```

#### Chat
```prisma
model Chat {
  id          String    @id @default(uuid())
  userId      String
  characterId String
  user        User      @relation(...)
  character   Character @relation(...)
  messages    Message[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

#### Message
```prisma
model Message {
  id        String   @id @default(uuid())
  chatId    String
  role      String   // "user" or "assistant"
  content   String
  createdAt DateTime @default(now())
  chat      Chat     @relation(...)
}
```

---

## Character System

### Personality Definition

Each character is defined by:

1. **Name**: Display name
2. **Role**: Short title (e.g., "Goth Streamer", "Mystic Guide")
3. **Description**: Personality traits with bracketed tags (e.g., "[Fantasy] [Mystical]")
4. **Backstory**: Multi-sentence background story
5. **Intimacy Level**: Interaction style ("normal", "flirty", "romantic", "mystical")

### System Prompt Structure

The AI receives a structured prompt that includes:

```
You are [Name], a [Role].

=== CHARACTER PROFILE ===
Name: [Name]
Role: [Role]
Personality & Vibe: [Description]
Backstory: [Backstory]
Relationship Status/Mood: [Intimacy Level]

=== INSTRUCTIONS ===
1. Stay in character. Never admit to being an AI.
2. Match your tone to your description tags.
3. Keep responses concise (1-3 sentences).
4. Use actions (*looks away*, *smiles*) for body language.
5. Context: You are chatting on the platform.
```

### Pre-built Characters

| Name | Role | Category |
|------|------|----------|
| Luna | Mystic Guide | Fantasy |
| Kael | Cyberpunk Runner | Sci-Fi |
| Aria | Girl Next Door | Realistic |
| Hinata | Shy Ninja | Anime |
| Yor | Deadly Assassin | Anime |
| Elena | Travel Vlogger | Realistic |
| Nova | Rogue AI | Sci-Fi |
| Mikasa | Elite Scout | Anime |
| Seraphina | Elven High Druid | Fantasy |
| Jade | Goth Streamer | Realistic |
| Ava | Tech CEO | Realistic |
| Kora | Stormbringer | Superhero |

---

## Voice Pipeline

### Speech-to-Text Flow

1. User holds microphone button in chat interface
2. Browser's MediaRecorder captures audio in webm format
3. Audio ArrayBuffer is sent via Socket.io to backend
4. Backend writes buffer to temp file and sends to Groq Whisper API
5. Transcribed text is processed as a regular chat message
6. Transcription is echoed back to user for confirmation

### Text-to-Speech (Planned)

The TTS functionality is stubbed for future implementation. Options include:

- ElevenLabs API
- OpenAI TTS
- Coqui TTS (local)

---

## Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make changes and test locally
4. Submit a pull request

### Code Style

- TypeScript strict mode enabled
- ESLint configuration inherited from Next.js
- Prisma schema formatting via `npx prisma format`

### Adding New Characters

1. Add character data to `backend/src/scripts/seed.ts`
2. Place character image in `frontend/public/characters/`
3. Run `npx tsx src/scripts/seed.ts` (clears and reseeds)

---

## License

This project is for educational and demonstration purposes.

---

## Acknowledgments

- Groq for fast LLM inference
- OpenAI Whisper for speech recognition
- Next.js and Tailwind CSS for frontend framework
- Prisma for database management
=======
# Heart-Haxor
HeartHaxor is a full-stack AI companion chatbot system that enables users to chat with AI characters having unique personalities, persistent conversations, and role-based interactions using modern LLM technology.
>>>>>>> e9b5821f49d5757429f169a5b7e9544014bac04b
#   H e a r t - H a x o r 
 
 #   H e a r t - H a x o r 
 
 