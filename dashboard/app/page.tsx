import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LandingPage } from "@/components/LandingPage";

// Fetch content from DB, revalidate every hour (on-demand revalidation also
// triggered via /api/landing-content/save when admin saves from desktop app).
async function getLandingContent() {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/landing-content`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error("fetch failed");
    return res.json();
  } catch {
    return null; // LandingPage handles null with built-in defaults
  }
}

export default async function Page() {
  const content = await getLandingContent();
  return <LandingPage content={content} />;
}
