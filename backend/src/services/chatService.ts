import crypto from 'crypto';
import supabase from '../lib/supabase.js';
import { getResponse } from './llmService.js';
import { isBirthdayToday } from './authService.js';
import { buildSystemPrompt } from '../utils/prompt.js';
import type { Chat, Character, Message } from '../types/database.js';

const BIRTHDAY_MESSAGE = "Happy Birthday 🎉 I'm really glad you're here today.";

// Helper: generate a UUID (works even if DB DEFAULT is missing)
const uuid = () => crypto.randomUUID();

// Helper type for chat with relations
interface ChatWithRelations extends Chat {
  character: Character;
  messages: Message[];
}

export const getOrCreateChat = async (userId: string, characterId: string): Promise<ChatWithRelations> => {
  // Find existing chat
  const { data: existingChat } = await supabase
    .from('Chat')
    .select('*')
    .eq('userId', userId)
    .eq('characterId', characterId)
    .limit(1)
    .single();

  if (existingChat) {
    // Fetch related character and messages
    const { data: character } = await supabase
      .from('Character')
      .select('*')
      .eq('id', characterId)
      .single();

    const { data: messages } = await supabase
      .from('Message')
      .select('*')
      .eq('chatId', existingChat.id)
      .order('createdAt', { ascending: true });

    return {
      ...existingChat,
      character: character as Character,
      messages: (messages || []) as Message[],
    } as ChatWithRelations;
  }

  // Verify user exists
  const { data: user } = await supabase
    .from('User')
    .select('id')
    .eq('id', userId)
    .single();

  if (!user) {
    throw new Error('User not found');
  }

  // Create new chat
  const { data: newChat, error } = await supabase
    .from('Chat')
    .insert({ id: uuid(), userId, characterId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    .select('*')
    .single();

  if (error || !newChat) {
    throw new Error(error?.message || 'Failed to create chat');
  }

  // Fetch character
  const { data: character } = await supabase
    .from('Character')
    .select('*')
    .eq('id', characterId)
    .single();

  return {
    ...newChat,
    character: character as Character,
    messages: [],
  } as ChatWithRelations;
};

/** Idempotent: adds one assistant birthday message per chat per calendar day. */
export const ensureBirthdayGreeting = async (userId: string, chatId: string): Promise<void> => {
  const { data: user } = await supabase
    .from('User')
    .select('dob')
    .eq('id', userId)
    .single();

  if (!user?.dob || !isBirthdayToday(new Date(user.dob))) {
    return;
  }

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  const { data: already } = await supabase
    .from('Message')
    .select('id')
    .eq('chatId', chatId)
    .eq('role', 'assistant')
    .ilike('content', '%Happy Birthday%')
    .gte('createdAt', startOfDay)
    .limit(1)
    .single();

  if (already) {
    return;
  }

  await supabase
    .from('Message')
    .insert({
      id: uuid(),
      chatId,
      role: 'assistant',
      content: BIRTHDAY_MESSAGE,
    });
};

export const saveMessage = async (chatId: string, role: string, content: string) => {
  const { data: message, error } = await supabase
    .from('Message')
    .insert({ id: uuid(), chatId, role, content })
    .select('*')
    .single();

  if (error || !message) {
    throw new Error(error?.message || 'Failed to save message');
  }
  return message as Message;
};

export const getChatHistory = async (chatId: string) => {
  const { data: messages, error } = await supabase
    .from('Message')
    .select('*')
    .eq('chatId', chatId)
    .order('createdAt', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }
  return (messages || []) as Message[];
};

export const getUserChats = async (userId: string) => {
  // Get all chats for the user
  const { data: chats, error } = await supabase
    .from('Chat')
    .select('*')
    .eq('userId', userId)
    .order('updatedAt', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  if (!chats || chats.length === 0) return [];

  // For each chat, fetch the character and last message
  const enrichedChats = await Promise.all(
    chats.map(async (chat) => {
      const { data: character } = await supabase
        .from('Character')
        .select('*')
        .eq('id', chat.characterId)
        .single();

      const { data: messages } = await supabase
        .from('Message')
        .select('*')
        .eq('chatId', chat.id)
        .order('createdAt', { ascending: false })
        .limit(1);

      return {
        ...chat,
        character: character as Character,
        messages: (messages || []) as Message[],
      };
    })
  );

  return enrichedChats;
};

export const generateAIReply = async (chatId: string, _userMessage: string) => {
  // Fetch chat with character
  const { data: chat, error: chatError } = await supabase
    .from('Chat')
    .select('*')
    .eq('id', chatId)
    .single();

  if (chatError || !chat) {
    throw new Error('Chat not found');
  }

  const { data: character } = await supabase
    .from('Character')
    .select('*')
    .eq('id', chat.characterId)
    .single();

  if (!character) {
    throw new Error('Character not found');
  }

  // Fetch customizations
  const { data: settings } = await supabase
    .from('UserChatbotSettings')
    .select('*')
    .eq('userId', chat.userId)
    .eq('characterId', chat.characterId)
    .single();

  const customName = settings?.customName || character.name;
  const customPersonality = settings?.customPersonality || undefined;

  // Get all messages
  const { data: allMessages } = await supabase
    .from('Message')
    .select('*')
    .eq('chatId', chatId)
    .order('createdAt', { ascending: true });

  const messages = (allMessages || []) as Message[];

  // Get last 20 messages
  const offset = Math.max(0, messages.length - 20);
  const recentMessages = messages.slice(offset);

  const systemPrompt = buildSystemPrompt(character as Character, customName, customPersonality);
  const history = recentMessages.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  const llmMessages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: systemPrompt },
    ...history,
  ];

  const responseText = await getResponse(llmMessages);
  const aiMessage = await saveMessage(chatId, 'assistant', responseText);

  // Background task: Analyze and save memory
  analyzeAndSaveMemory(chatId, messages).catch(err => console.error("Memory handling error:", err));

  return aiMessage.content;
};

export const analyzeAndSaveMemory = async (chatId: string, messages: any[]) => {
  // Take last 10 messages for memory context
  const offset = Math.max(0, messages.length - 10);
  const contextMessages = messages.slice(offset);
  const conversationText = contextMessages.map(m => `${m.role}: ${m.content}`).join("\n");

  const { extractMemory } = await import('./llmService.js');
  const memoryData = await extractMemory(conversationText);
  
  if (memoryData && memoryData.content) {
    await supabase
      .from('Memory')
      .insert({
        id: uuid(),
        chatId,
        content: memoryData.content,
        importance: memoryData.importance,
      });
  }
};
