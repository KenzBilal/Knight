"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FadeIn } from "@/components/Animations";

interface TeamMember {
  user_id: string;
  email: string;
  name: string | null;
  role: string;
  joined_at: string | null;
}

interface PendingInvite {
  id: string;
  email: string;
  role: string;
  created_at: string;
  expires_at: string;
}

interface OrgData {
  id: string;
  name: string;
  slug: string;
  plan: string;
}

const INPUT = "w-full rounded-xl input-base";
const LABEL = "text-xs font-medium text-[#a3a3a3] mb-1.5";

const ROLE_STYLES: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  owner: { bg: "bg-[#f87171]/10", text: "text-[#f87171]", dot: "bg-[#f87171]", label: "Owner" },
  admin: { bg: "bg-[#facc15]/10", text: "text-[#facc15]", dot: "bg-[#facc15]", label: "Admin" },
  member: { bg: "bg-white/[0.06]", text: "text-[#525252]", dot: "bg-[#525252]", label: "Member" },
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  owner: "Full access. Can manage billing, team, and all settings.",
  admin: "Can manage prospects, emails, and invite members.",
  member: "Can view and use the dashboard. Cannot change settings.",
};

function Avatar({ name, email, size = "md" }: { name?: string | null; email: string; size?: "sm" | "md" }) {
  const initials = name
    ? name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : email[0].toUpperCase();
  const sizeClasses = size === "sm" ? "w-8 h-8 text-[10px]" : "w-10 h-10 text-xs";
  return (
    <div className={`${sizeClasses} rounded-full bg-white/[0.06] flex items-center justify-center flex-shrink-0`}>
      <span className="font-bold text-white">{initials}</span>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="h-8 w-24 bg-ink-800 rounded-lg animate-pulse mb-2" />
        <div className="h-4 w-56 bg-ink-800 rounded-lg animate-pulse" />
      </div>
      <div className="dash-card rounded-2xl overflow-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-white/[0.06] last:border-0 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-ink-800" />
            <div className="flex-1">
              <div className="h-4 w-32 bg-ink-800 rounded mb-2" />
              <div className="h-3 w-48 bg-ink-800 rounded" />
            </div>
            <div className="h-6 w-16 bg-ink-800 rounded-full" />
            <div className="h-6 w-16 bg-ink-800 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [org, setOrg] = useState<OrgData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

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
      fetch("/api/team").then((r) => { if (!r.ok) throw new Error("Failed to load team"); return r.json(); }),
      fetch("/api/org").then((r) => { if (!r.ok) throw new Error("Failed to load org"); return r.json(); }),
    ])
      .then(([teamData, orgData]) => {
        setMembers(teamData.members || []);
        setInvites(teamData.invites || []);
        setCurrentUserEmail(teamData.currentUserEmail || null);
        setOrg(orgData.org || orgData);
        const o = orgData.org || orgData;
        if (o?.name) { setOrgName(o.name); setOrgSlug(o.slug || ""); }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const currentUserRole = members.find((m) => m.email === currentUserEmail)?.role;
  const isOwner = currentUserRole === "owner";
  const isPaid = org?.plan === "starter" || org?.plan === "max" || org?.plan === "pro" || org?.plan === "enterprise";

  if (!loading && !isPaid) {
    return (
      <div className="p-6 md:p-8 max-w-3xl">
        <div className="dash-card p-12 text-center">
          <div className="w-14 h-14 rounded-lg bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3a3a3a" strokeWidth="1.5" strokeLinecap="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <p className="text-sm font-medium text-[#a3a3a3] mb-1">Team management requires a paid plan</p>
          <p className="text-xs text-[#525252] mb-4">Upgrade to Starter or Max to invite and manage team members</p>
          <a href="/dashboard/billing" className="inline-block px-4 py-2 rounded-lg bg-white text-black text-[13px] font-medium hover:bg-white/90 transition-colors">
            Upgrade Plan
          </a>
        </div>
      </div>
    );
  }

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
      setInvites((prev) => [
        { id: data.invite?.id || Date.now().toString(), email: inviteEmail, role: inviteRole, created_at: new Date().toISOString(), expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() },
        ...prev,
      ]);
      setInviteEmail("");
      toast.success("Invitation sent", { description: `Invite link sent to ${inviteEmail}` });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSendingInvite(false);
    }
  }

  async function handleCancelInvite(inviteId: string, email: string) {
    try {
      const res = await fetch("/api/team/invite", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invite_id: inviteId }),
      });
      if (!res.ok) throw new Error("Failed to cancel invite");
      setInvites((prev) => prev.filter((i) => i.id !== inviteId));
      toast.success("Invite cancelled", { description: `Invitation to ${email} has been revoked` });
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleChangeRole(memberId: string, newRole: string) {
    setChangingRole(memberId);
    try {
      const res = await fetch("/api/team/member", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member_id: memberId, role: newRole }),
      });
      if (!res.ok) throw new Error("Failed to change role");
      setMembers((prev) => prev.map((m) => m.user_id === memberId ? { ...m, role: newRole } : m));
      toast.success("Role updated", { description: `Member role changed to ${newRole}` });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setChangingRole(null);
    }
  }

  async function handleRemoveMember(memberId: string, email: string) {
    if (!confirm(`Remove ${email} from this organization? They will lose access immediately.`)) return;
    setRemovingMember(memberId);
    try {
      const res = await fetch("/api/team/member", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member_id: memberId }),
      });
      if (!res.ok) throw new Error("Failed to remove member");
      setMembers((prev) => prev.filter((m) => m.user_id !== memberId));
      toast.success("Member removed", { description: `${email} has been removed from the organization` });
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
      setOrg((prev) => prev ? { ...prev, name: orgName, slug: orgSlug } : prev);
      setEditingOrg(false);
      toast.success("Organization updated");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSavingOrg(false);
    }
  }

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-display)" }}>Team</h1>
          <p className="text-sm text-[#a3a3a3] mt-1">Manage your organization members</p>
        </div>
        <div className="bg-[#f87171]/10 border border-[#f87171]/20 rounded-2xl p-6 text-center">
          <p className="text-sm text-[#f87171] font-medium">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-3 text-xs text-[#f87171] underline hover:text-[#f87171]/80">Try again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-display)" }}>Team</h1>
        <p className="text-sm text-[#a3a3a3] mt-1">
          {members.length} member{members.length !== 1 ? "s" : ""} &middot; {invites.length} pending invite{invites.length !== 1 ? "s" : ""}
        </p>
      </div>

      <FadeIn delay={100}>
        <div className="dash-card rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>Members</h2>
              <p className="text-xs text-[#525252] mt-0.5">People with access to this organization</p>
            </div>
            <span className="text-xs text-[#525252] bg-white/[0.06] px-2.5 py-1 rounded-full font-medium">{members.length}</span>
          </div>

          {members.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-[#525252]">No members yet</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {members.map((member) => {
                const isCurrentUser = member.email === currentUserEmail;
                const roleStyle = ROLE_STYLES[member.role] || ROLE_STYLES.member;
                return (
                  <div key={member.user_id} className="px-6 py-4 flex items-center gap-4 hover:bg-white/[0.04] transition-colors group">
                    <Avatar name={member.name} email={member.email} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white truncate">{member.name || member.email}</p>
                        {isCurrentUser && (
                          <span className="text-[10px] text-[#525252] bg-white/[0.06] px-1.5 py-0.5 rounded font-medium">You</span>
                        )}
                      </div>
                      <p className="text-xs text-[#525252] truncate">{member.email}</p>
                    </div>

                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${roleStyle.bg} ${roleStyle.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${roleStyle.dot}`} />
                      {roleStyle.label}
                    </span>

                    <span className="text-xs text-[#3a3a3a] w-24 text-right hidden sm:block">
                      {member.joined_at ? new Date(member.joined_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                    </span>

                    {isOwner && !isCurrentUser && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <select
                          value={member.role}
                          onChange={(e) => handleChangeRole(member.user_id, e.target.value)}
                          disabled={changingRole === member.user_id}
                          className="text-xs bg-[#0f0f0f] text-[#a3a3a3] rounded-lg px-2 py-1.5 focus:outline-none disabled:opacity-50 cursor-pointer input-base"
                        >
                          <option value="admin">Admin</option>
                          <option value="member">Member</option>
                        </select>
                        <button
                          onClick={() => handleRemoveMember(member.user_id, member.email)}
                          disabled={removingMember === member.user_id}
                          className="text-xs text-[#525252] hover:text-[#f87171] transition-colors px-2 py-1.5 rounded-lg hover:bg-[#f87171]/10 disabled:opacity-50"
                          title="Remove member"
                        >
                          {removingMember === member.user_id ? (
                            <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </FadeIn>

      <FadeIn delay={200}>
        <div className="dash-card rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white mb-1" style={{ fontFamily: "var(--font-display)" }}>Invite Member</h2>
          <p className="text-xs text-[#525252] mb-4">Send an invitation link to add someone to your organization</p>

          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1">
              <label className={LABEL}>Email address</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="teammate@example.com"
                className={INPUT}
                required
              />
            </div>
            <div className="w-40">
              <label className={LABEL}>Role</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className={`${INPUT} cursor-pointer`}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={sendingInvite || !inviteEmail.trim()}
              className="rounded-xl bg-white text-[#080808] font-medium px-5 py-2.5 text-sm hover:bg-white/90 transition-all disabled:opacity-40 active:scale-[0.98] flex items-center gap-2"
            >
              {sendingInvite && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
              )}
              {sendingInvite ? "Sending..." : "Send Invite"}
            </button>
          </form>

          {invites.length > 0 && (
            <div className="mt-5 pt-5 border-t border-white/[0.06]">
              <p className="text-xs font-medium text-[#525252] mb-3">Pending Invitations</p>
              <div className="space-y-2">
                {invites.map((invite) => {
                  const daysLeft = Math.ceil((new Date(invite.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  return (
              <div key={invite.id} className="flex items-center justify-between p-3 rounded-xl bg-[#0f0f0f] dash-card group hover:bg-white/[0.04] transition-colors">
                      <div className="flex items-center gap-3">
                        <Avatar email={invite.email} size="sm" />
                        <div>
                          <p className="text-sm text-white font-medium">{invite.email}</p>
                          <p className="text-[11px] text-[#3a3a3a]">
                            {invite.role} &middot; Expires in {daysLeft} day{daysLeft !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleCancelInvite(invite.id, invite.email)}
                        className="text-xs text-[#525252] hover:text-[#f87171] transition-colors px-2.5 py-1.5 rounded-lg hover:bg-[#f87171]/10 opacity-0 group-hover:opacity-100"
                      >
                        Cancel
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </FadeIn>

      <FadeIn delay={250}>
        <div className="dash-card rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white mb-1" style={{ fontFamily: "var(--font-display)" }}>Roles & Permissions</h2>
          <p className="text-xs text-[#525252] mb-4">What each role can do in the organization</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Object.entries(ROLE_STYLES).map(([key, style]) => (
              <div key={key} className="p-3 rounded-xl bg-[#0f0f0f] dash-card">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                  <span className={`text-xs font-semibold ${style.text}`}>{style.label}</span>
                </div>
                <p className="text-xs text-[#525252] leading-relaxed">{ROLE_DESCRIPTIONS[key]}</p>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>

      {org && (
        <FadeIn delay={300}>
          <div className="dash-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>Organization</h2>
                <p className="text-xs text-[#525252] mt-0.5">Your organization identity and plan</p>
              </div>
              <span className="text-xs text-[#a3a3a3] bg-white/[0.06] px-2.5 py-1 rounded-full font-medium capitalize">{org.plan} plan</span>
            </div>

            {!editingOrg ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-[#525252]">Name</span>
                  <span className="text-sm text-white font-medium">{org.name}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-white/[0.06]">
                  <span className="text-xs text-[#525252]">Slug</span>
                  <span className="text-sm text-white" style={{ fontFamily: "var(--font-mono)" }}>{org.slug || "Not set"}</span>
                </div>
                {isOwner && (
                  <button
                    onClick={() => setEditingOrg(true)}
                    className="text-xs text-[#525252] hover:text-white transition-colors mt-2 flex items-center gap-1"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
                    Edit
                  </button>
                )}
              </div>
            ) : (
              <form onSubmit={handleSaveOrg} className="space-y-4">
                <div>
                  <label className={LABEL}>Organization Name</label>
                  <input type="text" value={orgName} onChange={(e) => setOrgName(e.target.value)} className={INPUT} required />
                </div>
                <div>
                  <label className={LABEL}>Slug (URL-friendly identifier)</label>
                  <div className="flex items-center gap-0">
                    <span className="text-xs text-[#3a3a3a] bg-[#0f0f0f] rounded-l-xl px-3 py-2.5 input-base">knight.app/</span>
                    <input type="text" value={orgSlug} onChange={(e) => setOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} className={`${INPUT} rounded-l-none`} pattern="[a-z0-9\-]+" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={savingOrg}
                    className="rounded-xl bg-white text-[#080808] font-medium px-4 py-2 text-sm hover:bg-white/90 transition-all disabled:opacity-40 active:scale-[0.98] flex items-center gap-2"
                  >
                    {savingOrg && <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>}
                    {savingOrg ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditingOrg(false); setOrgName(org.name); setOrgSlug(org.slug || ""); }}
                    className="rounded-xl dash-card-glow text-[#a3a3a3] font-medium px-4 py-2 text-sm hover:bg-white/[0.04] hover:text-white transition-all"
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
