import * as llmService from '../services/llmService.js';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
    console.log("Testing LLM Service...");
    console.log("API Key present?", !!process.env.GROQ_API_KEY);

    const messages = [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say hello!' }
    ];

    try {
        // @ts-ignore
        const response = await llmService.getResponse(messages);
        console.log("LLM Response:", response);
    } catch (e) {
        console.error("LLM Failed:", e);
    }
}

main();
