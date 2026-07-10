import dotenv from 'dotenv';
dotenv.config();

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

export const nemotron = {
  chat: {
    completions: {
      create: async (params) => {
        const body = {
          model: 'nvidia/nemotron-3-ultra-550b-a55b:free',
          messages: params.messages,
          temperature: params.temperature || 0.3,
          max_tokens: params.max_tokens,
          response_format: params.response_format
        };

        let lastError = null;
        for (let i = 0; i < 3; i++) {
          try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${OPENROUTER_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(body)
            });

            if (!response.ok) {
              throw new Error(`OpenRouter error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
          } catch (err) {
            lastError = err;
            await new Promise(r => setTimeout(r, 2000 * (i + 1)));
          }
        }
        throw lastError;
      }
    }
  },
  models: {
    list: async () => {
      return { data: [{ id: 'nvidia/nemotron-3-ultra-550b-a55b:free' }] };
    }
  }
};
