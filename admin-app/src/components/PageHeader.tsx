import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children?: ReactNode;
}

export function PageHeader({ title, subtitle, action, children }: PageHeaderProps) {
  return (
    <header className="h-14 border-b border-[#1a1a1a] flex items-center justify-between px-6 shrink-0">
      <div>
        <h2 className="text-[15px] font-medium text-[#e0e0e0]">{title}</h2>
        {subtitle && <p className="text-[11px] text-[#555] mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {children}
        {action}
      </div>
    </header>
  );
}
