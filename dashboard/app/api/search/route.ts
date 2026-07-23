import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { requireAuthFromToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function cohereEmbed(text: string, apiKey: string, inputType = "search_query"): Promise<number[]> {
  const res = await fetch("https://api.cohere.com/v2/embed", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      texts: [text.slice(0, 2000)],
      model: "embed-english-v3.0",
      input_types: [inputType],
      embedding_types: ["float"],
    }),
  });
  if (!res.ok) throw new Error(`Cohere embed failed: ${res.status}`);
  const data = await res.json();
  const embeddings = data.embeddings;
  return Array.isArray(embeddings) ? embeddings[0] : embeddings.float?.[0] || embeddings[0];
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * GET /api/search?q=...&limit=10
 * Semantic search over companies using pgvector cosine similarity.
 */
export async function GET(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/knight_token=([^;]+)/);
    if (!tokenMatch) throw new Error("Unauthorized");
    const { org } = await requireAuthFromToken(tokenMatch[1]);

    const url = new URL(req.url);
    const query = url.searchParams.get("q");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "10"), 50);

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const supabase = createServiceClient();

    const cohereKey = process.env.COHERE_API_KEY;
    if (!cohereKey) {
      return NextResponse.json({ error: "Embedding service not configured" }, { status: 500 });
    }

    const queryEmbedding = await cohereEmbed(query, cohereKey, "search_query");
    if (!queryEmbedding) {
      return NextResponse.json({ error: "Failed to generate embedding" }, { status: 500 });
    }

    // Try RPC first, fallback to manual similarity
    const { data: results, error } = await supabase.rpc("search_companies", {
      query_embedding: JSON.stringify(queryEmbedding),
      match_count: limit,
      org_id_filter: org.id,
    });

    if (error) {
      const { data: fallback } = await supabase
        .from("companies")
        .select("id, name, website_url, industry, lead_score, status, ai_pitch, created_at, embedding")
        .eq("org_id", org.id)
        .not("embedding", "is", null)
        .limit(limit);

      const scored = (fallback || []).map((c) => {
        const emb = typeof c.embedding === "string" ? JSON.parse(c.embedding) : c.embedding;
        if (!emb) return { ...c, similarity: 0 };
        const sim = cosineSimilarity(queryEmbedding, emb);
        const { embedding: _, ...rest } = c;
        return { ...rest, similarity: sim };
      });

      scored.sort((a, b) => b.similarity - a.similarity);
      return NextResponse.json({ results: scored.slice(0, limit), query });
    }

    return NextResponse.json({ results, query });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
