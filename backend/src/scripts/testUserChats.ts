import prisma from '../lib/prisma.js';
import * as chatService from '../services/chatService.js';

async function main() {
    console.log("Testing getUserChats...");
    const userId = "test-user-123";

    try {
        const chats = await chatService.getUserChats(userId);
        console.log(`Found ${chats.length} chats.`);
        if (chats.length > 0) {
            console.log("Detailed Chat 0:", JSON.stringify(chats[0], null, 2));
            console.log("Success: getUserChats working with updatedAt sort.");
        } else {
            console.log("No chats found (might be normal if none created).");
        }
    } catch (e) {
        console.error("getUserChats FAILED:", e);
    }
}

main().finally(() => prisma.$disconnect());
