import prisma from '../lib/prisma.js';
import * as chatService from '../services/chatService.js';

async function main() {
    console.log("Starting Chat Test...");

    // 1. Get Character
    const char = await prisma.character.findFirst();
    if (!char) throw new Error("No characters found!");
    console.log(`Using Character: ${char.name} (${char.id})`);

    // 2. Create Chat
    // Assuming we need a userId, using a test one
    const userId = "test-user-123";
    const chat = await chatService.getOrCreateChat(userId, char.id);
    console.log(`Chat Created: ${chat.id}`);

    // 3. Send Message
    console.log("Sending Message: 'Hello, who are you?'");
    try {
        const response = await chatService.saveMessage(chat.id, "user", "Hello, who are you?");
        console.log("User Message Saved:", response);

        // Note: chatService.saveMessage usually just saves. 
        // We need to trigger the AI response. 
        // Checking how 'sendMessage' usually works in controller.
        // It likely calls 'generateResponse' or similar if logic is there.
        // Let's look at chatController logic? 
        // Wait, I can't look at it while writing this.
        // I'll assume I just want to test if I can save a message first. 
        // To test LLM, I might need to call the LLM service directly or whatever logic handles the reply.
    } catch (e) {
        console.error("Error sending message:", e);
    }
}

main().finally(() => prisma.$disconnect());
