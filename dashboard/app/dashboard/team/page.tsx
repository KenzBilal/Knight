"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FadeIn } from "@/components/Animations";

interface TeamMember {
  id: string;
  email: string;
  name: string | null;
  role: string;
  joinedAt: string;
}

interface PendingInvite {
  id: string;
  email: string;
  role: string;
  invitedAt: string;
}

interface OrgData {
  id: string;
  name: string;
  slug: string;
  plan: string;
}

const roleBadgeCls: Record<string, string> = {
  owner: "bg-red-500/20 text-red-400 border border-red-500/30",
  admin: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  member: "bg-[#222] text-[#888] border border-[#333]",
};

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [org, setOrg] = useState<OrgData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [sendingInvite, setSendingInvite] = useState(false);

  const [editingOrg, setEditingOrg] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [savingOrg, setSavingOrg] = useState(false);

  const [changingRole, setChangingRole] = useState<string | null>(null);
  const [removingMember, setRemovingMember] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/team").then(r => {
        if (!r.ok) throw new Error("Failed to load team");
        return r.json();
      }),
      fetch("/api/org").then(r => {
        if (!r.ok) throw new Error("Failed to load org");
        return r.json();
      }),
    ])
      .then(([teamData, orgData]) => {
        setMembers(teamData.members || []);
        setInvites(teamData.invites || []);
        setOrg(orgData.org || orgData);
        if (orgData.org?.name) {
          setOrgName(orgData.org.name);
          setOrgSlug(orgData.org.slug || "");
        } else if (orgData.name) {
          setOrgName(orgData.name);
          setOrgSlug(orgData.slug || "");
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setSendingInvite(true);

    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send invite");

      setInvites(prev => [
        { id: data.invite?.id || Date.now().toString(), email: inviteEmail, role: inviteRole, invitedAt: new Date().toISOString() },
        ...prev,
      ]);
      setInviteEmail("");
      toast.success("Invite sent successfully");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSendingInvite(false);
    }
  }

  async function handleCancelInvite(inviteId: string) {
    try {
      const res = await fetch(`/api/team/invite?id=${inviteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to cancel invite");
      setInvites(prev => prev.filter(i => i.id !== inviteId));
      toast.success("Invite cancelled");
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleChangeRole(memberId: string, newRole: string) {
    setChangingRole(memberId);
    try {
      const res = await fetch("/api/team/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, role: newRole }),
      });
      if (!res.ok) throw new Error("Failed to change role");
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m));
      toast.success("Role updated");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setChangingRole(null);
    }
  }

  async function handleRemoveMember(memberId: string) {
    if (!confirm("Are you sure you want to remove this member?")) return;
    setRemovingMember(memberId);
    try {
      const res = await fetch(`/api/team/member?id=${memberId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove member");
      setMembers(prev => prev.filter(m => m.id !== memberId));
      toast.success("Member removed");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setRemovingMember(null);
    }
  }

  async function handleSaveOrg(e: React.FormEvent) {
    e.preventDefault();
    setSavingOrg(true);
    try {
      const res = await fetch("/api/org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: orgName, slug: orgSlug }),
      });
      if (!res.ok) throw new Error("Failed to update organization");
      const data = await res.json();
      setOrg(prev => prev ? { ...prev, name: orgName, slug: orgSlug } : prev);
      setEditingOrg(false);
      toast.success("Organization updated");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSavingOrg(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#e0e0e0]">Team</h1>
          <p className="text-sm text-[#666] mt-1">Manage your organization members</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="w-5 h-5 border-2 border-[#333] border-t-[#e0e0e0] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#e0e0e0]">Team</h1>
          <p className="text-sm text-[#666] mt-1">Manage your organization members</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">
          {error}
        </div>
      </div>
    );
  }

  const currentUserRole = members.find(m => true)?.role;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#e0e0e0]">Team</h1>
        <p className="text-sm text-[#666] mt-1">Manage your organization members</p>
      </div>

      {/* Members Table */}
      <FadeIn delay={100}>
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1a1a1a]">
            <h2 className="text-sm font-semibold text-[#e0e0e0]">Members</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1a1a1a]">
                  <th className="text-left text-xs font-medium text-[#666] px-6 py-3">Name / Email</th>
                  <th className="text-left text-xs font-medium text-[#666] px-6 py-3">Role</th>
                  <th className="text-left text-xs font-medium text-[#666] px-6 py-3">Joined</th>
                  <th className="text-right text-xs font-medium text-[#666] px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map(member => (
                  <tr key={member.id} className="border-b border-[#1a1a1a] last:border-0 hover:bg-[#111] transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-[#e0e0e0]">{member.name || "No name"}</p>
                        <p className="text-xs text-[#666]">{member.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${roleBadgeCls[member.role] || roleBadgeCls.member}`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-[#666]">
                        {new Date(member.joinedAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {(currentUserRole === "owner" || currentUserRole === "admin") && member.role !== "owner" && (
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={member.role}
                            onChange={e => handleChangeRole(member.id, e.target.value)}
                            disabled={changingRole === member.id}
                            className="bg-[#1a1a1a] border border-[#2a2a2a] text-[#e0e0e0] text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#444] disabled:opacity-50"
                          >
                            <option value="admin">Admin</option>
                            <option value="member">Member</option>
                          </select>
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            disabled={removingMember === member.id}
                            className="text-xs text-[#666] hover:text-red-400 transition-colors disabled:opacity-50 px-2 py-1.5"
                          >
                            {removingMember === member.id ? "..." : "Remove"}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {members.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-[#666]">
                      No members yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </FadeIn>

      {/* Invite Form */}
      <FadeIn delay={200}>
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-[#e0e0e0] mb-4">Invite Member</h2>
          <form onSubmit={handleInvite} className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs text-[#666] mb-1.5">Email address</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder="teammate@example.com"
                className="w-full rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] px-4 py-2.5 text-sm text-[#e0e0e0] placeholder:text-[#555] focus:outline-none focus:border-[#444] transition-all"
                required
              />
            </div>
            <div className="w-36">
              <label className="block text-xs text-[#666] mb-1.5">Role</label>
              <select
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value)}
                className="w-full rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] px-4 py-2.5 text-sm text-[#e0e0e0] focus:outline-none focus:border-[#444] transition-all"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={sendingInvite || !inviteEmail.trim()}
              className="rounded-xl bg-[#e0e0e0] text-[#0a0a0a] font-medium px-5 py-2.5 text-sm hover:bg-white transition-all disabled:opacity-40 active:scale-[0.98]"
            >
              {sendingInvite ? "Sending..." : "Send Invite"}
            </button>
          </form>

          {invites.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs text-[#666] mb-2">Pending invites</p>
              {invites.map(invite => (
                <div key={invite.id} className="flex items-center justify-between p-3 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a]">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-[#e0e0e0]">{invite.email}</span>
                    <span className="text-xs text-[#555] capitalize">{invite.role}</span>
                  </div>
                  <button
                    onClick={() => handleCancelInvite(invite.id)}
                    className="text-xs text-[#666] hover:text-red-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </FadeIn>

      {/* Org Profile */}
      {org && (
        <FadeIn delay={300}>
          <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#e0e0e0]">Organization</h2>
              <span className="text-xs text-[#666] bg-[#1a1a1a] border border-[#2a2a2a] px-2.5 py-1 rounded-full capitalize">
                {org.plan} plan
              </span>
            </div>

            {!editingOrg ? (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-[#666]">Name</p>
                  <p className="text-sm text-[#e0e0e0]">{org.name}</p>
                </div>
                <div>
                  <p className="text-xs text-[#666]">Slug</p>
                  <p className="text-sm text-[#e0e0e0]">{org.slug || "Not set"}</p>
                </div>
                <button
                  onClick={() => setEditingOrg(true)}
                  className="text-xs text-[#888] hover:text-[#e0e0e0] transition-colors"
                >
                  Edit
                </button>
              </div>
            ) : (
              <form onSubmit={handleSaveOrg} className="space-y-4">
                <div>
                  <label className="block text-xs text-[#666] mb-1.5">Name</label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={e => setOrgName(e.target.value)}
                    className="w-full rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] px-4 py-2.5 text-sm text-[#e0e0e0] placeholder:text-[#555] focus:outline-none focus:border-[#444] transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#666] mb-1.5">Slug</label>
                  <input
                    type="text"
                    value={orgSlug}
                    onChange={e => setOrgSlug(e.target.value)}
                    className="w-full rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] px-4 py-2.5 text-sm text-[#e0e0e0] placeholder:text-[#555] focus:outline-none focus:border-[#444] transition-all"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={savingOrg}
                    className="rounded-xl bg-[#e0e0e0] text-[#0a0a0a] font-medium px-4 py-2 text-sm hover:bg-white transition-all disabled:opacity-40 active:scale-[0.98]"
                  >
                    {savingOrg ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingOrg(false);
                      setOrgName(org.name);
                      setOrgSlug(org.slug || "");
                    }}
                    className="rounded-xl border border-[#2a2a2a] text-[#888] font-medium px-4 py-2 text-sm hover:text-[#e0e0e0] hover:border-[#444] transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </FadeIn>
      )}
    </div>
  );
}
