import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { PageHeader } from './PageHeader';
import { DataTable } from './DataTable';
import { Badge, statusBadgeColor } from './Badge';
import { SearchInput } from './SearchInput';
import { dbSelect } from '../lib/supabase';

export function LeadsModule() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  async function load() {
    setLoading(true);
    try {
      const res = await dbSelect('companies', {
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
    l.name?.toLowerCase().includes(search.toLowerCase()) ||
    l.website_url?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader title="Leads" subtitle={`${leads.length} companies`}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search leads..." />
        <button onClick={load} disabled={loading} className="text-[11px] text-[#555] hover:text-[#aaa] transition-colors flex items-center gap-1.5">
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
        </button>
      </PageHeader>

      <div className="flex-1 overflow-auto p-4">
        <DataTable
          columns={[
            { key: 'name', label: 'Company', render: (r: any) => <span className="text-[#e0e0e0]">{r.name}</span> },
            { key: 'website_url', label: 'Website', className: 'text-[11px] text-[#60a5fa]' },
            { key: 'industry', label: 'Industry' },
            { key: 'lead_score', label: 'Score', render: (r: any) => <span className={r.lead_score == null ? 'text-[#555]' : r.lead_score <= 40 ? 'text-[#f87171]' : r.lead_score <= 60 ? 'text-[#facc15]' : 'text-[#4ade80]'}>{r.lead_score ?? '-'}</span> },
            { key: 'status', label: 'Status', render: (r: any) => <Badge variant={statusBadgeColor(r.status)}>{r.status}</Badge> },
            { key: 'created_at', label: 'Created', render: (r: any) => new Date(r.created_at).toLocaleDateString() },
          ]}
          data={filtered}
          loading={loading}
          emptyMessage="No leads found"
        />
      </div>
    </div>
  );
}
