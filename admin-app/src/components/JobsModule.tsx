import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { PageHeader } from './PageHeader';
import { DataTable } from './DataTable';
import { Badge, statusBadgeColor } from './Badge';
import { SearchInput } from './SearchInput';
import { dbSelect } from '../lib/supabase';

export function JobsModule() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  async function load() {
    setLoading(true);
    const filters: Record<string, any> = {};
    if (statusFilter !== 'all') filters.status = statusFilter;

    const res = await dbSelect('jobs', {
      filters,
      order: { column: 'created_at', ascending: false },
      limit: 200,
    });
    setJobs(res.data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [statusFilter]);

  const filtered = jobs.filter(j =>
    j.type?.toLowerCase().includes(search.toLowerCase()) ||
    j.org_id?.includes(search)
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader title="Jobs Queue" subtitle={`${jobs.length} jobs`}>
        <div className="flex items-center gap-2">
          {['all', 'PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'FAILED_PERMANENTLY'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                statusFilter === s ? 'bg-[#1a1a1a] text-[#e0e0e0]' : 'text-[#555] hover:text-[#888]'
              }`}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
        <SearchInput value={search} onChange={setSearch} placeholder="Search..." />
        <button onClick={load} disabled={loading} className="text-[11px] text-[#555] hover:text-[#aaa] transition-colors flex items-center gap-1.5">
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
        </button>
      </PageHeader>

      <div className="flex-1 overflow-auto p-4">
        <DataTable
          columns={[
            { key: 'type', label: 'Type', render: (r: any) => <span className="text-[#e0e0e0] font-medium">{r.type}</span> },
            { key: 'status', label: 'Status', render: (r: any) => <Badge variant={statusBadgeColor(r.status)}>{r.status}</Badge> },
            { key: 'org_id', label: 'Org', className: 'font-mono text-[10px] text-[#555]', render: (r: any) => r.org_id?.slice(0, 8) + '...' },
            { key: 'attempts', label: 'Attempts', render: (r: any) => `${r.attempts || 0}/${r.max_attempts || 3}` },
            { key: 'error', label: 'Error', className: 'text-[#f87171] text-[11px] max-w-[200px] truncate', render: (r: any) => r.error || '-' },
            { key: 'created_at', label: 'Created', render: (r: any) => new Date(r.created_at).toLocaleString() },
          ]}
          data={filtered}
          emptyMessage={loading ? 'Loading...' : 'No jobs found'}
        />
      </div>
    </div>
  );
}
