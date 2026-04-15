import { Server, Socket } from 'socket.io';
import * as chatService from '../services/chatService.js';
import * as llmService from '../services/llmService.js';
import { chatbotSettingsService } from '../services/chatbotSettingsService.js';
import { buildSystemPrompt } from '../utils/prompt.js';

export const registerChatHandlers = (io: Server, socket: Socket) => {

    socket.on('join_chat', async ({ userId, characterId }) => {
        try {
            const chat = await chatService.getOrCreateChat(userId, characterId);
            await chatService.ensureBirthdayGreeting(userId, chat.id);
            const messages = await chatService.getChatHistory(chat.id);

            let displayName = chat.character.name;
            try {
                const customData = await chatbotSettingsService.getCharacterWithUserSettings(userId, characterId);
                displayName = customData.name;
            } catch {
                // Use default if customization not found
            }

            socket.join(chat.id);
            socket.emit('chat_history', messages);
            console.log(`User ${userId} joined chat ${chat.id} with ${displayName}`);
        } catch (error) {
            console.error("Join Error:", error);
            socket.emit('error', 'Failed to join chat');
        }
    });

    socket.on('send_message', async ({ userId, characterId, content, customName }) => {
        try {
            // 1. Get Chat
            const chat = await chatService.getOrCreateChat(userId, characterId);

            // 2. Save User Message
            await chatService.saveMessage(chat.id, 'user', content);

            // 3. Build Context for LLM
            const history = await chatService.getChatHistory(chat.id);
            
            // Fetch user customizations (name + personality)
            let displayName = customName || chat.character.name;
            let customPersonality: string | null = null;

            try {
                const customData = await chatbotSettingsService.getCharacterWithUserSettings(userId, characterId);
                displayName = customData.name;
                customPersonality = customData.customPersonality || null;
            } catch {
                // Use defaults
            }
            
            const systemPrompt = buildSystemPrompt(chat.character, displayName, customPersonality);

            console.log(`[Chat] Building prompt for ${displayName}${customPersonality ? ` (custom personality: "${customPersonality.slice(0, 50)}...")` : ''}`);

            const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
                { role: 'system', content: systemPrompt },
                ...history.map(m => ({
                    role: m.role as 'user' | 'assistant',
                    content: m.content
                }))
            ];

            // 4. Get LLM Response
            // Emit "typing" event
            socket.emit('typing', { characterId });

            const responseText = await llmService.getResponse(messages);

            // 5. Save AI Message
            const aiMsg = await chatService.saveMessage(chat.id, 'assistant', responseText);

            // 6. Emit Response
            io.to(chat.id).emit('receive_message', aiMsg);

        } catch (error) {
            console.error("Message Error:", error);
            socket.emit('error', 'Failed to process message');
        }
    });
};
