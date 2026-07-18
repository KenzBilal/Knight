"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export function SentryUserProvider() {
  useEffect(() => {
    fetch("/api/org")
      .then((r) => r.json())
      .then((data) => {
        if (data.id) {
          Sentry.setContext("organization", {
            id: data.id,
            plan: data.plan,
          });
        }
      })
      .catch(() => {});
  }, []);

  return null;
}
