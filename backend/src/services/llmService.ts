import OpenAI from 'openai';
import dotenv from 'dotenv';
import prisma from '../lib/prisma.js';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy_key'
});

export const getResponse = async (
    messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
    model = "groq/compound",
    retries = 3
): Promise<string> => {
    if (!process.env.OPENAI_API_KEY) {
        console.warn("OpenAI API Key missing. Returning mock response.");
        return "This is a mock response from Heart Haxor (OpenAI Key missing).";
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const chatCompletion = await openai.chat.completions.create({
                messages: messages,
                model: model,
                temperature: 0.7,
                max_tokens: 1024,
            });

            return chatCompletion.choices[0]?.message?.content || "";
        } catch (error) {
            console.error(`OpenAI API Error (Attempt ${attempt}/${retries}):`, error);
            if (attempt === retries) {
                return "I'm having a little trouble thinking right now. Could we try again?"; // Fallback
            }
            // Wait slightly before retrying (exponential backoff)
            await new Promise(res => setTimeout(res, 1000 * attempt));
        }
    }
    
    return "I'm having a little trouble thinking right now. Could we try again?";
};

export const extractMemory = async (conversationText: string): Promise<{content: string, importance: number} | null> => {
    if (!process.env.OPENAI_API_KEY) return null;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Analyze the conversation. If the user shares important personal information (e.g. name, age, preferences, fears, job, etc.), extract ONE concise memory summary. Return JSON like { \"content\": \"User likes swimming\", \"importance\": 4 }. Importance is 1-5. If nothing important is shared, return JSON { \"content\": \"\" }. Only return the JSON." },
                { role: "user", content: conversationText }
            ],
            response_format: { type: "json_object" }
        });

        const resultText = response.choices[0]?.message?.content;
        if (!resultText) return null;

        const parsed = JSON.parse(resultText);
        if (parsed.content && parsed.content.trim() !== "") {
            return {
                content: parsed.content,
                importance: parsed.importance || 1
            };
        }
        return null;
    } catch (error) {
        console.error("Memory Extraction Error:", error);
        return null;
    }
};
