import prisma from '../lib/prisma.js';

interface CharacterDataForUser {
  name: string;
  imageUrl: string;
  isCustomized: boolean;
}

export const chatbotSettingsService = {
  /**
   * Get character data with user customizations applied
   */
  async getCharacterDataForUser(
    userId: string,
    characterId: string
  ): Promise<CharacterDataForUser> {
    try {
      // First try to get user's customization for this character
      const settings = await prisma.userChatbotSettings.findUnique({
        where: {
          userId_characterId: {
            userId,
            characterId,
          },
        },
        include: {
          character: true,
        },
      });

      if (settings && settings.character) {
        return {
          name: settings.customName || settings.character.name,
          imageUrl: settings.customImageUrl || settings.character.imageUrl,
          isCustomized: !!(settings.customName || settings.customImageUrl),
        };
      }

      // If no customization, fetch character defaults
      const character = await prisma.character.findUnique({
        where: { id: characterId },
      });

      if (!character) {
        throw new Error('Character not found');
      }

      return {
        name: character.name,
        imageUrl: character.imageUrl,
        isCustomized: false,
      };
    } catch (error) {
      console.error('Error in getCharacterDataForUser:', error);
      throw error;
    }
  },

  /**
   * Update or create customization for a character.
   * Only updates fields that are explicitly provided (not undefined).
   * Passing undefined for a field leaves the existing DB value untouched.
   * Passing null or empty string explicitly clears that field.
   */
  async updateUserChatbotSettings(
    userId: string,
    characterId: string,
    customName?: string | null,
    customImageUrl?: string | null
  ) {
    try {
      // Validate custom name length
      if (customName && customName.length > 50) {
        throw new Error('Custom name must be 50 characters or less');
      }

      // Validate image URL format if provided
      if (customImageUrl) {
        try {
          new URL(customImageUrl);
        } catch {
          throw new Error('Invalid image URL format');
        }
      }

      // Build update payload — only include fields that were explicitly passed
      const updateData: Record<string, string | null> = {};
      if (customName !== undefined) {
        updateData.customName = customName || null;
      }
      if (customImageUrl !== undefined) {
        updateData.customImageUrl = customImageUrl || null;
      }

      const settings = await prisma.userChatbotSettings.upsert({
        where: {
          userId_characterId: {
            userId,
            characterId,
          },
        },
        update: updateData,
        create: {
          userId,
          characterId,
          customName: customName || null,
          customImageUrl: customImageUrl || null,
        },
        include: {
          character: true,
        },
      });

      return {
        customName: settings.customName,
        customImageUrl: settings.customImageUrl,
        character: settings.character,
      };
    } catch (error) {
      console.error('Error in updateUserChatbotSettings:', error);
      throw error;
    }
  },

  /**
   * Get all customizations for a user
   */
  async getUserAllCustomizations(userId: string) {
    try {
      const customizations = await prisma.userChatbotSettings.findMany({
        where: { userId },
        include: { character: true },
      });

      return customizations;
    } catch (error) {
      console.error('Error in getUserAllCustomizations:', error);
      throw error;
    }
  },

  /**
   * Delete customization for a character
   */
  async deleteUserChatbotSetting(userId: string, characterId: string) {
    try {
      await prisma.userChatbotSettings.delete({
        where: {
          userId_characterId: {
            userId,
            characterId,
          },
        },
      });

      return { success: true, message: 'Customization deleted' };
    } catch (error) {
      console.error('Error in deleteUserChatbotSetting:', error);
      throw error;
    }
  },

  /**
   * Get character with user settings applied
   */
  async getCharacterWithUserSettings(userId: string, characterId: string) {
    try {
      const character = await prisma.character.findUnique({
        where: { id: characterId },
      });

      if (!character) {
        throw new Error('Character not found');
      }

      const customization = await prisma.userChatbotSettings.findUnique({
        where: {
          userId_characterId: {
            userId,
            characterId,
          },
        },
      });

      return {
        ...character,
        name: customization?.customName || character.name,
        imageUrl: customization?.customImageUrl || character.imageUrl,
        isCustomized: !!(
          customization?.customName || customization?.customImageUrl
        ),
      };
    } catch (error) {
      console.error('Error in getCharacterWithUserSettings:', error);
      throw error;
    }
  },
};
