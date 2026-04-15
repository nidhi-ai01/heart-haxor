import crypto from 'crypto';
import supabase from '../lib/supabase.js';
import type { Character, UserChatbotSettings } from '../types/database.js';

const uuid = () => crypto.randomUUID();

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
      const { data: settings } = await supabase
        .from('UserChatbotSettings')
        .select('*')
        .eq('userId', userId)
        .eq('characterId', characterId)
        .single();

      if (settings) {
        // Fetch the character separately
        const { data: character } = await supabase
          .from('Character')
          .select('*')
          .eq('id', characterId)
          .single();

        if (character) {
          return {
            name: settings.customName || character.name,
            imageUrl: settings.customImageUrl || character.imageUrl,
            isCustomized: !!(settings.customName || settings.customImageUrl),
          };
        }
      }

      // If no customization, fetch character defaults
      const { data: character, error } = await supabase
        .from('Character')
        .select('*')
        .eq('id', characterId)
        .single();

      if (error || !character) {
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

  
  async updateUserChatbotSettings(
    userId: string,
    characterId: string,
    customName?: string | null,
    customImageUrl?: string | null,
    customPersonality?: string | null
  ) {
    try {
      
      if (customName && customName.length > 50) {
        throw new Error('Custom name must be 50 characters or less');
      }

      
      if (customImageUrl) {
        try {
          new URL(customImageUrl);
        } catch {
          throw new Error('Invalid image URL format');
        }
      }

      // Validate personality length
      if (customPersonality && customPersonality.length > 300) {
        throw new Error('Personality description must be 300 characters or less');
      }

      // Check if setting already exists
      const { data: existing } = await supabase
        .from('UserChatbotSettings')
        .select('*')
        .eq('userId', userId)
        .eq('characterId', characterId)
        .single();

      let settings: UserChatbotSettings;

      if (existing) {
        // Build update payload — only include fields that were explicitly passed
        const updateData: Record<string, string | null> = {};
        if (customName !== undefined) {
          updateData.customName = customName || null;
        }
        if (customImageUrl !== undefined) {
          updateData.customImageUrl = customImageUrl || null;
        }
        if (customPersonality !== undefined) {
          updateData.customPersonality = customPersonality || null;
        }

        const { data: updated, error } = await supabase
          .from('UserChatbotSettings')
          .update(updateData)
          .eq('userId', userId)
          .eq('characterId', characterId)
          .select('*')
          .single();

        if (error || !updated) {
          throw new Error(error?.message || 'Failed to update settings');
        }
        settings = updated as UserChatbotSettings;
      } else {
        // Create new
        const { data: created, error } = await supabase
          .from('UserChatbotSettings')
          .insert({
            id: uuid(),
            userId,
            characterId,
            customName: customName || null,
            customImageUrl: customImageUrl || null,
            customPersonality: customPersonality || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
          .select('*')
          .single();

        if (error || !created) {
          throw new Error(error?.message || 'Failed to create settings');
        }
        settings = created as UserChatbotSettings;
      }

      // Fetch the character for the response
      const { data: character } = await supabase
        .from('Character')
        .select('*')
        .eq('id', characterId)
        .single();

      return {
        customName: settings.customName,
        customImageUrl: settings.customImageUrl,
        customPersonality: settings.customPersonality,
        character: character as Character,
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
      const { data: customizations, error } = await supabase
        .from('UserChatbotSettings')
        .select('*')
        .eq('userId', userId);

      if (error) {
        throw new Error(error.message);
      }

      // Fetch characters for each customization
      const enriched = await Promise.all(
        (customizations || []).map(async (c) => {
          const { data: character } = await supabase
            .from('Character')
            .select('*')
            .eq('id', c.characterId)
            .single();
          return { ...c, character: character as Character };
        })
      );

      return enriched;
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
      const { error } = await supabase
        .from('UserChatbotSettings')
        .delete()
        .eq('userId', userId)
        .eq('characterId', characterId);

      if (error) {
        throw new Error(error.message);
      }

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
      const { data: character, error } = await supabase
        .from('Character')
        .select('*')
        .eq('id', characterId)
        .single();

      if (error || !character) {
        throw new Error('Character not found');
      }

      const { data: customization } = await supabase
        .from('UserChatbotSettings')
        .select('*')
        .eq('userId', userId)
        .eq('characterId', characterId)
        .single();

      return {
        ...character,
        name: customization?.customName || character.name,
        imageUrl: customization?.customImageUrl || character.imageUrl,
        customPersonality: customization?.customPersonality || null,
        isCustomized: !!(
          customization?.customName || customization?.customImageUrl || customization?.customPersonality
        ),
      };
    } catch (error) {
      console.error('Error in getCharacterWithUserSettings:', error);
      throw error;
    }
  },
};
