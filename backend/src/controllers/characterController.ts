import { Request, Response } from 'express';
import * as characterService from '../services/characterService.js';

export const createCharacter = async (req: Request, res: Response): Promise<void> => {
    try {
        const character = await characterService.createCharacter(req.body);
        res.status(201).json(character);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create character' });
    }
};

export const getCharacters = async (req: Request, res: Response): Promise<void> => {
    try {
        const characters = await characterService.getAllCharacters();
        res.json(characters);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch characters' });
    }
};

export const getCharacter = async (req: Request, res: Response): Promise<void> => {
    try {
        const character = await characterService.getCharacterById(req.params.id);
        if (!character) {
            res.status(404).json({ error: 'Character not found' });
            return;
        }
        res.json(character);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch character' });
    }
};

export const updateCharacter = async (req: Request, res: Response): Promise<void> => {
    try {
        const character = await characterService.updateCharacter(req.params.id, req.body);
        res.json(character);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update character' });
    }
};

export const deleteCharacter = async (req: Request, res: Response): Promise<void> => {
    try {
        await characterService.deleteCharacter(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete character' });
    }
};
