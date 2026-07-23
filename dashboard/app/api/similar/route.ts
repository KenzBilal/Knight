import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { requireAuthFromToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/similar?companyId=...&limit=10
 * Find companies similar to a given company using pgvector cosine similarity.
 */
export async function GET(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/knight_token=([^;]+)/);
    if (!tokenMatch) throw new Error("Unauthorized");
    const { org } = await requireAuthFromToken(tokenMatch[1]);

    const url = new URL(req.url);
    const companyId = url.searchParams.get("companyId");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "10"), 50);

    if (!companyId) {
      return NextResponse.json({ error: "companyId is required" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Get the target company's embedding
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("id, name, website_url, industry, lead_score, status, ai_pitch, embedding")
      .eq("id", companyId)
      .eq("org_id", org.id)
      .single();

    if (companyError || !company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    if (!company.embedding) {
      return NextResponse.json({ error: "Company has no embedding yet" }, { status: 400 });
    }

    const embedding = typeof company.embedding === "string"
      ? JSON.parse(company.embedding)
      : company.embedding;

    // Search for similar companies using pgvector
    const { data: results, error: searchError } = await supabase.rpc("search_companies", {
      query_embedding: JSON.stringify(embedding),
      match_count: limit + 1, // +1 to exclude self
      org_id_filter: org.id,
    });

    if (searchError) {
      // Fallback: manual similarity
      const { data: allCompanies } = await supabase
        .from("companies")
        .select("id, name, website_url, industry, lead_score, status, ai_pitch, embedding")
        .eq("org_id", org.id)
        .not("embedding", "is", null)
        .neq("id", companyId)
        .limit(100);

      const scored = (allCompanies || []).map((c) => {
        const emb = typeof c.embedding === "string" ? JSON.parse(c.embedding) : c.embedding;
        const sim = emb ? cosineSimilarity(embedding, emb) : 0;
        const { embedding: _, ...rest } = c;
        return { ...rest, similarity: sim };
      });

      scored.sort((a, b) => b.similarity - a.similarity);
      return NextResponse.json({
        results: scored.slice(0, limit),
        source: { id: company.id, name: company.name },
      });
    }

    // Filter out self from results
    const filtered = (results || []).filter((r: any) => r.id !== companyId).slice(0, limit);

    return NextResponse.json({
      results: filtered,
      source: { id: company.id, name: company.name },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
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
