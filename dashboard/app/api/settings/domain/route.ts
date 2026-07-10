import { NextResponse } from "next/server";
import { requireAuthFromToken } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import crypto from "crypto";

export const dynamic = "force-dynamic";

// Generate DNS records for domain verification
function generateDNSRecords(domain: string, verificationToken: string) {
  return {
    dkim: {
      type: "CNAME",
      host: `resend._domainkey.${domain}`,
      value: `resend._domainkey.knight.com`,
      note: "DKIM record for email authentication",
    },
    spf: {
      type: "TXT",
      host: domain,
      value: "v=spf1 include:resend.com ~all",
      note: "SPF record to authorize Resend",
    },
    dmarc: {
      type: "TXT",
      host: `_dmarc.${domain}`,
      value: `v=DMARC1; p=none; rua=mailto:dmarc@knight.com`,
      note: "DMARC policy for email authentication",
    },
    verification: {
      type: "TXT",
      host: `_knight-verification.${domain}`,
      value: `knight-verify=${verificationToken}`,
      note: "Domain verification record",
    },
  };
}

// GET: Fetch domain status
export async function GET(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/knight_token=([^;]+)/);
    if (!tokenMatch) throw new Error("Unauthorized");
    const { org } = await requireAuthFromToken(tokenMatch[1]);

    const supabase = createServiceClient();
    const { data: domains } = await supabase
      .from("email_domains")
      .select("*")
      .eq("org_id", org.id)
      .order("created_at", { ascending: false });

    return NextResponse.json({ domains: domains || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Add a new domain
export async function POST(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/knight_token=([^;]+)/);
    if (!tokenMatch) throw new Error("Unauthorized");
    const { org } = await requireAuthFromToken(tokenMatch[1]);

    const { domain } = await req.json();

    if (!domain || !domain.includes(".")) {
      return NextResponse.json({ error: "Invalid domain" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Check if domain already exists for this org
    const { data: existing } = await supabase
      .from("email_domains")
      .select("id")
      .eq("org_id", org.id)
      .eq("domain", domain.toLowerCase())
      .single();

    if (existing) {
      return NextResponse.json({ error: "Domain already added" }, { status: 400 });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Create domain record
    const { data: newDomain, error } = await supabase
      .from("email_domains")
      .insert({
        org_id: org.id,
        domain: domain.toLowerCase(),
        status: "pending",
        verification_token: verificationToken,
      })
      .select()
      .single();

    if (error) throw error;

    // Generate DNS records
    const dnsRecords = generateDNSRecords(domain.toLowerCase(), verificationToken);

    return NextResponse.json({
      ok: true,
      domain: newDomain,
      dnsRecords,
      instructions: [
        "1. Log in to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)",
        "2. Add the DNS records shown above",
        "3. Wait 5-30 minutes for DNS propagation",
        "4. Click 'Verify Domain' to confirm",
      ],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/settings/domain/verify: Verify domain
export async function PUT(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/knight_token=([^;]+)/);
    if (!tokenMatch) throw new Error("Unauthorized");
    const { org } = await requireAuthFromToken(tokenMatch[1]);

    const { domainId } = await req.json();

    const supabase = createServiceClient();

    // Get domain
    const { data: domain } = await supabase
      .from("email_domains")
      .select("*")
      .eq("id", domainId)
      .eq("org_id", org.id)
      .single();

    if (!domain) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 });
    }

    // TODO: In production, verify DNS records are set correctly
    // For now, mark as verified
    const { error } = await supabase
      .from("email_domains")
      .update({
        status: "verified",
        updated_at: new Date().toISOString(),
      })
      .eq("id", domainId);

    if (error) throw error;

    return NextResponse.json({ ok: true, status: "verified" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
