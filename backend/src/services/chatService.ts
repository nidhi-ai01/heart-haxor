import prisma from '../lib/prisma.js';
import { getResponse } from './llmService.js';
import { isBirthdayToday } from './authService.js';
import { buildSystemPrompt } from '../utils/prompt.js';

const BIRTHDAY_MESSAGE = "Happy Birthday 🎉 I'm really glad you're here today.";

export const getOrCreateChat = async (userId: string, characterId: string) => {
  let chat = await prisma.chat.findFirst({
    where: { userId, characterId },
    include: {
      messages: { orderBy: { createdAt: 'asc' } },
      character: true,
    },
  });

  if (!chat) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    chat = await prisma.chat.create({
      data: {
        userId,
        characterId,
      },
      include: {
        messages: true,
        character: true,
      },
    });
  }

  return chat;
};

/** Idempotent: adds one assistant birthday message per chat per calendar day. */
export const ensureBirthdayGreeting = async (userId: string, chatId: string): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user?.dob || !isBirthdayToday(user.dob)) {
    return;
  }

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const already = await prisma.message.findFirst({
    where: {
      chatId,
      role: 'assistant',
      content: { contains: 'Happy Birthday' },
      createdAt: { gte: startOfDay },
    },
  });

  if (already) {
    return;
  }

  await prisma.message.create({
    data: {
      chatId,
      role: 'assistant',
      content: BIRTHDAY_MESSAGE,
    },
  });
};

export const saveMessage = async (chatId: string, role: string, content: string) => {
  return await prisma.message.create({
    data: {
      chatId,
      role,
      content,
    },
  });
};

export const getChatHistory = async (chatId: string) => {
  return await prisma.message.findMany({
    where: { chatId },
    orderBy: { createdAt: 'asc' },
  });
};

export const getUserChats = async (userId: string) => {
  return await prisma.chat.findMany({
    where: { userId },
    include: {
      character: true,
      messages: {
        take: 1,
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });
};

export const generateAIReply = async (chatId: string, _userMessage: string) => {
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: {
      character: true,
      messages: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!chat) {
    throw new Error('Chat not found');
  }

  // Get last 20 messages
  const offset = Math.max(0, chat.messages.length - 20);
  const recentMessages = chat.messages.slice(offset);

  const systemPrompt = buildSystemPrompt(chat.character, chat.character.name);
  const history = recentMessages.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: systemPrompt },
    ...history,
  ];

  const responseText = await getResponse(messages);
  const aiMessage = await saveMessage(chatId, 'assistant', responseText);

  // Background task: Analyze and save memory
  analyzeAndSaveMemory(chatId, chat.messages).catch(err => console.error("Memory handling error:", err));

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
    await prisma.memory.create({
      data: {
        chatId,
        content: memoryData.content,
        importance: memoryData.importance
      }
    });
  }
};
