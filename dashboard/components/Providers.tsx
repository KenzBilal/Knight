"use client";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { Toaster } from "sonner";
import { UpdateChecker } from "./UpdateChecker";
import { SentryUserProvider } from "./SentryUserProvider";

if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: "https://us.i.posthog.com",
    person_profiles: "identified_only",
    capture_pageview: false,
    capture_pageleave: true,
    autocapture: true,
    session_recording: {
      maskTextSelector: ".ph-no-capture",
    },
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider client={posthog}>
      <SentryUserProvider />
      {children}
      <UpdateChecker />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "rgba(17, 17, 17, 0.95)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            color: "#e5e5e5",
            fontSize: "13px",
            fontWeight: 500,
            borderRadius: "12px",
            padding: "12px 16px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(12px)",
            letterSpacing: "-0.01em",
          },
          classNames: {
            success: "!bg-[#4ade80]/8 !border-[#4ade80]/15 !text-[#4ade80]",
            error: "!bg-[#f87171]/8 !border-[#f87171]/15 !text-[#f87171]",
            warning: "!bg-[#fbbf24]/8 !border-[#fbbf24]/15 !text-[#fbbf24]",
            info: "!bg-[#60a5fa]/8 !border-[#60a5fa]/15 !text-[#60a5fa]",
            actionButton: "!bg-white/10 hover:!bg-white/15 !text-white !border-0 !rounded-lg !px-3 !py-1.5 !text-[12px] !font-semibold !transition-all !duration-150",
            cancelButton: "!bg-white/5 hover:!bg-white/10 !text-[#a3a3a3] !border-0 !rounded-lg !px-3 !py-1.5 !text-[12px] !font-medium !transition-all !duration-150",
          },
        }}
        richColors
        duration={4000}
        gap={12}
        visibleToasts={3}
      />
    </PostHogProvider>
  );
}
