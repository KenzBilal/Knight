// Knight worker/providers/cohere.js
// Cohere provider adapter

import { CohereClient } from 'cohere-ai';

export async function cohereChat(messages, opts = {}, apiKey) {
  const cohere = new CohereClient({ token: apiKey });

  const prompt = messages.map(m => {
    if (m.role === 'system') return `[SYSTEM] ${m.content}`;
    if (m.role === 'assistant') return `[ASSISTANT] ${m.content}`;
    return m.content;
  }).join('\n\n');

  const response = await cohere.chat({
    message: prompt,
    model: opts.model || 'command-r-plus-08-2024',
    temperature: opts.temperature ?? 0.3,
    maxTokens: opts.maxTokens,
    ...(opts.responseFormat === 'json' ? { responseFormat: { type: 'json_object' } } : {}),
  });

  return { content: response.text };
}
