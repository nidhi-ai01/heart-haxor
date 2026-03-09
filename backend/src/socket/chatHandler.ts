import { Server, Socket } from 'socket.io';
import * as chatService from '../services/chatService.js';
import * as llmService from '../services/llmService.js';
import { chatbotSettingsService } from '../services/chatbotSettingsService.js';
import { buildSystemPrompt } from '../utils/prompt.js';

export const registerChatHandlers = (io: Server, socket: Socket) => {

    socket.on('join_chat', async ({ userId, characterId }) => {
        try {
            const chat = await chatService.getOrCreateChat(userId, characterId);
            
            // Try to get customized character data for display
            let displayName = chat.character.name;
            try {
                const customData = await chatbotSettingsService.getCharacterWithUserSettings(userId, characterId);
                displayName = customData.name;
            } catch (err) {
                // Use default if customization not found
            }
            
            socket.join(chat.id);
            socket.emit('chat_history', chat.messages);
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
            
            // Use custom name if provided, otherwise fetch it
            let displayName = customName || chat.character.name;
            if (!customName) {
                try {
                    const customData = await chatbotSettingsService.getCharacterWithUserSettings(userId, characterId);
                    displayName = customData.name;
                } catch (err) {
                    // Use default
                }
            }
            
            const systemPrompt = buildSystemPrompt(chat.character, displayName);

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
