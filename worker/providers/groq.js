// Knight worker/providers/groq.js
// Groq provider adapter (uses OpenAI SDK with Groq baseURL)

import OpenAI from 'openai';

export async function groqChat(messages, opts = {}, apiKey) {
  const client = new OpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey,
  });

  const completion = await client.chat.completions.create({
    messages,
    model: opts.model || 'llama-3.3-70b-versatile',
    temperature: opts.temperature ?? 0.3,
    max_tokens: opts.maxTokens,
    ...(opts.responseFormat === 'json' ? { response_format: { type: 'json_object' } } : {}),
  });

  return { content: completion.choices[0]?.message?.content?.trim() || '' };
}
