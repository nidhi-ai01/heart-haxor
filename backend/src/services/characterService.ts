import prisma from '../lib/prisma.js';
import { Character, Prisma } from '@prisma/client';

export const createCharacter = async (data: Prisma.CharacterCreateInput) => {
    return await prisma.character.create({
        data,
    });
};

export const getAllCharacters = async () => {
    return await prisma.character.findMany({
        orderBy: { createdAt: 'desc' }
    });
};

export const getCharacterById = async (id: string) => {
    return await prisma.character.findUnique({
        where: { id },
    });
};

export const updateCharacter = async (id: string, data: Prisma.CharacterUpdateInput) => {
    return await prisma.character.update({
        where: { id },
        data,
    });
};

export const deleteCharacter = async (id: string) => {
    return await prisma.character.delete({
        where: { id },
    });
};
