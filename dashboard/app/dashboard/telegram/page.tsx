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

export default function TelegramPage() {
  const [connected, setConnected] = useState(false);
  const [leads, setLeads] = useState<TelegramLead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if Telegram is connected
    fetch("/api/config")
      .then(r => r.json())
      .then(data => {
        if (data.telegram_session) {
          setConnected(true);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Fetch Telegram leads
    fetch("/api/telegram/leads")
      .then(r => r.json())
      .then(data => {
        if (data.leads) {
          setLeads(data.leads);
        }
      })
      .catch(() => {});
  }, []);

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
          <p><strong>How it works:</strong></p>
          <p>• Connect your Telegram account (phone number)</p>
          <p>• Knight joins relevant groups based on your niche</p>
          <p>• AI identifies business owners who need your services</p>
          <p>• Sends personalized DMs and handles conversations</p>
          <p>• You get notified to approve/decline deals</p>
          <p><strong>Setup:</strong></p>
          <p>1. Click &quot;Connect Telegram&quot; and enter your phone number</p>
          <p>2. Enter the SMS verification code</p>
          <p>3. Create a bot via @BotFather for notifications</p>
          <p>4. Enter the bot token in settings</p>
        </HelpModal>
      </div>

      {/* Connection Status */}
      <div className={`rounded-xl border p-6 mb-6 ${
        connected 
          ? "border-green-500/30 bg-green-500/5" 
          : "border-line bg-ink-900"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${connected ? "bg-green-500" : "bg-paper-400"}`} />
            <div>
              <h2 className="font-display text-lg text-paper-100">
                {connected ? "Telegram Connected" : "Telegram Not Connected"}
              </h2>
              <p className="text-sm text-paper-400">
                {connected 
                  ? "Knight is finding leads and handling conversations" 
                  : "Connect your Telegram to start finding leads"}
              </p>
            </div>
          </div>
          <Link
            href={connected ? "/dashboard/telegram/setup" : "/dashboard/telegram/setup"}
            className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${
              connected
                ? "border border-line text-paper-300 hover:bg-ink-800"
                : "bg-flash-500 text-ink-950 hover:bg-flash-400"
            }`}
          >
            {connected ? "Reconnect" : "Connect Telegram"}
          </Link>
        </div>
      </div>

      {/* Stats */}
      {connected && (
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
      )}

      {/* Recent Leads */}
      {connected && (
        <div className="rounded-xl border border-line bg-ink-900 p-6">
          <h2 className="font-display text-lg text-paper-100 mb-4">Recent Leads</h2>
          
          {leads.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="font-display text-lg text-paper-100 mb-2">No leads yet</h3>
              <p className="text-sm text-paper-400">
                Knight will start finding leads in Telegram groups automatically.
              </p>
            </div>
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
      )}

      {/* Info */}
      <div className="mt-6 rounded-xl border border-line bg-ink-900 p-6">
        <h3 className="font-display text-sm text-paper-100 mb-2">How Telegram works</h3>
        <ul className="text-xs text-paper-400 space-y-1">
          <li>• Knight joins relevant Telegram groups based on your niche</li>
          <li>• It identifies business owners who need your services</li>
          <li>• Sends personalized DMs and handles conversations</li>
          <li>• You get notified to approve/decline deals</li>
          <li>• Approved leads receive a follow-up from your team</li>
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
      
      // Refresh leads
      const res = await fetch("/api/telegram/leads");
      const data = await res.json();
      if (data.leads) {
        setLeads(data.leads);
      }
    } catch (err) {
      console.error("Action failed:", err);
    }
  }
}
