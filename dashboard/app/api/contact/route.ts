import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const REQUIRED_FIELDS = [
  "firstName",
  "lastName",
  "workEmail",
  "companyName",
  "teamSize",
  "useCase",
  "annualRevenue",
  "contactMethod",
] as const;

const VALID_CONTACT_METHODS = ["email", "video", "phone"] as const;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate required fields
    for (const field of REQUIRED_FIELDS) {
      if (!body[field] || (typeof body[field] === "string" && !body[field].trim())) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.workEmail)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Validate contact method
    if (!VALID_CONTACT_METHODS.includes(body.contactMethod)) {
      return NextResponse.json(
        { error: "Invalid contact method" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const { error } = await supabase.from("contact_submissions").insert({
      first_name: body.firstName.trim(),
      last_name: body.lastName.trim(),
      work_email: body.workEmail.trim().toLowerCase(),
      company_name: body.companyName.trim(),
      team_size: body.teamSize,
      use_case: body.useCase,
      annual_revenue: body.annualRevenue,
      current_workflow: (body.currentWorkflow || "").trim(),
      contact_method: body.contactMethod,
      status: "new",
    });

    if (error) {
      console.error("[Contact] Insert error:", error);
      return NextResponse.json(
        { error: "Failed to submit form" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[Contact] Error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
