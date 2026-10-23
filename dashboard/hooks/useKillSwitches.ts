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

const DISABLED_FLAGS: KillSwitches = {
  "enable-discovery": false,
  "enable-osint": false,
  "enable-ai-pitching": false,
  "enable-webhooks": false,
  "enable-auto-email": false,
  "enable-telegram-userbot": false,
};

export function useKillSwitches() {
  const [flags, setFlags] = useState<KillSwitches>(DISABLED_FLAGS);
  const [loading, setLoading] = useState(true);

  const fetchFlags = useCallback(async () => {
    try {
      const res = await fetch("/api/kill-switches");
      if (!res.ok) {
        setFlags(DISABLED_FLAGS);
        return;
      }
      const data = await res.json();
      setFlags(data.flags || DISABLED_FLAGS);
    } catch {
      setFlags(DISABLED_FLAGS);
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
