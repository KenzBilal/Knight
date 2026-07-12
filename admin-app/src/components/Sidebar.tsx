import {
  LayoutDashboard, Activity, Users, Building2, CreditCard, Tag,
  ListTodo, Target, Mail, MessageCircle, Key, Cpu, ScrollText,
  Terminal, Settings, ChevronDown, UserCog
} from 'lucide-react';
import { useState } from 'react';

export type Tab =
  | 'overview' | 'activity'
  | 'users' | 'orgs' | 'billing' | 'plans' | 'team'
  | 'jobs' | 'leads' | 'emails' | 'telegram'
  | 'api-hub' | 'worker' | 'logs' | 'environment'
  | 'settings';

interface SidebarProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

interface NavGroup {
  label: string;
  items: { id: Tab; icon: any; label: string }[];
}

const groups: NavGroup[] = [
  {
    label: 'OVERVIEW',
    items: [
      { id: 'overview', icon: LayoutDashboard, label: 'Dashboard' },
      { id: 'activity', icon: Activity, label: 'Activity Log' },
    ],
  },
  {
    label: 'MANAGEMENT',
    items: [
      { id: 'users', icon: Users, label: 'Users' },
      { id: 'orgs', icon: Building2, label: 'Organizations' },
      { id: 'team', icon: UserCog, label: 'Team' },
      { id: 'billing', icon: CreditCard, label: 'Billing' },
      { id: 'plans', icon: Tag, label: 'Plans' },
    ],
  },
  {
    label: 'DATA',
    items: [
      { id: 'jobs', icon: ListTodo, label: 'Jobs Queue' },
      { id: 'leads', icon: Target, label: 'Leads' },
      { id: 'emails', icon: Mail, label: 'Emails' },
      { id: 'telegram', icon: MessageCircle, label: 'Telegram' },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { id: 'api-hub', icon: Key, label: 'API Hub' },
      { id: 'worker', icon: Cpu, label: 'Worker' },
      { id: 'logs', icon: ScrollText, label: 'Log Viewer' },
      { id: 'environment', icon: Terminal, label: 'Environment' },
    ],
  },
];

export function Sidebar({ active, onChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleGroup = (label: string) => {
    setCollapsed(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div className="w-52 bg-[#0a0a0a] border-r border-[#1a1a1a] flex flex-col shrink-0 overflow-y-auto">
      <div className="flex-1 py-3">
        {groups.map(group => (
          <div key={group.label} className="mb-1">
            <button
              onClick={() => toggleGroup(group.label)}
              className="w-full flex items-center justify-between px-4 py-1.5 text-[10px] tracking-[0.15em] text-[#444] uppercase font-medium hover:text-[#666] transition-colors"
            >
              {group.label}
              <ChevronDown
                size={10}
                className={`transition-transform ${collapsed[group.label] ? '-rotate-90' : ''}`}
              />
            </button>
            {!collapsed[group.label] && (
              <div className="space-y-0.5 px-2">
                {group.items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => onChange(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded text-[13px] transition-colors ${
                      active === item.id
                        ? 'bg-[#1a1a1a] text-[#e0e0e0]'
                        : 'text-[#666] hover:text-[#aaa] hover:bg-[#111]'
                    }`}
                  >
                    <item.icon size={14} strokeWidth={1.5} />
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-[#1a1a1a] p-3">
        <button
          onClick={() => onChange('settings')}
          className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded text-[13px] transition-colors ${
            active === 'settings'
              ? 'bg-[#1a1a1a] text-[#e0e0e0]'
              : 'text-[#666] hover:text-[#aaa] hover:bg-[#111]'
          }`}
        >
          <Settings size={14} strokeWidth={1.5} />
          Settings
        </button>
      </div>
    </div>
  );
}
