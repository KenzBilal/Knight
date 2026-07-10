"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { HelpModal } from "@/components/HelpModal";
import { EmptyState } from "@/components/EmptyState";

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
      .then(data => {
        setConfig(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch("/api/telegram/leads")
      .then(r => r.json())
      .then(data => {
        if (data.leads) setLeads(data.leads);
      })
      .catch(() => {});
  }, []);

  const connected = config?.telegram_mode === "userbot" || config?.telegram_mode === "normal";
  const mode = config?.telegram_mode;
  const pendingLeads = leads.filter(l => l.status === "NEEDS_APPROVAL" || l.status === "PENDING");
  const approvedLeads = leads.filter(l => l.status === "APPROVED");
  const rejectedLeads = leads.filter(l => l.status === "REJECTED");

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-ink-800 rounded" />
          <div className="h-32 bg-ink-800 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-2 mb-6">
        <h1 className="font-display text-2xl text-paper-100">Telegram</h1>
        <HelpModal title="Telegram Integration">
          <p>Telegram integration lets Knight find leads directly in Telegram groups.</p>
          <p><strong>Two connection modes:</strong></p>
          <p>• <strong>Userbot</strong> - Connect your personal account. Knight joins groups, finds leads, and sends DMs as you. Higher response rates.</p>
          <p>• <strong>Normal Bot</strong> - Create a bot via BotFather. Knight responds to messages but cannot proactively find leads.</p>
          <p><strong>If you don&apos;t connect Telegram:</strong></p>
          <p>• Knight only finds leads via online scraping (Google Maps, websites)</p>
          <p>• No Telegram leads or conversations</p>
          <p>• You can still use all other features</p>
        </HelpModal>
      </div>

      {/* Not Connected - Show Options */}
      {!connected && (
        <div className="space-y-6">
          <div className="rounded-xl border border-line bg-ink-900 p-6">
            <h2 className="font-display text-lg text-paper-100 mb-2">Telegram Not Connected</h2>
            <p className="text-sm text-paper-400 mb-4">
              Connect Telegram to find leads in groups and handle conversations automatically.
              Without Telegram, Knight only finds leads via online scraping.
            </p>
            <Link
              href="/dashboard/telegram/setup"
              className="inline-block rounded-lg bg-flash-500 text-ink-950 font-medium px-5 py-2.5 text-sm hover:bg-flash-400 transition-colors"
            >
              Connect Telegram
            </Link>
          </div>

          {/* What you're missing */}
          <div className="rounded-xl border border-line bg-ink-900 p-6">
            <h3 className="font-display text-sm text-paper-100 mb-4">What you&apos;re missing without Telegram</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-lg bg-ink-950 border border-line p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🎯</span>
                  <h4 className="text-sm font-medium text-paper-100">Group Lead Hunting</h4>
                </div>
                <p className="text-xs text-paper-400">
                  Knight joins Telegram groups in your niche and identifies business owners who need your services.
                </p>
              </div>
              <div className="rounded-lg bg-ink-950 border border-line p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">💬</span>
                  <h4 className="text-sm font-medium text-paper-100">Automated DMs</h4>
                </div>
                <p className="text-xs text-paper-400">
                  Sends personalized first messages to prospects and handles the entire conversation until they&apos;re ready to book.
                </p>
              </div>
              <div className="rounded-lg bg-ink-950 border border-line p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🤖</span>
                  <h4 className="text-sm font-medium text-paper-100">AI Sales Agent</h4>
                </div>
                <p className="text-xs text-paper-400">
                  Gemini-powered agent handles objections, answers questions, and books meetings on your calendar.
                </p>
              </div>
              <div className="rounded-lg bg-ink-950 border border-line p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">📊</span>
                  <h4 className="text-sm font-medium text-paper-100">Lead Approval</h4>
                </div>
                <p className="text-xs text-paper-400">
                  Review and approve/decline leads before Knight continues the conversation. Full control over who you pursue.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connected - Show Dashboard */}
      {connected && (
        <>
          {/* Connection Status */}
          <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <div>
                  <h2 className="font-display text-lg text-paper-100">
                    Telegram Connected
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-500">
                      {mode === "userbot" ? "Userbot" : "Bot"}
                    </span>
                  </h2>
                  <p className="text-sm text-paper-400">
                    {mode === "userbot"
                      ? `Connected as @${config?.telegram_username || "unknown"} • Finding leads in groups`
                      : `Bot @${config?.telegram_username || "unknown"} • Responding to messages`}
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/telegram/setup"
                className="rounded-lg border border-line text-paper-300 font-medium px-5 py-2.5 text-sm hover:bg-ink-800 transition-colors"
              >
                Reconnect
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="rounded-xl border border-line bg-ink-900 p-4">
              <p className="text-sm text-paper-400">Pending</p>
              <p className="text-2xl font-bold text-paper-100">{pendingLeads.length}</p>
            </div>
            <div className="rounded-xl border border-line bg-ink-900 p-4">
              <p className="text-sm text-paper-400">Approved</p>
              <p className="text-2xl font-bold text-green-500">{approvedLeads.length}</p>
            </div>
            <div className="rounded-xl border border-line bg-ink-900 p-4">
              <p className="text-sm text-paper-400">Rejected</p>
              <p className="text-2xl font-bold text-paper-400">{rejectedLeads.length}</p>
            </div>
          </div>

          {/* Recent Leads */}
          <div className="rounded-xl border border-line bg-ink-900 p-6">
            <h2 className="font-display text-lg text-paper-100 mb-4">Recent Leads</h2>
            
            {leads.length === 0 ? (
              <EmptyState
                icon="🔍"
                title="No leads yet"
                description="Knight will start finding leads in Telegram groups automatically."
              />
            ) : (
              <div className="space-y-3">
                {leads.slice(0, 10).map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-ink-950 border border-line"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-ink-800 flex items-center justify-center">
                        <span className="text-sm text-paper-400">
                          {(lead.full_name || lead.username || "?")[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-paper-100">
                          {lead.full_name || lead.username || "Unknown"}
                        </p>
                        <p className="text-xs text-paper-400">
                          {lead.category || "Unknown category"} • {new Date(lead.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        lead.status === "APPROVED" 
                          ? "bg-green-500/10 text-green-500" 
                          : lead.status === "REJECTED"
                          ? "bg-paper-400/10 text-paper-400"
                          : "bg-flash-500/10 text-flash-500"
                      }`}>
                        {lead.status}
                      </span>
                      {lead.status === "NEEDS_APPROVAL" && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleAction(lead.id, "approve")}
                            className="px-2 py-1 text-xs rounded bg-green-500/10 text-green-500 hover:bg-green-500/20"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => handleAction(lead.id, "decline")}
                            className="px-2 py-1 text-xs rounded bg-red-500/10 text-red-500 hover:bg-red-500/20"
                          >
                            ✕
                          </button>
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

      {/* Info */}
      <div className="mt-6 rounded-xl border border-line bg-ink-900 p-6">
        <h3 className="font-display text-sm text-paper-100 mb-2">How Telegram works</h3>
        <ul className="text-xs text-paper-400 space-y-1">
          <li>• <strong>Userbot:</strong> Knight joins relevant groups, finds business owners, sends DMs, and handles conversations</li>
          <li>• <strong>Normal Bot:</strong> Knight responds to messages and handles conversations, but cannot proactively find leads</li>
          <li>• <strong>No Telegram:</strong> Knight only finds leads via Google Maps and website scraping</li>
          <li>• You get notified to approve/decline deals</li>
          <li>• Your session is encrypted and stored securely</li>
        </ul>
      </div>
    </div>
  );

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
    } catch (err) {
      console.error("Action failed:", err);
    }
  }
}
