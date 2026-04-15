/**
 * Database row types — replaces `@prisma/client` generated types.
 * These mirror the Supabase table schemas exactly.
 */

export interface User {
  id: string;
  name: string;
  email: string;
  password: string | null;
  role: string;
  dob: string | null;         // ISO timestamp string from Supabase
  isAdult: boolean;
  googleId: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Character {
  id: string;
  name: string;
  role: string;
  personality: string;
  description: string;
  backstory: string;
  imageUrl: string;
  intimacyLevel: string;
  isSystem: boolean;
  createdAt: string;
}

export interface Chat {
  id: string;
  userId: string;
  characterId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  role: string;
  content: string;
  createdAt: string;
}

export interface Memory {
  id: string;
  chatId: string;
  content: string;
  importance: number;
}

export interface UserChatbotSettings {
  id: string;
  userId: string;
  characterId: string;
  customName: string | null;
  customImageUrl: string | null;
  customPersonality: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Insert types (omit auto-generated fields) ──

export type CharacterInsert = Omit<Character, 'id' | 'createdAt'> & {
  id?: string;
  createdAt?: string;
};

export type CharacterUpdate = Partial<Omit<Character, 'id' | 'createdAt'>>;
