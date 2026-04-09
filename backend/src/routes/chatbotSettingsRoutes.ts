import express from 'express';
import {
  getCharacterData,
  getAllUserCustomizations,
  updateChatbotSettings,
  deleteChatbotSetting,
} from '../controllers/chatbotSettingsController.js';
import { verifyJWT } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/chatbot-settings/:characterId
 * Get character data with user customizations applied
 */
router.get('/:characterId', verifyJWT, getCharacterData);

/**
 * GET /api/chatbot-settings
 * Get all user's chatbot customizations
 */
router.get('/', verifyJWT, getAllUserCustomizations);

/**
 * PUT /api/chatbot-settings/:characterId
 * Update or create customization for a character
 */
router.put('/:characterId', verifyJWT, updateChatbotSettings);

/**
 * DELETE /api/chatbot-settings/:characterId
 * Delete customization for a character
 */
router.delete('/:characterId', verifyJWT, deleteChatbotSetting);

export default router;
