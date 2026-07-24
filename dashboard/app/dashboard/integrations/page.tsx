"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { createPortal } from "react-dom";
import { track } from "@/lib/analytics";

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
  key_value?: string;
  last_used_at: string | null;
  created_at: string;
}

function Modal({ children, onClose, wide }: { children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className={`bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl w-full mx-4 p-0 overflow-hidden shadow-2xl ${wide ? "max-w-2xl" : "max-w-lg"}`} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body
  );
}

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); toast.success(label || "Copied"); setTimeout(() => setCopied(false), 2000); }} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium bg-white/[0.06] text-[#a3a3a3] rounded-md hover:bg-white/[0.1] hover:text-white transition-colors">
      {copied ? (
        <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg> Copied</>
      ) : (
        <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy</>
      )}
    </button>
  );
}

export default function IntegrationsPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [mcpKeys, setMcpKeys] = useState<McpKey[]>([]);

  const [showMcpCreate, setShowMcpCreate] = useState(false);
  const [mcpLabel, setMcpLabel] = useState("");
  const [mcpSaving, setMcpSaving] = useState(false);
  const [newMcpKey, setNewMcpKey] = useState<{ key_value: string; label: string } | null>(null);

  const [showWebhookCreate, setShowWebhookCreate] = useState(false);
  const [whUrl, setWhUrl] = useState("");
  const [whLabel, setWhLabel] = useState("");
  const [whEvents, setWhEvents] = useState<string[]>(["audit.completed"]);
  const [whSaving, setWhSaving] = useState(false);
  const [newWebhook, setNewWebhook] = useState<Webhook | null>(null);

  const [detailWebhook, setDetailWebhook] = useState<Webhook | null>(null);
  const [detailMcpKey, setDetailMcpKey] = useState<McpKey | null>(null);

  useEffect(() => {
    fetch("/api/integrations/webhooks").then(r => r.json()).then(d => setWebhooks(d.webhooks || [])).catch(() => {});
    fetch("/api/integrations/mcp").then(r => r.json()).then(d => setMcpKeys(d.keys || [])).catch(() => {});
  }, []);

  async function handleCreateMcp(e: React.FormEvent) {
    e.preventDefault();
    setMcpSaving(true);
    try {
      const res = await fetch("/api/integrations/mcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: mcpLabel || "Default" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMcpKeys(prev => [data.key, ...prev]);
      setNewMcpKey({ key_value: data.key.key_value, label: data.key.label });
      setShowMcpCreate(false);
      setMcpLabel("");
    } catch (e: any) { toast.error(e.message || "Failed"); }
    setMcpSaving(false);
  }

  async function handleCreateWebhook(e: React.FormEvent) {
    e.preventDefault();
    if (whEvents.length === 0) { toast.error("Select at least one event"); return; }
    setWhSaving(true);
    try {
      const res = await fetch("/api/integrations/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: whUrl, label: whLabel || "My Webhook", events: whEvents }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setWebhooks(prev => [data.webhook, ...prev]);
      setNewWebhook(data.webhook);
      setShowWebhookCreate(false);
      track("webhook_created", { url: whUrl, label: whLabel || "My Webhook", events: whEvents });
      setWhUrl("");
      setWhLabel("");
      setWhEvents(["audit.completed"]);
    } catch (e: any) { toast.error(e.message || "Failed"); }
    setWhSaving(false);
  }

  async function deleteWebhook(id: string) {
    const res = await fetch(`/api/integrations/webhooks?id=${id}`, { method: "DELETE" });
    if (res.ok) { setWebhooks(prev => prev.filter(w => w.id !== id)); toast.success("Deleted"); setDetailWebhook(null); }
  }

  async function deleteMcpKey(id: string) {
    const res = await fetch(`/api/integrations/mcp?id=${id}`, { method: "DELETE" });
    if (res.ok) { setMcpKeys(prev => prev.filter(k => k.id !== id)); toast.success("Deleted"); setDetailMcpKey(null); }
  }

  const MCP_CONFIG_EXAMPLE = `{
  "mcpServers": {
    "knight": {
      "url": "https://dashboard-ten-lake-62.vercel.app/api/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}`;

  return (
    <div className="space-y-8">
      {/* Webhooks */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[15px] font-semibold text-white">Webhooks</h2>
            <p className="text-[12px] text-[#525252] mt-0.5">Send real-time events to your server</p>
          </div>
          <button onClick={() => setShowWebhookCreate(true)} className="px-3 py-1.5 text-[13px] font-medium bg-white text-black rounded-lg hover:bg-[#e5e5e5] transition-colors">
            Add Webhook
          </button>
        </div>

        {webhooks.length === 0 ? (
          <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-8 text-center">
            <div className="w-10 h-10 rounded-lg bg-white/[0.04] flex items-center justify-center mx-auto mb-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3a3a3a" strokeWidth="1.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            </div>
            <p className="text-[13px] text-[#737373] mb-1">No webhooks</p>
            <p className="text-[11px] text-[#3a3a3a]">Add a webhook to receive events on your server.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {webhooks.map(w => (
              <button key={w.id} onClick={() => setDetailWebhook(w)} className="w-full bg-[#111111] border border-[#1a1a1a] rounded-xl p-4 text-left hover:border-[#2a2a2a] transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#737373" strokeWidth="1.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-white">{w.label}</span>
                        <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${w.is_active ? "bg-green-500/10 text-green-400" : "bg-[#1a1a1a] text-[#525252]"}`}>{w.is_active ? "Active" : "Paused"}</span>
                      </div>
                      <p className="text-[11px] text-[#525252] mt-0.5 truncate font-mono">{w.url}</p>
                    </div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3a3a3a" strokeWidth="2" className="flex-shrink-0 ml-3"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* MCP API Keys */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[15px] font-semibold text-white">MCP API Keys</h2>
            <p className="text-[12px] text-[#525252] mt-0.5">Connect AI tools to Knight</p>
          </div>
          <button onClick={() => setShowMcpCreate(true)} className="px-3 py-1.5 text-[13px] font-medium bg-white text-black rounded-lg hover:bg-[#e5e5e5] transition-colors">
            Create Key
          </button>
        </div>

        {mcpKeys.length === 0 ? (
          <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-8 text-center">
            <div className="w-10 h-10 rounded-lg bg-white/[0.04] flex items-center justify-center mx-auto mb-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3a3a3a" strokeWidth="1.5"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
            </div>
            <p className="text-[13px] text-[#737373] mb-1">No API keys</p>
            <p className="text-[11px] text-[#3a3a3a]">Create a key to connect MCP-compatible tools.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {mcpKeys.map(k => (
              <button key={k.id} onClick={() => setDetailMcpKey(k)} className="w-full bg-[#111111] border border-[#1a1a1a] rounded-xl p-4 text-left hover:border-[#2a2a2a] transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#737373" strokeWidth="1.5"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-white">{k.label}</span>
                        <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${k.is_active ? "bg-green-500/10 text-green-400" : "bg-[#1a1a1a] text-[#525252]"}`}>{k.is_active ? "Active" : "Disabled"}</span>
                      </div>
                      <p className="text-[11px] text-[#525252] mt-0.5">
                        Created {new Date(k.created_at).toLocaleDateString()}
                        {k.last_used_at && ` · Last used ${new Date(k.last_used_at).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3a3a3a" strokeWidth="2" className="flex-shrink-0 ml-3"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ═══ CREATE MCP KEY MODAL ═══ */}
      {showMcpCreate && (
        <Modal onClose={() => setShowMcpCreate(false)}>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-white">Create API Key</h3>
                <p className="text-[12px] text-[#525252]">Connect AI tools like Cursor, Windsurf, or Claude Desktop</p>
              </div>
            </div>
            <form onSubmit={handleCreateMcp}>
              <div className="mb-5">
                <label className="block text-[12px] text-[#737373] mb-1.5 font-medium">Name</label>
                <input value={mcpLabel} onChange={e => setMcpLabel(e.target.value)} placeholder="e.g. Production, My Laptop" className={inputCls} autoFocus />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowMcpCreate(false)} className="px-4 py-2 text-[13px] text-[#737373] hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={mcpSaving} className="px-4 py-2 text-[13px] font-medium bg-white text-black rounded-lg hover:bg-[#e5e5e5] disabled:opacity-50 transition-colors">{mcpSaving ? "Creating..." : "Create Key"}</button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* ═══ NEW MCP KEY REVEALED MODAL ═══ */}
      {newMcpKey && (
        <Modal onClose={() => setNewMcpKey(null)} wide>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-white">API Key Created</h3>
                <p className="text-[12px] text-[#525252]">Copy your key now — it won&apos;t be shown again.</p>
              </div>
            </div>

            <div className="bg-[#080808] border border-[#1a1a1a] rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-[#525252] font-medium uppercase tracking-wider">API Key</span>
                <CopyButton text={newMcpKey.key_value} />
              </div>
              <code className="text-[13px] text-[#a3a3a3] font-mono break-all leading-relaxed">{newMcpKey.key_value}</code>
            </div>

            <div className="bg-[#080808] border border-[#1a1a1a] rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-[#525252] font-medium uppercase tracking-wider">MCP Config</span>
                <CopyButton text={MCP_CONFIG_EXAMPLE.replace("YOUR_API_KEY", newMcpKey.key_value)} label="Config copied" />
              </div>
              <pre className="text-[12px] text-[#737373] font-mono overflow-x-auto whitespace-pre leading-relaxed">{MCP_CONFIG_EXAMPLE.replace("YOUR_API_KEY", newMcpKey.key_value)}</pre>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 mb-5">
              <p className="text-[12px] text-amber-400/80">This key will not be displayed again. Store it securely.</p>
            </div>

            <div className="flex justify-end">
              <button onClick={() => setNewMcpKey(null)} className="px-4 py-2 text-[13px] font-medium bg-white text-black rounded-lg hover:bg-[#e5e5e5] transition-colors">I&apos;ve saved my key</button>
            </div>
          </div>
        </Modal>
      )}

      {/* ═══ CREATE WEBHOOK MODAL ═══ */}
      {showWebhookCreate && (
        <Modal onClose={() => setShowWebhookCreate(false)} wide>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-white">Add Webhook</h3>
                <p className="text-[12px] text-[#525252]">Receive POST requests when events happen</p>
              </div>
            </div>
            <form onSubmit={handleCreateWebhook}>
              <div className="space-y-4 mb-5">
                <div>
                  <label className="block text-[12px] text-[#737373] mb-1.5 font-medium">Endpoint URL</label>
                  <input value={whUrl} onChange={e => setWhUrl(e.target.value)} placeholder="https://your-server.com/webhook" className={inputCls} required autoFocus />
                </div>
                <div>
                  <label className="block text-[12px] text-[#737373] mb-1.5 font-medium">Description <span className="text-[#3a3a3a]">(optional)</span></label>
                  <input value={whLabel} onChange={e => setWhLabel(e.target.value)} placeholder="e.g. Zapier, My Server" className={inputCls} />
                </div>
                <div>
                  <label className="block text-[12px] text-[#737373] mb-1.5 font-medium">Events</label>
                  <div className="bg-[#080808] border border-[#1a1a1a] rounded-xl p-3 space-y-2">
                    {[
                      { value: "audit.completed", label: "audit.completed", desc: "Fired when a website audit finishes" },
                      { value: "email.sent", label: "email.sent", desc: "Fired when an outreach email is sent" },
                      { value: "email.replied", label: "email.replied", desc: "Fired when a prospect replies" },
                      { value: "lead.created", label: "lead.created", desc: "Fired when a new lead is discovered" },
                    ].map(evt => (
                      <label key={evt.value} className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={whEvents.includes(evt.value)}
                          onChange={e => {
                            setWhEvents(prev =>
                              e.target.checked ? [...prev, evt.value] : prev.filter(x => x !== evt.value)
                            );
                          }}
                          className="w-4 h-4 rounded border-[#3a3a3a] bg-[#111111] text-white accent-white"
                        />
                        <div>
                          <span className="text-[13px] text-white font-medium">{evt.label}</span>
                          <p className="text-[11px] text-[#525252]">{evt.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowWebhookCreate(false)} className="px-4 py-2 text-[13px] text-[#737373] hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={whSaving} className="px-4 py-2 text-[13px] font-medium bg-white text-black rounded-lg hover:bg-[#e5e5e5] disabled:opacity-50 transition-colors">{whSaving ? "Adding..." : "Add Webhook"}</button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* ═══ NEW WEBHOOK CREATED MODAL ═══ */}
      {newWebhook && (
        <Modal onClose={() => setNewWebhook(null)} wide>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-white">Webhook Created</h3>
                <p className="text-[12px] text-[#525252]">Save your signing secret — it won&apos;t be shown again.</p>
              </div>
            </div>

            <div className="bg-[#080808] border border-[#1a1a1a] rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-[#525252] font-medium uppercase tracking-wider">Signing Secret</span>
                <CopyButton text={newWebhook.secret} />
              </div>
              <code className="text-[13px] text-[#a3a3a3] font-mono break-all leading-relaxed">{newWebhook.secret}</code>
            </div>

            <div className="bg-[#080808] border border-[#1a1a1a] rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-[#525252] font-medium uppercase tracking-wider">Example Payload</span>
                <CopyButton text='{"event":"audit.completed","data":{"company":"Acme Corp","website":"https://acme.com","score":42}}' label="Payload copied" />
              </div>
              <pre className="text-[12px] text-[#737373] font-mono overflow-x-auto whitespace-pre leading-relaxed">{`{
  "event": "audit.completed",
  "data": {
    "company": "Acme Corp",
    "website": "https://acme.com",
    "score": 42,
    "issues": [...],
    "contacts": [...],
    "pitch": "Hi, I noticed your site..."
  }
}`}</pre>
            </div>

            <div className="bg-[#080808] border border-[#1a1a1a] rounded-xl p-4 mb-4">
              <span className="text-[11px] text-[#525252] font-medium uppercase tracking-wider block mb-2">Headers</span>
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <code className="text-[12px] text-white font-mono bg-black px-2 py-0.5 rounded">Content-Type</code>
                  <span className="text-[11px] text-[#525252]">application/json</span>
                </div>
                <div className="flex items-center gap-3">
                  <code className="text-[12px] text-white font-mono bg-black px-2 py-0.5 rounded">X-Webhook-Signature</code>
                  <span className="text-[11px] text-[#525252]">HMAC-SHA256 of body with your secret</span>
                </div>
                <div className="flex items-center gap-3">
                  <code className="text-[12px] text-white font-mono bg-black px-2 py-0.5 rounded">X-Knight-Event</code>
                  <span className="text-[11px] text-[#525252]">audit.completed</span>
                </div>
              </div>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 mb-5">
              <p className="text-[12px] text-amber-400/80">This secret will not be displayed again. Store it securely and use it to verify webhook signatures.</p>
            </div>

            <div className="flex justify-end">
              <button onClick={() => setNewWebhook(null)} className="px-4 py-2 text-[13px] font-medium bg-white text-black rounded-lg hover:bg-[#e5e5e5] transition-colors">Done</button>
            </div>
          </div>
        </Modal>
      )}

      {/* ═══ WEBHOOK DETAIL MODAL ═══ */}
      {detailWebhook && (
        <Modal onClose={() => setDetailWebhook(null)} wide>
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-white">{detailWebhook.label}</h3>
                  <p className="text-[12px] text-[#525252] font-mono">{detailWebhook.url}</p>
                </div>
              </div>
              <button onClick={() => setDetailWebhook(null)} className="p-1.5 text-[#525252] hover:text-white transition-colors rounded-lg hover:bg-[#1a1a1a]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-[#080808] border border-[#1a1a1a] rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-[#525252] font-medium uppercase tracking-wider">Signing Secret</span>
                </div>
                <code className="text-[13px] text-[#a3a3a3] font-mono break-all leading-relaxed">whsec_••••••••••••••••</code>
                <p className="text-[11px] text-[#3a3a3a] mt-2">Secret is only shown at creation time for security.</p>
              </div>

              <div className="bg-[#080808] border border-[#1a1a1a] rounded-xl p-4">
                <span className="text-[11px] text-[#525252] font-medium uppercase tracking-wider block mb-2">Status</span>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 text-[11px] font-medium rounded ${detailWebhook.is_active ? "bg-green-500/10 text-green-400" : "bg-[#1a1a1a] text-[#525252]"}`}>{detailWebhook.is_active ? "Active" : "Paused"}</span>
                  {detailWebhook.last_status && <span className={`px-2 py-0.5 text-[11px] font-medium rounded ${detailWebhook.last_status >= 200 && detailWebhook.last_status < 300 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>Last: {detailWebhook.last_status}</span>}
                  {detailWebhook.last_triggered_at && <span className="text-[11px] text-[#525252]">Triggered {new Date(detailWebhook.last_triggered_at).toLocaleDateString()}</span>}
                </div>
              </div>

              <div className="bg-[#080808] border border-[#1a1a1a] rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-[#525252] font-medium uppercase tracking-wider">Example Payload</span>
                  <CopyButton text='{"event":"audit.completed","data":{"company":"Acme Corp","website":"https://acme.com","score":42}}' label="Payload copied" />
                </div>
                <pre className="text-[12px] text-[#737373] font-mono overflow-x-auto whitespace-pre leading-relaxed">{`{
  "event": "audit.completed",
  "data": {
    "company": "Acme Corp",
    "website": "https://acme.com",
    "score": 42,
    "issues": [...],
    "contacts": [...],
    "pitch": "Hi, I noticed your site..."
  }
}`}</pre>
              </div>

              <div className="bg-[#080808] border border-[#1a1a1a] rounded-xl p-4">
                <span className="text-[11px] text-[#525252] font-medium uppercase tracking-wider block mb-2">Headers</span>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <code className="text-[12px] text-white font-mono bg-black px-2 py-0.5 rounded">Content-Type</code>
                    <span className="text-[11px] text-[#525252]">application/json</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <code className="text-[12px] text-white font-mono bg-black px-2 py-0.5 rounded">X-Webhook-Signature</code>
                    <span className="text-[11px] text-[#525252]">HMAC-SHA256 of body with your secret</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <code className="text-[12px] text-white font-mono bg-black px-2 py-0.5 rounded">X-Knight-Event</code>
                    <span className="text-[11px] text-[#525252]">audit.completed</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-5">
              <button onClick={() => { if (confirm("Delete this webhook?")) deleteWebhook(detailWebhook.id); }} className="px-4 py-2 text-[13px] font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">Delete Webhook</button>
            </div>
          </div>
        </Modal>
      )}

      {/* ═══ MCP KEY DETAIL MODAL ═══ */}
      {detailMcpKey && (
        <Modal onClose={() => setDetailMcpKey(null)} wide>
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-white">{detailMcpKey.label}</h3>
                  <p className="text-[12px] text-[#525252]">Created {new Date(detailMcpKey.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <button onClick={() => setDetailMcpKey(null)} className="p-1.5 text-[#525252] hover:text-white transition-colors rounded-lg hover:bg-[#1a1a1a]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-[#080808] border border-[#1a1a1a] rounded-xl p-4">
                <span className="text-[11px] text-[#525252] font-medium uppercase tracking-wider block mb-2">Status</span>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 text-[11px] font-medium rounded ${detailMcpKey.is_active ? "bg-green-500/10 text-green-400" : "bg-[#1a1a1a] text-[#525252]"}`}>{detailMcpKey.is_active ? "Active" : "Disabled"}</span>
                  {detailMcpKey.last_used_at && <span className="text-[11px] text-[#525252]">Last used {new Date(detailMcpKey.last_used_at).toLocaleDateString()}</span>}
                </div>
              </div>

              <div className="bg-[#080808] border border-[#1a1a1a] rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-[#525252] font-medium uppercase tracking-wider">MCP Config</span>
                  <CopyButton text={MCP_CONFIG_EXAMPLE} label="Config copied" />
                </div>
                <pre className="text-[12px] text-[#737373] font-mono overflow-x-auto whitespace-pre leading-relaxed">{MCP_CONFIG_EXAMPLE}</pre>
              </div>

              <div className="bg-[#080808] border border-[#1a1a1a] rounded-xl p-4">
                <span className="text-[11px] text-[#525252] font-medium uppercase tracking-wider block mb-2">Available Tools</span>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3 py-1">
                    <code className="text-[12px] text-white font-mono bg-black px-2 py-0.5 rounded">audit_site</code>
                    <span className="text-[11px] text-[#525252]">Run a full website audit</span>
                  </div>
                  <div className="flex items-center gap-3 py-1">
                    <code className="text-[12px] text-white font-mono bg-black px-2 py-0.5 rounded">list_leads</code>
                    <span className="text-[11px] text-[#525252]">Get all leads for your org</span>
                  </div>
                  <div className="flex items-center gap-3 py-1">
                    <code className="text-[12px] text-white font-mono bg-black px-2 py-0.5 rounded">get_audit</code>
                    <span className="text-[11px] text-[#525252]">Get a specific audit result</span>
                  </div>
                  <div className="flex items-center gap-3 py-1">
                    <code className="text-[12px] text-white font-mono bg-black px-2 py-0.5 rounded">send_pitch</code>
                    <span className="text-[11px] text-[#525252]">Send a pitch email to a lead</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-5">
              <button onClick={() => { if (confirm("Delete this API key? Any tools using it will stop working.")) deleteMcpKey(detailMcpKey.id); }} className="px-4 py-2 text-[13px] font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">Delete Key</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
