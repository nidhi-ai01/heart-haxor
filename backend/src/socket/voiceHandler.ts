import { Server, Socket } from 'socket.io';
import * as chatService from '../services/chatService.js';
import * as llmService from '../services/llmService.js';
import * as voiceService from '../services/voiceService.js';
import { buildSystemPrompt } from '../utils/prompt.js';

export const registerVoiceHandlers = (io: Server, socket: Socket) => {

    socket.on('send_audio', async ({ userId, characterId, audioData }) => {
        // audioData is expected to be a Buffer or Blob (arraybuffer)
        try {
            console.log(`Received audio from ${userId}`);
            const buffer = Buffer.from(audioData); // Validate type

            // 1. STT
            const userText = await voiceService.transcribeAudio(buffer);
            console.log(`Transcribed: ${userText}`);

            if (!userText) {
                socket.emit('error', 'Could not understand audio');
                return;
            }

            // 2. Chat Logic (Same as text)
            const chat = await chatService.getOrCreateChat(userId, characterId);
            await chatService.saveMessage(chat.id, 'user', userText);

            // Emit transcription back to user so they see what they said
            socket.emit('transcription', { text: userText, role: 'user' });

            // 3. LLM
            const history = await chatService.getChatHistory(chat.id);
            const systemPrompt = buildSystemPrompt(chat.character);
            const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
                { role: 'system', content: systemPrompt },
                ...history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))
            ];

            socket.emit('typing', { characterId });
            const aiText = await llmService.getResponse(messages);

            await chatService.saveMessage(chat.id, 'assistant', aiText);
            socket.emit('receive_message', { content: aiText, role: 'assistant', chatId: chat.id }); // Text fallback

            // 4. TTS
            const audioBuffer = await voiceService.generateSpeech(aiText, "default"); // map character voice later

            if (audioBuffer) {
                socket.emit('receive_audio', { audio: audioBuffer, text: aiText });
            }

        } catch (error) {
            console.error("Voice Error:", error);
            socket.emit('error', 'Voice processing failed');
        }
    });
};
