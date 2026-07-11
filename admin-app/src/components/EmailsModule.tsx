import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { PageHeader } from './PageHeader';
import { DataTable } from './DataTable';
import { Badge } from './Badge';
import { SearchInput } from './SearchInput';
import { dbSelect } from '../lib/supabase';

export function EmailsModule() {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  async function load() {
    setLoading(true);
    const res = await dbSelect('emails', {
      order: { column: 'created_at', ascending: false },
      limit: 200,
    });
    setEmails(res.data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = emails.filter(e =>
    e.subject?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader title="Emails" subtitle={`${emails.length} total`}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search subject..." />
        <button onClick={load} disabled={loading} className="text-[11px] text-[#555] hover:text-[#aaa] transition-colors flex items-center gap-1.5">
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
        </button>
      </PageHeader>

      <div className="flex-1 overflow-auto p-4">
        <DataTable
          columns={[
            { key: 'direction', label: 'Dir', render: (r: any) => <Badge variant={r.direction === 'outbound' ? 'info' : 'success'}>{r.direction}</Badge> },
            { key: 'subject', label: 'Subject', render: (r: any) => <span className="text-[#e0e0e0]">{r.subject || '(no subject)'}</span> },
            { key: 'company_id', label: 'Company', className: 'font-mono text-[10px] text-[#555]', render: (r: any) => r.company_id?.slice(0, 8) + '...' },
            { key: 'created_at', label: 'Sent', render: (r: any) => new Date(r.created_at).toLocaleString() },
          ]}
          data={filtered}
          emptyMessage={loading ? 'Loading...' : 'No emails found'}
        />
      </div>
    </div>
  );
}
