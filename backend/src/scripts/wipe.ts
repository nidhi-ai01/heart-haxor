import prisma from '../lib/prisma.js';

async function main() {
    console.log("!!! WIPING ALL CHARACTERS !!!");

    // First, we need to delete related data if any constraints exist, 
    // but CASCADE might handle it or we ignore for now.
    // Ideally we preserve chats, but if the character is gone, the chat is broken anyway.
    // For this fix, we will just delete the characters.
    // Note: If you have foreign keys protecting this, it might fail.

    // Deleting chats first to avoid constraint errors if no cascade
    // await prisma.chat.deleteMany({}); // Uncomment if you want to nuke chats too

    try {
        console.log("Deleting Messages...");
        await prisma.message.deleteMany({});

        console.log("Deleting Chats...");
        await prisma.chat.deleteMany({});

        console.log("Deleting Characters...");
        const { count } = await prisma.character.deleteMany({});
        console.log(`Successfully deleted ${count} characters.`);
    } catch (e) {
        console.error("Wipe failed:", e);
    }
}

main().finally(() => prisma.$disconnect());
