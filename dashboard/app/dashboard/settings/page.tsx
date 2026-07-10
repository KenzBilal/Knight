"use client";

import { useState, useEffect } from "react";

interface EmailDomain {
  id: string;
  domain: string;
  status: string;
  created_at: string;
}

export default function SettingsPage() {
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [services, setServices] = useState("");
  const [calendlyLink, setCalendlyLink] = useState("");
  const [telegramBotToken, setTelegramBotToken] = useState("");
  const [telegramAdminChatId, setTelegramAdminChatId] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // BYOK states
  const [useCustomKeys, setUseCustomKeys] = useState(false);
  const [cohereKey, setCohereKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [openrouterKey, setOpenrouterKey] = useState("");
  const [keysSaved, setKeysSaved] = useState(false);

  // Email domain states
  const [domains, setDomains] = useState<EmailDomain[]>([]);
  const [newDomain, setNewDomain] = useState("");
  const [dnsRecords, setDnsRecords] = useState<any>(null);
  const [domainLoading, setDomainLoading] = useState(false);
  const [domainError, setDomainError] = useState("");

  useEffect(() => {
    // Load current config
    fetch("/api/config")
      .then(r => r.json())
      .then(data => {
        if (data.company_name) setCompanyName(data.company_name);
        if (data.company_website) setCompanyWebsite(data.company_website);
        if (data.services_offered) setServices(data.services_offered.join(", "));
        if (data.calendly_link) setCalendlyLink(data.calendly_link);
        if (data.telegram_bot_token) setTelegramBotToken(data.telegram_bot_token);
        if (data.telegram_admin_chat_id) setTelegramAdminChatId(data.telegram_admin_chat_id);
      })
      .catch(() => {});

    // Load email domains
    fetch("/api/settings/domain")
      .then(r => r.json())
      .then(data => {
        if (data.domains) setDomains(data.domains);
      })
      .catch(() => {});

    // Load API keys status
    fetch("/api/settings/keys")
      .then(r => r.json())
      .then(data => {
        if (data.hasKeys) {
          setUseCustomKeys(true);
        }
      })
      .catch(() => {});
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: companyName,
          company_website: companyWebsite,
          services_offered: services.split(",").map((s) => s.trim()).filter(Boolean),
          calendly_link: calendlyLink,
          telegram_bot_token: telegramBotToken || null,
          telegram_admin_chat_id: telegramAdminChatId || null,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    setSaving(false);
  }

  async function handleSaveKeys() {
    setKeysSaved(false);
    try {
      await fetch("/api/settings/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cohere_key: cohereKey || null,
          gemini_key: geminiKey || null,
          openrouter_key: openrouterKey || null,
        }),
      });
      setKeysSaved(true);
      setTimeout(() => setKeysSaved(false), 3000);
    } catch {}
  }

  async function handleAddDomain(e: React.FormEvent) {
    e.preventDefault();
    setDomainLoading(true);
    setDomainError("");
    setDnsRecords(null);

    try {
      const res = await fetch("/api/settings/domain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: newDomain }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to add domain");
      }

      setDomains(prev => [data.domain, ...prev]);
      setDnsRecords(data.dnsRecords);
      setNewDomain("");
    } catch (err: any) {
      setDomainError(err.message);
    } finally {
      setDomainLoading(false);
    }
  }

  async function handleVerifyDomain(domainId: string) {
    try {
      const res = await fetch("/api/settings/domain", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domainId }),
      });

      if (res.ok) {
        setDomains(prev =>
          prev.map(d => d.id === domainId ? { ...d, status: "verified" } : d)
        );
      }
    } catch {}
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="font-display text-2xl text-paper-100 mb-6">Settings</h1>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Company Profile */}
        <div className="rounded-xl border border-line bg-ink-900 p-6 space-y-4">
          <h2 className="font-display text-lg text-paper-100">Company Profile</h2>

          <div>
            <label className="block text-sm text-paper-300 mb-1.5">Company name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Your agency name"
              className="w-full rounded-lg bg-ink-950 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500"
            />
          </div>

          <div>
            <label className="block text-sm text-paper-300 mb-1.5">Your website</label>
            <input
              type="text"
              value={companyWebsite}
              onChange={(e) => setCompanyWebsite(e.target.value)}
              placeholder="yoursite.com"
              className="w-full rounded-lg bg-ink-950 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500"
            />
          </div>

          <div>
            <label className="block text-sm text-paper-300 mb-1.5">Services offered (comma separated)</label>
            <input
              type="text"
              value={services}
              onChange={(e) => setServices(e.target.value)}
              placeholder="web development, SEO, logo design"
              className="w-full rounded-lg bg-ink-950 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500"
            />
          </div>

          <div>
            <label className="block text-sm text-paper-300 mb-1.5">Calendly link (optional)</label>
            <input
              type="text"
              value={calendlyLink}
              onChange={(e) => setCalendlyLink(e.target.value)}
              placeholder="https://calendly.com/yourname"
              className="w-full rounded-lg bg-ink-950 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500"
            />
          </div>
        </div>

        {/* Email Domain */}
        <div className="rounded-xl border border-line bg-ink-900 p-6 space-y-4">
          <h2 className="font-display text-lg text-paper-100">Email Domain</h2>
          <p className="text-sm text-paper-400">
            Verify your own domain to send emails from your business email address.
          </p>

          {/* Existing domains */}
          {domains.length > 0 && (
            <div className="space-y-2">
              {domains.map((domain) => (
                <div
                  key={domain.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-ink-950 border border-line"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      domain.status === "verified" ? "bg-green-500" : "bg-yellow-500"
                    }`} />
                    <span className="text-sm text-paper-100">{domain.domain}</span>
                    <span className="text-xs text-paper-400 capitalize">{domain.status}</span>
                  </div>
                  {domain.status === "pending" && (
                    <button
                      type="button"
                      onClick={() => handleVerifyDomain(domain.id)}
                      className="text-xs text-flash-500 hover:text-flash-400"
                    >
                      Verify
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add new domain */}
          <form onSubmit={handleAddDomain} className="flex gap-2">
            <input
              type="text"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="yourdomain.com"
              className="flex-1 rounded-lg bg-ink-950 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500"
            />
            <button
              type="submit"
              disabled={domainLoading || !newDomain}
              className="rounded-lg bg-flash-500 text-ink-950 font-medium px-4 py-2.5 text-sm hover:bg-flash-400 transition-colors disabled:opacity-50"
            >
              {domainLoading ? "Adding..." : "Add Domain"}
            </button>
          </form>

          {domainError && (
            <p className="text-xs text-red-500">{domainError}</p>
          )}

          {/* DNS Records */}
          {dnsRecords && (
            <div className="rounded-lg bg-ink-950 border border-line p-4 space-y-3">
              <p className="text-xs text-paper-400 mb-2">
                Add these DNS records to your domain registrar:
              </p>
              {Object.entries(dnsRecords).map(([key, record]: [string, any]) => (
                <div key={key} className="text-xs">
                  <p className="text-paper-300 font-medium mb-1">{record.note}</p>
                  <div className="flex gap-4 text-paper-400">
                    <span>Type: {record.type}</span>
                    <span>Host: {record.host}</span>
                    <span className="text-paper-300 break-all">Value: {record.value}</span>
                  </div>
                </div>
              ))}
              <p className="text-xs text-paper-500 mt-2">
                DNS propagation may take 5-30 minutes. Click &quot;Verify&quot; after adding records.
              </p>
            </div>
          )}
        </div>

        {/* Telegram Notifications */}
        <div className="rounded-xl border border-line bg-ink-900 p-6 space-y-4">
          <h2 className="font-display text-lg text-paper-100">Telegram Notifications</h2>
          <p className="text-sm text-paper-400">
            Optional. Connect your own Telegram bot to receive approval requests and manage leads directly from Telegram.
          </p>

          <div>
            <label className="block text-sm text-paper-300 mb-1.5">Bot Token (from @BotFather)</label>
            <input
              type="password"
              value={telegramBotToken}
              onChange={(e) => setTelegramBotToken(e.target.value)}
              placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
              className="w-full rounded-lg bg-ink-950 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500"
            />
          </div>

          <div>
            <label className="block text-sm text-paper-300 mb-1.5">Your Telegram Chat ID</label>
            <input
              type="text"
              value={telegramAdminChatId}
              onChange={(e) => setTelegramAdminChatId(e.target.value)}
              placeholder="@yourusername or 123456789"
              className="w-full rounded-lg bg-ink-950 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500"
            />
            <p className="text-xs text-paper-500 mt-1">
              Send /start to @userinfobot to get your chat ID
            </p>
          </div>
        </div>

        {/* AI Provider Keys */}
        <div className="rounded-xl border border-line bg-ink-900 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg text-paper-100">AI Provider Keys</h2>
              <p className="text-sm text-paper-400">
                Optional. Use your own API keys for AI providers.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={useCustomKeys}
                onChange={(e) => setUseCustomKeys(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-ink-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-flash-500"></div>
            </label>
          </div>

          {useCustomKeys && (
            <div className="space-y-4 pt-2">
              <p className="text-xs text-paper-500">
                Get keys from:{" "}
                <a href="https://cohere.com" target="_blank" rel="noopener noreferrer" className="text-flash-500 hover:underline">cohere.com</a>,{" "}
                <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="text-flash-500 hover:underline">Google AI Studio</a>,{" "}
                <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-flash-500 hover:underline">openrouter.ai</a>
              </p>

              <div>
                <label className="block text-sm text-paper-300 mb-1.5">Cohere API Key</label>
                <input
                  type="password"
                  value={cohereKey}
                  onChange={(e) => setCohereKey(e.target.value)}
                  placeholder="Enter your Cohere API key"
                  className="w-full rounded-lg bg-ink-950 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500"
                />
              </div>

              <div>
                <label className="block text-sm text-paper-300 mb-1.5">Gemini API Key</label>
                <input
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="Enter your Gemini API key"
                  className="w-full rounded-lg bg-ink-950 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500"
                />
              </div>

              <div>
                <label className="block text-sm text-paper-300 mb-1.5">OpenRouter API Key</label>
                <input
                  type="password"
                  value={openrouterKey}
                  onChange={(e) => setOpenrouterKey(e.target.value)}
                  placeholder="Enter your OpenRouter API key"
                  className="w-full rounded-lg bg-ink-950 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveKeys}
                className="rounded-lg bg-flash-500 text-ink-950 font-medium px-4 py-2 text-sm hover:bg-flash-400 transition-colors"
              >
                Save API Keys
              </button>
              {keysSaved && (
                <span className="text-sm text-green-500 ml-2">✓ Saved</span>
              )}
            </div>
          )}

          {!useCustomKeys && (
            <p className="text-xs text-paper-500">
              Using Knight&apos;s built-in AI keys. Enable custom keys to use your own.
            </p>
          )}
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-flash-500 text-ink-950 font-medium px-5 py-2.5 text-sm hover:bg-flash-400 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
          {saved && (
            <span className="text-sm text-green-500">✓ Saved</span>
          )}
        </div>
      </form>
    </div>
  );
}
