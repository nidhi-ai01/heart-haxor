import prisma from '../lib/prisma.js';

async function main() {
    console.log("Starting cleanup...");

    // 1. Delete characters with default/null imageUrl BUT keep our seeded one if it's correct. 
    // Actually, user said there is a duplicate Luna.

    const lunas = await prisma.character.findMany({
        where: { name: "Luna" }
    });

    if (lunas.length > 1) {
        console.log(`Found ${lunas.length} Lunas. Cleaning up...`);
        // Keep the one with the local file path "/characters/luna.png" or the most recent one?
        // Our seed used "/characters/luna.png".

        const goodLuna = lunas.find(l => l.imageUrl === "/characters/luna.png");

        // Delete all others
        for (const luna of lunas) {
            if (luna !== goodLuna) {
                await prisma.character.delete({ where: { id: luna.id } });
                console.log(`Deleted duplicate Luna: ${luna.id}`);
            }
        }
    }

    // Also generic cleanup for empty names
    await prisma.character.deleteMany({
        where: { name: "" }
    });

    console.log("Cleanup complete.");
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
