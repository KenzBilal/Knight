"use client";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  animated?: boolean;
}

export function Card({ children, className = "", hover = false, animated = true }: CardProps) {
  return (
    <div
      className={`
        rounded-xl border border-line bg-ink-900 
        ${hover ? "hover:border-flash-500/30 hover:bg-ink-800/50 cursor-pointer" : ""}
        ${animated ? "transition-all duration-200" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-6 py-4 border-b border-line ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  );
}
