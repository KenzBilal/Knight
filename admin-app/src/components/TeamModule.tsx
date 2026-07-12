import { useState, useEffect } from 'react';
import { RefreshCw, UserPlus, X, Shield, Crown, User } from 'lucide-react';
import { PageHeader } from './PageHeader';
import { DataTable } from './DataTable';
import { Badge } from './Badge';
import { SearchInput } from './SearchInput';
import { dbSelect, dbInsert, dbUpdate, dbDelete } from '../lib/supabase';

interface TeamMemberRow {
  member_id: string;
  org_id: string;
  org_name: string;
  user_id: string;
  email: string;
  role: string;
  joined_at: string | null;
}

interface PendingInvite {
  id: string;
  org_id: string;
  org_name: string;
  email: string;
  role: string;
  invited_by: string;
  created_at: string;
  expires_at: string;
}

const ROLE_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  owner: { icon: Crown, color: 'red', label: 'Owner' },
  admin: { icon: Shield, color: 'amber', label: 'Admin' },
  member: { icon: User, color: 'neutral', label: 'Member' },
};

function Avatar({ name, email, size = 32 }: { name?: string | null; email: string; size?: number }) {
  const initials = name
    ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : email[0]?.toUpperCase() || '?';
  return (
    <div
      className="rounded-full bg-[#222] border border-[#333] flex items-center justify-center flex-shrink-0 text-[11px] font-bold text-[#aaa]"
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  );
}

export function TeamModule() {
  const [members, setMembers] = useState<TeamMemberRow[]>([]);
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Invite form
  const [showInvite, setShowInvite] = useState(false);
  const [inviteOrgId, setInviteOrgId] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [sendingInvite, setSendingInvite] = useState(false);

  // Editing
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [removingMember, setRemovingMember] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      // Fetch all org_members with org name
      const [membersRes, orgsRes, invitesRes, usersRes] = await Promise.all([
        dbSelect('org_members', { order: { column: 'created_at', ascending: false }, limit: 500 }),
        dbSelect('orgs', { select: 'id, name', limit: 500 }),
        dbSelect('org_invites', { filters: { accepted_at: null }, order: { column: 'created_at', ascending: false }, limit: 200 }),
        window.electronAPI?.getUsers?.() || Promise.resolve({ data: [] }),
      ]);

      const orgMap = new Map((orgsRes.data || []).map((o: any) => [o.id, o.name]));
      const userList: any[] = Array.isArray(usersRes?.data) ? usersRes.data : (usersRes?.data || []);
      const userMap = new Map(userList.map((u: any) => [u.id, u.email]));

      const memberRows: TeamMemberRow[] = (membersRes.data || []).map((m: any) => ({
        member_id: m.id,
        org_id: m.org_id,
        org_name: orgMap.get(m.org_id) || m.org_id,
        user_id: m.user_id,
        email: userMap.get(m.user_id) || 'unknown',
        role: m.role,
        joined_at: m.joined_at,
      }));

      const inviteRows: PendingInvite[] = (invitesRes.data || []).map((i: any) => ({
        id: i.id,
        org_id: i.org_id,
        org_name: orgMap.get(i.org_id) || i.org_id,
        email: i.email,
        role: i.role,
        invited_by: i.invited_by,
        created_at: i.created_at,
        expires_at: i.expires_at,
      }));

      setMembers(memberRows);
      setInvites(inviteRows);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleInvite() {
    if (!inviteOrgId || !inviteEmail) return;
    setSendingInvite(true);
    try {
      const token = crypto.randomUUID().replace(/-/g, '');
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const res = await dbInsert('org_invites', {
        org_id: inviteOrgId,
        email: inviteEmail,
        role: inviteRole,
        token,
        invited_by: '00000000-0000-0000-0000-000000000000',
        expires_at: expiresAt,
      });
      if (res.error) throw new Error(res.error);

      const orgsRes = await dbSelect('orgs', { select: 'id, name', filters: { id: inviteOrgId }, limit: 1 });
      const orgName = orgsRes.data?.[0]?.name || inviteOrgId;

      setInvites(prev => [{
        id: res.data?.[0]?.id || Date.now().toString(),
        org_id: inviteOrgId,
        org_name: orgName,
        email: inviteEmail,
        role: inviteRole,
        invited_by: '00000000-0000-0000-0000-000000000000',
        created_at: new Date().toISOString(),
        expires_at: expiresAt,
      }, ...prev]);

      setInviteEmail('');
      setShowInvite(false);
    } catch (err: any) {
      setError(err.message);
    }
    setSendingInvite(false);
  }

  async function handleChangeRole(memberId: string, orgId: string, newRole: string) {
    setEditingMember(memberId);
    try {
      const res = await dbUpdate('org_members', { role: newRole }, { id: memberId });
      if (res.error) throw new Error(res.error);
      setMembers(prev => prev.map(m => m.member_id === memberId ? { ...m, role: newRole } : m));
    } catch (err: any) {
      setError(err.message);
    }
    setEditingMember(null);
  }

  async function handleRemoveMember(memberId: string, email: string) {
    if (!confirm(`Remove ${email}? They will lose access immediately.`)) return;
    setRemovingMember(memberId);
    try {
      const res = await dbDelete('org_members', { id: memberId });
      if (res.error) throw new Error(res.error);
      setMembers(prev => prev.filter(m => m.member_id !== memberId));
    } catch (err: any) {
      setError(err.message);
    }
    setRemovingMember(null);
  }

  async function handleCancelInvite(inviteId: string, email: string) {
    if (!confirm(`Cancel invitation to ${email}?`)) return;
    try {
      const res = await dbDelete('org_invites', { id: inviteId });
      if (res.error) throw new Error(res.error);
      setInvites(prev => prev.filter(i => i.id !== inviteId));
    } catch (err: any) {
      setError(err.message);
    }
  }

  const filteredMembers = members.filter(m =>
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.org_name.toLowerCase().includes(search.toLowerCase()) ||
    m.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader title="Team Management" subtitle={`${members.length} members · ${invites.length} pending invites`}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search members..." />
        <button
          onClick={() => setShowInvite(!showInvite)}
          className="text-[11px] bg-[#1a1a1a] border border-[#2a2a2a] text-[#aaa] hover:text-[#e0e0e0] hover:bg-[#222] transition-colors px-3 py-1.5 rounded flex items-center gap-1.5"
        >
          <UserPlus size={12} />
          Invite
        </button>
        <button onClick={load} disabled={loading} className="text-[11px] text-[#555] hover:text-[#aaa] transition-colors flex items-center gap-1.5">
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </PageHeader>

      {/* Invite Form */}
      {showInvite && (
        <div className="border-b border-[#1a1a1a] bg-[#0a0a0a] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-[11px] text-[#555] mb-1 block">Organization ID</label>
              <input
                value={inviteOrgId}
                onChange={e => setInviteOrgId(e.target.value)}
                placeholder="org uuid"
                className="w-full bg-[#121212] border border-[#222] rounded px-3 py-1.5 text-[13px] text-[#e0e0e0] placeholder:text-[#444] focus:outline-none focus:border-[#444]"
              />
            </div>
            <div className="flex-1">
              <label className="text-[11px] text-[#555] mb-1 block">Email</label>
              <input
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder="teammate@example.com"
                className="w-full bg-[#121212] border border-[#222] rounded px-3 py-1.5 text-[13px] text-[#e0e0e0] placeholder:text-[#444] focus:outline-none focus:border-[#444]"
              />
            </div>
            <div className="w-32">
              <label className="text-[11px] text-[#555] mb-1 block">Role</label>
              <select
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value)}
                className="w-full bg-[#121212] border border-[#222] rounded px-3 py-1.5 text-[13px] text-[#e0e0e0] focus:outline-none focus:border-[#444] cursor-pointer"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handleInvite}
                disabled={sendingInvite || !inviteOrgId || !inviteEmail}
                className="px-4 py-1.5 rounded bg-[#e0e0e0] text-[#111] text-[12px] font-medium hover:bg-white transition-colors disabled:opacity-40 flex items-center gap-1.5"
              >
                {sendingInvite && <div className="w-3 h-3 border-2 border-[#111] border-t-transparent rounded-full animate-spin" />}
                Send
              </button>
              <button
                onClick={() => setShowInvite(false)}
                className="px-3 py-1.5 rounded border border-[#2a2a2a] text-[#666] text-[12px] hover:text-[#aaa] hover:border-[#444] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {error && (
          <div className="p-3 border border-[#3a1a1a] bg-[#1a0a0a] rounded text-[#f87171] text-[12px] flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-[#f87171] hover:text-white"><X size={14} /></button>
          </div>
        )}

        {/* Members */}
        <div>
          <h3 className="text-[12px] font-medium text-[#555] uppercase tracking-wider mb-2 px-1">Members</h3>
          <DataTable
            columns={[
              {
                key: 'email', label: 'Member', render: (r: TeamMemberRow) => (
                  <div className="flex items-center gap-2.5">
                    <Avatar name={r.email} email={r.email} />
                    <div>
                      <div className="text-[#e0e0e0] text-[13px]">{r.email}</div>
                      <div className="text-[10px] text-[#555]">{r.org_name}</div>
                    </div>
                  </div>
                ),
              },
              {
                key: 'role', label: 'Role', render: (r: TeamMemberRow) => {
                  const cfg = ROLE_CONFIG[r.role] || ROLE_CONFIG.member;
                  const Icon = cfg.icon;
                  return (
                    <div className="flex items-center gap-1.5">
                      <Icon size={12} className={`text-${cfg.color}-400`} />
                      <Badge variant={cfg.color === 'red' ? 'danger' : cfg.color === 'amber' ? 'warning' : 'neutral'}>{cfg.label}</Badge>
                    </div>
                  );
                },
              },
              {
                key: 'joined_at', label: 'Joined', render: (r: TeamMemberRow) => (
                  <span className="text-[11px] text-[#555]">
                    {r.joined_at ? new Date(r.joined_at).toLocaleDateString() : '—'}
                  </span>
                ),
              },
              {
                key: 'actions', label: '', className: 'w-24', render: (r: TeamMemberRow) => (
                  <div className="flex items-center gap-1 justify-end">
                    <select
                      value={r.role}
                      onChange={e => handleChangeRole(r.member_id, r.org_id, e.target.value)}
                      disabled={editingMember === r.member_id || r.role === 'owner'}
                      className="text-[11px] bg-[#121212] border border-[#222] text-[#888] rounded px-1.5 py-1 focus:outline-none focus:border-[#444] disabled:opacity-40 cursor-pointer"
                    >
                      <option value="owner">Owner</option>
                      <option value="admin">Admin</option>
                      <option value="member">Member</option>
                    </select>
                    <button
                      onClick={() => handleRemoveMember(r.member_id, r.email)}
                      disabled={removingMember === r.member_id || r.role === 'owner'}
                      className="text-[#555] hover:text-[#f87171] transition-colors p-1 rounded hover:bg-[#1a0a0a] disabled:opacity-30"
                      title="Remove member"
                    >
                      {removingMember === r.member_id ? (
                        <div className="w-3.5 h-3.5 border-2 border-[#f87171] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <X size={14} />
                      )}
                    </button>
                  </div>
                ),
              },
            ]}
            data={filteredMembers}
            loading={loading}
            emptyMessage="No team members found"
          />
        </div>

        {/* Pending Invites */}
        {invites.length > 0 && (
          <div>
            <h3 className="text-[12px] font-medium text-[#555] uppercase tracking-wider mb-2 px-1">Pending Invitations</h3>
            <div className="border border-[#1a1a1a] rounded-lg bg-[#080808] overflow-hidden">
              {invites.map(invite => {
                const daysLeft = Math.ceil((new Date(invite.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                const isExpired = daysLeft <= 0;
                return (
                  <div key={invite.id} className="flex items-center justify-between px-4 py-3 border-b border-[#141414] last:border-0 hover:bg-[#0d0d0d] transition-colors group">
                    <div className="flex items-center gap-3">
                      <Avatar email={invite.email} size={28} />
                      <div>
                        <div className="text-[13px] text-[#e0e0e0]">{invite.email}</div>
                        <div className="text-[10px] text-[#555]">
                          {invite.org_name} · {invite.role}
                          {!isExpired && <span className="ml-1 text-[#444]">· Expires in {daysLeft}d</span>}
                          {isExpired && <span className="ml-1 text-[#f87171]">· Expired</span>}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCancelInvite(invite.id, invite.email)}
                      className="text-[#444] hover:text-[#f87171] transition-colors opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[#1a0a0a]"
                      title="Cancel invite"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
