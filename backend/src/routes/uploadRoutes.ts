import { Router } from 'express';
import { upload } from '../middleware/upload.js';
import { verifyJWT } from '../middleware/auth.js';
import { uploadCharacterImage, uploadFile } from '../controllers/uploadController.js';

const router = Router();

/**
 * POST /api/upload/character-image/:characterId
 * Upload and set character customization image (requires authentication)
 */
router.post('/character-image/:characterId', verifyJWT, upload.single('image'), uploadCharacterImage);

/**
 * POST /api/upload
 * Generic file upload (legacy support)
 */
router.post('/', upload.single('file'), uploadFile);

export default router;
