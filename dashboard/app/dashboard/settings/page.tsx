"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FadeIn } from "@/components/Animations";
import { TemplateManager } from "@/components/TemplateManager";
import { track } from "@/lib/analytics";

interface EmailDomain {
  id: string;
  domain: string;
  status: string;
}

const inputCls =
  "w-full rounded-xl input-base";

export default function SettingsPage() {
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [services, setServices] = useState("");
  const [calendlyLink, setCalendlyLink] = useState("");
  const [saving, setSaving] = useState(false);

  const [useCustomKeys, setUseCustomKeys] = useState(false);
  const [cohereKey, setCohereKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [openrouterKey, setOpenrouterKey] = useState("");

  const [domains, setDomains] = useState<EmailDomain[]>([]);
  const [newDomain, setNewDomain] = useState("");
  const [dnsRecords, setDnsRecords] = useState<any>(null);
  const [domainLoading, setDomainLoading] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testSending, setTestSending] = useState(false);
  const [plan, setPlan] = useState<string>("free");

  useEffect(() => {
    fetch("/api/org")
      .then(r => r.json())
      .then(d => { if (d.plan) setPlan(d.plan); })
      .catch(() => {});

    fetch("/api/config")
      .then(r => r.json())
      .then(data => {
        if (data.company_name) setCompanyName(data.company_name);
        if (data.company_website) setCompanyWebsite(data.company_website);
        if (data.services_offered) setServices(data.services_offered.join(", "));
        if (data.calendly_link) setCalendlyLink(data.calendly_link);
      }).catch(() => {});

    fetch("/api/settings/domain")
      .then(r => r.json())
      .then(data => { if (data.domains) setDomains(data.domains); })
      .catch(() => {});

    fetch("/api/settings/keys")
      .then(r => r.json())
      .then(data => { if (data.hasKeys) setUseCustomKeys(true); })
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
        services_offered: services.split(",").map(s => s.trim()).filter(Boolean),
        calendly_link: calendlyLink,
      }),
    }).then(async res => { if (!res.ok) throw new Error("Failed"); return res.json(); });

    track("company_profile_saved", {
      has_name: !!companyName,
      has_website: !!companyWebsite,
      service_count: services.split(",").map(s => s.trim()).filter(Boolean).length,
      has_calendly: !!calendlyLink,
    });
    toast.promise(promise, { loading: "Saving...", success: "Saved!", error: "Failed to save" });
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
    }).then(async res => { if (!res.ok) throw new Error("Failed"); return res.json(); });

    track("api_keys_saved", { has_cohere: !!cohereKey, has_gemini: !!geminiKey, has_openrouter: !!openrouterKey });
    toast.promise(promise, { loading: "Saving keys...", success: "Keys saved!", error: "Failed" });
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
      if (!res.ok) throw new Error(data.error || "Failed");
      track("email_domain_added", { domain: newDomain });
      setDomains(prev => [data.domain, ...prev]);
      setDnsRecords(data.dnsRecords);
      setNewDomain("");
      toast.success("Domain added. Add DNS records to verify.");
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
    }).then(async res => {
      if (!res.ok) throw new Error("Verification failed");
      setDomains(prev => prev.map(d => d.id === domainId ? { ...d, status: "verified" } : d));
      return res.json();
    });
    toast.promise(promise, { loading: "Verifying...", success: "Verified!", error: "Check DNS records" });
  }

  async function handleSendTest() {
    if (!testEmail) { toast.error("Enter an email address"); return; }
    setTestSending(true);
    try {
      const res = await fetch("/api/send-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: "test-email-check",
          text: `Knight email deliverability test\n\nThis is a test email to verify your domain is properly configured.\n\nSent from: Knight Dashboard\nTime: ${new Date().toISOString()}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");
      track("test_email_sent", { email: testEmail });
      toast.success("Test email sent! Check your inbox.");
    } catch (e: any) {
      toast.error(e.message || "Failed to send test email");
    }
    setTestSending(false);
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <FadeIn>
        <form onSubmit={handleSave} className="space-y-5">
          {/* Company Profile */}
          <FadeIn delay={100}>
            <div className="dash-card rounded-2xl p-6 space-y-4">
              <h2 className="text-base font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>Company Profile</h2>
              <div>
                <label className="block text-xs font-medium text-[#525252] mb-1.5">Company name</label>
                <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)}
                  placeholder="Your agency name" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#525252] mb-1.5">Website</label>
                <input type="text" value={companyWebsite} onChange={e => setCompanyWebsite(e.target.value)}
                  placeholder="yoursite.com" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#525252] mb-1.5">Services (comma separated)</label>
                <input type="text" value={services} onChange={e => setServices(e.target.value)}
                  placeholder="web development, SEO, logo design" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#525252] mb-1.5">Calendly link</label>
                <input type="text" value={calendlyLink} onChange={e => setCalendlyLink(e.target.value)}
                  placeholder="https://calendly.com/yourname" className={inputCls} />
              </div>
            </div>
          </FadeIn>

          {/* Email Domain */}
          <FadeIn delay={200}>
            <div className="dash-card rounded-2xl p-6 space-y-4">
              <h2 className="text-base font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>Email Domain</h2>
              {domains.length > 0 && (
                <div className="space-y-2">
                  {domains.map(d => (
                    <div key={d.id} className="flex items-center justify-between p-3 rounded-xl bg-[#0f0f0f] dash-card">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${d.status === "verified" ? "bg-green-500" : "bg-yellow-400"}`} />
                        <span className="text-sm text-white">{d.domain}</span>
                        <span className="text-xs text-[#525252] capitalize">{d.status}</span>
                      </div>
                      {d.status === "pending" && (
                        <button type="button" onClick={() => handleVerifyDomain(d.id)}
                          className="text-xs text-[#a3a3a3] hover:text-white font-medium transition-colors">Verify</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <form onSubmit={handleAddDomain} className="flex gap-2">
                <input type="text" value={newDomain} onChange={e => setNewDomain(e.target.value)}
                  placeholder="yourdomain.com"
                  className="flex-1 rounded-xl input-base" />
                <button type="submit" disabled={domainLoading || !newDomain}
                  className="rounded-xl bg-white text-[#080808] font-medium px-4 py-2.5 text-sm hover:bg-white/90 transition-all disabled:opacity-40 active:scale-[0.98]">
                  {domainLoading ? "Adding..." : "Add"}
                </button>
              </form>
              {/* Test Email */}
              {domains.some(d => d.status === "verified") && (
                <div className="flex gap-2 items-center pt-2 border-t border-white/[0.06]">
                  <input type="email" value={testEmail} onChange={e => setTestEmail(e.target.value)}
                    placeholder="test@yourdomain.com"
                    className="flex-1 rounded-xl input-base text-sm" />
                  <button type="button" onClick={handleSendTest} disabled={testSending || !testEmail}
                    className="rounded-xl bg-white/[0.06] text-white font-medium px-4 py-2.5 text-sm hover:bg-white/[0.1] transition-all disabled:opacity-40 active:scale-[0.98]">
                    {testSending ? "Sending..." : "Send Test"}
                  </button>
                </div>
              )}
              {dnsRecords && (
                <div className="rounded-xl bg-[#0f0f0f] dash-card p-4 space-y-3">
                  <p className="text-xs font-medium text-[#a3a3a3]">Add these DNS records:</p>
                  {Object.entries(dnsRecords).map(([key, record]: [string, any]) => (
                    <div key={key} className="text-xs">
                      <p className="text-white font-medium mb-1">{record.note}</p>
                      <div className="flex gap-4 text-[#525252]">
                        <span>Type: {record.type}</span>
                        <span>Host: {record.host}</span>
                        <span className="text-[#3a3a3a] break-all">Value: {record.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FadeIn>

          {/* API Keys — Max only (BYOK) */}
          {plan === "max" && (
          <FadeIn delay={300}>
            <div className="dash-card rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>API Keys</h2>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={useCustomKeys} onChange={e => setUseCustomKeys(e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-white/[0.06] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#525252] after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white peer-checked:after:bg-[#080808]"></div>
                </label>
              </div>
              {useCustomKeys && (
                <div className="space-y-4 pt-1">
                  <div>
                    <label className="block text-xs font-medium text-[#525252] mb-1.5">Cohere</label>
                    <input type="password" value={cohereKey} onChange={e => setCohereKey(e.target.value)}
                      placeholder="Cohere API key" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#525252] mb-1.5">Gemini</label>
                    <input type="password" value={geminiKey} onChange={e => setGeminiKey(e.target.value)}
                      placeholder="Gemini API key" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#525252] mb-1.5">OpenRouter</label>
                    <input type="password" value={openrouterKey} onChange={e => setOpenrouterKey(e.target.value)}
                      placeholder="OpenRouter API key" className={inputCls} />
                  </div>
                  <button type="button" onClick={handleSaveKeys}
                    className="rounded-xl bg-white text-[#080808] font-medium px-4 py-2 text-sm hover:bg-white/90 transition-all active:scale-[0.98]">
                    Save Keys
                  </button>
                </div>
              )}
              {!useCustomKeys && <p className="text-xs text-[#525252]">Using Knight&apos;s built-in keys.</p>}
            </div>
          </FadeIn>
          )}

          <TemplateManager />

          <FadeIn delay={500}>
            <button type="submit" disabled={saving}
              className="rounded-xl bg-white text-[#080808] font-medium px-5 py-2.5 text-sm hover:bg-white/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]">
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </FadeIn>
        </form>
      </FadeIn>
    </div>
  );
}
