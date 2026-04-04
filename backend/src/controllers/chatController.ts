import { Request, Response } from 'express';
import * as chatService from '../services/chatService.js';
import { chatbotSettingsService } from '../services/chatbotSettingsService.js';
import prisma from '../lib/prisma.js';

interface AuthRequest extends Request {
  userId?: string;
}

/**
 * Get all chats for authenticated user
 * GET /api/chats/user
 */
export const getUserChats = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const chats = await chatService.getUserChats(userId);
        res.json({
            success: true,
            data: chats,
            count: chats.length
        });
    } catch (error: any) {
        console.error("Error fetching user chats:", error);
        res.status(500).json({ error: error.message || 'Failed to fetch chats' });
    }
};

/**
 * Get chat history for a specific chat
 * GET /api/chats/:chatId/history
 */
export const getChatHistory = async (req: AuthRequest, res: Response) => {
    try {
        const { chatId } = req.params;
        const userId = req.userId;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        if (!chatId) {
            res.status(400).json({ error: 'Chat ID is required' });
            return;
        }

        // Fetch chat to verify ownership
        const chat = await prisma.chat.findUnique({
            where: { id: chatId }
        });

        if (!chat) {
            res.status(404).json({ error: 'Chat not found' });
            return;
        }

        // Verify the chat belongs to the authenticated user
        if (chat.userId !== userId) {
            res.status(403).json({ error: 'Unauthorized - chat does not belong to this user' });
            return;
        }

        const history = await chatService.getChatHistory(chatId);
        res.json({
            success: true,
            data: history,
            count: history.length
        });
    } catch (error: any) {
        console.error("Error fetching chat history:", error);
        res.status(500).json({ error: error.message || 'Failed to fetch history' });
    }
};

/**
 * Get or create chat with a character and fetch its history
 * Useful for loading chat on page load
 * GET /api/chats/:characterId/with-character
 */
export const getChatWithCharacter = async (req: AuthRequest, res: Response) => {
    try {
        const { characterId } = req.params;
        const userId = req.userId;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        if (!characterId) {
            res.status(400).json({ error: 'Character ID is required' });
            return;
        }

        const chat = await chatService.getOrCreateChat(userId, characterId);

        await chatService.ensureBirthdayGreeting(userId, chat.id);
        const messages = await chatService.getChatHistory(chat.id);

        let customCharacterName = chat.character.name;
        let customCharacterImage = chat.character.imageUrl;
        try {
            const customData = await chatbotSettingsService.getCharacterWithUserSettings(userId, characterId);
            customCharacterName = customData.name;
            customCharacterImage = customData.imageUrl;
        } catch {
            // Use default name
        }

        res.json({
            success: true,
            data: {
                chatId: chat.id,
                character: {
                    ...chat.character,
                    name: customCharacterName,
                    imageUrl: customCharacterImage,
                },
                messages,
                messageCount: messages.length
            }
        });
    } catch (error: any) {
        console.error("Error fetching/creating chat with character:", error);
        res.status(500).json({ error: error.message || 'Failed to fetch chat' });
    }
};
