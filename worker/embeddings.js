// Knight worker/embeddings.js
// Generate vector embeddings using Cohere embed-english-v3.0 (1024 dims, free tier)

import { CohereClient } from 'cohere-ai';

let _client = null;

function getClient(apiKey) {
  if (_client && _client._token === apiKey) return _client;
  _client = new CohereClient({ token: apiKey });
  _client._token = apiKey;
  return _client;
}

/**
 * Generate embedding for a single text string.
 * Returns a float[] of 1024 dimensions.
 */
export async function generateEmbedding(text, apiKey) {
  if (!text || !text.trim()) return null;

  const client = getClient(apiKey);

  // Cohere embed-english-v3.0 produces 1024-dim vectors
  const response = await client.embed({
    texts: [text.slice(0, 2000)], // Cohere has a 512 token limit, 2000 chars is safe
    model: 'embed-english-v3.0',
    inputType: 'search_document',
    embeddingTypes: ['float'],
  });

  return response.embeddings.float[0];
}

/**
 * Generate embeddings for multiple texts in one batch call.
 * Returns an array of float[] arrays.
 */
export async function generateEmbeddings(texts, apiKey) {
  if (!texts || texts.length === 0) return [];

  const client = getClient(apiKey);

  const truncated = texts.map(t => (t || '').slice(0, 2000));

  const response = await client.embed({
    texts: truncated,
    model: 'embed-english-v3.0',
    inputType: 'search_document',
    embeddingTypes: ['float'],
  });

  return response.embeddings.float;
}

/**
 * Build a text representation of a company for embedding.
 */
export function companyToText(company) {
  const parts = [
    company.name,
    company.industry,
    company.website_url,
    company.ai_pitch,
    company.ai_suggestions,
  ].filter(Boolean);

  return parts.join(' — ');
}

/**
 * Build a text representation of an audit for embedding.
 */
export function auditToText(audit, results) {
  const parts = [];

  if (audit.total_score !== null) parts.push(`Score: ${audit.total_score}/100`);
  if (audit.company?.name) parts.push(`Company: ${audit.company.name}`);
  if (audit.company?.industry) parts.push(`Industry: ${audit.company.industry}`);

  if (results && results.length > 0) {
    for (const r of results) {
      if (r.category) parts.push(`Category: ${r.category}`);
      if (r.issues_found && Array.isArray(r.issues_found)) {
        const issues = r.issues_found.map(i => i.issue || i.detail).filter(Boolean);
        if (issues.length) parts.push(`Issues: ${issues.join('; ')}`);
      }
    }
  }

  return parts.join(' — ');
}
