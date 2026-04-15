import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

// ============= GROQ CLIENT =============
// Uses GROQ_API_KEY from .env — no OpenAI dependency
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Default model — fast, high-quality, free tier friendly
const DEFAULT_MODEL = 'llama-3.1-8b-instant';

// Model for structured JSON extraction (memory)
const JSON_MODEL = 'llama-3.1-8b-instant';

/**
 * Generate a chat response using Groq's LLM API.
 * Replaces the old OpenAI-based getResponse.
 */
export const getResponse = async (
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  model: string = DEFAULT_MODEL,
  retries = 3
): Promise<string> => {
  if (!process.env.GROQ_API_KEY) {
    console.error('[LLM] GROQ_API_KEY is missing in .env — cannot generate AI response.');
    return "I'm unable to respond right now. Please check the server configuration.";
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`[LLM] Calling Groq (model: ${model}, attempt: ${attempt}/${retries}, messages: ${messages.length})`);

      const chatCompletion = await groq.chat.completions.create({
        messages,
        model,
        temperature: 0.7,
        max_tokens: 1024,
      });

      const content = chatCompletion.choices[0]?.message?.content || '';
      console.log(`[LLM] Response received (${content.length} chars)`);
      return content;
    } catch (error: any) {
      console.error(`[LLM] Groq API Error (Attempt ${attempt}/${retries}):`, error.message || error);

      if (attempt === retries) {
        return "I'm having a little trouble thinking right now. Could we try again?";
      }

      // Exponential backoff before retry
      await new Promise(res => setTimeout(res, 1000 * attempt));
    }
  }

  return "I'm having a little trouble thinking right now. Could we try again?";
};

/**
 * Extract a memory from conversation using Groq's LLM.
 * Returns a short summary + importance score, or null if nothing notable.
 */
export const extractMemory = async (
  conversationText: string
): Promise<{ content: string; importance: number } | null> => {
  if (!process.env.GROQ_API_KEY) return null;

  try {
    const response = await groq.chat.completions.create({
      model: JSON_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'Analyze the conversation. If the user shares important personal information ' +
            '(e.g. name, age, preferences, fears, job, etc.), extract ONE concise memory summary. ' +
            'Return JSON like { "content": "User likes swimming", "importance": 4 }. ' +
            'Importance is 1-5. If nothing important is shared, return JSON { "content": "" }. ' +
            'Only return the JSON, no other text.',
        },
        { role: 'user', content: conversationText },
      ],
      temperature: 0.3,
      max_tokens: 256,
      response_format: { type: 'json_object' },
    });

    const resultText = response.choices[0]?.message?.content;
    if (!resultText) return null;

    const parsed = JSON.parse(resultText);
    if (parsed.content && parsed.content.trim() !== '') {
      return {
        content: parsed.content,
        importance: parsed.importance || 1,
      };
    }
    return null;
  } catch (error: any) {
    console.error('[LLM] Memory Extraction Error:', error.message || error);
    return null;
  }
};
