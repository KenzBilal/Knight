import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { PageHeader } from './PageHeader';
import { DataTable } from './DataTable';
import { Badge, statusBadgeColor } from './Badge';
import { SearchInput } from './SearchInput';
import { dbSelect } from '../lib/supabase';

export function TelegramModule() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  async function load() {
    setLoading(true);
    try {
      const res = await dbSelect('telegram_leads', {
        order: { column: 'created_at', ascending: false },
        limit: 200,
      });
      setLeads(res.data || []);
    } catch {
      setLeads([]);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = leads.filter(l =>
    l.username?.toLowerCase().includes(search.toLowerCase()) ||
    l.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader title="Telegram Leads" subtitle={`${leads.length} total`}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search username..." />
        <button onClick={load} disabled={loading} className="text-[11px] text-[#555] hover:text-[#aaa] transition-colors flex items-center gap-1.5">
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
        </button>
      </PageHeader>

      <div className="flex-1 overflow-auto p-4">
        <DataTable
          columns={[
            { key: 'username', label: 'Username', render: (r: any) => <span className="text-[#60a5fa]">@{r.username || 'none'}</span> },
            { key: 'full_name', label: 'Name', render: (r: any) => <span className="text-[#e0e0e0]">{r.full_name || '-'}</span> },
            { key: 'source_group', label: 'Source', className: 'text-[11px] text-[#888]' },
            { key: 'status', label: 'Status', render: (r: any) => <Badge variant={statusBadgeColor(r.status)}>{r.status}</Badge> },
            { key: 'created_at', label: 'Created', render: (r: any) => new Date(r.created_at).toLocaleDateString() },
          ]}
          data={filtered}
          loading={loading}
          emptyMessage="No Telegram leads found"
        />
      </div>
    </div>
  );
}
