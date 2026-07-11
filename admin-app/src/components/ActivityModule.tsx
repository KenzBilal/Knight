import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { PageHeader } from './PageHeader';
import { DataTable } from './DataTable';
import { Badge, statusBadgeColor } from './Badge';
import { SearchInput } from './SearchInput';
import { dbSelect } from '../lib/supabase';

export function ActivityModule() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');

  async function load() {
    setLoading(true);
    const filters: Record<string, any> = {};
    if (levelFilter !== 'all') filters.level = levelFilter;

    const res = await dbSelect('activity_log', {
      filters,
      order: { column: 'created_at', ascending: false },
      limit: 200,
    });
    setLogs(res.data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [levelFilter]);

  const filtered = logs.filter(l =>
    l.message?.toLowerCase().includes(search.toLowerCase()) ||
    l.type?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader title="Activity Log" subtitle={`${logs.length} entries`}>
        <div className="flex items-center gap-2">
          {['all', 'info', 'success', 'warning', 'error'].map(l => (
            <button
              key={l}
              onClick={() => setLevelFilter(l)}
              className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                levelFilter === l ? 'bg-[#1a1a1a] text-[#e0e0e0]' : 'text-[#555] hover:text-[#888]'
              }`}
            >
              {l.charAt(0).toUpperCase() + l.slice(1)}
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
            { key: 'level', label: 'Level', render: (r: any) => <Badge variant={statusBadgeColor(r.level)}>{r.level}</Badge> },
            { key: 'type', label: 'Type', className: 'text-[#888]' },
            { key: 'message', label: 'Message', render: (r: any) => <span className="text-[#e0e0e0]">{r.message}</span> },
            { key: 'created_at', label: 'Time', render: (r: any) => new Date(r.created_at).toLocaleString() },
          ]}
          data={filtered}
          emptyMessage={loading ? 'Loading...' : 'No activity found'}
        />
      </div>
    </div>
  );
}
