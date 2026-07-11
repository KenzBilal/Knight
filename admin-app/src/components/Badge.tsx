import type { ReactNode } from 'react';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default';

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-[#0a2a1a] text-[#4ade80] border-[#1a3a2a]',
  warning: 'bg-[#2a2a0a] text-[#facc15] border-[#3a3a1a]',
  error: 'bg-[#2a0a0a] text-[#f87171] border-[#3a1a1a]',
  info: 'bg-[#0a1a2a] text-[#60a5fa] border-[#1a2a3a]',
  default: 'bg-[#1a1a1a] text-[#888] border-[#2a2a2a]',
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
}

export function Badge({ variant = 'default', children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${variantStyles[variant]}`}>
      {children}
    </span>
  );
}

export function planBadgeColor(plan: string): BadgeVariant {
  switch (plan) {
    case 'pro': return 'success';
    case 'starter': return 'info';
    case 'agency': return 'warning';
    default: return 'default';
  }
}

export function statusBadgeColor(status: string): BadgeVariant {
  switch (status) {
    case 'COMPLETED': case 'CLOSED': case 'approved': return 'success';
    case 'RUNNING': case 'PENDING': case 'pending': return 'info';
    case 'FAILED': case 'FAILED_PERMANENTLY': case 'REJECTED': case 'error': return 'error';
    case 'NEW': case 'AUDITED': return 'warning';
    default: return 'default';
  }
}
