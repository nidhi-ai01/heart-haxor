import { Request, Response } from 'express';
import { chatbotSettingsService } from '../services/chatbotSettingsService.js';

interface AuthRequest extends Request {
  userId?: string;
}

/**
 * Get character data with user customizations applied
 */
export const getCharacterData = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { characterId } = req.params;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!characterId) {
      res.status(400).json({ error: 'Character ID is required' });
      return;
    }

    try {
      const characterData = await chatbotSettingsService.getCharacterWithUserSettings(
        userId,
        characterId
      );
      res.json(characterData);
    } catch (serviceError: any) {
      if (serviceError.message === 'Character not found') {
        res.status(404).json({ error: 'Character not found' });
      } else {
        throw serviceError;
      }
    }
  } catch (error: any) {
    console.error('Error in getCharacterData:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch character data' });
  }
};

/**
 * Get all user's chatbot customizations
 */
export const getAllUserCustomizations = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const customizations = await chatbotSettingsService.getUserAllCustomizations(userId);
    res.json(customizations);
  } catch (error: any) {
    console.error('Error in getAllUserCustomizations:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch customizations' });
  }
};

/**
 * Update or create customization for a character
 */
export const updateChatbotSettings = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { characterId } = req.params;
    const { customName, customImageUrl } = req.body;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!characterId) {
      res.status(400).json({ error: 'Character ID is required' });
      return;
    }

    // Validate inputs
    if (customName !== undefined && customName !== null && typeof customName !== 'string') {
      res.status(400).json({ error: 'Custom name must be a string' });
      return;
    }

    if (
      customImageUrl !== undefined &&
      customImageUrl !== null &&
      typeof customImageUrl !== 'string'
    ) {
      res.status(400).json({ error: 'Custom image URL must be a string' });
      return;
    }

    const result = await chatbotSettingsService.updateUserChatbotSettings(
      userId,
      characterId,
      customName,
      customImageUrl
    );

    res.json({
      success: true,
      customName: result.customName,
      customImageUrl: result.customImageUrl,
    });
  } catch (error: any) {
    console.error('Error in updateChatbotSettings:', error);
    res.status(500).json({ error: error.message || 'Failed to update customization' });
  }
};

/**
 * Delete customization for a character
 */
export const deleteChatbotSetting = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { characterId } = req.params;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!characterId) {
      res.status(400).json({ error: 'Character ID is required' });
      return;
    }

    const result = await chatbotSettingsService.deleteUserChatbotSetting(userId, characterId);
    res.json(result);
  } catch (error: any) {
    console.error('Error in deleteChatbotSetting:', error);
    res.status(500).json({ error: error.message || 'Failed to delete customization' });
  }
};
