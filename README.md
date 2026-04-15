<<<<<<< HEAD
# Heart Haxor AI - AI Companion Platform

Heart Haxor is a full-stack AI companion platform that enables users to interact with customizable AI characters. Each character is designed with a distinct personality, backstory, and communication style powered by large language models.

The platform focuses on delivering a refined and immersive conversational experience with real-time communication, personality-driven responses, and a modern interface.

---

## Table of Contents

1. Overview
2. Architecture
3. MVP Architecture Philosophy
4. Technology Stack
5. Directory Structure
6. Features
7. Installation
8. Configuration
9. Running the Application
10. Database
11. Custom Personality System
12. Voice Input
13. UI/UX Enhancements
14. Contributing

---

## Overview

Heart Haxor provides an intelligent conversational environment where users can engage with AI-powered companions. Each interaction is influenced by structured personality design and contextual awareness.

Key capabilities include:

* Real-time AI chat interactions
* Personality-based response generation
* Persistent chat history
* Scalable backend architecture

---

## Architecture

```
Frontend (Next.js)  <-->  Backend (Express + Socket.io)  <-->  Database (Supabase PostgreSQL)
                                     |
                                     v
                           External Services
                           - Groq LLM API
                           - Web Speech API (Planned)
```

---

## MVP Architecture Philosophy

The application follows a feature-based MVP architecture optimized for rapid development and maintainability.

### Principles

* Avoid unnecessary abstraction layers
* Organize code by feature (auth, chat, character)
* Keep UI and business logic close during early development
* Minimize file fragmentation
* Scale structure only when complexity increases

### Benefits

* Faster development cycles
* Easier debugging and maintenance
* Clear and intuitive project structure
* Flexibility for future expansion

---

## Technology Stack

### Frontend

* Next.js
* TypeScript
* Tailwind CSS
* Socket.io Client

### Backend

* Node.js
* Express.js
* Socket.io
* Supabase (Database and Authentication)

### Database

* Supabase (PostgreSQL)

### AI Integration

* Groq API for language model inference

---

## Directory Structure

```
project/
├── backend/
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── chat.ts
│   │   └── character.ts
│   ├── services/
│   │   ├── aiService.ts
│   │   └── dbService.ts
│   ├── config/
│   │   └── supabase.ts
│   └── server.ts
│
├── frontend/
│   ├── features/
│   │   ├── auth/
│   │   ├── chat/
│   │   └── character/
│   ├── components/
│   ├── lib/
│   │   └── supabase.ts
│   └── app/
│
└── README.md
```

---

## Features

### Core Features

* Real-time AI chat powered by Groq
* Character-based conversational system
* Persistent chat sessions
* Authentication using Supabase

### Advanced Features

* Custom personality injection
* Structured prompt engineering
* Real-time communication via WebSockets
* Optimized MVP architecture

---

## Installation

### Prerequisites

* Node.js 18 or higher
* npm or yarn

### Backend Setup

```bash
cd backend
npm install
```

### Frontend Setup

```bash
cd frontend
npm install
```

---

## Configuration

Create a `.env` file in the backend directory:

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
GROQ_API_KEY=your_groq_api_key
PORT=3001
```

---

## Running the Application

### Backend

```bash
npm run dev
```

### Frontend

```bash
npm run dev
```

### Application URLs

* Frontend: http://localhost:3000
* Backend: http://localhost:3001

---

## Database

The application uses Supabase (PostgreSQL) as the primary data store.

### Core Tables

* users
* characters
* chats
* messages
* user_chatbot_settings

### Example Structure

```
user_chatbot_settings
- id
- user_id
- character_id
- custom_personality (TEXT)
```

---

## Custom Personality System

The platform allows users to define custom personality behavior for AI characters.

### Workflow

1. User defines personality description
2. Data is stored in Supabase
3. Backend injects personality into system prompt
4. AI responses adapt dynamically

This enables personalized and context-aware interactions.

---

## Voice Input

The voice input feature is currently under development.

### Planned Behavior

* Capture user speech via browser
* Convert speech to text
* Insert text into chat input
* User manually submits message

### Current Status

* UI integration completed
* Feature temporarily disabled with "Coming Soon" feedback

---

## UI/UX Enhancements

* Static background layout
* Hidden scrollbars for cleaner interface
* Subtle zoom interaction effects
* Fixed chat input positioning
* Improved modal and scroll behavior
* Refined logout flow

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes
4. Submit a pull request

---

## Future Improvements

* Full voice input implementation
* Text-to-speech responses
* Multi-language support
* Advanced personality customization

---

## License

This project is intended for educational and demonstration purposes.
=======
# 💙 Heart Haxor AI — Intelligent Companion Platform

> A full-stack AI companion system that enables emotionally-aware, personality-driven conversations with AI characters.

---

## 🚀 Overview

**Heart Haxor AI** is an immersive AI chat platform where users interact with intelligent companions that have:

* 🧠 Unique personalities & backstories
* 💬 Real-time conversations (WebSockets)
* 🎭 Mood-aware responses (AI + NLP)
* 🎙️ Voice + text interaction support
* 🧑‍🤝‍🧑 Role-based companions (Friend, Mentor, Partner)

---

## 🧠 Key Features

### ✨ Core Features

* 🔹 AI-powered character chat (LLM-based)
* 🔹 Mood detection using NLP (Python + Transformers)
* 🔹 Real-time messaging via Socket.io
* 🔹 Persistent chat history (per user)
* 🔹 Dynamic personality-based responses

---

### 🎭 Smart Interaction

* Indirect mood questioning (human-like)
* Emotion-aware replies (sad, happy, anxious, etc.)
* Adaptive tone (friendly, calm, energetic)

---

### 🎨 UI/UX

* Modern SaaS-style dashboard
* Glassmorphism design
* Smooth animations
* Responsive layout

---

## 🏗️ Architecture

```
Frontend (Next.js)
        ↓
Backend (Node.js + Express + Socket.io)
        ↓
Database (Prisma + SQLite)
        ↓
Python AI Service (FastAPI - Mood Detection)
        ↓
External APIs (Grok LLM)
```

---

## ⚙️ Tech Stack

### 🖥️ Frontend

* Next.js
* TypeScript
* Tailwind CSS
* Socket.io Client

---

### ⚙️ Backend

* Node.js
* Express.js
* Socket.io
* Prisma ORM
* SQLite

---

### 🤖 AI Layer

* Python (FastAPI)
* HuggingFace Transformers
* Emotion Detection Model

---

### 🌐 External APIs

* Grok API (Chat AI)

---

## 📁 Project Structure

```
heart-haxor/
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   └── server.js
│
├── frontend/
│   ├── app/
│   ├── components/
│   └── pages/
│
├── ai-service/
│   └── mood_api.py
│
└── chat-storage/
    └── user-*.json
```

---

## 🔧 Installation

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/heart-haxor.git
cd heart-haxor
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
npm run dev
```

---

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

### 4️⃣ Python AI Service

```bash
cd ai-service
pip install fastapi uvicorn transformers torch
uvicorn mood_api:app --reload --port 8000
```

---

## 🔐 Environment Variables

Create `.env` in backend:

```env
GROK_API_KEY=your_api_key
DATABASE_URL=file:./dev.db
PORT=5000
```

---

## 🧠 Mood Detection Flow

1. User sends message
2. Backend extracts last 5–10 messages
3. Python model detects emotion
4. Mood returned (sad, joy, anger, etc.)
5. AI generates response based on mood

---

## 💬 Example

**User:**

> I feel really tired today

**AI:**

> That sounds exhausting… want to talk about what’s been draining you?

---

## 🚀 Running the App

| Service    | URL                   |
| ---------- | --------------------- |
| Frontend   | http://localhost:3000 |
| Backend    | http://localhost:5000 |
| AI Service | http://localhost:8000 |

---

## 🔥 Highlights

✔ Fully local AI system (no OpenAI needed)
✔ Emotion-aware chatbot
✔ Real-time architecture
✔ Scalable design
✔ Clean UI/UX

---

## 📌 Future Improvements

* 📊 Mood analytics dashboard
* 🧠 Memory system (long-term context)
* 🔊 Text-to-speech (TTS)
* 🎯 Personalization engine

---

## 🤝 Contributing

Contributions are welcome!

```bash
fork → branch → commit → pull request
```

---

## 📄 License

MIT License

---

## ⭐ Final Note

This project demonstrates:

* Full-stack engineering
* AI integration
* Real-time systems
* Human-centered design

---

> Built with ❤️ to create emotionally intelligent AI companions
>>>>>>> 1e38f3ae00b31588d42d468cbae7328590d154b7
