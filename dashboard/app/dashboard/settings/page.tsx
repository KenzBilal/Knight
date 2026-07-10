"use client";

import { useState, useEffect } from "react";
import { Tooltip } from "@/components/Tooltip";
import { toast } from "sonner";
import { FadeIn } from "@/components/Animations";
import { TemplateManager } from "@/components/TemplateManager";

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

  // BYOK states
  const [useCustomKeys, setUseCustomKeys] = useState(false);
  const [cohereKey, setCohereKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [openrouterKey, setOpenrouterKey] = useState("");

  // Email domain states
  const [domains, setDomains] = useState<EmailDomain[]>([]);
  const [newDomain, setNewDomain] = useState("");
  const [dnsRecords, setDnsRecords] = useState<any>(null);
  const [domainLoading, setDomainLoading] = useState(false);

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
      .catch(() => toast.error("Failed to load settings"));

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

    const promise = fetch("/api/config", {
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
    }).then(async (res) => {
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    });

    toast.promise(promise, {
      loading: "Saving settings...",
      success: "Settings saved!",
      error: "Failed to save settings",
    });

    promise.finally(() => setSaving(false));
  }

  async function handleSaveKeys() {
    const promise = fetch("/api/settings/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cohere_key: cohereKey || null,
        gemini_key: geminiKey || null,
        openrouter_key: openrouterKey || null,
      }),
    }).then(async (res) => {
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    });

    toast.promise(promise, {
      loading: "Saving API keys...",
      success: "API keys saved!",
      error: "Failed to save API keys",
    });
  }

  async function handleAddDomain(e: React.FormEvent) {
    e.preventDefault();
    setDomainLoading(true);
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
      toast.success("Domain added! Add DNS records to verify.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDomainLoading(false);
    }
  }

  async function handleVerifyDomain(domainId: string) {
    const promise = fetch("/api/settings/domain", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domainId }),
    }).then(async (res) => {
      if (!res.ok) throw new Error("Verification failed");
      setDomains(prev =>
        prev.map(d => d.id === domainId ? { ...d, status: "verified" } : d)
      );
      return res.json();
    });

    toast.promise(promise, {
      loading: "Verifying domain...",
      success: "Domain verified!",
      error: "Verification failed. Check DNS records.",
    });
  }

  return (
    <div className="p-8 max-w-2xl">
      <FadeIn>
        <h1 className="font-display text-2xl text-paper-100 mb-6">Settings</h1>
      </FadeIn>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Company Profile */}
        <FadeIn delay={100}>
          <div className="rounded-xl border border-line bg-ink-900 p-6 space-y-4">
            <h2 className="font-display text-lg text-paper-100">Company Profile</h2>

            <div>
              <label className="block text-sm text-paper-300 mb-1.5">
                Company name
                <Tooltip content="Your business name shown in outreach emails and pitches" />
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Your agency name"
                className="w-full rounded-lg bg-ink-950 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500 focus:ring-1 focus:ring-flash-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm text-paper-300 mb-1.5">
                Your website
                <Tooltip content="Your business website URL" />
              </label>
              <input
                type="text"
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
                placeholder="yoursite.com"
                className="w-full rounded-lg bg-ink-950 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500 focus:ring-1 focus:ring-flash-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm text-paper-300 mb-1.5">
                Services offered (comma separated)
                <Tooltip content="Services you provide, used to generate relevant pitches" />
              </label>
              <input
                type="text"
                value={services}
                onChange={(e) => setServices(e.target.value)}
                placeholder="web development, SEO, logo design"
                className="w-full rounded-lg bg-ink-950 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500 focus:ring-1 focus:ring-flash-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm text-paper-300 mb-1.5">
                Calendly link (optional)
                <Tooltip content="Your scheduling link, included in pitches for easy booking" />
              </label>
              <input
                type="text"
                value={calendlyLink}
                onChange={(e) => setCalendlyLink(e.target.value)}
                placeholder="https://calendly.com/yourname"
                className="w-full rounded-lg bg-ink-950 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500 focus:ring-1 focus:ring-flash-500/20 transition-all"
              />
            </div>
          </div>
        </FadeIn>

        {/* Email Domain */}
        <FadeIn delay={200}>
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
                    className="flex items-center justify-between p-3 rounded-lg bg-ink-950 border border-line transition-all hover:border-flash-500/30"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full transition-colors ${
                        domain.status === "verified" ? "bg-green-500" : "bg-yellow-500"
                      }`} />
                      <span className="text-sm text-paper-100">{domain.domain}</span>
                      <span className="text-xs text-paper-400 capitalize">{domain.status}</span>
                    </div>
                    {domain.status === "pending" && (
                      <button
                        type="button"
                        onClick={() => handleVerifyDomain(domain.id)}
                        className="text-xs text-flash-500 hover:text-flash-400 transition-colors"
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
                className="flex-1 rounded-lg bg-ink-950 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500 focus:ring-1 focus:ring-flash-500/20 transition-all"
              />
              <button
                type="submit"
                disabled={domainLoading || !newDomain}
                className="rounded-lg bg-flash-500 text-ink-950 font-medium px-4 py-2.5 text-sm hover:bg-flash-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {domainLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Adding...
                  </span>
                ) : (
                  "Add Domain"
                )}
              </button>
            </form>

            {/* DNS Records */}
            {dnsRecords && (
              <div className="rounded-lg bg-ink-950 border border-line p-4 space-y-3 animate-in fade-in slide-in-from-top-2">
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
        </FadeIn>

        {/* Telegram Notifications */}
        <FadeIn delay={300}>
          <div className="rounded-xl border border-line bg-ink-900 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg text-paper-100">Telegram Notifications</h2>
              <Tooltip content="Optional. Receive approval requests and manage leads via Telegram" />
            </div>
            <p className="text-sm text-paper-400">
              Connect your own Telegram bot to receive approval requests and manage leads directly from Telegram.
            </p>

            <div>
              <label className="block text-sm text-paper-300 mb-1.5">
                Bot Token (from @BotFather)
                <Tooltip content="Create a bot via @BotFather on Telegram to get this token" />
              </label>
              <input
                type="password"
                value={telegramBotToken}
                onChange={(e) => setTelegramBotToken(e.target.value)}
                placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                className="w-full rounded-lg bg-ink-950 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500 focus:ring-1 focus:ring-flash-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm text-paper-300 mb-1.5">
                Your Telegram Chat ID
                <Tooltip content="Send /start to @userinfobot on Telegram to get your chat ID" />
              </label>
              <input
                type="text"
                value={telegramAdminChatId}
                onChange={(e) => setTelegramAdminChatId(e.target.value)}
                placeholder="@yourusername or 123456789"
                className="w-full rounded-lg bg-ink-950 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500 focus:ring-1 focus:ring-flash-500/20 transition-all"
              />
              <p className="text-xs text-paper-500 mt-1">
                Send /start to @userinfobot to get your chat ID
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Email Templates */}
        <TemplateManager />

        {/* AI Provider Keys */}
        <FadeIn delay={400}>
          <div className="rounded-xl border border-line bg-ink-900 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg text-paper-100">AI Provider Keys</h2>
                <Tooltip content="Optional. Use your own API keys instead of Knight's built-in keys" />
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
                    className="w-full rounded-lg bg-ink-950 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500 focus:ring-1 focus:ring-flash-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm text-paper-300 mb-1.5">Gemini API Key</label>
                  <input
                    type="password"
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder="Enter your Gemini API key"
                    className="w-full rounded-lg bg-ink-950 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500 focus:ring-1 focus:ring-flash-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm text-paper-300 mb-1.5">OpenRouter API Key</label>
                  <input
                    type="password"
                    value={openrouterKey}
                    onChange={(e) => setOpenrouterKey(e.target.value)}
                    placeholder="Enter your OpenRouter API key"
                    className="w-full rounded-lg bg-ink-950 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500 focus:ring-1 focus:ring-flash-500/20 transition-all"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveKeys}
                  className="rounded-lg bg-flash-500 text-ink-950 font-medium px-4 py-2 text-sm hover:bg-flash-400 transition-all active:scale-[0.98]"
                >
                  Save API Keys
                </button>
              </div>
            )}

            {!useCustomKeys && (
              <p className="text-xs text-paper-500">
                Using Knight&apos;s built-in AI keys. Enable custom keys to use your own.
              </p>
            )}
          </div>
        </FadeIn>

        {/* Save Button */}
        <FadeIn delay={500}>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-flash-500 text-ink-950 font-medium px-5 py-2.5 text-sm hover:bg-flash-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                "Save changes"
              )}
            </button>
          </div>
        </FadeIn>
      </form>
    </div>
  );
}
