"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Set user context for Sentry
    Sentry.setContext("app", { name: "knight-dashboard" });
  }, []);

  return <>{children}</>;
}
