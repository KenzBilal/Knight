import { useState, useEffect } from 'react';
import { Users, Building2, Target, Mail, ListTodo, Activity } from 'lucide-react';
import { StatCard } from './StatCard';
import { dbSelect, dbCount } from '../lib/supabase';
import { LogViewer } from './LogViewer';

export function Overview() {
  const [stats, setStats] = useState({
    users: 0, orgs: 0, leads: 0, emails: 0, jobs: 0, activeJobs: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    loadStats();
    loadLogs();
  }, []);

  async function loadStats() {
    setLoading(true);
    try {
      const [usersRes, orgsRes, leadsRes, emailsRes, jobsRes, activeRes] = await Promise.all([
        dbCount('org_members'),
        dbCount('orgs'),
        dbCount('companies'),
        dbCount('emails'),
        dbCount('jobs'),
        dbCount('jobs', { status: 'RUNNING' }),
      ]);

      setStats({
        users: usersRes.data || 0,
        orgs: orgsRes.data || 0,
        leads: leadsRes.data || 0,
        emails: emailsRes.data || 0,
        jobs: jobsRes.data || 0,
        activeJobs: activeRes.data || 0,
      });

      const activityRes = await dbSelect('activity_log', {
        order: { column: 'created_at', ascending: false },
        limit: 10,
      });
      setRecentActivity(activityRes.data || []);
    } catch {
      // Stats failed to load — show zeros
    }
    setLoading(false);
  }

  async function loadLogs() {
    try {
      if (window.electronAPI?.getLogs) {
        const result = await window.electronAPI.getLogs();
        const cached = (result as any)?.data || result;
        if (Array.isArray(cached)) setLogs(cached.slice(-50));
      }
    } catch {
      // Logs unavailable
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="h-14 border-b border-[#1a1a1a] flex items-center justify-between px-6 shrink-0">
        <h2 className="text-[15px] font-medium text-[#e0e0e0]">Dashboard</h2>
        <button onClick={loadStats} className="text-[11px] text-[#555] hover:text-[#aaa] transition-colors">
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </header>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Users" value={stats.users} icon={<Users size={16} />} />
          <StatCard label="Organizations" value={stats.orgs} icon={<Building2 size={16} />} />
          <StatCard label="Leads" value={stats.leads} icon={<Target size={16} />} />
          <StatCard label="Emails Sent" value={stats.emails} icon={<Mail size={16} />} />
          <StatCard label="Total Jobs" value={stats.jobs} icon={<ListTodo size={16} />} />
          <StatCard label="Active Jobs" value={stats.activeJobs} icon={<Activity size={16} />} color={stats.activeJobs > 0 ? '#4ade80' : '#e0e0e0'} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-[11px] uppercase tracking-wider text-[#555] font-medium mb-3">Recent Activity</h3>
            <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg overflow-hidden">
              {recentActivity.length === 0 ? (
                <div className="p-4 text-center text-[#444] text-[12px]">No recent activity</div>
              ) : (
                <div className="divide-y divide-[#141414]">
                  {recentActivity.map((a: any, i: number) => (
                    <div key={a.id ?? i} className="px-4 py-2.5 flex items-center justify-between">
                      <span className="text-[12px] text-[#888] truncate">{a.message || 'Unknown event'}</span>
                      <span className="text-[10px] text-[#444] shrink-0 ml-3">
                        {a.created_at ? new Date(a.created_at).toLocaleTimeString() : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-[11px] uppercase tracking-wider text-[#555] font-medium mb-3">Worker Logs</h3>
            <LogViewer logs={logs} maxHeight="240px" />
          </div>
        </div>
      </div>
    </div>
  );
}
