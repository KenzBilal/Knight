"use client";

import { useState, useEffect } from "react";

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

const cardShadow = { boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" };

export default function InboxPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);

  useEffect(() => {
    fetch("/api/inbox")
      .then(r => r.json())
      .then(data => { setThreads(data.threads || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 md:p-8">
      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="bg-white rounded-2xl p-4 animate-pulse" style={cardShadow}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#f0f0f0]" />
                <div className="flex-1">
                  <div className="h-4 w-32 bg-[#f0f0f0] rounded mb-2" />
                  <div className="h-3 w-48 bg-[#f0f0f0] rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : threads.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center" style={cardShadow}>
          <p className="text-4xl mb-3">📬</p>
          <p className="text-sm text-[#999]">No email threads yet</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Thread list */}
          <div className="md:col-span-1 space-y-2">
            {threads.map((thread) => (
              <button
                key={thread.company.id}
                onClick={() => setSelectedThread(thread)}
                className={`w-full text-left rounded-2xl p-4 transition-all duration-150 ${
                  selectedThread?.company.id === thread.company.id
                    ? "bg-[#f5f5f5] ring-1 ring-[#e0e0e0]"
                    : "bg-white hover:bg-[#fafafa]"
                }`}
                style={cardShadow}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#f0f0f0] flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-[#555]">
                      {thread.company.name?.[0]?.toUpperCase() || "?"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#111] truncate">
                        {thread.company.name || "Unknown"}
                      </span>
                      {thread.hasReply && <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-[#999] truncate mt-0.5">
                      {thread.emails[thread.emails.length - 1]?.subject || "No subject"}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Thread detail */}
          <div className="md:col-span-2">
            {selectedThread ? (
              <div className="bg-white rounded-2xl p-6" style={cardShadow}>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display text-lg font-bold text-[#111]">{selectedThread.company.name}</h2>
                  <span className="text-xs text-[#aaa] bg-[#f5f5f5] px-3 py-1 rounded-full">
                    {selectedThread.emails.length} messages
                  </span>
                </div>
                <div className="space-y-3 max-h-[560px] overflow-auto pr-1">
                  {selectedThread.emails.map((email) => (
                    <div
                      key={email.id}
                      className={`rounded-xl p-4 ${
                        email.direction === "outbound"
                          ? "bg-[#f5f5f5] ml-8"
                          : "bg-white border border-[#f0f0f0] mr-8"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-semibold ${
                          email.direction === "outbound" ? "text-[#555]" : "text-green-600"
                        }`}>
                          {email.direction === "outbound" ? "You" : "Prospect"}
                        </span>
                        <span className="text-xs text-[#bbb]">
                          {new Date(email.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-[#444] whitespace-pre-wrap leading-relaxed">
                        {email.body_text || email.subject || "No content"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center h-64" style={cardShadow}>
                <p className="text-2xl mb-2">👈</p>
                <p className="text-sm text-[#aaa]">Select a thread to read</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
