"use client";

import { useState, useCallback } from "react";
import apiClient from "@/lib/api";
import { useToast } from "@/context/ToastContext";

interface Character {
  id: string;
  name: string;
  imageUrl: string;
  role: string;
  description: string;
  backstory: string;
  intimacyLevel: string;
  isSystem: boolean;
  createdAt: string | Date;
}

export const useCharacterCustomization = (characterId: string) => {
  const [customName, setCustomName] = useState<string>("");
  const [customImageUrl, setCustomImageUrl] = useState<string>("");
  const [customPersonality, setCustomPersonality] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();

  /**
   * Fetch current customization settings for a character
   */
  const fetchSettings = useCallback(async () => {
    if (!characterId) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.get(`/chatbot-settings/${characterId}`);

      if (response.data) {
        setCustomName(response.data.customName || "");
        setCustomImageUrl(response.data.customImageUrl || "");
        setCustomPersonality(response.data.customPersonality || "");
      }
    } catch (err: any) {
      // 404 is expected when no customization exists yet - this is not an error
      if (err.response?.status === 404) {
        setCustomName("");
        setCustomImageUrl("");
        setCustomPersonality("");
        setError(null);
        return;
      }
      
      console.error("Error fetching customization settings:", err);
      setError(null); // Don't show error for initial fetch
    } finally {
      setIsLoading(false);
    }
  }, [characterId]);

  /**
   * Update or create customization for a character
   */
  const updateSettings = useCallback(
    async (data: { customName?: string; customImageUrl?: string; customPersonality?: string }) => {
      if (!characterId) {
        showError("Character ID is required");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await apiClient.put(`/chatbot-settings/${characterId}`, {
          customName: data.customName || null,
          customImageUrl: data.customImageUrl || null,
          customPersonality: data.customPersonality || null,
        });

        if (response.data) {
          setCustomName(response.data.customName || "");
          setCustomImageUrl(response.data.customImageUrl || "");
          setCustomPersonality(response.data.customPersonality || "");
          showSuccess("Customization saved successfully!");
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || "Failed to save customization";
        setError(errorMessage);
        showError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [characterId, showSuccess, showError]
  );

  /**
   * Reset customization to defaults
   */
  const resetToDefaults = useCallback(async () => {
    if (!characterId) {
      showError("Character ID is required");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await apiClient.delete(`/chatbot-settings/${characterId}`);

      setCustomName("");
      setCustomImageUrl("");
      setCustomPersonality("");
      showSuccess("Reset to default character settings");
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Failed to reset customization";
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [characterId, showSuccess, showError]);

  /**
   * Get character display with customizations applied
   */
  const getCharacterDisplay = useCallback(
    (character: Character): Partial<Character> => {
      return {
        ...character,
        name: customName || character.name,
        imageUrl: customImageUrl || character.imageUrl,
      };
    },
    [customName, customImageUrl]
  );

  /**
   * Check if character has customizations
   */
  const isCustomized = Boolean(customName || customImageUrl || customPersonality);

  return {
    customName,
    customImageUrl,
    customPersonality,
    isLoading,
    error,
    isCustomized,
    fetchSettings,
    updateSettings,
    resetToDefaults,
    getCharacterDisplay,
    setCustomName,
    setCustomImageUrl,
    setCustomPersonality,
  };
};
