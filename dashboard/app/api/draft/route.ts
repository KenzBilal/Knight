import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { requireAuthFromToken } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/knight_token=([^;]+)/);
    if (!tokenMatch) throw new Error("Unauthorized");
    const { org } = await requireAuthFromToken(tokenMatch[1]);

    const supabase = createServiceClient();
    const { id, type } = await req.json(); // id = company_id

    const { data: company } = await supabase
      .from("companies")
      .select("*")
      .eq("id", id)
      .eq("org_id", org.id)
      .single();
    if (!company) throw new Error("Company not found");

    const { data: audit } = await supabase
      .from("audits")
      .select("id")
      .eq("company_id", id)
      .eq("org_id", org.id)
      .single();

    let semanticData: any = null;
    if (audit) {
      const { data: results } = await supabase
        .from("audit_results")
        .select("*")
        .eq("audit_id", audit.id)
        .eq("org_id", org.id);
      if (results) {
        const pitchRes = results.find((r: any) => r.category === "AI_PITCH");
        if (pitchRes?.raw_data?.businessContext?.semantic) {
          semanticData = pitchRes.raw_data.businessContext.semantic;
        }
      }
    }

    const { data: inboundEmail } = await supabase
      .from("emails")
      .select("body_text")
      .eq("company_id", id)
      .eq("org_id", org.id)
      .eq("direction", "inbound")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const { data: orgConfig } = await supabase
      .from("org_config")
      .select("*")
      .eq("org_id", org.id)
      .single();

    const companyName = orgConfig?.company_name || "Your Agency";
    const calendly = orgConfig?.calendly_link || "";

    const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = gemini.getGenerativeModel({ model: "gemini-2.5-flash" });

    let prompt = `You are a sales representative at ${companyName}.
You just received a positive reply from ${company.name} regarding your cold email.
Your goal is to write a warm, conversational follow-up to move them towards a quick discovery call.

Company Info:
Industry: ${semanticData?.industry || company.industry || "Unknown"}
What they do: ${semanticData?.primaryService || "Unknown"}
Target Audience: ${semanticData?.targetAudience || "Unknown"}
${calendly ? `Calendly: ${calendly}` : ""}

${inboundEmail ? `The client just replied with this email:\n"""\n${inboundEmail.body_text}\n"""\nWrite a response specifically addressing what they said.` : ""}
`;

    if (type === "whatsapp") {
      prompt += `
Format: This will be sent on WHATSAPP.
Rules:
- Extremely brief, max 2 sentences.
- Highly conversational, friendly, like texting a friend.
- Do NOT use formal sign-offs.
- Just casually suggest a 10 min call this week.`;
    } else {
      prompt += `
Format: This will be sent as an EMAIL.
Rules:
- Keep it under 4 sentences.
- Professional but warm.
- Acknowledge their interest and suggest a brief 10-15 minute call.
- Include a simple sign-off "Best, ${companyName} Team".`;
    }

    const result = await model.generateContent(prompt);
    const draft = result.response.text().trim();

    return NextResponse.json({ draft });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ draft: "Hey! Glad you reached out. Let's find a time to chat." });
  }
}
