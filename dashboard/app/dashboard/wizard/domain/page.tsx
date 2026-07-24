"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WizardLayout, WizardCard, WizardComplete, WizardBenefitList, WizardInfoRow } from "@/components/WizardLayout";
import { toast } from "sonner";
import { track } from "@/lib/analytics";

interface EmailDomain {
  id: string;
  domain: string;
  status: string;
}

const STEPS = [
  { id: "why", title: "Why" },
  { id: "domain", title: "Domain" },
  { id: "dns", title: "DNS" },
  { id: "verify", title: "Verify" },
  { id: "done", title: "Done" },
];

const inputCls =
  "w-full rounded-xl bg-[#0a0a0a] border border-white/[0.08] px-4 py-3 text-[14px] text-white placeholder:text-[#2a2a2a] focus:outline-none focus:border-white/[0.22] focus:ring-2 focus:ring-white/[0.04] transition-all duration-200";

export default function DomainWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [domain, setDomain] = useState("");
  const [domains, setDomains] = useState<EmailDomain[]>([]);
  const [dnsRecords, setDnsRecords] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    fetch("/api/settings/domain")
      .then((r) => r.json())
      .then((data) => {
        if (data.domains) setDomains(data.domains);
      })
      .catch(() => {});
  }, []);

  async function handleAddDomain(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setDnsRecords(null);
    try {
      const res = await fetch("/api/settings/domain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setDomains((prev) => [data.domain, ...prev]);
      setDnsRecords(data.dnsRecords);
      setDomain("");
      track("domain_added", { domain: data.domain.domain });
      toast.success("Domain added. Add DNS records to verify.");
      setStep(2);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(domainId: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/settings/domain", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domainId }),
      });
      if (!res.ok) throw new Error("Verification failed");
      setDomains((prev) =>
        prev.map((d) => (d.id === domainId ? { ...d, status: "verified" } : d))
      );
      toast.success("Domain verified!");
      setCompleted(true);
      setStep(4);
    } catch {
      toast.error("Verification failed. Check DNS records.");
    } finally {
      setLoading(false);
    }
  }

  if (completed) {
    return (
      <WizardLayout
        title="Email Domain"
        steps={STEPS}
        currentStep={step}
        onStepChange={setStep}
        backHref="/dashboard"
      >
        <WizardComplete
          title="Domain Verified!"
          description="Emails will now be sent from your verified business domain, boosting deliverability and trust."
          onContinue={() => router.push("/dashboard")}
          onSetupMore={() => router.push("/dashboard/wizard/keys")}
        />
      </WizardLayout>
    );
  }

  return (
    <WizardLayout
      title="Email Domain"
      subtitle="Send emails from your own domain for professional deliverability"
      steps={STEPS}
      currentStep={step}
      onStepChange={setStep}
      backHref="/dashboard"
    >
      {/* ── Step 0: Why ── */}
      {step === 0 && (
        <WizardCard
          title="Why verify your domain?"
          description="Boost deliverability and look professional"
          icon={
            <svg className="w-5 h-5 text-[#a3a3a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          }
        >
          <div className="space-y-5">
            <WizardInfoRow>
              <p className="text-[13px] text-[#525252] leading-relaxed">
                By default, Knight sends from{" "}
                <code className="text-[#4ade80] bg-[#4ade80]/8 px-1.5 py-0.5 rounded text-[12px] font-mono border border-[#4ade80]/15">
                  onboarding@resend.dev
                </code>
                . Verifying your domain means outreach arrives from your professional address.
              </p>
            </WizardInfoRow>
            <WizardBenefitList
              items={[
                { label: "Higher inbox placement — avoid spam filters" },
                { label: "Professional sender identity builds trust" },
                { label: "Better open rates & reply rates" },
              ]}
            />
          </div>
        </WizardCard>
      )}

      {/* ── Step 1: Add Domain ── */}
      {step === 1 && (
        <WizardCard
          title="Add Your Domain"
          description="Enter the domain you send email from"
          icon={
            <svg className="w-5 h-5 text-[#a3a3a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
          }
        >
          <div className="space-y-5">
            {/* Existing domains */}
            {domains.length > 0 && (
              <div className="space-y-2">
                {domains.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between p-3.5 rounded-xl"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          d.status === "verified" ? "bg-[#4ade80]" : "bg-[#fbbf24]"
                        }`}
                        style={{
                          boxShadow: d.status === "verified"
                            ? "0 0 6px rgba(74,222,128,0.4)"
                            : "0 0 6px rgba(251,191,36,0.4)",
                        }}
                      />
                      <span className="text-[13px] text-white font-medium">{d.domain}</span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${
                        d.status === "verified"
                          ? "bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/20"
                          : "bg-[#fbbf24]/10 text-[#fbbf24] border border-[#fbbf24]/20"
                      }`}>
                        {d.status}
                      </span>
                    </div>
                    {d.status === "pending" && (
                      <button
                        onClick={() => handleVerify(d.id)}
                        disabled={loading}
                        className="text-[12px] text-[#525252] hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/[0.04]"
                      >
                        Verify →
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleAddDomain} className="flex gap-3">
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="yourdomain.com"
                className={inputCls}
              />
              <button
                type="submit"
                disabled={loading || !domain}
                className="flex-shrink-0 rounded-xl bg-white text-[#080808] font-semibold text-[13px] px-5 py-3 transition-all duration-200 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  boxShadow: "0 0 0 1px rgba(255,255,255,0.1), 0 4px 20px rgba(255,255,255,0.08)",
                }}
              >
                {loading ? "Adding..." : "Add"}
              </button>
            </form>
          </div>
        </WizardCard>
      )}

      {/* ── Step 2: DNS Records ── */}
      {step === 2 && (
        <WizardCard
          title="DNS Records"
          description="Add these records to your domain registrar to verify ownership"
          icon={
            <svg className="w-5 h-5 text-[#a3a3a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
            </svg>
          }
        >
          <div className="space-y-5">
            {dnsRecords && (
              <div className="space-y-3">
                {Object.entries(dnsRecords).map(([key, record]: [string, any]) => (
                  <div
                    key={key}
                    className="rounded-xl p-4"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <p className="text-[12px] text-[#a3a3a3] font-semibold mb-2">{record.note}</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[12px] text-[#3a3a3a] mb-2">
                      <span>
                        Type:{" "}
                        <span className="text-[#525252] font-mono">{record.type}</span>
                      </span>
                      <span>
                        Host:{" "}
                        <span className="text-[#525252] font-mono">{record.host}</span>
                      </span>
                    </div>
                    <div
                      className="mt-2 rounded-lg p-2.5 font-mono text-[11px] text-[#525252] break-all select-all cursor-text"
                      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}
                    >
                      {record.value}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <WizardInfoRow>
              <p className="text-[10px] text-[#3a3a3a] uppercase tracking-widest font-semibold mb-3">
                How to add DNS records
              </p>
              <ol className="text-[13px] text-[#525252] space-y-2">
                {[
                  "Log in to your domain registrar (GoDaddy, Namecheap, Cloudflare…)",
                  "Find DNS management or DNS settings",
                  "Add each record shown above",
                  "Wait 5–30 minutes for DNS propagation",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#2a2a2a] font-mono mt-0.5 flex-shrink-0">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </WizardInfoRow>

            <button
              onClick={() => setStep(3)}
              className="w-full rounded-xl bg-white text-[#080808] font-semibold text-[13px] py-3 transition-all duration-200 active:scale-[0.98]"
              style={{
                boxShadow: "0 0 0 1px rgba(255,255,255,0.1), 0 4px 20px rgba(255,255,255,0.08)",
              }}
            >
              I&apos;ve Added DNS Records →
            </button>
          </div>
        </WizardCard>
      )}

      {/* ── Step 3: Verify ── */}
      {step === 3 && (
        <WizardCard
          title="Verify Domain"
          description="Check that DNS records have propagated"
          icon={
            <svg className="w-5 h-5 text-[#a3a3a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          }
        >
          <div className="space-y-4">
            {domains
              .filter((d) => d.status === "pending")
              .map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between p-4 rounded-xl"
                  style={{
                    background: "rgba(251,191,36,0.04)",
                    border: "1px solid rgba(251,191,36,0.15)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-2.5 h-2.5 rounded-full bg-[#fbbf24] flex-shrink-0"
                      style={{ boxShadow: "0 0 6px rgba(251,191,36,0.5)" }}
                    />
                    <div>
                      <p className="text-[13px] text-white font-medium">{d.domain}</p>
                      <p className="text-[11px] text-[#525252]">Pending verification</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleVerify(d.id)}
                    disabled={loading}
                    className="rounded-xl bg-white text-[#080808] font-semibold text-[13px] px-5 py-2.5 transition-all duration-200 active:scale-[0.98] disabled:opacity-30"
                    style={{
                      boxShadow: "0 0 0 1px rgba(255,255,255,0.1), 0 4px 20px rgba(255,255,255,0.08)",
                    }}
                  >
                    {loading ? "Checking..." : "Verify Now"}
                  </button>
                </div>
              ))}
            {domains.filter((d) => d.status === "pending").length === 0 && (
              <WizardInfoRow>
                <p className="text-[13px] text-[#525252] text-center py-2">
                  No domains pending verification. Add a domain first.
                </p>
              </WizardInfoRow>
            )}
          </div>
        </WizardCard>
      )}
    </WizardLayout>
  );
}
