-- Add customPersonality column to UserChatbotSettings table
-- This stores per-user, per-character personality descriptions for LLM system prompts
ALTER TABLE "UserChatbotSettings"
ADD COLUMN IF NOT EXISTS "customPersonality" TEXT DEFAULT NULL;
