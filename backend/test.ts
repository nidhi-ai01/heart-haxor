import { PrismaClient } from '@prisma/client'; const prisma = new PrismaClient(); prisma.character.findMany().then(c => console.log('count:', c.length, 'names:', c.map(n=>n.name)));
