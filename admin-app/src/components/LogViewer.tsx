import { useEffect, useRef } from 'react';

interface LogViewerProps {
  logs: string[];
  maxHeight?: string;
}

export function LogViewer({ logs, maxHeight = '100%' }: LogViewerProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const colorize = (line: string) => {
    if (line.includes('[ERROR]') || line.includes('error')) return 'text-[#f87171]';
    if (line.includes('[STATUS]') || line.includes('status')) return 'text-[#facc15]';
    if (line.includes('Discover') || line.includes('Job') || line.includes('Scrape')) return 'text-[#e0e0e0]';
    if (line.includes('[Heartbeat]')) return 'text-[#4ade80]';
    if (line.includes('[Telegram]')) return 'text-[#60a5fa]';
    return 'text-[#777]';
  };

  return (
    <div
      className="bg-[#080808] border border-[#1a1a1a] rounded-lg overflow-y-auto p-4 font-mono text-[11px] leading-relaxed"
      style={{ maxHeight }}
    >
      {logs.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-[#333]">
          Awaiting log stream...
        </div>
      ) : (
        logs.map((log, i) => (
          <div key={i} className={`mb-0.5 break-words whitespace-pre-wrap ${colorize(log)}`}>
            {log}
          </div>
        ))
      )}
      <div ref={endRef} />
    </div>
  );
}
