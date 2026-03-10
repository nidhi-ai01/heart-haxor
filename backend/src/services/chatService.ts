import prisma from '../lib/prisma.js';
import { getResponse } from './llmService.js';


export const getOrCreateChat = async (userId: string, characterId: string) => {

    let chat = await prisma.chat.findFirst({
        where: { userId, characterId },
        include: {
            messages: { orderBy: { createdAt: 'asc' } },
            character: true
        }
    });

    if (!chat) {

        let user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    id: userId,
                    name: 'Anonymous User',
                    age: 18
                }
            });
        }

        chat = await prisma.chat.create({
            data: {
                userId,
                characterId
            },
            include: {
                messages: true,
                character: true
            }
        });
    }

    return chat;
};


export const saveMessage = async (
    chatId: string,
    role: string,
    content: string
) => {

    return await prisma.message.create({
        data: {
            chatId,
            role,
            content
        }
    });

};


export const getChatHistory = async (chatId: string) => {

    return await prisma.message.findMany({
        where: { chatId },
        orderBy: { createdAt: 'asc' }
    });

};


export const getUserChats = async (userId: string) => {

    return await prisma.chat.findMany({
        where: { userId },
        include: {
            character: true,
            messages: {
                take: 1,
                orderBy: { createdAt: 'desc' }
            }
        },
        orderBy: { updatedAt: 'desc' }
    });

};



/*
---------------------------------------
NEW FUNCTION: Generate AI Reply
---------------------------------------
*/

export const generateAIReply = async (
    chatId: string,
    userMessage: string
) => {

    // Get chat + character
    const chat = await prisma.chat.findUnique({
        where: { id: chatId },
        include: {
            character: true,
            messages: {
                orderBy: { createdAt: 'asc' }
            }
        }
    });

    if (!chat) {
        throw new Error("Chat not found");
    }

    const character = chat.character;

    /*
    ---------------------------------------
    SYSTEM PROMPT WITH PERSONALITY
    ---------------------------------------
    */

    const systemPrompt = `
You are ${character.name}.

Role:
${character.role}

Personality:
${character.personality}

Description:
${character.description}

Backstory:
${character.backstory}

Rules:
- Always stay in character.
- Respond according to your personality.
- Be natural and conversational.
- Do not say you are an AI assistant.
`;


    /*
    ---------------------------------------
    BUILD MESSAGE HISTORY
    ---------------------------------------
    */

    const messages = [
        {
            role: "system" as const,
            content: systemPrompt
        },

        ...chat.messages.map((msg: any) => ({
            role: msg.role as "user" | "assistant",
            content: msg.content
        })),

        {
            role: "user" as const,
            content: userMessage
        }
    ];


    /*
    ---------------------------------------
    CALL LLM
    ---------------------------------------
    */

    const aiResponse = await getResponse(messages);


    /*
    ---------------------------------------
    SAVE AI MESSAGE
    ---------------------------------------
    */

    await saveMessage(chatId, "assistant", aiResponse);


    return aiResponse;
};