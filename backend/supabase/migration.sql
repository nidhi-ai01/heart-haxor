-- ============================================================
-- Heart Haxor: Supabase SQL Migration
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable uuid-ossp extension for uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS "User" (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  password    TEXT,
  role        TEXT NOT NULL DEFAULT 'user',
  dob         TIMESTAMPTZ,
  "isAdult"   BOOLEAN NOT NULL DEFAULT false,
  "googleId"  TEXT UNIQUE,
  "isVerified" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_email ON "User" (email);

-- ============================================================
-- 2. CHARACTERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS "Character" (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  role            TEXT NOT NULL,
  personality     TEXT NOT NULL,
  description     TEXT NOT NULL,
  backstory       TEXT NOT NULL,
  "imageUrl"      TEXT NOT NULL,
  "intimacyLevel" TEXT NOT NULL DEFAULT 'normal',
  "isSystem"      BOOLEAN NOT NULL DEFAULT false,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. CHATS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS "Chat" (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId"      UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "characterId" UUID NOT NULL REFERENCES "Character"(id) ON DELETE CASCADE,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 4. MESSAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS "Message" (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "chatId"    UUID NOT NULL REFERENCES "Chat"(id) ON DELETE CASCADE,
  role        TEXT NOT NULL,
  content     TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 5. MEMORIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS "Memory" (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "chatId"    UUID NOT NULL REFERENCES "Chat"(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  importance  INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 6. USER CHATBOT SETTINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS "UserChatbotSettings" (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId"        UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "characterId"   UUID NOT NULL REFERENCES "Character"(id) ON DELETE CASCADE,
  "customName"    TEXT,
  "customImageUrl" TEXT,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE("userId", "characterId")
);

CREATE INDEX IF NOT EXISTS idx_ucs_user ON "UserChatbotSettings" ("userId");
CREATE INDEX IF NOT EXISTS idx_ucs_character ON "UserChatbotSettings" ("characterId");

-- ============================================================
-- Auto-update "updatedAt" trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updatedAt
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_user_updated_at') THEN
    CREATE TRIGGER set_user_updated_at
      BEFORE UPDATE ON "User"
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_chat_updated_at') THEN
    CREATE TRIGGER set_chat_updated_at
      BEFORE UPDATE ON "Chat"
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_ucs_updated_at') THEN
    CREATE TRIGGER set_ucs_updated_at
      BEFORE UPDATE ON "UserChatbotSettings"
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END;
$$;
