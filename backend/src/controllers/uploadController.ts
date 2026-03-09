import { Request, Response } from 'express';
import { chatbotSettingsService } from '../services/chatbotSettingsService.js';

interface AuthRequest extends Request {
  userId?: string;
  file?: Express.Multer.File;
}

/**
 * Upload character image and update customization
 * POST /api/upload/character-image/:characterId
 */
export const uploadCharacterImage = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { characterId } = req.params;
    const userId = req.userId;

    // Validate authentication
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized. Please provide a valid JWT token.' });
      return;
    }

    // Validate character ID
    if (!characterId) {
      res.status(400).json({ error: 'Character ID is required' });
      return;
    }

    // Validate file upload
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    // Construct file URL
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    // Update customization with image URL
    const result = await chatbotSettingsService.updateUserChatbotSettings(
      userId,
      characterId,
      undefined, // Don't change custom name
      fileUrl // Update image URL
    );

    res.json({
      success: true,
      imageUrl: fileUrl,
      message: 'Character image updated successfully',
      customization: {
        customName: result.customName,
        customImageUrl: result.customImageUrl,
      },
    });
  } catch (error: any) {
    console.error('Error in uploadCharacterImage:', error);

    // Handle multer errors
    if (error.code === 'FILE_TOO_LARGE') {
      res.status(400).json({ error: 'File is too large. Maximum size is 5MB.' });
      return;
    }

    if (error.message && error.message.includes('Only image files')) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(500).json({ 
      error: error.message || 'Failed to upload character image' 
    });
  }
};

/**
 * Generic file upload (legacy support)
 * POST /api/upload
 */
export const uploadFile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded.' });
      return;
    }

    // Construct URL
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  } catch (error: any) {
    console.error('Error in uploadFile:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to upload file' 
    });
  }
};
