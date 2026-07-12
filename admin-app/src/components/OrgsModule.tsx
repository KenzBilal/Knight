import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { PageHeader } from './PageHeader';
import { DataTable } from './DataTable';
import { Badge, planBadgeColor } from './Badge';
import { SearchInput } from './SearchInput';
import { dbSelect } from '../lib/supabase';

export function OrgsModule() {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  async function load() {
    setLoading(true);
    try {
      const res = await dbSelect('orgs', {
        order: { column: 'created_at', ascending: false },
        limit: 100,
      });
      setOrgs(res.data || []);
    } catch {
      setOrgs([]);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = orgs.filter(o =>
    o.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.slug?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader title="Organizations" subtitle={`${orgs.length} total`}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search orgs..." />
        <button onClick={load} disabled={loading} className="text-[11px] text-[#555] hover:text-[#aaa] transition-colors flex items-center gap-1.5">
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </PageHeader>

      <div className="flex-1 overflow-auto p-4">
        <DataTable
          columns={[
            { key: 'name', label: 'Name', render: (r: any) => <span className="text-[#e0e0e0]">{r.name}</span> },
            { key: 'slug', label: 'Slug', className: 'font-mono text-[11px] text-[#666]' },
            { key: 'plan', label: 'Plan', render: (r: any) => <Badge variant={planBadgeColor(r.plan)}>{r.plan}</Badge> },
            { key: 'lemon_customer_id', label: 'Lemon', render: (r: any) => r.lemon_customer_id ? <Badge variant="success">Active</Badge> : <Badge>None</Badge> },
            { key: 'created_at', label: 'Created', render: (r: any) => new Date(r.created_at).toLocaleDateString() },
          ]}
          data={filtered}
          loading={loading}
          emptyMessage="No organizations found"
        />
      </div>
    </div>
  );
}
