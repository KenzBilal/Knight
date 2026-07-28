"use client";
import { useState, useEffect, useCallback } from "react";

export interface KillSwitches {
  "enable-discovery": boolean;
  "enable-osint": boolean;
  "enable-ai-pitching": boolean;
  "enable-webhooks": boolean;
  "enable-auto-email": boolean;
  "enable-telegram-userbot": boolean;
}

const DEFAULT_FLAGS: KillSwitches = {
  "enable-discovery": true,
  "enable-osint": true,
  "enable-ai-pitching": true,
  "enable-webhooks": true,
  "enable-auto-email": true,
  "enable-telegram-userbot": true,
};

export function useKillSwitches() {
  const [flags, setFlags] = useState<KillSwitches>(DEFAULT_FLAGS);
  const [loading, setLoading] = useState(true);

  const fetchFlags = useCallback(async () => {
    try {
      const res = await fetch("/api/kill-switches");
      if (!res.ok) return;
      const data = await res.json();
      setFlags(data.flags || DEFAULT_FLAGS);
    } catch {
      // Fail-open: keep defaults (all true)
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlags();
    // Re-check every 60s in case admin toggles a flag
    const interval = setInterval(fetchFlags, 60000);
    return () => clearInterval(interval);
  }, [fetchFlags]);

  return { flags, loading, refetch: fetchFlags };
}
