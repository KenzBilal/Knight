import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  subtitle?: string;
  color?: string;
}

export function StatCard({ label, value, icon, subtitle, color = '#e0e0e0' }: StatCardProps) {
  return (
    <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg p-4 flex flex-col gap-3 hover:border-[#2a2a2a] transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider text-[#555] font-medium">{label}</span>
        <span className="text-[#444]">{icon}</span>
      </div>
      <div className="text-2xl font-display font-medium" style={{ color }}>{value}</div>
      {subtitle && <div className="text-[11px] text-[#444]">{subtitle}</div>}
    </div>
  );
}
