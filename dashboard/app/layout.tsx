import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Knight — Your AI Sales Rep",
  description: "Autonomous AI-powered B2B sales agent. Discovers leads, audits websites, writes personalized pitches, and sends cold emails — all on autopilot.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ink-950 text-paper-100 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
