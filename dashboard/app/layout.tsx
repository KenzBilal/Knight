import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://knight.ai";

export const metadata: Metadata = {
  title: {
    default: "Knight — Autonomous AI Sales Agent",
    template: "%s | Knight",
  },
  description:
    "Knight finds leads, audits their website, writes personalized pitches, and sends cold emails — all on autopilot. The AI sales agent for web agencies.",
  metadataBase: new URL(APP_URL),
  keywords: [
    "AI sales agent",
    "cold email automation",
    "B2B lead generation",
    "website audit",
    "sales automation",
    "Telegram outreach",
  ],
  authors: [{ name: "Knight" }],
  creator: "Knight",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    siteName: "Knight",
    title: "Knight — Autonomous AI Sales Agent",
    description:
      "Discovers leads, audits websites, writes personalized pitches, and sends cold emails — all on autopilot.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Knight — AI Sales Automation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Knight — Autonomous AI Sales Agent",
    description:
      "Discovers leads, audits websites, writes personalized pitches, and sends cold emails — all on autopilot.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="theme-color" content="#080808" />
        <meta name="color-scheme" content="dark" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen bg-[#080808] text-[#f5f5f5] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
