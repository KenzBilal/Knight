"use client";

import { useState } from "react";

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children || (
        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-ink-800 text-paper-400 text-xs cursor-help">
          ?
        </span>
      )}
      {show && (
        <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs text-paper-100 bg-ink-800 border border-line rounded-lg shadow-lg whitespace-nowrap max-w-xs">
          {content}
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-ink-800" />
        </span>
      )}
    </span>
  );
}
