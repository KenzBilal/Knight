// Knight worker/providers/gemini.js
// Gemini provider adapter

import { GoogleGenerativeAI } from '@google/generative-ai';

export async function geminiChat(messages, opts = {}, apiKey) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: opts.model || 'gemini-2.0-flash' });

  const contents = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  const systemInstruction = messages.find(m => m.role === 'system')?.content;

  const result = await model.generateContent({
    contents,
    ...(systemInstruction ? { systemInstruction } : {}),
    generationConfig: {
      temperature: opts.temperature ?? 0.3,
      maxOutputTokens: opts.maxTokens,
      ...(opts.responseFormat === 'json' ? { responseMimeType: 'application/json' } : {}),
    },
  });

  return { content: result.response.text().trim() };
}
