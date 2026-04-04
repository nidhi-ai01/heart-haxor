import { detectEmotion } from "../services/emotion.service";

app.post("/chat", async (req, res) => {
  const { message } = req.body;

  // 🔥 1. Detect emotion
  const emotion = await detectEmotion(message);

  // 🔥 2. Build prompt
  const prompt = `
User emotion: ${emotion}

Respond accordingly:
- sad → empathetic
- happy → energetic
- angry → calm
`;

  // 🔥 3. Call LLM
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: prompt },
      { role: "user", content: message },
    ],
  });

  res.json({
    reply: response.choices[0].message.content,
    emotion,
  });
});