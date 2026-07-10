"use client";

interface SkeletonProps {
  className?: string;
  count?: number;
}

export function Skeleton({ className = "", count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-ink-800 rounded ${className}`}
        />
      ))}
    </>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-line bg-ink-900 p-6 animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-ink-800" />
        <div className="flex-1">
          <div className="h-4 w-32 bg-ink-800 rounded mb-2" />
          <div className="h-3 w-48 bg-ink-800 rounded" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-3 w-full bg-ink-800 rounded" />
        <div className="h-3 w-3/4 bg-ink-800 rounded" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-line bg-ink-900 animate-pulse">
          <div className="w-10 h-10 rounded bg-ink-800" />
          <div className="flex-1">
            <div className="h-4 w-32 bg-ink-800 rounded mb-2" />
            <div className="h-3 w-48 bg-ink-800 rounded" />
          </div>
          <div className="h-6 w-16 bg-ink-800 rounded" />
        </div>
      ))}
    </div>
  );
}
