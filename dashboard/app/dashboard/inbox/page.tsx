"use client";

import { HelpModal } from "@/components/HelpModal";
import { EmptyState } from "@/components/EmptyState";

export default function InboxPage() {
  return (
    <div className="p-8">
      <div className="flex items-center gap-2 mb-6">
        <h1 className="font-display text-2xl text-paper-100">Inbox</h1>
        <HelpModal title="Inbox">
          <p>The Inbox shows all email conversations with your prospects.</p>
          <p><strong>Features:</strong></p>
          <p>• View inbound and outbound emails</p>
          <p>• Reply directly from the dashboard</p>
          <p>• See conversation history with each prospect</p>
          <p>• Track which pitches got responses</p>
          <p>When a prospect replies to your outreach, it appears here. Click on any thread to view the full conversation and respond.</p>
        </HelpModal>
      </div>
      <div className="rounded-xl border border-line bg-ink-900 p-6">
        <EmptyState
          icon="📬"
          title="No email threads yet"
          description="Replies from prospects will appear here. Run a discovery and send some pitches to get started."
          action="Start Discovery"
          href="/dashboard"
        />
      </div>
    </div>
  );
}
