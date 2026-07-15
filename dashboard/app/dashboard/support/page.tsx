"use client";

import { useState, useEffect, useRef } from "react";

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

// ─── Status Config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, {
  label: string;
  bg: string;
  text: string;
  dot: string;
  canReply: boolean;
  shade: string;
  hint: string;
}> = {
  open: {
    label: "Open",
    bg: "bg-blue-50",
    text: "text-blue-600",
    dot: "bg-blue-500",
    canReply: true,
    shade: "",
    hint: "",
  },
  "in-progress": {
    label: "In Progress",
    bg: "bg-amber-50",
    text: "text-amber-600",
    dot: "bg-amber-500",
    canReply: true,
    shade: "",
    hint: "A support agent is reviewing your request",
  },
  resolved: {
    label: "Resolved",
    bg: "bg-green-50",
    text: "text-green-600",
    dot: "bg-green-500",
    canReply: false,
    shade: "bg-green-50/50",
    hint: "This ticket has been resolved. Create a new ticket if you need further help.",
  },
  closed: {
    label: "Closed",
    bg: "bg-gray-100",
    text: "text-gray-500",
    dot: "bg-gray-400",
    canReply: false,
    shade: "bg-gray-50/80",
    hint: "This ticket is closed.",
  },
};

const PRIORITY_CONFIG: Record<string, { bg: string; text: string; label: string; icon: string }> = {
  low:    { bg: "bg-gray-100", text: "text-gray-500", label: "Low", icon: "↓" },
  medium: { bg: "bg-blue-50",  text: "text-blue-600",  label: "Medium", icon: "→" },
  high:   { bg: "bg-orange-50", text: "text-orange-600", label: "High", icon: "↑" },
  urgent: { bg: "bg-red-50",   text: "text-red-600",   label: "Urgent", icon: "!!" },
};

const CATEGORIES: Record<string, string> = {
  bug: "Bug Report",
  feature: "Feature Request",
  billing: "Billing",
  other: "General",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatTime(d: string) {
  return new Date(d).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true,
  });
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
  const prevReplyCountRef = useRef(0);
  const replyIdsRef = useRef<Set<string>>(new Set());

  // Fetch tickets
  useEffect(() => {
    fetch("/api/support")
      .then((r) => r.json())
      .then((d) => setTickets(d.tickets || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Fetch replies when ticket selected
  useEffect(() => {
    if (!selectedTicket) return;
    setLoadingReplies(true);
    replyIdsRef.current.clear();
    fetch(`/api/support/${selectedTicket.id}`)
      .then((r) => r.json())
      .then((d) => {
        const list = d.replies || [];
        setReplies(list);
        prevReplyCountRef.current = list.length;
        list.forEach((r: Reply) => replyIdsRef.current.add(r.id));
      })
      .catch(() => {})
      .finally(() => setLoadingReplies(false));
  }, [selectedTicket]);

  // Poll replies every 5s
  useEffect(() => {
    if (!selectedTicket) return;
    const poll = async () => {
      try {
        const res = await fetch(`/api/support/${selectedTicket.id}`);
        const d = await res.json();
        const newReplies: Reply[] = d.replies || [];
        const newOnes = newReplies.filter((r: Reply) => !replyIdsRef.current.has(r.id));
        if (newOnes.length > 0) {
          newOnes.forEach((r: Reply) => replyIdsRef.current.add(r.id));
          setReplies(newReplies);
          if (newOnes.some((r: Reply) => r.sender_type === "admin")) playDing();
        }
        // Sync status changes
        if (d.ticket && d.ticket.status !== selectedTicket.status) {
          setSelectedTicket(d.ticket);
          setTickets((prev) => prev.map((t) => t.id === d.ticket.id ? d.ticket : t));
        }
      } catch {}
    };
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [selectedTicket]);

  // Poll ticket list every 10s
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch("/api/support");
        const d = await res.json();
        if (d.tickets) setTickets(d.tickets);
      } catch {}
    };
    const interval = setInterval(poll, 10000);
    return () => clearInterval(interval);
  }, []);

  // Scroll only when new reply added
  useEffect(() => {
    if (replies.length > prevReplyCountRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevReplyCountRef.current = replies.length;
  }, [replies.length]);

  // Create ticket
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newSubject.trim() || !newMessage.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: newSubject.trim(), message: newMessage.trim(), category: newCategory }),
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
    const cfg = STATUS_CONFIG[selectedTicket.status];
    if (!cfg?.canReply) return;
    setSending(true);
    try {
      const res = await fetch(`/api/support/${selectedTicket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyText.trim() }),
      });
      if (res.ok) setReplyText("");
    } catch {}
    setSending(false);
  }

  // ─── Thread View ────────────────────────────────────────────────────────────
  if (selectedTicket) {
    const statusCfg = STATUS_CONFIG[selectedTicket.status] || STATUS_CONFIG.open;
    const priorityCfg = PRIORITY_CONFIG[selectedTicket.priority] || PRIORITY_CONFIG.medium;
    const canReply = statusCfg.canReply;
    const replyCount = replies.filter((r) => r.sender_type === "user").length;
    const adminReplyCount = replies.filter((r) => r.sender_type === "admin").length;

    return (
      <div className={`p-6 md:p-8 h-full flex flex-col ${statusCfg.shade}`}>
        {/* Header */}
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
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg font-bold text-[#111] truncate">
                {selectedTicket.subject}
              </h2>
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${statusCfg.bg} ${statusCfg.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                {statusCfg.label}
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${priorityCfg.bg} ${priorityCfg.text}`}>
                <span className="text-[9px]">{priorityCfg.icon}</span>
                {priorityCfg.label}
              </span>
              <span className="text-[11px] text-[#bbb]">{CATEGORIES[selectedTicket.category] || selectedTicket.category}</span>
              <span className="text-[11px] text-[#ccc]">·</span>
              <span className="text-[11px] text-[#bbb]">{formatTime(selectedTicket.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Status banner for closed/resolved */}
        {!canReply && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm flex items-center gap-3 ${
            selectedTicket.status === "resolved"
              ? "bg-green-50 text-green-700 border border-green-100"
              : "bg-gray-50 text-gray-600 border border-gray-200"
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              selectedTicket.status === "resolved" ? "bg-green-100" : "bg-gray-200"
            }`}>
              {selectedTicket.status === "resolved" ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              )}
            </div>
            <div>
              <p className="font-medium text-[13px]">{statusCfg.hint}</p>
              {selectedTicket.status === "resolved" && (
                <p className="text-[11px] text-green-600/70 mt-0.5">You can still view this conversation below.</p>
              )}
            </div>
          </div>
        )}

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
            <div className="text-center py-12 text-sm text-[#bbb]">No messages yet.</div>
          ) : (
            replies.map((reply, idx) => {
              const isUser = reply.sender_type === "user";
              const showAvatar = idx === 0 || replies[idx - 1]?.sender_type !== reply.sender_type;
              return (
                <div key={reply.id} className={`flex gap-3 ${isUser ? "justify-end" : ""}`}>
                  {!isUser && (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-opacity ${!canReply ? "opacity-50" : ""} ${
                      showAvatar ? "bg-[#111]" : "bg-transparent"
                    }`}>
                      {showAvatar && (
                        <svg width="14" height="14" viewBox="0 0 32 32" fill="none">
                          <path d="M16 2C10 2 5 6.5 5 12v8c0 5.5 5 10 11 10s11-4.5 11-10v-8c0-5.5-5-10-11-10z" fill="#333"/>
                          <path d="M16 6l-1 18h2L16 6z" fill="#fff"/>
                          <path d="M13 14l6-3v2l-4 2 4 2v2l-6-3z" fill="#fff"/>
                        </svg>
                      )}
                    </div>
                  )}
                  {!isUser && !showAvatar && <div className="w-8" />}
                  <div className={`max-w-[75%] ${isUser ? "order-1" : ""}`}>
                    {(showAvatar || isUser) && (
                      <p className={`text-[11px] mb-1 ${isUser ? "text-right text-[#aaa]" : "text-[#aaa]"}`}>
                        {isUser ? "You" : "Knight Support"} · {formatTime(reply.created_at)}
                      </p>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap transition-opacity ${
                        !canReply ? "opacity-70" : ""
                      } ${
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
        <div className={`${!canReply ? "pointer-events-none" : ""}`}>
          <form onSubmit={handleReply} className="flex gap-2">
            <input
              type="text"
              placeholder={canReply ? "Type a reply..." : "This ticket is " + selectedTicket.status}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              disabled={sending || !canReply}
              className={`flex-1 border rounded-xl px-4 py-3 text-sm transition-all ${
                canReply
                  ? "bg-[#f5f5f5] border-[#ebebeb] text-[#333] placeholder:text-[#bbb] focus:outline-none focus:border-[#ccc]"
                  : "bg-[#f9f9f9] border-[#eee] text-[#ccc] placeholder:text-[#ddd] cursor-not-allowed"
              }`}
            />
            <button
              type="submit"
              disabled={sending || !replyText.trim() || !canReply}
              className={`rounded-xl px-5 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
                canReply
                  ? "bg-[#111] text-white hover:bg-[#222] disabled:opacity-40 disabled:cursor-not-allowed"
                  : "bg-[#e5e5e5] text-[#bbb] cursor-not-allowed"
              }`}
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

        {/* Thread metadata */}
        <div className="mt-3 flex items-center justify-between text-[11px] text-[#ccc]">
          <span>{replies.length} messages · {replyCount} from you · {adminReplyCount} from support</span>
          <span>Created {formatTime(selectedTicket.created_at)}</span>
        </div>
      </div>
    );
  }

  // ─── Ticket List ────────────────────────────────────────────────────────────
  return (
    <div className="p-6 md:p-8">
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

      {showNewForm && (
        <div className="bg-white rounded-2xl p-6 mb-6 border border-[#ebebeb]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base font-semibold text-[#111]">New Support Ticket</h3>
            <button onClick={() => setShowNewForm(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#aaa] hover:text-[#333] hover:bg-[#f0f0f0] transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="flex gap-3">
              <input type="text" placeholder="Subject" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} required
                className="flex-1 bg-[#f7f7f7] border border-[#ebebeb] rounded-xl px-4 py-2.5 text-sm text-[#333] placeholder:text-[#bbb] focus:outline-none focus:border-[#ccc] transition-all" />
              <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
                className="bg-[#f7f7f7] border border-[#ebebeb] rounded-xl px-4 py-2.5 text-sm text-[#333] focus:outline-none focus:border-[#ccc] transition-all appearance-none cursor-pointer">
                <option value="other">General</option>
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="billing">Billing</option>
              </select>
            </div>
            <textarea placeholder="Describe your issue..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} required rows={4}
              className="w-full bg-[#f7f7f7] border border-[#ebebeb] rounded-xl px-4 py-3 text-sm text-[#333] placeholder:text-[#bbb] focus:outline-none focus:border-[#ccc] transition-all resize-none" />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowNewForm(false)} className="px-4 py-2 text-sm text-[#666] hover:text-[#333] transition-colors">Cancel</button>
              <button type="submit" disabled={creating || !newSubject.trim() || !newMessage.trim()}
                className="bg-[#111] text-white rounded-xl px-5 py-2 text-sm font-medium hover:bg-[#222] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
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
            const sc = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
            const pc = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.medium;
            const isClosed = ticket.status === "closed" || ticket.status === "resolved";
            return (
              <button
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`w-full px-6 py-5 border-b border-[#f0f0f0] last:border-0 transition-colors text-left flex items-center gap-4 ${
                  isClosed ? "opacity-60 hover:opacity-80" : "hover:bg-[#fafafa]"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-medium text-sm truncate ${isClosed ? "text-[#999]" : "text-[#111]"}`}>
                      {ticket.subject}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${sc.bg} ${sc.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                      {sc.label}
                    </span>
                    <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${pc.bg} ${pc.text}`}>
                      <span className="text-[8px]">{pc.icon}</span>
                      {pc.label}
                    </span>
                  </div>
                  <p className="text-xs text-[#aaa]">
                    {CATEGORIES[ticket.category] || ticket.category} · {timeAgo(ticket.updated_at || ticket.created_at)}
                    {isClosed && <span className="ml-2 text-[#ccc]">— No longer accepting replies</span>}
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
