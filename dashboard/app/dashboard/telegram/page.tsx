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

const cardShadow = { boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" };

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
      <div className="p-6 md:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-[#f0f0f0] rounded-2xl" />
          <div className="h-24 bg-[#f0f0f0] rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      {!connected && (
        <div className="space-y-5">
          {/* Not connected card */}
          <div className="bg-white rounded-2xl p-6" style={cardShadow}>
            <h2 className="font-display text-lg font-bold text-[#111] mb-2">Not Connected</h2>
            <p className="text-sm text-[#888] mb-5">
              Connect Telegram to find leads in groups and handle conversations automatically.
            </p>
            <Link
              href="/dashboard/wizard/telegram"
              className="inline-block rounded-xl bg-[#111] text-white font-medium px-5 py-2.5 text-sm hover:bg-[#222] transition-colors"
            >
              Connect Telegram
            </Link>
          </div>

          {/* Feature grid */}
          <div className="bg-white rounded-2xl p-6" style={cardShadow}>
            <h3 className="font-display text-sm font-semibold text-[#111] mb-4">What you&apos;re missing</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                { icon: "🎯", title: "Group Lead Hunting", desc: "Find business owners in Telegram groups" },
                { icon: "💬", title: "Automated DMs", desc: "Send personalized first messages" },
                { icon: "🤖", title: "AI Sales Agent", desc: "Handle objections and book meetings" },
                { icon: "📊", title: "Lead Approval", desc: "Review and approve leads before pursuit" },
              ].map(item => (
                <div key={item.title} className="rounded-xl bg-[#f7f7f7] border border-[#f0f0f0] p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-lg">{item.icon}</span>
                    <h4 className="text-sm font-semibold text-[#111]">{item.title}</h4>
                  </div>
                  <p className="text-xs text-[#999]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {connected && (
        <>
          {/* Connection status */}
          <div className="bg-white rounded-2xl p-5 mb-5 flex items-center justify-between" style={cardShadow}>
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <div>
                <p className="font-semibold text-[#111] text-sm flex items-center gap-2">
                  Connected
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600">
                    {mode === "userbot" ? "Userbot" : "Bot"}
                  </span>
                </p>
                <p className="text-xs text-[#999] mt-0.5">@{config?.telegram_username || "unknown"}</p>
              </div>
            </div>
            <Link
              href="/dashboard/wizard/telegram"
              className="rounded-xl border border-[#ebebeb] text-[#555] font-medium px-4 py-2 text-sm hover:bg-[#f5f5f5] transition-colors"
            >
              Reconnect
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mb-5">
            {[
              { label: "Pending", value: pendingLeads.length, color: "text-[#111]" },
              { label: "Approved", value: approvedLeads.length, color: "text-green-600" },
              { label: "Total", value: leads.length, color: "text-[#111]" },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-2xl p-5" style={cardShadow}>
                <p className="text-xs text-[#999] mb-1">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Leads card */}
          <div className="bg-white rounded-2xl p-6" style={cardShadow}>
            <h2 className="font-display text-base font-semibold text-[#111] mb-4">Leads</h2>
            {leads.length === 0 ? (
              <p className="text-sm text-[#aaa]">No leads yet. Knight will start finding them automatically.</p>
            ) : (
              <div className="space-y-2">
                {leads.slice(0, 10).map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-3.5 rounded-xl bg-[#fafafa] border border-[#f0f0f0] hover:bg-[#f5f5f5] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#f0f0f0] flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-[#555]">
                          {(lead.full_name || lead.username || "?")[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#111]">
                          {lead.full_name || lead.username || "Unknown"}
                        </p>
                        <p className="text-xs text-[#aaa]">
                          {lead.category || "Unknown"} · {new Date(lead.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        lead.status === "APPROVED"  ? "bg-green-50 text-green-600" :
                        lead.status === "REJECTED"  ? "bg-[#f5f5f5] text-[#aaa]" :
                        "bg-yellow-50 text-yellow-600"
                      }`}>
                        {lead.status}
                      </span>
                      {lead.status === "NEEDS_APPROVAL" && (
                        <div className="flex gap-1">
                          <button onClick={() => handleAction(lead.id, "approve")}
                            className="px-2.5 py-1 text-xs rounded-lg bg-green-50 text-green-600 hover:bg-green-100 font-medium transition-colors">✓</button>
                          <button onClick={() => handleAction(lead.id, "decline")}
                            className="px-2.5 py-1 text-xs rounded-lg bg-red-50 text-red-500 hover:bg-red-100 font-medium transition-colors">✕</button>
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
