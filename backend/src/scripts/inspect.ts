import prisma from '../lib/prisma.js';

async function main() {
    console.log("Inspecting Character Table...");
    const chars = await prisma.character.findMany();
    console.log(`Found ${chars.length} total characters.`);

    const first = chars[0];
    if (first) {
        console.log(`TEST_CHAR_ID=${first.id}`);
    }
}

main().finally(() => prisma.$disconnect());
