// Knight worker/providers/openrouter.js
// OpenRouter provider adapter

export async function openrouterChat(messages, opts = {}, apiKey) {
  const body = {
    model: opts.model || 'meta-llama/llama-3.1-8b-instruct:free',
    messages,
    temperature: opts.temperature ?? 0.3,
    max_tokens: opts.maxTokens,
    ...(opts.responseFormat === 'json' ? { response_format: { type: 'json_object' } } : {}),
  };

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`OpenRouter ${response.status}: ${text.slice(0, 200)}`);
  }

  const json = await response.json();
  const content = json.choices?.[0]?.message?.content?.trim() || '';

  return { content };
}
