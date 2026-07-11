import { useState, useEffect } from 'react';
import { RefreshCw, Key } from 'lucide-react';
import { PageHeader } from './PageHeader';
import { DataTable } from './DataTable';
import { dbSelect } from '../lib/supabase';

export function ApiHubModule() {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await dbSelect('org_api_keys', {
      order: { column: 'created_at', ascending: false },
      limit: 200,
    });
    setKeys(res.data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const maskKey = (key: string) => {
    if (!key || key.length < 12) return '***';
    return key.slice(0, 6) + '...' + key.slice(-4);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader title="API Hub" subtitle={`${keys.length} keys configured`}>
        <button onClick={load} disabled={loading} className="text-[11px] text-[#555] hover:text-[#aaa] transition-colors flex items-center gap-1.5">
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </PageHeader>

      <div className="flex-1 overflow-auto p-4">
        <DataTable
          columns={[
            { key: 'provider', label: 'Provider', render: (r: any) => <span className="text-[#e0e0e0] flex items-center gap-2"><Key size={12} className="text-[#555]" />{r.provider}</span> },
            { key: 'org_id', label: 'Org', className: 'font-mono text-[10px] text-[#555]', render: (r: any) => r.org_id?.slice(0, 8) + '...' },
            { key: 'key_encrypted', label: 'Key', className: 'font-mono text-[11px] text-[#666]', render: (r: any) => maskKey(r.key_encrypted) },
            { key: 'created_at', label: 'Created', render: (r: any) => new Date(r.created_at).toLocaleDateString() },
          ]}
          data={keys}
          emptyMessage={loading ? 'Loading...' : 'No API keys found'}
        />
      </div>
    </div>
  );
}
