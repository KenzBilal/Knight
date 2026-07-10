"use client";

import { HelpModal } from "@/components/HelpModal";
import { EmptyState } from "@/components/EmptyState";

export default function PitchesPage() {
  return (
    <div className="p-8">
      <div className="flex items-center gap-2 mb-6">
        <h1 className="font-display text-2xl text-paper-100">Pitches</h1>
        <HelpModal title="AI Pitches">
          <p>The Pitches page shows AI-generated outreach messages for each lead.</p>
          <p><strong>How it works:</strong></p>
          <p>• Knight runs a website audit on each lead</p>
          <p>• AI analyzes the audit results and generates a personalized pitch</p>
          <p>• Pitches highlight specific issues and how your services can fix them</p>
          <p>• You can edit pitches before they&apos;re sent</p>
          <p><strong>Best practices:</strong></p>
          <p>• Review pitches to ensure they match your tone</p>
          <p>• Add personal touches for high-value leads</p>
          <p>• Use the &quot;Send&quot; button to approve and send pitches</p>
        </HelpModal>
      </div>
      <div className="rounded-xl border border-line bg-ink-900 p-6">
        <EmptyState
          icon="✨"
          title="No pitches yet"
          description="AI-generated pitches will appear here after audits. Run a discovery to find leads and generate pitches automatically."
          action="Start Discovery"
          href="/dashboard"
        />
      </div>
    </div>
  );
}
