"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

const inputCls = "w-full rounded-xl input-base";

interface Webhook {
  id: string;
  url: string;
  label: string;
  events: string[];
  is_active: boolean;
  last_triggered_at: string | null;
  last_status: number | null;
  secret: string;
  created_at: string;
}

interface McpKey {
  id: string;
  label: string;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
}

export default function IntegrationsPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [mcpKeys, setMcpKeys] = useState<McpKey[]>([]);
  const [showAddWebhook, setShowAddWebhook] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [expandedSecret, setExpandedSecret] = useState<string | null>(null);
  const [showNewKey, setShowNewKey] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/integrations/webhooks").then(r => r.json()).then(d => setWebhooks(d.webhooks || [])).catch(() => {});
    fetch("/api/integrations/mcp").then(r => r.json()).then(d => setMcpKeys(d.keys || [])).catch(() => {});
  }, []);

  async function addWebhook(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/integrations/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newUrl, label: newLabel || "My Webhook" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setWebhooks(prev => [data.webhook, ...prev]);
      setNewUrl("");
      setNewLabel("");
      setShowAddWebhook(false);
      toast.success("Webhook added");
    } catch (e: any) {
      toast.error(e.message || "Failed");
    }
    setSaving(false);
  }

  async function deleteWebhook(id: string) {
    const res = await fetch(`/api/integrations/webhooks?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setWebhooks(prev => prev.filter(w => w.id !== id));
      toast.success("Deleted");
    }
  }

  async function toggleWebhook(id: string, active: boolean) {
    toast.info("Coming soon");
  }

  async function createMcpKey() {
    try {
      const res = await fetch("/api/integrations/mcp", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMcpKeys(prev => [data.key, ...prev]);
      setShowNewKey(data.key.key_value);
      toast.success("Key created");
    } catch (e: any) {
      toast.error(e.message || "Failed");
    }
  }

  async function deleteMcpKey(id: string) {
    const res = await fetch(`/api/integrations/mcp?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setMcpKeys(prev => prev.filter(k => k.id !== id));
      toast.success("Deleted");
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Copied");
  }

  return (
    <div className="space-y-8">
      {/* Webhooks */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[15px] font-semibold text-white">Webhooks</h2>
            <p className="text-[13px] text-[#525252] mt-1">Send data to your own endpoints when events happen in Knight.</p>
          </div>
          <button
            onClick={() => setShowAddWebhook(true)}
            className="px-3 py-1.5 text-[13px] font-medium bg-white text-black rounded-lg hover:bg-[#e5e5e5] transition-colors"
          >
            Add Webhook
          </button>
        </div>

        {showAddWebhook && (
          <form onSubmit={addWebhook} className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-4 mb-4 space-y-3">
            <div>
              <label className="block text-[12px] text-[#737373] mb-1 font-medium">Label</label>
              <input
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                placeholder="e.g. Zapier, My Server"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-[12px] text-[#737373] mb-1 font-medium">Endpoint URL</label>
              <input
                value={newUrl}
                onChange={e => setNewUrl(e.target.value)}
                placeholder="https://your-server.com/webhook"
                className={inputCls}
                required
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowAddWebhook(false)} className="px-3 py-1.5 text-[13px] text-[#737373] hover:text-white transition-colors">Cancel</button>
              <button type="submit" disabled={saving} className="px-3 py-1.5 text-[13px] font-medium bg-white text-black rounded-lg hover:bg-[#e5e5e5] disabled:opacity-50 transition-colors">
                {saving ? "Adding..." : "Add"}
              </button>
            </div>
          </form>
        )}

        {webhooks.length === 0 && !showAddWebhook && (
          <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-8 text-center">
            <p className="text-[13px] text-[#525252]">No webhooks yet. Add one to send audit data to your own server.</p>
          </div>
        )}

        <div className="space-y-2">
          {webhooks.map(w => (
            <div key={w.id} className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-white">{w.label}</span>
                    <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${w.is_active ? "bg-green-500/10 text-green-400" : "bg-[#1a1a1a] text-[#525252]"}`}>
                      {w.is_active ? "Active" : "Paused"}
                    </span>
                    {w.last_status && (
                      <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${w.last_status >= 200 && w.last_status < 300 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                        {w.last_status}
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-[#525252] mt-1 truncate font-mono">{w.url}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[11px] text-[#3a3a3a]">Events: {w.events.join(", ")}</span>
                    {w.last_triggered_at && (
                      <span className="text-[11px] text-[#3a3a3a]">Last: {new Date(w.last_triggered_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <button
                    onClick={() => setExpandedSecret(expandedSecret === w.id ? null : w.id)}
                    className="p-1.5 text-[#525252] hover:text-white transition-colors rounded-lg hover:bg-[#1a1a1a]"
                    title="Show secret"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </button>
                  <button
                    onClick={() => deleteWebhook(w.id)}
                    className="p-1.5 text-[#525252] hover:text-red-400 transition-colors rounded-lg hover:bg-[#1a1a1a]"
                    title="Delete"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </div>
              </div>
              {expandedSecret === w.id && (
                <div className="mt-3 pt-3 border-t border-[#1a1a1a]">
                  <p className="text-[11px] text-[#525252] mb-1">Signing Secret</p>
                  <div className="flex items-center gap-2">
                    <code className="text-[11px] text-[#737373] font-mono bg-black px-2 py-1 rounded flex-1 truncate">{w.secret}</code>
                    <button onClick={() => copyToClipboard(w.secret)} className="text-[11px] text-[#525252] hover:text-white transition-colors">Copy</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Webhook Payload */}
      <section>
        <h2 className="text-[15px] font-semibold text-white mb-4">Webhook Payload</h2>
        <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-4">
          <p className="text-[13px] text-[#737373] mb-3">When an audit completes, Knight sends a POST request to your endpoint with this payload:</p>
          <pre className="text-[12px] text-[#525252] font-mono bg-black rounded-lg p-4 overflow-x-auto whitespace-pre">
{`{
  "event": "audit.completed",
  "data": {
    "company": "Acme Corp",
    "website": "https://acme.com",
    "score": 42,
    "issues": [...],
    "contacts": [...],
    "pitch": "Hi, I noticed your site...",
    "suggestions": [...]
  }
}`}
          </pre>
          <p className="text-[11px] text-[#3a3a3a] mt-3">Each request includes an <code>X-Webhook-Signature</code> header for verification.</p>
        </div>
      </section>

      {/* MCP */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[15px] font-semibold text-white">MCP API Keys</h2>
            <p className="text-[13px] text-[#525252] mt-1">Connect Knight to AI tools like Claude, Cursor, or custom scripts.</p>
          </div>
          <button
            onClick={createMcpKey}
            className="px-3 py-1.5 text-[13px] font-medium bg-white text-black rounded-lg hover:bg-[#e5e5e5] transition-colors"
          >
            Create Key
          </button>
        </div>

        {showNewKey && (
          <div className="bg-[#111111] border border-green-500/20 rounded-xl p-4 mb-4">
            <p className="text-[12px] text-green-400 font-medium mb-2">New API Key (copy it now, it won&apos;t be shown again)</p>
            <div className="flex items-center gap-2">
              <code className="text-[11px] text-[#737373] font-mono bg-black px-2 py-1 rounded flex-1 break-all">{showNewKey}</code>
              <button onClick={() => copyToClipboard(showNewKey)} className="text-[11px] text-[#525252] hover:text-white transition-colors shrink-0">Copy</button>
            </div>
            <button onClick={() => setShowNewKey(null)} className="text-[11px] text-[#3a3a3a] hover:text-white mt-2 transition-colors">Dismiss</button>
          </div>
        )}

        {mcpKeys.length === 0 && !showNewKey && (
          <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-8 text-center">
            <p className="text-[13px] text-[#525252]">No API keys yet. Create one to connect AI tools to Knight.</p>
          </div>
        )}

        <div className="space-y-2">
          {mcpKeys.map(k => (
            <div key={k.id} className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-white">{k.label}</span>
                  <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${k.is_active ? "bg-green-500/10 text-green-400" : "bg-[#1a1a1a] text-[#525252]"}`}>
                    {k.is_active ? "Active" : "Disabled"}
                  </span>
                </div>
                <p className="text-[11px] text-[#3a3a3a] mt-1">
                  Created {new Date(k.created_at).toLocaleDateString()}
                  {k.last_used_at && ` · Last used ${new Date(k.last_used_at).toLocaleDateString()}`}
                </p>
              </div>
              <button
                onClick={() => deleteMcpKey(k.id)}
                className="p-1.5 text-[#525252] hover:text-red-400 transition-colors rounded-lg hover:bg-[#1a1a1a]"
                title="Delete"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* MCP Setup */}
      <section>
        <h2 className="text-[15px] font-semibold text-white mb-4">MCP Setup</h2>
        <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-4 space-y-4">
          <div>
            <p className="text-[13px] text-[#737373] mb-2">Add this to your MCP client config:</p>
            <pre className="text-[12px] text-[#525252] font-mono bg-black rounded-lg p-4 overflow-x-auto whitespace-pre">
{`{
  "mcpServers": {
    "knight": {
      "url": "https://dashboard.knight.app/api/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}`}
            </pre>
          </div>
          <div>
            <p className="text-[13px] text-[#737373] mb-2">Available tools:</p>
            <div className="space-y-1">
              {[
                { name: "audit_site", desc: "Run a full website audit" },
                { name: "list_leads", desc: "Get all leads for your org" },
                { name: "get_audit", desc: "Get a specific audit result" },
                { name: "send_pitch", desc: "Send a pitch email to a lead" },
              ].map(t => (
                <div key={t.name} className="flex items-center gap-3 py-1.5">
                  <code className="text-[12px] text-white font-mono bg-black px-2 py-0.5 rounded">{t.name}</code>
                  <span className="text-[12px] text-[#525252]">{t.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
