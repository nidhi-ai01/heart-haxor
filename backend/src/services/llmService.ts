import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || 'dummy_key'
});

export const getResponse = async (
    messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
    model = "llama-3.1-8b-instant"
) => {
    if (process.env.GROQ_API_KEY === 'INSERT_YOUR_GROQ_API_KEY_HERE' || !process.env.GROQ_API_KEY) {
        console.warn("Groq API Key missing. Returning mock response.");
        return "This is a mock response from Heart Haxor (Groq Key missing).";
    }

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            model: model,
            temperature: 0.7,
            max_tokens: 1024,
        });

        return chatCompletion.choices[0]?.message?.content || "";
    } catch (error) {
        console.error("Groq API Error:", error);
        return "Thinking..."; // Fallback
    }
};
