import express from "express";
import {
  getOrCreateChat,
  saveMessage,
  generateAIReply
} from "../services/chatService.js";

const router = express.Router();


router.post("/chat", async (req, res) => {

    try {

        const { userId, characterId, message } = req.body;

        const chat = await getOrCreateChat(userId, characterId);

        await saveMessage(chat.id, "user", message);

        const aiReply = await generateAIReply(chat.id, message);

        res.json({
            reply: aiReply
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Chat failed"
        });

    }

});

export default router;