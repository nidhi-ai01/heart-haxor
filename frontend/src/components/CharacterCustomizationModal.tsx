'use client';

import React, { useEffect, useState, useRef } from 'react';
import { X, Upload } from 'lucide-react';
import Button from './ui/Button';
import Input from './ui/Input';
import Card from './ui/Card';
import { useCharacterCustomization } from '@/hooks/useCharacterCustomization';

interface CharacterCustomizationModalProps {
  isOpen: boolean;
  characterId: string;
  characterName: string;
  characterImage: string;
  onClose: () => void;
}

export default function CharacterCustomizationModal({
  isOpen,
  characterId,
  characterName,
  characterImage,
  onClose,
}: CharacterCustomizationModalProps) {
  const {
    customName,
    customImageUrl,
    isLoading,
    fetchSettings,
    updateSettings,
    resetToDefaults,
    setCustomName,
    setCustomImageUrl,
  } = useCharacterCustomization(characterId);

  const [previewImage, setPreviewImage] = useState(characterImage);
  const [imageError, setImageError] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchSettings();
      setPreviewImage(customImageUrl || characterImage);
    }
  }, [isOpen, characterId]);

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setCustomImageUrl(url);
    setImageError('');

    if (url) {
      // Validate URL format
      try {
        new URL(url);
        setPreviewImage(url);
      } catch {
        setImageError('Invalid URL format');
        setPreviewImage(characterImage);
      }
    } else {
      setPreviewImage(characterImage);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setImageError('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setImageError('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setImageError('');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('accessToken');
      if (!token) {
        setImageError('You must be logged in to upload custom images');
        setIsUploading(false);
        return;
      }

      const response = await fetch(
        `http://localhost:3001/api/upload/character-image/${characterId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setImageError(data.error || 'Failed to upload image');
        setIsUploading(false);
        return;
      }

      // Update the custom image URL with the upload result
      setCustomImageUrl(data.imageUrl);
      setPreviewImage(data.imageUrl);
      setImageError('');
      
      // Success feedback
      const event = new CustomEvent('toast', {
        detail: { type: 'success', message: 'Image uploaded successfully!' }
      });
      window.dispatchEvent(event);
    } catch (err) {
      setImageError('Failed to upload image. Please try again.');
      console.error('Error uploading image:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async () => {
    await updateSettings({
      customName: customName || undefined,
      customImageUrl: customImageUrl || undefined,
    });
    // Close modal after a brief delay to show success message
    setTimeout(() => {
      onClose();
    }, 500);
  };

  const handleResetConfirm = async () => {
    await resetToDefaults();
    setPreviewImage(characterImage);
    setShowResetConfirm(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-in fade-in scale-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent">
            Customize {characterName}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Image Preview */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-white/80">Profile Image</label>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <img
                  src={previewImage}
                  alt={characterName}
                  className="w-20 h-20 rounded-xl object-cover border border-white/20"
                  onError={() => setPreviewImage(characterImage)}
                />
              </div>
              <div className="flex-1 space-y-2">
                {/* File Upload Button */}
                <div className="flex gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading || isUploading}
                    className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {isUploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={isLoading || isUploading}
                  className="hidden"
                  aria-label="Upload character image"
                />
                <Input
                  type="text"
                  placeholder="Or paste image URL"
                  value={customImageUrl}
                  onChange={handleImageUrlChange}
                  disabled={isLoading || isUploading}
                  className={imageError ? 'border-red-500/50' : ''}
                />
                {imageError && <p className="text-xs text-red-400">{imageError}</p>}
              </div>
            </div>
          </div>

          {/* Name Input */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-white/80">Custom Name</label>
              <span className={`text-xs ${customName.length > 45 ? 'text-amber-400' : 'text-white/50'}`}>
                {customName.length}/50
              </span>
            </div>
            <Input
              type="text"
              placeholder={`Default: ${characterName}`}
              value={customName}
              onChange={(e) => setCustomName(e.target.value.slice(0, 50))}
              disabled={isLoading || isUploading}
              maxLength={50}
            />
            <p className="text-xs text-white/50">
              Give your chatbot a unique name. Leave empty to use the default.
            </p>
          </div>

          {/* Reset Confirmation */}
          {showResetConfirm && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg space-y-3">
              <p className="text-sm text-amber-200">
                Are you sure you want to reset to default settings? This will remove your customizations.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleResetConfirm}
                  disabled={isLoading || isUploading}
                  className="flex-1 bg-gradient-to-r from-red-500 to-pink-600"
                  size="sm"
                >
                  {isLoading ? 'Resetting...' : 'Confirm Reset'}
                </Button>
                <Button
                  onClick={() => setShowResetConfirm(false)}
                  variant="outline"
                  disabled={isLoading || isUploading}
                  className="flex-1"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-white/10">
          <Button
            onClick={handleSave}
            disabled={isLoading || isUploading}
            className="flex-1"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            onClick={() => setShowResetConfirm(true)}
            variant="outline"
            disabled={isLoading || isUploading}
            className="flex-1"
          >
            Reset to Defaults
          </Button>
        </div>

        {/* Help Text */}
        <div className="px-6 pb-4 text-xs text-white/50 border-t border-white/5">
          Your customizations are saved to your account and will appear across all your chats.
        </div>
      </Card>
    </div>
  );
}
