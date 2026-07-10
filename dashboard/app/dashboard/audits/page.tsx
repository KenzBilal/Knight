"use client";

import { HelpModal } from "@/components/HelpModal";
import { EmptyState } from "@/components/EmptyState";

export default function AuditsPage() {
  return (
    <div className="p-8">
      <div className="flex items-center gap-2 mb-6">
        <h1 className="font-display text-2xl text-paper-100">Audits</h1>
        <HelpModal title="Audits">
          <p>The Audits page shows detailed website analysis results for each lead.</p>
          <p><strong>What&apos;s checked (30+ points):</strong></p>
          <p>• <strong>SEO:</strong> Meta tags, headings, mobile responsiveness</p>
          <p>• <strong>Performance:</strong> Page speed, load times, optimization</p>
          <p>• <strong>Security:</strong> SSL, headers, vulnerabilities</p>
          <p>• <strong>Content:</strong> Word count, images, CTAs</p>
          <p>• <strong>Technical:</strong> HTML5, broken links, robots.txt</p>
          <p>Each audit generates a lead score (0-100) indicating how much the business needs your services.</p>
        </HelpModal>
      </div>
      <div className="rounded-xl border border-line bg-ink-900 p-6">
        <EmptyState
          icon="🔍"
          title="No audits yet"
          description="Start a discovery or audit a website to see results. Audits analyze 30+ points across SEO, performance, security, and more."
          action="Run an Audit"
          href="/dashboard"
        />
      </div>
    </div>
  );
}
