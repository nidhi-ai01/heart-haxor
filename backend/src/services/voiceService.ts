import Groq from 'groq-sdk';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';
import os from 'os';
import axios from 'axios';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Transcribe audio using Groq's Whisper API (Cloud-based, fast, accurate)
 */
export const transcribeAudio = async (audioBuffer: Buffer): Promise<string> => {
    try {
        console.log(`[STT] Received audio buffer of ${audioBuffer.length} bytes`);

        // Validate buffer
        if (!audioBuffer || audioBuffer.length < 1000) {
            console.error("[STT] Audio buffer too small or empty");
            return "";
        }

        // Groq SDK requires a file path, so we write to temp
        // Use .webm since browser records in webm/opus format
        const tempPath = path.join(os.tmpdir(), `audio_${Date.now()}.webm`);
        fs.writeFileSync(tempPath, audioBuffer);

        console.log(`[STT] Saved temp file: ${tempPath}`);

        const transcription = await groq.audio.transcriptions.create({
            file: fs.createReadStream(tempPath),
            model: "whisper-large-v3-turbo",
            language: "en",
            response_format: "text"
        });

        console.log(`[STT] Transcription result:`, transcription);

        // Cleanup
        fs.unlinkSync(tempPath);

        // Handle different response types
        if (typeof transcription === 'string') {
            return transcription;
        } else if (transcription && typeof transcription === 'object' && 'text' in transcription) {
            return (transcription as any).text;
        }

        return String(transcription);
    } catch (error: any) {
        console.error("[STT] Groq STT Error:", error.message || error);
        return "";
    }
};

/**
 * Generate speech using Groq's TTS (if available) or fallback.
 * NOTE: Groq does not have a public TTS API as of Dec 2024.
 * For MVP, we'll return null and rely on text-only responses.
 * In production, integrate ElevenLabs, OpenAI TTS, or similar.
 */
export const generateSpeech = async (text: string, characterVoice: string): Promise<Buffer | null> => {
    try {
        if (!process.env.VOICE_SERVICE_URL) {
            console.warn("[TTS] VOICE_SERVICE_URL not set. Skipping.");
            return null;
        }

        console.log(`[TTS] Requesting audio for: "${text.substring(0, 50)}..."`);
        const response = await axios.post(`${process.env.VOICE_SERVICE_URL}/tts`, {
            text: text,
            character: characterVoice
        }, {
            responseType: 'arraybuffer'
        });

        console.log(`[TTS] Received audio: ${response.data.length} bytes`);
        return Buffer.from(response.data);
    } catch (error: any) {
        console.error("[TTS] Error generating speech:", error.message);
        return null;
    }
};
