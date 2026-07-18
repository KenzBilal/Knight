"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { FadeIn } from "@/components/Animations";
import { getAvailableVariables } from "@/lib/templates";

interface EmailTemplate {
  id: string;
  name: string;
  type: string;
  subject: string;
  body: string;
  is_default: boolean;
  created_at: string;
}

const TEMPLATE_TYPES = [
  { value: "initial", label: "Cold Outreach", description: "First email to a new lead" },
  { value: "follow_up_1", label: "Follow-up #1", description: "Sent 3 days after initial" },
  { value: "follow_up_2", label: "Follow-up #2", description: "Sent 7 days after initial" },
  { value: "re_engagement", label: "Re-engagement", description: "For stale leads" },
  { value: "reply", label: "Interested Reply", description: "Response to positive replies" },
];

const SAMPLE_VARS: Record<string, string> = {
  company_name: "Acme Corp",
  contact_name: "John Smith",
  sender_name: "Alex Knight",
  sender_website: "knight.app",
  calendly_link: "calendly.com/alex",
  audit_score: "85",
  issues_summary: "Slow load times, missing meta tags",
  industry: "SaaS",
  subject: "Quick question about Acme Corp",
};

export function TemplateManager() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ name: "", type: "initial", subject: "", body: "", is_default: false });
  const [saving, setSaving] = useState(false);
  const [showVariables, setShowVariables] = useState(false);
  const [usingDefaults, setUsingDefaults] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);
  const [plan, setPlan] = useState<string>("free");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const variables = getAvailableVariables();

  const canEdit = plan === "starter" || plan === "max" || plan === "pro" || plan === "enterprise";

  useEffect(() => {
    fetch("/api/org")
      .then(r => r.json())
      .then(d => { if (d.plan) setPlan(d.plan); })
      .catch(() => {});
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    try {
      const res = await fetch("/api/templates");
      const data = await res.json();
      if (data.templates) { setTemplates(data.templates); setUsingDefaults(data.defaults === true); }
    } catch { toast.error("Failed to load templates"); } finally { setLoading(false); }
  }

  function handleCreate() {
    if (!canEdit) { toast.error("Upgrade to Starter to create templates", { action: { label: "Upgrade", onClick: () => window.location.href = "/dashboard/billing" } }); return; }
    setEditingTemplate(null);
    setFormData({ name: "", type: "initial", subject: "", body: "", is_default: false });
    setIsCreating(true);
    setPreviewMode(false);
  }

  function handleEdit(template: EmailTemplate) {
    if (!canEdit) { toast.error("Upgrade to Starter to edit templates", { action: { label: "Upgrade", onClick: () => window.location.href = "/dashboard/billing" } }); return; }
    setEditingTemplate(template);
    setFormData({ name: template.name, type: template.type, subject: template.subject, body: template.body, is_default: template.is_default });
    setIsCreating(false);
    setPreviewMode(false);
  }

  async function handleSave() {
    if (!formData.name || !formData.subject || !formData.body) { toast.error("Fill in all fields"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/templates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      if (!res.ok) throw new Error("Failed");
      toast.success("Template created");
      await fetchTemplates();
      setIsCreating(false);
    } catch { toast.error("Failed to save"); } finally { setSaving(false); }
  }

  async function handleUpdate() {
    if (!editingTemplate) return;
    setSaving(true);
    try {
      const res = await fetch("/api/templates", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editingTemplate.id, ...formData }) });
      if (!res.ok) throw new Error("Failed");
      toast.success("Template updated");
      await fetchTemplates();
      setEditingTemplate(null);
    } catch { toast.error("Failed to update"); } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    setActingId(id);
    try {
      const res = await fetch(`/api/templates?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Deleted");
      await fetchTemplates();
    } catch { toast.error("Failed to delete"); } finally { setActingId(null); setConfirmDelete(null); }
  }

  const insertVariable = useCallback((variable: string) => {
    const ta = textareaRef.current;
    if (ta) {
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const before = formData.body.substring(0, start);
      const after = formData.body.substring(end);
      const newBody = before + `{{${variable}}}` + after;
      setFormData(prev => ({ ...prev, body: newBody }));
      setTimeout(() => { ta.focus(); ta.setSelectionRange(start + variable.length + 4, start + variable.length + 4); }, 0);
    } else {
      setFormData(prev => ({ ...prev, body: prev.body + `{{${variable}}}` }));
    }
  }, [formData.body]);

  function renderPreview(): string {
    let body = formData.body;
    for (const [key, val] of Object.entries(SAMPLE_VARS)) {
      body = body.replaceAll(`{{${key}}}`, val);
    }
    return body;
  }

  if (loading) {
    return (
      <div className="dash-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-ink-800 rounded w-1/3" />
          <div className="h-32 bg-ink-800 rounded" />
        </div>
      </div>
    );
  }

  return (
    <FadeIn delay={600}>
      <div className="dash-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>Email Templates</h2>
          {canEdit && !usingDefaults && !isCreating && !editingTemplate && (
            <button onClick={handleCreate}
              className="rounded-xl bg-white text-[#080808] font-medium px-4 py-2 text-sm hover:bg-white/90 transition-all active:scale-[0.98]">
              New Template
            </button>
          )}
        </div>

        {!canEdit && (
          <div className="rounded-xl bg-white/[0.04] p-3 text-xs text-[#525252]">
            View-only. Upgrade to Starter to create and edit templates.
          </div>
        )}

        {usingDefaults && (
          <div className="rounded-xl bg-white/[0.04] dash-card-glow p-3 text-sm text-[#525252]">
            Using default templates. Run migration to enable custom templates.
          </div>
        )}

        {!isCreating && !editingTemplate && (
          <div className="space-y-2">
            {templates.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center mx-auto mb-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3a3a3a" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                </div>
                <p className="text-sm text-[#525252]">No templates yet</p>
              </div>
            ) : (
              templates.map(template => (
                <div key={template.id} className="flex items-center justify-between p-4 rounded-xl bg-[#0f0f0f] dash-card hover:bg-white/[0.02] transition-all">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-white">{template.name}</span>
                      {template.is_default && <span className="text-[10px] bg-white/[0.06] text-[#a3a3a3] px-2 py-0.5 rounded-full font-medium">Default</span>}
                      <span className="text-[11px] text-[#525252] uppercase tracking-wider font-semibold" style={{ fontFamily: "var(--font-mono)" }}>
                        {TEMPLATE_TYPES.find(t => t.value === template.type)?.label}
                      </span>
                    </div>
                    <p className="text-xs text-[#525252] mt-1 line-clamp-1">{template.subject}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {confirmDelete === template.id ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-[#f87171]">Delete?</span>
                        <button onClick={() => handleDelete(template.id)} disabled={actingId === template.id}
                          className="text-[11px] text-[#f87171] font-semibold hover:underline disabled:opacity-50">
                          {actingId === template.id ? "..." : "Yes"}
                        </button>
                        <button onClick={() => setConfirmDelete(null)}
                          className="text-[11px] text-[#525252] font-medium hover:text-white">No</button>
                      </div>
                    ) : (
                      <>
                        {canEdit && !template.id.startsWith("default-") && (
                          <>
                            <button onClick={() => handleEdit(template)} disabled={actingId !== null}
                              className="text-xs text-[#737373] hover:text-white font-medium transition-colors disabled:opacity-50">Edit</button>
                            <button onClick={() => setConfirmDelete(template.id)} disabled={actingId !== null}
                              className="text-xs text-[#f87171]/60 hover:text-[#f87171] font-medium transition-colors disabled:opacity-50">Delete</button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {(isCreating || editingTemplate) && (
          <div className="space-y-4 p-5 rounded-2xl bg-[#0a0a0a] dash-card">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-white">{editingTemplate ? "Edit Template" : "New Template"}</h3>
              <button onClick={() => { setIsCreating(false); setEditingTemplate(null); }}
                className="text-xs font-medium text-[#525252] hover:text-white transition-colors">Cancel</button>
            </div>

            {/* Preview toggle */}
            <div className="flex items-center gap-1 p-1 bg-[#0f0f0f] rounded-lg w-fit">
              <button onClick={() => setPreviewMode(false)}
                className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all ${!previewMode ? "bg-white text-[#080808]" : "text-[#525252] hover:text-[#a3a3a3]"}`}>
                Edit
              </button>
              <button onClick={() => setPreviewMode(true)}
                className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all ${previewMode ? "bg-white text-[#080808]" : "text-[#525252] hover:text-[#a3a3a3]"}`}>
                Preview
              </button>
            </div>

            {previewMode ? (
              <div className="space-y-3">
                <div className="rounded-xl bg-[#0f0f0f] p-4 border border-white/[0.06]">
                  <p className="text-[10px] text-[#525252] uppercase tracking-wider mb-2 font-medium" style={{ fontFamily: "var(--font-mono)" }}>Subject</p>
                  <p className="text-sm text-white">{formData.subject || "No subject"}</p>
                </div>
                <div className="rounded-xl bg-[#0f0f0f] p-4 border border-white/[0.06]">
                  <p className="text-[10px] text-[#525252] uppercase tracking-wider mb-2 font-medium" style={{ fontFamily: "var(--font-mono)" }}>Body</p>
                  <p className="text-sm text-[#a3a3a3] whitespace-pre-wrap leading-relaxed">{renderPreview() || "No content"}</p>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#525252] mb-1.5">Name</label>
                    <input type="text" value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="Cold Outreach"
                      className="w-full input-base" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#525252] mb-1.5">Type</label>
                    <select value={formData.type} onChange={e => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full input-base cursor-pointer">
                      {TEMPLATE_TYPES.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#525252] mb-1.5">Subject</label>
                  <input type="text" value={formData.subject} onChange={e => setFormData(prev => ({ ...prev, subject: e.target.value }))} placeholder="Quick question about {{company_name}}"
                    className="w-full input-base" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-[#525252]">Body</label>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-[#3a3a3a]" style={{ fontFamily: "var(--font-mono)" }}>{formData.body.length} chars</span>
                      <button type="button" onClick={() => setShowVariables(!showVariables)} className="text-xs font-medium text-[#525252] hover:text-white transition-colors">
                        {showVariables ? "Hide" : "Variables"}
                      </button>
                    </div>
                  </div>
                  {showVariables && (
                    <div className="mb-2 p-3 rounded-xl bg-[#0f0f0f] border border-white/[0.06]">
                      <p className="text-[10px] text-[#525252] mb-2 uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)" }}>Click to insert at cursor</p>
                      <div className="flex flex-wrap gap-1.5">
                        {variables.map(v => (
                          <button key={v.name} onClick={() => insertVariable(v.name)} title={v.description}
                            className="text-[10px] font-mono bg-white/[0.04] text-[#a3a3a3] px-2 py-1 rounded-md hover:bg-white/[0.08] hover:text-white transition-colors border border-white/[0.06]">
                            {`{{${v.name}}}`}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <textarea ref={textareaRef} value={formData.body} onChange={e => setFormData(prev => ({ ...prev, body: e.target.value }))}
                    placeholder="Write your email template. Use {{variable}} for dynamic content."
                    rows={10}
                    className="w-full rounded-xl bg-[#0f0f0f] border border-white/[0.08] px-4 py-3 text-sm text-white placeholder:text-[#3a3a3a] focus:outline-none focus:border-white/[0.2] transition-all font-mono resize-y" />
                </div>

                <div className="flex items-center gap-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={formData.is_default} onChange={e => setFormData(prev => ({ ...prev, is_default: e.target.checked }))} className="sr-only peer" />
                    <div className="w-9 h-5 bg-white/[0.06] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#525252] after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white peer-checked:after:bg-[#080808]"></div>
                  </label>
                  <label className="text-sm font-medium text-[#737373]">Set as default</label>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.06]">
                  <button onClick={() => { setIsCreating(false); setEditingTemplate(null); }}
                    className="btn-ghost px-4 py-2 text-sm">Cancel</button>
                  <button onClick={editingTemplate ? handleUpdate : handleSave} disabled={saving}
                    className="btn-primary px-4 py-2 text-sm disabled:opacity-50">
                    {saving ? "Saving..." : editingTemplate ? "Update" : "Create"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        <div className="text-xs text-[#3a3a3a]">
          <p>Use <span className="font-mono text-[#525252]">{"{{variable}}"}</span> syntax. Available: {variables.map(v => v.name).join(", ")}</p>
        </div>
      </div>
    </FadeIn>
  );
}
