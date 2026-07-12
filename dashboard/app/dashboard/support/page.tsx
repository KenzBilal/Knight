"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Ticket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  category: string;
  created_at: string;
  updated_at: string;
  last_seen_at: string | null;
}

interface Reply {
  id: string;
  ticket_id: string;
  sender_type: string;
  sender_id: string;
  message: string;
  created_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function getStatusStyle(status: string) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    open:        { bg: "bg-blue-50",  text: "text-blue-600",  label: "Open" },
    "in-progress": { bg: "bg-yellow-50", text: "text-yellow-600", label: "In Progress" },
    resolved:    { bg: "bg-green-50", text: "text-green-600", label: "Resolved" },
    closed:      { bg: "bg-gray-100", text: "text-gray-500",  label: "Closed" },
  };
  return map[status] || { bg: "bg-gray-100", text: "text-gray-500", label: status };
}

function getPriorityStyle(p: string) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    low:    { bg: "bg-gray-100", text: "text-gray-500", label: "Low" },
    medium: { bg: "bg-blue-50",  text: "text-blue-600",  label: "Medium" },
    high:   { bg: "bg-orange-50", text: "text-orange-600", label: "High" },
    urgent: { bg: "bg-red-50",   text: "text-red-600",   label: "Urgent" },
  };
  return map[p] || { bg: "bg-gray-100", text: "text-gray-500", label: p };
}

function getCategoryLabel(c: string) {
  const map: Record<string, string> = {
    bug: "Bug Report",
    feature: "Feature Request",
    billing: "Billing",
    other: "General",
  };
  return map[c] || c;
}

function playDing() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.value = 0.15;
    osc.frequency.value = 880;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.stop(ctx.currentTime + 0.2);
  } catch {}
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [newCategory, setNewCategory] = useState("other");
  const [creating, setCreating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const replyIdsRef = useRef<Set<string>>(new Set());

  // Fetch tickets
  useEffect(() => {
    fetch("/api/support")
      .then((r) => r.json())
      .then((d) => {
        const list = d.tickets || [];
        setTickets(list);
        // Cache reply IDs to avoid duplicates
        list.forEach((t: Ticket) => replyIdsRef.current.add(t.id));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Fetch replies when ticket selected
  useEffect(() => {
    if (!selectedTicket) return;
    setLoadingReplies(true);
    fetch(`/api/support/${selectedTicket.id}`)
      .then((r) => r.json())
      .then((d) => {
        const list = d.replies || [];
        setReplies(list);
        // Track existing reply IDs
        list.forEach((r: Reply) => replyIdsRef.current.add(r.id));
      })
      .catch(() => {})
      .finally(() => setLoadingReplies(false));
  }, [selectedTicket]);

  // ─── Realtime: live replies for selected ticket ──────────────────────────
  useEffect(() => {
    if (!selectedTicket) return;

    const channel = supabase
      .channel(`support-replies-${selectedTicket.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_replies",
          filter: `ticket_id=eq.${selectedTicket.id}`,
        },
        (payload) => {
          const newReply = payload.new as Reply;
          // Dedup
          if (replyIdsRef.current.has(newReply.id)) return;
          replyIdsRef.current.add(newReply.id);

          setReplies((prev) => [...prev, newReply]);

          // Sound + notification for admin replies
          if (newReply.sender_type === "admin") {
            playDing();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedTicket]);

  // ─── Realtime: live ticket status updates ───────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel("support-tickets-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "support_tickets",
        },
        (payload) => {
          const updated = payload.new as Ticket;
          setTickets((prev) =>
            prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t))
          );
          setSelectedTicket((prev) =>
            prev?.id === updated.id ? { ...prev, ...updated } : prev
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Scroll to bottom on new reply
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [replies]);

  // Create new ticket
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newSubject.trim() || !newMessage.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: newSubject.trim(),
          message: newMessage.trim(),
          category: newCategory,
        }),
      });
      if (res.ok) {
        const { ticket } = await res.json();
        setTickets((prev) => [ticket, ...prev]);
        setShowNewForm(false);
        setNewSubject("");
        setNewMessage("");
        setNewCategory("other");
        setSelectedTicket(ticket);
      }
    } catch {}
    setCreating(false);
  }

  // Send reply
  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;
    setSending(true);
    try {
      const res = await fetch(`/api/support/${selectedTicket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyText.trim() }),
      });
      if (res.ok) {
        setReplyText("");
        // Realtime will add the reply automatically
      }
    } catch {}
    setSending(false);
  }

  // ─── Thread view ──────────────────────────────────────────────────────────
  if (selectedTicket) {
    const ss = getStatusStyle(selectedTicket.status);
    return (
      <div className="p-6 md:p-8 h-full flex flex-col">
        {/* Back + header */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setSelectedTicket(null)}
            className="w-9 h-9 rounded-xl border border-[#ebebeb] flex items-center justify-center text-[#666] hover:bg-[#f0f0f0] transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-lg font-bold text-[#111] truncate">
              {selectedTicket.subject}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ss.bg} ${ss.text}`}>
                {ss.label}
              </span>
              <span className="text-xs text-[#aaa]">
                {getCategoryLabel(selectedTicket.category)}
              </span>
              <span className="text-xs text-[#aaa]">
                {timeAgo(selectedTicket.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
          {loadingReplies ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#f0f0f0] flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-[#f0f0f0] rounded w-24" />
                  <div className="h-16 bg-[#f0f0f0] rounded-xl w-3/4" />
                </div>
              </div>
            ))
          ) : replies.length === 0 ? (
            <div className="text-center py-12 text-sm text-[#bbb]">
              No messages yet.
            </div>
          ) : (
            replies.map((reply) => {
              const isUser = reply.sender_type === "user";
              return (
                <div
                  key={reply.id}
                  className={`flex gap-3 ${isUser ? "justify-end" : ""}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-full bg-[#111] flex items-center justify-center flex-shrink-0">
                      <svg width="14" height="14" viewBox="0 0 32 32" fill="none">
                        <path d="M16 2C10 2 5 6.5 5 12v8c0 5.5 5 10 11 10s11-4.5 11-10v-8c0-5.5-5-10-11-10z" fill="#333"/>
                        <path d="M16 6l-1 18h2L16 6z" fill="#fff"/>
                        <path d="M13 14l6-3v2l-4 2 4 2v2l-6-3z" fill="#fff"/>
                      </svg>
                    </div>
                  )}
                  <div className={`max-w-[75%] ${isUser ? "order-1" : ""}`}>
                    <p className={`text-xs mb-1 ${isUser ? "text-right text-[#aaa]" : "text-[#aaa]"}`}>
                      {isUser ? "You" : "Knight"} · {timeAgo(reply.created_at)}
                    </p>
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                        isUser
                          ? "bg-[#111] text-white rounded-tr-md"
                          : "bg-[#f5f5f5] text-[#333] border border-[#ebebeb] rounded-tl-md"
                      }`}
                    >
                      {reply.message}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply input */}
        <form onSubmit={handleReply} className="flex gap-2">
          <input
            type="text"
            placeholder="Type a reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            disabled={sending}
            className="flex-1 bg-[#f5f5f5] border border-[#ebebeb] rounded-xl px-4 py-3 text-sm text-[#333] placeholder:text-[#bbb] focus:outline-none focus:border-[#ccc] transition-all"
          />
          <button
            type="submit"
            disabled={sending || !replyText.trim()}
            className="bg-[#111] text-white rounded-xl px-5 py-3 text-sm font-medium hover:bg-[#222] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {sending ? (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.2"/><path d="M22 12a10 10 0 0 0-10-10"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            )}
            Send
          </button>
        </form>
      </div>
    );
  }

  // ─── Ticket list ──────────────────────────────────────────────────────────
  return (
    <div className="p-6 md:p-8">
      {/* Header + new ticket button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-lg font-bold text-[#111]">Support Tickets</h2>
          <p className="text-sm text-[#aaa] mt-0.5">Get help from the Knight team</p>
        </div>
        <button
          onClick={() => setShowNewForm(true)}
          className="bg-[#111] text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-[#222] transition-colors flex items-center gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Ticket
        </button>
      </div>

      {/* New ticket form */}
      {showNewForm && (
        <div className="bg-white rounded-2xl p-6 mb-6 border border-[#ebebeb]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base font-semibold text-[#111]">New Support Ticket</h3>
            <button
              onClick={() => setShowNewForm(false)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#aaa] hover:text-[#333] hover:bg-[#f0f0f0] transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Subject"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                required
                className="flex-1 bg-[#f7f7f7] border border-[#ebebeb] rounded-xl px-4 py-2.5 text-sm text-[#333] placeholder:text-[#bbb] focus:outline-none focus:border-[#ccc] transition-all"
              />
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="bg-[#f7f7f7] border border-[#ebebeb] rounded-xl px-4 py-2.5 text-sm text-[#333] focus:outline-none focus:border-[#ccc] transition-all appearance-none cursor-pointer"
              >
                <option value="other">General</option>
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="billing">Billing</option>
              </select>
            </div>
            <textarea
              placeholder="Describe your issue..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              required
              rows={4}
              className="w-full bg-[#f7f7f7] border border-[#ebebeb] rounded-xl px-4 py-3 text-sm text-[#333] placeholder:text-[#bbb] focus:outline-none focus:border-[#ccc] transition-all resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNewForm(false)}
                className="px-4 py-2 text-sm text-[#666] hover:text-[#333] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating || !newSubject.trim() || !newMessage.trim()}
                className="bg-[#111] text-white rounded-xl px-5 py-2 text-sm font-medium hover:bg-[#222] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {creating ? "Creating..." : "Create Ticket"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Ticket list */}
      <div className="bg-white rounded-2xl overflow-hidden border border-[#ebebeb]">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse px-6 py-5 border-b border-[#f0f0f0] last:border-0">
              <div className="flex items-center gap-3">
                <div className="h-3 bg-[#f0f0f0] rounded w-48" />
                <div className="h-5 bg-[#f0f0f0] rounded-full w-16" />
              </div>
              <div className="h-2.5 bg-[#f0f0f0] rounded w-32 mt-2" />
            </div>
          ))
        ) : tickets.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 rounded-full bg-[#f5f5f5] flex items-center justify-center mx-auto mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <p className="text-sm text-[#999] mb-1">No tickets yet</p>
            <p className="text-xs text-[#bbb]">Create a ticket to get help from our team</p>
          </div>
        ) : (
          tickets.map((ticket) => {
            const ss = getStatusStyle(ticket.status);
            const ps = getPriorityStyle(ticket.priority);
            return (
              <button
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className="w-full px-6 py-5 border-b border-[#f0f0f0] last:border-0 hover:bg-[#fafafa] transition-colors text-left flex items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-[#111] truncate">
                      {ticket.subject}
                    </span>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${ss.bg} ${ss.text}`}>
                      {ss.label}
                    </span>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${ps.bg} ${ps.text}`}>
                      {ps.label}
                    </span>
                  </div>
                  <p className="text-xs text-[#aaa]">
                    {getCategoryLabel(ticket.category)} · {timeAgo(ticket.updated_at || ticket.created_at)}
                  </p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
