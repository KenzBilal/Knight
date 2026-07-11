"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface TelegramLead {
  id: string;
  username: string;
  full_name: string;
  category: string;
  status: string;
  ai_summary: string;
  created_at: string;
}

interface TelegramConfig {
  telegram_mode: string | null;
  telegram_phone: string | null;
  telegram_bot_token: string | null;
  telegram_username: string | null;
}

export default function TelegramPage() {
  const [config, setConfig] = useState<TelegramConfig | null>(null);
  const [leads, setLeads] = useState<TelegramLead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/config")
      .then(r => r.json())
      .then(data => { setConfig(data); setLoading(false); })
      .catch(() => setLoading(false));

    fetch("/api/telegram/leads")
      .then(r => r.json())
      .then(data => { if (data.leads) setLeads(data.leads); })
      .catch(() => {});
  }, []);

  const connected = config?.telegram_mode === "userbot" || config?.telegram_mode === "normal";
  const mode = config?.telegram_mode;
  const pendingLeads = leads.filter(l => l.status === "NEEDS_APPROVAL" || l.status === "PENDING");
  const approvedLeads = leads.filter(l => l.status === "APPROVED");

  async function handleAction(leadId: string, action: "approve" | "decline") {
    try {
      await fetch("/api/telegram/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, action }),
      });
      const res = await fetch("/api/telegram/leads");
      const data = await res.json();
      if (data.leads) setLeads(data.leads);
    } catch {}
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-neutral-800 rounded" />
          <div className="h-32 bg-neutral-800 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="font-display text-2xl text-paper-100 mb-6">Telegram</h1>

      {!connected && (
        <div className="space-y-6">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 grain-card">
            <h2 className="font-display text-lg text-paper-100 mb-2">Not Connected</h2>
            <p className="text-sm text-neutral-400 mb-4">
              Connect Telegram to find leads in groups and handle conversations automatically.
            </p>
            <Link
              href="/dashboard/wizard/telegram"
              className="inline-block rounded-lg bg-paper-100 text-neutral-950 font-medium px-5 py-2.5 text-sm hover:bg-paper-200 transition-colors"
            >
              Connect Telegram
            </Link>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 grain-card">
            <h3 className="font-display text-sm text-paper-100 mb-4">What you&apos;re missing</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { icon: "🎯", title: "Group Lead Hunting", desc: "Find business owners in Telegram groups" },
                { icon: "💬", title: "Automated DMs", desc: "Send personalized first messages" },
                { icon: "🤖", title: "AI Sales Agent", desc: "Handle objections and book meetings" },
                { icon: "📊", title: "Lead Approval", desc: "Review and approve leads before pursuit" },
              ].map(item => (
                <div key={item.title} className="rounded-lg bg-neutral-950 border border-neutral-800 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{item.icon}</span>
                    <h4 className="text-sm font-medium text-paper-100">{item.title}</h4>
                  </div>
                  <p className="text-xs text-neutral-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {connected && (
        <>
          <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <div>
                  <h2 className="font-display text-lg text-paper-100">
                    Connected
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-500">
                      {mode === "userbot" ? "Userbot" : "Bot"}
                    </span>
                  </h2>
                  <p className="text-sm text-neutral-400">
                    @{config?.telegram_username || "unknown"}
                  </p>
                </div>
              </div>
              <Link href="/dashboard/wizard/telegram"
                className="rounded-lg border border-neutral-700 text-neutral-300 font-medium px-5 py-2.5 text-sm hover:bg-neutral-800 transition-colors">
                Reconnect
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 grain-card">
              <p className="text-sm text-neutral-400">Pending</p>
              <p className="text-2xl font-bold text-paper-100">{pendingLeads.length}</p>
            </div>
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 grain-card">
              <p className="text-sm text-neutral-400">Approved</p>
              <p className="text-2xl font-bold text-green-500">{approvedLeads.length}</p>
            </div>
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 grain-card">
              <p className="text-sm text-neutral-400">Total</p>
              <p className="text-2xl font-bold text-paper-100">{leads.length}</p>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 grain-card">
            <h2 className="font-display text-lg text-paper-100 mb-4">Leads</h2>
            {leads.length === 0 ? (
              <p className="text-sm text-neutral-500">No leads yet. Knight will start finding them automatically.</p>
            ) : (
              <div className="space-y-3">
                {leads.slice(0, 10).map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center">
                        <span className="text-sm text-neutral-400">
                          {(lead.full_name || lead.username || "?")[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-paper-100">
                          {lead.full_name || lead.username || "Unknown"}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {lead.category || "Unknown"} · {new Date(lead.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        lead.status === "APPROVED" ? "bg-green-500/10 text-green-500" :
                        lead.status === "REJECTED" ? "bg-neutral-800 text-neutral-500" :
                        "bg-neutral-700 text-neutral-300"
                      }`}>
                        {lead.status}
                      </span>
                      {lead.status === "NEEDS_APPROVAL" && (
                        <div className="flex gap-1">
                          <button onClick={() => handleAction(lead.id, "approve")}
                            className="px-2 py-1 text-xs rounded bg-green-500/10 text-green-500 hover:bg-green-500/20">✓</button>
                          <button onClick={() => handleAction(lead.id, "decline")}
                            className="px-2 py-1 text-xs rounded bg-red-500/10 text-red-500 hover:bg-red-500/20">✕</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
