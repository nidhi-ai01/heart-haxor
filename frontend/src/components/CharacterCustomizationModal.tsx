"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { X, Upload, ImagePlus, RotateCcw, Save, Loader2 } from "lucide-react";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Card from "./ui/Card";
import { useCharacterCustomization } from "@/hooks/useCharacterCustomization";
import clsx from "clsx";

interface CharacterCustomizationModalProps {
  isOpen: boolean;
  characterId: string;
  characterName: string;
  characterImage: string;
  onClose: () => void;
  onSaved?: () => void;
}

export default function CharacterCustomizationModal({
  isOpen,
  characterId,
  characterName,
  characterImage,
  onClose,
  onSaved,
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
  const [imageError, setImageError] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track original values to detect changes
  const [originalName, setOriginalName] = useState("");
  const [originalImage, setOriginalImage] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen, characterId, fetchSettings]);

  // Once settings load, capture originals
  useEffect(() => {
    if (isOpen) {
      setOriginalName(customName);
      setOriginalImage(customImageUrl);
      setPreviewImage(customImageUrl || characterImage);
    }
    // Intentional: only snapshot when modal opens or data first loads
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isLoading]);

  const hasChanges =
    customName !== originalName || customImageUrl !== originalImage;

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setCustomImageUrl(url);
    setImageError("");

    if (!url) {
      setPreviewImage(characterImage);
      return;
    }

    try {
      new URL(url);
      setPreviewImage(url);
    } catch {
      setImageError("Invalid URL format");
      setPreviewImage(characterImage);
    }
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setImageError("Please select an image file (JPG, PNG)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError("File size must be less than 5MB");
      return;
    }

    // Show local preview immediately
    const localPreview = URL.createObjectURL(file);
    setPreviewImage(localPreview);

    setIsUploading(true);
    setImageError("");

    try {
      const formData = new FormData();
      formData.append("image", file);
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setImageError("You must be logged in to upload images");
        setPreviewImage(customImageUrl || characterImage);
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/upload/character-image/${characterId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      const data = await response.json();
      if (!response.ok) {
        setImageError(data.error || "Failed to upload image");
        setPreviewImage(customImageUrl || characterImage);
        return;
      }

      setCustomImageUrl(data.imageUrl);
      setPreviewImage(data.imageUrl);
    } catch {
      setImageError("Upload failed. Please try again.");
      setPreviewImage(customImageUrl || characterImage);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processFile(file);
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) await processFile(file);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [characterId, customImageUrl, characterImage]
  );

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings({
        customName: customName || undefined,
        customImageUrl: customImageUrl || undefined,
      });
      // Update originals so hasChanges resets
      setOriginalName(customName);
      setOriginalImage(customImageUrl);
      onSaved?.();
      setTimeout(() => onClose(), 400);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    await resetToDefaults();
    setPreviewImage(characterImage);
    setShowResetConfirm(false);
    setOriginalName("");
    setOriginalImage("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-3xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200/70 pb-5 dark:border-white/10">
          <div>
            <p className="app-eyebrow">Character settings</p>
            <h2 className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              Personalize {characterName}
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Customize how your companion appears throughout Heart Haxor. Changes are saved to your account.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-2xl border border-slate-200 bg-white/70 p-3 text-slate-700 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body — 2-column */}
        <div className="mt-6 grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Left: Preview Panel */}
          <div className="rounded-[1.75rem] bg-slate-950 p-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">
              Live preview
            </p>
            <div className="mt-4 overflow-hidden rounded-[1.5rem]">
              <img
                src={previewImage}
                alt={characterName}
                className="aspect-square w-full object-cover transition-opacity duration-300"
                onError={() => setPreviewImage(characterImage)}
              />
            </div>
            <p className="mt-4 text-lg font-bold">{customName || characterName}</p>
            <p className="mt-1 text-sm text-slate-400">
              {customName && customName !== characterName
                ? `Original: ${characterName}`
                : "Using default name"}
            </p>

            {(customName || customImageUrl) && (
              <div className="mt-4 rounded-xl border border-blue-400/20 bg-blue-500/10 px-3 py-2">
                <p className="text-xs text-blue-200">
                  ✦ Customized — your changes are visible across the platform.
                </p>
              </div>
            )}
          </div>

          {/* Right: Controls */}
          <div className="space-y-6">
            {/* Image Upload Section */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Profile image
                </label>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  JPG, PNG up to 5 MB
                </span>
              </div>

              {/* Drag & Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={clsx(
                  "relative cursor-pointer rounded-[1.5rem] border-2 border-dashed p-6 text-center transition-all duration-200",
                  isDragging
                    ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-500/10"
                    : "border-slate-200 bg-white/60 hover:border-blue-300 hover:bg-blue-50/50 dark:border-white/10 dark:bg-white/5 dark:hover:border-blue-400/30 dark:hover:bg-blue-500/5"
                )}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-3 py-2">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                      Uploading image...
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 py-2">
                    <div className="rounded-2xl bg-slate-100 p-3 dark:bg-white/10">
                      <ImagePlus className="h-6 w-6 text-slate-500 dark:text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {isDragging ? "Drop your image here" : "Drag & drop an image"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        or click to browse files
                      </p>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileSelect}
                  disabled={isLoading || isUploading}
                  className="hidden"
                  aria-label="Upload character image"
                />
              </div>

              {/* Or use URL */}
              <div className="mt-4">
                <Input
                  type="text"
                  label="Or paste an image URL"
                  placeholder="https://example.com/avatar.jpg"
                  value={customImageUrl}
                  onChange={handleImageUrlChange}
                  disabled={isLoading || isUploading}
                  error={imageError || undefined}
                />
              </div>
            </div>

            {/* Name Input Section */}
            <div>
              <Input
                type="text"
                label="Custom name"
                placeholder={`Default: ${characterName}`}
                value={customName}
                onChange={(e) => setCustomName(e.target.value.slice(0, 50))}
                disabled={isLoading || isUploading}
                helpText={`${customName.length}/50 characters · Leave blank to use original name.`}
              />
            </div>

            {/* Reset Confirmation */}
            {showResetConfirm && (
              <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                  Reset all changes for this character?
                </p>
                <p className="mt-2 text-sm text-amber-700 dark:text-amber-200">
                  This removes your custom name and image permanently.
                </p>
                <div className="mt-4 flex gap-3">
                  <Button
                    onClick={handleReset}
                    variant="danger"
                    size="sm"
                    className="flex-1"
                    disabled={isLoading}
                  >
                    Confirm reset
                  </Button>
                  <Button
                    onClick={() => setShowResetConfirm(false)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex flex-col gap-3 border-t border-slate-200/70 pt-5 dark:border-white/10 sm:flex-row">
          <Button
            onClick={handleSave}
            disabled={isLoading || isUploading || isSaving || !hasChanges}
            fullWidth
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving changes...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {hasChanges ? "Save changes" : "No changes"}
              </>
            )}
          </Button>
          <Button
            onClick={() => setShowResetConfirm(true)}
            variant="outline"
            disabled={isLoading || isUploading || isSaving}
            fullWidth
          >
            <RotateCcw className="h-4 w-4" />
            Reset to defaults
          </Button>
        </div>
      </Card>
    </div>
  );
}
