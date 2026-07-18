"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

interface Template {
  id: string;
  name: string;
  type: string;
  subject: string;
  body: string;
  is_default: boolean;
  created_at: string;
}

const TEMPLATE_TYPES = [
  { value: "initial", label: "Cold Outreach", desc: "First cold email to a new prospect" },
  { value: "follow_up_1", label: "Follow-up #1", desc: "First follow-up after no reply" },
  { value: "follow_up_2", label: "Follow-up #2", desc: "Final follow-up / breakup email" },
  { value: "re_engagement", label: "Re-engagement", desc: "Re-engaging old contacts" },
  { value: "reply", label: "Interested Reply", desc: "Replying to a positive response" },
];

const VARIABLES = [
  { key: "{{company_name}}", desc: "Target company name" },
  { key: "{{contact_name}}", desc: "Contact person's name" },
  { key: "{{sender_name}}", desc: "Your company name" },
  { key: "{{calendly_link}}", desc: "Your Calendly link" },
  { key: "{{audit_score}}", desc: "Website audit score" },
  { key: "{{industry}}", desc: "Target company's industry" },
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Template | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", type: "initial", subject: "", body: "" });
  const [saving, setSaving] = useState(false);
  const [plan, setPlan] = useState<string>("free");

  useEffect(() => {
    fetch("/api/org")
      .then(r => r.json())
      .then(d => { if (d.plan) setPlan(d.plan); })
      .catch(() => {});

    fetch("/api/templates")
      .then(r => r.json())
      .then(d => { setTemplates(d.templates || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const canUse = plan === "starter" || plan === "max" || plan === "pro" || plan === "enterprise";

  function startCreate() {
    if (!canUse) { toast.error("Upgrade to Starter to create templates", { action: { label: "Upgrade", onClick: () => window.location.href = "/dashboard/billing" } }); return; }
    setEditing(null);
    setForm({ name: "", type: "initial", subject: "", body: "" });
    setCreating(true);
  }

  function startEdit(t: Template) {
    if (!canUse) { toast.error("Upgrade to Starter to edit templates", { action: { label: "Upgrade", onClick: () => window.location.href = "/dashboard/billing" } }); return; }
    setCreating(false);
    setEditing(t);
    setForm({ name: t.name, type: t.type, subject: t.subject, body: t.body });
  }

  async function handleSave() {
    if (!form.name || !form.subject || !form.body) {
      toast.error("Name, subject, and body are required");
      return;
    }
    setSaving(true);
    try {
      const isUpdate = editing && !editing.id.startsWith("default-");
      const res = await fetch("/api/templates", {
        method: isUpdate ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isUpdate ? { id: editing.id, ...form } : form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (isUpdate) {
        setTemplates(prev => prev.map(t => t.id === editing.id ? { ...t, ...form } : t));
      } else {
        setTemplates(prev => [data.template, ...prev]);
      }
      setCreating(false);
      setEditing(null);
      toast.success(isUpdate ? "Template updated" : "Template created");
    } catch (e: any) {
      toast.error(e.message || "Failed");
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (id.startsWith("default-")) { toast.error("Cannot delete default templates"); return; }
    if (!confirm("Delete this template?")) return;
    try {
      const res = await fetch(`/api/templates?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      setTemplates(prev => prev.filter(t => t.id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  }

  function insertVariable(key: string) {
    setForm(prev => ({ ...prev, body: prev.body + key }));
  }

  const isFormOpen = creating || editing !== null;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Email Templates</h1>
          <p className="text-sm text-[#525252] mt-1">
            {canUse ? "Customize your outreach emails with variables" : "View your email templates (upgrade to Starter to create)"}
          </p>
        </div>
        {!isFormOpen && canUse && (
          <button
            onClick={startCreate}
            className="px-4 py-2 rounded-lg bg-white text-black text-[13px] font-medium hover:bg-white/90 transition-colors"
          >
            New Template
          </button>
        )}
      </div>

      {/* Template Form */}
      {isFormOpen && (
        <div className="dash-card p-6 mb-6">
          <h2 className="text-sm font-medium text-white mb-4">
            {editing ? "Edit Template" : "New Template"}
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] text-[#525252] mb-1.5 font-medium">Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Cold Outreach v2"
                  className="w-full input-base rounded-lg px-3 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#525252] mb-1.5 font-medium">Type</label>
                <select
                  value={form.type}
                  onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                  className="w-full input-base rounded-lg px-3 py-2.5 text-sm"
                >
                  {TEMPLATE_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[11px] text-[#525252] mb-1.5 font-medium">Subject Line</label>
              <input
                value={form.subject}
                onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                placeholder="e.g. Quick question about {{company_name}}"
                className="w-full input-base rounded-lg px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#525252] mb-1.5 font-medium">Body</label>
              <textarea
                value={form.body}
                onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
                placeholder="Hey {{contact_name}},&#10;&#10;I noticed {{company_name}}..."
                rows={10}
                className="w-full input-base rounded-lg px-3 py-2.5 text-sm font-mono resize-y"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#525252] mb-1.5 font-medium">Variables</label>
              <div className="flex flex-wrap gap-2">
                {VARIABLES.map(v => (
                  <button
                    key={v.key}
                    onClick={() => insertVariable(v.key)}
                    className="px-2.5 py-1 rounded bg-white/[0.06] text-[11px] text-[#a3a3a3] hover:bg-white/[0.1] hover:text-white transition-colors font-mono"
                    title={v.desc}
                  >
                    {v.key}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setCreating(false); setEditing(null); }}
                className="px-4 py-2 text-[13px] text-[#525252] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-white text-black text-[13px] font-medium hover:bg-white/90 disabled:opacity-50 transition-colors"
              >
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="dash-card p-4 animate-pulse">
              <div className="h-4 w-32 bg-white/[0.04] rounded mb-2" />
              <div className="h-3 w-48 bg-white/[0.02] rounded" />
            </div>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="dash-card p-12 text-center">
          <p className="text-[13px] text-[#525252]">No templates yet. Create your first one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map(t => {
            const typeInfo = TEMPLATE_TYPES.find(tt => tt.value === t.type);
            return (
              <div key={t.id} className="dash-card p-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[13px] font-medium text-white">{t.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/[0.06] text-[#a3a3a3]">
                      {typeInfo?.label || t.type}
                    </span>
                    {t.is_default && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-[#525252] truncate">{t.subject}</p>
                  <p className="text-[11px] text-[#3a3a3a] mt-1 line-clamp-2">{t.body}</p>
                </div>
                <div className="flex items-center gap-1">
                  {canUse && !t.id.startsWith("default-") && (
                    <>
                      <button
                        onClick={() => startEdit(t)}
                        className="p-1.5 rounded text-[#525252] hover:text-white hover:bg-white/[0.06] transition-colors"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-1.5 rounded text-[#525252] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>
                    </>
                  )}
                  {canUse && (
                    <button
                      onClick={() => startEdit(t)}
                      className="p-1.5 rounded text-[#525252] hover:text-white hover:bg-white/[0.06] transition-colors"
                      title="View/Edit"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
