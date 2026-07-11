import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { PageHeader } from './PageHeader';
import { DataTable } from './DataTable';
import { SearchInput } from './SearchInput';


export function UsersModule() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      if (window.electronAPI?.getUsers) {
        const res = await window.electronAPI.getUsers();
        if (res.error) setError(res.error);
        else setUsers(res.data || []);
      }
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader title="Users" subtitle={`${users.length} total`}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search by email..." />
        <button onClick={fetchUsers} disabled={loading} className="text-[11px] text-[#555] hover:text-[#aaa] transition-colors flex items-center gap-1.5">
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </PageHeader>

      <div className="flex-1 overflow-auto p-4">
        {error ? (
          <div className="p-4 border border-[#3a1a1a] bg-[#1a0a0a] rounded text-[#f87171] text-[13px]">{error}</div>
        ) : (
          <DataTable
            columns={[
              { key: 'email', label: 'Email' },
              { key: 'id', label: 'ID', className: 'font-mono text-[10px] text-[#555]', render: (r: any) => r.id?.slice(0, 8) + '...' },
              { key: 'created_at', label: 'Created', render: (r: any) => new Date(r.created_at).toLocaleDateString() },
              { key: 'last_sign_in_at', label: 'Last Sign In', render: (r: any) => r.last_sign_in_at ? new Date(r.last_sign_in_at).toLocaleDateString() : 'Never' },
            ]}
            data={filtered}
            loading={loading}
            emptyMessage="No users found"
          />
        )}
      </div>
    </div>
  );
}
