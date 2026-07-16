"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";

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
  telegram_bot_token: string | null;
  telegram_connected: boolean;
}

export default function TelegramPage() {
  const [config, setConfig] = useState<TelegramConfig | null>(null);
  const [leads, setLeads] = useState<TelegramLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/config")
      .then(r => r.json())
      .then(data => { setConfig(data); setLoading(false); })
      .catch(() => setLoading(false));

    fetchLeads(1);
  }, []);

  function fetchLeads(p: number) {
    fetch(`/api/telegram/leads?page=${p}`)
      .then(r => r.json())
      .then(data => {
        if (data.leads) {
          setLeads(data.leads);
          setTotal(data.total || 0);
          setHasMore(data.hasMore || false);
          setPage(data.page || 1);
        }
      })
      .catch(() => {});
  }

  const connected = config?.telegram_connected === true;
  const mode = config?.telegram_mode;
  const pendingLeads = leads.filter(l => l.status === "NEEDS_APPROVAL" || l.status === "PENDING");
  const approvedLeads = leads.filter(l => l.status === "APPROVED");

  async function handleAction(leadId: string, action: "approve" | "decline") {
    setActionLoading(leadId);
    try {
      const res = await fetch("/api/telegram/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, action }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Action failed");
        return;
      }
      toast.success(action === "approve" ? "Lead approved" : "Lead declined");
      // Refresh leads
      fetchLeads(page);
    } catch {
      toast.error("Failed to perform action");
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-ink-800 rounded-2xl" />
          <div className="h-24 bg-ink-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      {!connected && (
        <div className="space-y-5">
          <div className="dash-card rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>Not Connected</h2>
            <p className="text-sm text-[#a3a3a3] mb-5">
              Connect Telegram to find leads in groups and handle conversations automatically.
            </p>
            <Link
              href="/dashboard/wizard/telegram"
              className="inline-block rounded-xl bg-white text-[#080808] font-medium px-5 py-2.5 text-sm hover:bg-white/90 transition-colors"
            >
              Connect Telegram
            </Link>
          </div>

          <div className="dash-card rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-4" style={{ fontFamily: "var(--font-display)" }}>What you&apos;re missing</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>, title: "Group Lead Hunting", desc: "Find business owners in Telegram groups" },
                { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, title: "Automated DMs", desc: "Send personalized first messages" },
                { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83"/></svg>, title: "AI Sales Agent", desc: "Handle objections and book meetings" },
                { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, title: "Lead Approval", desc: "Review and approve leads before pursuit" },
              ].map(item => (
                <div key={item.title} className="dash-card-glow rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[#525252]">{item.icon}</span>
                    <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                  </div>
                  <p className="text-xs text-[#525252]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {connected && (
        <>
          <div className="dash-card rounded-2xl p-5 mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#4ade80]" />
              <div>
                <p className="font-semibold text-white text-sm flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
                  Connected
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#4ade80]/10 text-[#4ade80]">
                    {mode === "userbot" ? "Userbot" : "Bot"}
                  </span>
                </p>
                <p className="text-xs text-[#525252] mt-0.5">
                  Telegram active
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/wizard/telegram"
              className="rounded-xl dash-card-glow text-[#a3a3a3] font-medium px-4 py-2 text-sm hover:bg-white/[0.04] hover:text-white transition-colors"
            >
              Reconnect
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            {[
              { label: "Pending", value: pendingLeads.length, color: "text-white" },
              { label: "Approved", value: approvedLeads.length, color: "text-[#4ade80]" },
              { label: "Total", value: total, color: "text-white" },
            ].map(stat => (
              <div key={stat.label} className="dash-card rounded-2xl p-5">
                <p className="text-xs text-[#525252] mb-1">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="dash-card rounded-2xl p-6">
            <h2 className="text-base font-semibold text-white mb-4" style={{ fontFamily: "var(--font-display)" }}>Leads</h2>
            {leads.length === 0 ? (
              <p className="text-sm text-[#525252]">No leads yet. Knight will start finding them automatically.</p>
            ) : (
              <>
                <div className="space-y-2">
                  {leads.map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between p-3.5 dash-card-glow rounded-xl hover:bg-white/[0.04] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-[#a3a3a3]">
                            {(lead.full_name || lead.username || "?")[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {lead.full_name || lead.username || "Unknown"}
                          </p>
                          <p className="text-xs text-[#525252]">
                            {lead.category || "Unknown"} · {new Date(lead.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          lead.status === "APPROVED"  ? "bg-[#4ade80]/10 text-[#4ade80]" :
                          lead.status === "REJECTED"  ? "bg-white/[0.06] text-[#525252]" :
                          "bg-[#facc15]/10 text-[#facc15]"
                        }`}>
                          {lead.status}
                        </span>
                        {lead.status === "NEEDS_APPROVAL" && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleAction(lead.id, "approve")}
                              disabled={actionLoading === lead.id}
                              className="w-7 h-7 rounded-lg bg-[#4ade80]/10 text-[#4ade80] hover:bg-[#4ade80]/20 font-medium transition-colors flex items-center justify-center disabled:opacity-50"
                            >
                              {actionLoading === lead.id ? (
                                <div className="w-3 h-3 border border-[#4ade80]/30 border-t-[#4ade80] rounded-full animate-spin" />
                              ) : (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                              )}
                            </button>
                            <button
                              onClick={() => handleAction(lead.id, "decline")}
                              disabled={actionLoading === lead.id}
                              className="w-7 h-7 rounded-lg bg-[#f87171]/10 text-[#f87171] hover:bg-[#f87171]/20 font-medium transition-colors flex items-center justify-center disabled:opacity-50"
                            >
                              {actionLoading === lead.id ? (
                                <div className="w-3 h-3 border border-[#f87171]/30 border-t-[#f87171] rounded-full animate-spin" />
                              ) : (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {hasMore && (
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={() => fetchLeads(page + 1)}
                      className="text-[13px] font-medium text-[#525252] hover:text-white transition-colors px-4 py-2"
                    >
                      Load more
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
