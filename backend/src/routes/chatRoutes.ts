import express from "express";
import { verifyJWT } from "../middleware/auth.js";
import {
  getUserChats,
  getChatHistory,
  getChatWithCharacter,
  saveChatJson,
  getAdminUserChat
} from "../controllers/chatController.js";
import {
  getOrCreateChat,
  saveMessage,
  generateAIReply
} from "../services/chatService.js";

const router = express.Router();

// Apply authentication middleware to all chat routes
router.use(verifyJWT);

// Get all chats for authenticated user
router.get("/user", getUserChats);

// Get chat history for a specific chat
router.get("/:chatId/history", getChatHistory);

// Get or create chat with a character
router.get("/:characterId/with-character", getChatWithCharacter);

// POST /chat
router.post("/chat", async (req, res) => {
    try {
        const userId = req.userId;
        const { characterId, message, chatId: providedChatId } = req.body;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (!message || !characterId) {
            return res.status(400).json({ error: "Missing required fields: message, characterId" });
        }

        let chat;
        if (providedChatId) {
            // we could verify ownership here, but getOrCreateChat does it or creates a new one
            chat = await getOrCreateChat(userId, characterId);
        } else {
            chat = await getOrCreateChat(userId, characterId);
        }

        // Store user message inside the chat
        await saveMessage(chat.id, "user", message);

        // Generate AI reply (also handles memory extraction internally)
        const aiReply = await generateAIReply(chat.id, message);

        res.json({
            reply: aiReply,
            chatId: chat.id
        });

    } catch (error) {
        res.status(500).json({ error: "Chat failed" });
    }
});

// Save chat json per user (Requirement 5)
router.post("/save", saveChatJson);

// Admin read user json
router.get("/admin/:userId", getAdminUserChat);

export default router;