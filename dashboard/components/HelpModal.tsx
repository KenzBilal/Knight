"use client";

import { useState } from "react";

interface HelpModalProps {
  title: string;
  children: React.ReactNode;
}

export function HelpModal({ title, children }: HelpModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-ink-800 text-paper-400 text-xs hover:bg-ink-700 hover:text-paper-200 transition-colors"
        title={`Help: ${title}`}
      >
        ?
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setOpen(false)}>
          <div
            className="bg-ink-900 border border-line rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-line">
              <h2 className="font-display text-lg text-paper-100">{title}</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-paper-400 hover:text-paper-200 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-4 text-sm text-paper-300 leading-relaxed space-y-3">
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
