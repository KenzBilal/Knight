"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

interface Email {
  id: string;
  direction: string;
  subject: string;
  body_text: string;
  created_at: string;
}

interface Thread {
  company: { id: string; name: string; website: string };
  emails: Email[];
  lastActivity: string;
  hasReply: boolean;
}

interface Template {
  id: string;
  name: string;
  type: string;
  subject: string;
  body: string;
}

export default function InboxPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [replyText, setReplyText] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [sending, setSending] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [plan, setPlan] = useState<string>("free");

  useEffect(() => {
    fetch("/api/org")
      .then(r => r.json())
      .then(d => { if (d.plan) setPlan(d.plan); })
      .catch(() => {});

    fetch("/api/inbox")
      .then(r => r.json())
      .then(data => { setThreads(data.threads || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/templates")
      .then(r => r.json())
      .then(d => setTemplates(d.templates || []))
      .catch(() => {});
  }, []);

  async function generateDraft() {
    if (!requirePlan("use AI drafts")) return;
    if (!selectedThread) return;
    setDrafting(true);
    try {
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedThread.company.id, type: "email" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate draft");
      setReplyText(data.draft || "");
      toast.success("Draft generated");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate draft");
    }
    setDrafting(false);
  }

  function applyTemplate(templateId: string) {
    const t = templates.find(t => t.id === templateId);
    if (!t) return;
    setSelectedTemplate(templateId);
    setReplyText(t.body);
  }

  async function sendReply() {
    if (!requirePlan("send replies")) return;
    if (!selectedThread || !replyText.trim()) {
      toast.error("Write a reply first");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/send-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: selectedThread.company.id,
          text: replyText,
          template_id: selectedTemplate || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");
      toast.success("Reply sent!");
      setReplyText("");
      setSelectedTemplate("");
      // Refresh threads
      const refreshed = await fetch("/api/inbox").then(r => r.json());
      setThreads(refreshed.threads || []);
      // Re-select the thread
      const updated = refreshed.threads?.find((t: Thread) => t.company.id === selectedThread.company.id);
      if (updated) setSelectedThread(updated);
    } catch (e: any) {
      toast.error(e.message || "Failed to send");
    }
    setSending(false);
  }

  const canUse = plan === "max" || plan === "enterprise";

  function requirePlan(action: string) {
    if (!canUse) {
      toast.error(`Upgrade to Max to ${action}`, { action: { label: "Upgrade", onClick: () => window.location.href = "/dashboard/billing" } });
      return false;
    }
    return true;
  }

  return (
    <div className="p-6 md:p-8">
      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="dash-card p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/[0.04]" />
                <div className="flex-1">
                  <div className="h-4 w-32 bg-white/[0.04] rounded mb-2" />
                  <div className="h-3 w-48 bg-white/[0.04] rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : threads.length === 0 ? (
        <div className="dash-card p-12 text-center">
          <div className="w-14 h-14 rounded-lg bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3a3a3a" strokeWidth="1.5" strokeLinecap="round">
              <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
            </svg>
          </div>
          <p className="text-sm font-medium text-[#525252]">No email threads yet</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Thread list */}
          <div className="md:col-span-1 space-y-2">
            {threads.map((thread) => (
              <button
                key={thread.company.id}
                onClick={() => { setSelectedThread(thread); setReplyText(""); setSelectedTemplate(""); }}
                className={`w-full text-left rounded-lg p-4 transition-all duration-150 dash-card ${
                  selectedThread?.company.id === thread.company.id
                    ? "bg-white/[0.06]"
                    : "hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-[#a3a3a3]">
                      {thread.company.name?.[0]?.toUpperCase() || "?"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white truncate">
                        {thread.company.name || "Unknown"}
                      </span>
                      {thread.hasReply && <div className="w-2 h-2 rounded-full bg-[#4ade80] flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-[#525252] truncate mt-0.5">
                      {thread.emails[thread.emails.length - 1]?.subject || "No subject"}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Thread detail + reply */}
          <div className="md:col-span-2">
            {selectedThread ? (
              <div className="space-y-4">
                {/* Thread header */}
                <div className="dash-card p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-white">{selectedThread.company.name}</h2>
                      <p className="text-xs text-[#525252]">{selectedThread.company.website}</p>
                    </div>
                    <span className="text-xs text-[#525252] bg-white/[0.06] px-3 py-1 rounded">
                      {selectedThread.emails.length} messages
                    </span>
                  </div>
                </div>

                {/* Thread messages */}
                <div className="dash-card p-4">
                  <div className="space-y-3 max-h-[400px] overflow-auto pr-1">
                    {selectedThread.emails.map((email) => (
                      <div
                        key={email.id}
                        className={`rounded-lg p-4 ${
                          email.direction === "outbound"
                            ? "bg-white/[0.04] ml-8"
                            : "bg-[#0f0f0f] dash-card mr-8"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-semibold ${
                            email.direction === "outbound" ? "text-[#a3a3a3]" : "text-[#4ade80]"
                          }`}>
                            {email.direction === "outbound" ? "You" : "Prospect"}
                          </span>
                          <span className="text-xs text-[#3a3a3a]">
                            {new Date(email.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-[#a3a3a3] whitespace-pre-wrap leading-relaxed">
                          {email.body_text || email.subject || "No content"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reply composer */}
                <div className="dash-card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-white">Reply</h3>
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedTemplate}
                        onChange={e => applyTemplate(e.target.value)}
                        className="input-base rounded-lg px-3 py-1.5 text-[12px]"
                      >
                        <option value="">Template...</option>
                        {templates.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                      <button
                        onClick={generateDraft}
                        disabled={drafting}
                        className="px-3 py-1.5 rounded-lg bg-white/[0.06] text-[12px] font-medium text-[#a3a3a3] hover:bg-white/[0.1] hover:text-white disabled:opacity-50 transition-colors"
                      >
                        {drafting ? "Generating..." : "AI Draft"}
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={replyText}
                    onChange={e => { setReplyText(e.target.value); setSelectedTemplate(""); }}
                    placeholder="Type your reply..."
                    rows={6}
                    className="w-full input-base rounded-lg px-3 py-2.5 text-sm font-mono resize-y mb-3"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={sendReply}
                      disabled={sending || !replyText.trim()}
                      className="px-4 py-2 rounded-lg bg-white text-black text-[13px] font-medium hover:bg-white/90 disabled:opacity-50 transition-colors"
                    >
                      {sending ? "Sending..." : "Send Reply"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="dash-card p-6 flex flex-col items-center justify-center h-64">
                <div className="w-12 h-12 rounded-lg bg-white/[0.04] flex items-center justify-center mb-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3a3a3a" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <p className="text-sm text-[#3a3a3a]">Select a thread to read</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
