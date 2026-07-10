"use client";

import { useState, useEffect } from "react";
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

export function TemplateManager() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "initial",
    subject: "",
    body: "",
    is_default: false,
  });
  const [saving, setSaving] = useState(false);
  const [showVariables, setShowVariables] = useState(false);
  const [usingDefaults, setUsingDefaults] = useState(false);

  const variables = getAvailableVariables();

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    try {
      const res = await fetch("/api/templates");
      const data = await res.json();
      if (data.templates) {
        setTemplates(data.templates);
        setUsingDefaults(data.defaults === true);
      }
    } catch (err) {
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(template: EmailTemplate) {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      type: template.type,
      subject: template.subject,
      body: template.body,
      is_default: template.is_default,
    });
    setIsCreating(false);
  }

  function handleCreate() {
    setEditingTemplate(null);
    setFormData({
      name: "",
      type: "initial",
      subject: "",
      body: "",
      is_default: false,
    });
    setIsCreating(true);
  }

  async function handleSave() {
    if (!formData.name || !formData.subject || !formData.body) {
      toast.error("Please fill in all fields");
      return;
    }

    setSaving(true);
    const promise = fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    }).then(async (res) => {
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    });

    toast.promise(promise, {
      loading: "Saving template...",
      success: "Template saved!",
      error: "Failed to save template",
    });

    promise.then(() => {
      fetchTemplates();
      setIsCreating(false);
      setEditingTemplate(null);
    });

    promise.finally(() => setSaving(false));
  }

  async function handleUpdate() {
    if (!editingTemplate) return;

    setSaving(true);
    const promise = fetch("/api/templates", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingTemplate.id, ...formData }),
    }).then(async (res) => {
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    });

    toast.promise(promise, {
      loading: "Updating template...",
      success: "Template updated!",
      error: "Failed to update template",
    });

    promise.then(() => {
      fetchTemplates();
      setEditingTemplate(null);
    });

    promise.finally(() => setSaving(false));
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this template?")) return;

    const promise = fetch(`/api/templates?id=${id}`, {
      method: "DELETE",
    }).then(async (res) => {
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    });

    toast.promise(promise, {
      loading: "Deleting template...",
      success: "Template deleted!",
      error: "Failed to delete template",
    });

    promise.then(() => fetchTemplates());
  }

  function insertVariable(variable: string) {
    setFormData(prev => ({
      ...prev,
      body: prev.body + `{{${variable}}}`,
    }));
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-line bg-ink-900 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-ink-800 rounded w-1/3"></div>
          <div className="h-4 bg-ink-800 rounded w-2/3"></div>
          <div className="h-32 bg-ink-800 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <FadeIn delay={600}>
      <div className="rounded-xl border border-line bg-ink-900 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg text-paper-100">Email Templates</h2>
            <p className="text-sm text-paper-400 mt-1">
              Customize your outreach emails with templates and variables.
            </p>
          </div>
          {!usingDefaults && (
            <button
              onClick={handleCreate}
              className="rounded-lg bg-flash-500 text-ink-950 font-medium px-4 py-2 text-sm hover:bg-flash-400 transition-all active:scale-[0.98]"
            >
              New Template
            </button>
          )}
        </div>

        {usingDefaults && (
          <div className="rounded-lg bg-flash-500/10 border border-flash-500/20 p-3 text-sm text-flash-500">
            Using built-in default templates. Run the migration in Supabase SQL Editor to enable custom templates.
          </div>
        )}

        {/* Template List */}
        {!isCreating && !editingTemplate && (
          <div className="space-y-2">
            {templates.length === 0 ? (
              <p className="text-sm text-paper-500 py-4 text-center">
                No templates yet. Create your first template to get started.
              </p>
            ) : (
              templates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-ink-950 border border-line hover:border-flash-500/30 transition-all"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-paper-100">
                        {template.name}
                      </span>
                      {template.is_default && (
                        <span className="text-xs bg-flash-500/20 text-flash-500 px-2 py-0.5 rounded">
                          Default
                        </span>
                      )}
                      <span className="text-xs text-paper-500">
                        {TEMPLATE_TYPES.find(t => t.value === template.type)?.label}
                      </span>
                    </div>
                    <p className="text-xs text-paper-400 mt-1 line-clamp-1">
                      {template.subject}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!template.id.startsWith("default-") && (
                      <>
                        <button
                          onClick={() => handleEdit(template)}
                          className="text-xs text-paper-400 hover:text-paper-200 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(template.id)}
                          className="text-xs text-red-400 hover:text-red-300 transition-colors"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Template Editor */}
        {(isCreating || editingTemplate) && (
          <div className="space-y-4 p-4 rounded-lg bg-ink-950 border border-line">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-paper-100">
                {editingTemplate ? "Edit Template" : "New Template"}
              </h3>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingTemplate(null);
                }}
                className="text-xs text-paper-400 hover:text-paper-200 transition-colors"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-paper-300 mb-1.5">Template Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Cold Outreach"
                  className="w-full rounded-lg bg-ink-900 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500 focus:ring-1 focus:ring-flash-500/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm text-paper-300 mb-1.5">Template Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full rounded-lg bg-ink-900 border border-line px-4 py-2.5 text-sm text-paper-100 focus:outline-none focus:border-flash-500 focus:ring-1 focus:ring-flash-500/20 transition-all"
                >
                  {TEMPLATE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label} - {type.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-paper-300 mb-1.5">Subject Line</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="e.g., Quick question about {{company_name}}"
                className="w-full rounded-lg bg-ink-900 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500 focus:ring-1 focus:ring-flash-500/20 transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm text-paper-300">Email Body</label>
                <button
                  type="button"
                  onClick={() => setShowVariables(!showVariables)}
                  className="text-xs text-flash-500 hover:text-flash-400 transition-colors"
                >
                  {showVariables ? "Hide Variables" : "Show Variables"}
                </button>
              </div>

              {showVariables && (
                <div className="mb-2 p-3 rounded-lg bg-ink-900 border border-line">
                  <p className="text-xs text-paper-400 mb-2">Click to insert:</p>
                  <div className="flex flex-wrap gap-2">
                    {variables.map((v) => (
                      <button
                        key={v.name}
                        onClick={() => insertVariable(v.name)}
                        className="text-xs bg-ink-800 text-paper-300 px-2 py-1 rounded hover:bg-ink-700 transition-colors"
                        title={v.description}
                      >
                        {`{{${v.name}}}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <textarea
                value={formData.body}
                onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                placeholder="Write your email template here. Use {{variable_name}} for dynamic content."
                rows={10}
                className="w-full rounded-lg bg-ink-900 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500 focus:ring-1 focus:ring-flash-500/20 transition-all font-mono"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_default"
                checked={formData.is_default}
                onChange={(e) => setFormData(prev => ({ ...prev, is_default: e.target.checked }))}
                className="rounded border-line bg-ink-900 text-flash-500 focus:ring-flash-500"
              />
              <label htmlFor="is_default" className="text-sm text-paper-300">
                Set as default for this template type
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingTemplate(null);
                }}
                className="rounded-lg border border-line px-4 py-2 text-sm text-paper-300 hover:bg-ink-800 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={editingTemplate ? handleUpdate : handleSave}
                disabled={saving}
                className="rounded-lg bg-flash-500 text-ink-950 font-medium px-4 py-2 text-sm hover:bg-flash-400 transition-all disabled:opacity-50 active:scale-[0.98]"
              >
                {saving ? "Saving..." : editingTemplate ? "Update" : "Create"}
              </button>
            </div>
          </div>
        )}

        {/* Variables Help */}
        <div className="text-xs text-paper-500">
          <p>
            Use {"{{variable_name}}"} syntax to insert dynamic content. Available variables:{" "}
            {variables.map(v => v.name).join(", ")}
          </p>
        </div>
      </div>
    </FadeIn>
  );
}
