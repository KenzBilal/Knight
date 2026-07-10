"use client";

import { useState, useEffect } from "react";
import { HelpModal } from "@/components/HelpModal";
import { EmptyState } from "@/components/EmptyState";

interface Email {
  id: string;
  direction: string;
  subject: string;
  body_text: string;
  created_at: string;
}

interface Thread {
  company: {
    id: string;
    name: string;
    website: string;
  };
  emails: Email[];
  lastActivity: string;
  hasReply: boolean;
}

export default function InboxPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);

  useEffect(() => {
    fetch("/api/inbox")
      .then(r => r.json())
      .then(data => {
        setThreads(data.threads || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <div className="flex items-center gap-2 mb-6">
        <h1 className="font-display text-2xl text-paper-100">Inbox</h1>
        <HelpModal title="Inbox">
          <p>The Inbox shows all email conversations with your prospects.</p>
          <p><strong>Features:</strong></p>
          <p>• View inbound and outbound emails</p>
          <p>• Click on any thread to see the full conversation</p>
          <p>• Threads with replies are marked with a green indicator</p>
          <p>• Sort by most recent activity</p>
        </HelpModal>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="rounded-xl border border-line bg-ink-900 p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-ink-800" />
                <div className="flex-1">
                  <div className="h-4 w-32 bg-ink-800 rounded mb-2" />
                  <div className="h-3 w-48 bg-ink-800 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : threads.length === 0 ? (
        <div className="rounded-xl border border-line bg-ink-900 p-6">
          <EmptyState
            icon="📬"
            title="No email threads yet"
            description="Replies from prospects will appear here. Run a discovery and send some pitches to get started."
            action="Start Discovery"
            href="/dashboard"
          />
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Thread List */}
          <div className="md:col-span-1 space-y-2">
            {threads.map((thread) => (
              <button
                key={thread.company.id}
                onClick={() => setSelectedThread(thread)}
                className={`w-full text-left rounded-xl border p-4 transition-colors ${
                  selectedThread?.company.id === thread.company.id
                    ? "border-flash-500/50 bg-ink-800"
                    : "border-line bg-ink-900 hover:bg-ink-800/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-ink-800 flex items-center justify-center">
                    <span className="text-sm text-paper-400">
                      {thread.company.name?.[0]?.toUpperCase() || "?"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-paper-100 truncate">
                        {thread.company.name || "Unknown"}
                      </span>
                      {thread.hasReply && (
                        <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-paper-400 truncate">
                      {thread.emails[thread.emails.length - 1]?.subject || "No subject"}
                    </p>
                  </div>
                  <span className="text-xs text-paper-400">
                    {new Date(thread.lastActivity).toLocaleDateString()}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Thread Detail */}
          <div className="md:col-span-2">
            {selectedThread ? (
              <div className="rounded-xl border border-line bg-ink-900 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-display text-lg text-paper-100">
                      {selectedThread.company.name}
                    </h2>
                    <p className="text-xs text-paper-400">
                      {selectedThread.company.website || "No website"}
                    </p>
                  </div>
                  <span className="text-xs text-paper-400">
                    {selectedThread.emails.length} messages
                  </span>
                </div>

                <div className="space-y-4 max-h-[600px] overflow-auto">
                  {selectedThread.emails.map((email) => (
                    <div
                      key={email.id}
                      className={`rounded-lg p-4 ${
                        email.direction === "outbound"
                          ? "bg-flash-500/5 border border-flash-500/20 ml-8"
                          : "bg-ink-950 border border-line mr-8"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-medium ${
                          email.direction === "outbound" ? "text-flash-500" : "text-green-500"
                        }`}>
                          {email.direction === "outbound" ? "You" : "Prospect"}
                        </span>
                        <span className="text-xs text-paper-400">
                          {new Date(email.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-paper-200 whitespace-pre-wrap">
                        {email.body_text || email.subject || "No content"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-line bg-ink-900 p-6 flex items-center justify-center h-64">
                <p className="text-sm text-paper-400">Select a thread to view conversation</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
