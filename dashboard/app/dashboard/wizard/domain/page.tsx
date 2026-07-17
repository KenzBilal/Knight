"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WizardLayout, WizardCard, WizardComplete } from "@/components/WizardLayout";
import { toast } from "sonner";

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
          description="Your emails will be sent from your verified domain."
          onContinue={() => router.push("/dashboard")}
          onSetupMore={() => router.push("/dashboard/wizard/keys")}
        />
      </WizardLayout>
    );
  }

  return (
    <WizardLayout
      title="Email Domain"
      subtitle="Send emails from your business domain"
      steps={STEPS}
      currentStep={step}
      onStepChange={setStep}
      backHref="/dashboard"
    >
      {step === 0 && (
        <WizardCard
          title="Why Verify?"
          description="Improve email deliverability"
          icon={
            <svg className="w-5 h-5 text-[#a3a3a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          }
        >
          <div className="space-y-5">
            <p className="text-[13px] text-[#525252] leading-relaxed">
              By default, Knight sends from{" "}
              <code className="text-[#4ade80] bg-[#4ade80]/5 px-1.5 py-0.5 rounded text-[12px]">
                onboarding@resend.dev
              </code>
              . Verifying your domain sends from your professional email.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-[13px]">
                <div className="w-6 h-6 rounded-full bg-[#4ade80]/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-[#4ade80]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <span className="text-[#a3a3a3]">Higher inbox placement</span>
              </div>
              <div className="flex items-center gap-3 text-[13px]">
                <div className="w-6 h-6 rounded-full bg-[#4ade80]/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-[#4ade80]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <span className="text-[#a3a3a3]">Professional sender identity</span>
              </div>
              <div className="flex items-center gap-3 text-[13px]">
                <div className="w-6 h-6 rounded-full bg-[#4ade80]/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-[#4ade80]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <span className="text-[#a3a3a3]">Better open rates</span>
              </div>
            </div>
          </div>
        </WizardCard>
      )}

      {step === 1 && (
        <WizardCard
          title="Add Domain"
          description="Enter your domain"
          icon={
            <svg className="w-5 h-5 text-[#a3a3a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
          }
        >
          <div className="space-y-5">
            {domains.length > 0 && (
              <div className="space-y-2">
                {domains.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${d.status === "verified" ? "bg-[#4ade80]" : "bg-[#fbbf24]"}`} />
                      <span className="text-[13px] text-white font-medium">{d.domain}</span>
                    </div>
                    {d.status === "pending" && (
                      <button
                        onClick={() => handleVerify(d.id)}
                        disabled={loading}
                        className="text-[12px] text-[#525252] hover:text-white transition-colors"
                      >
                        Verify
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
                className="flex-1 rounded-xl bg-[#080808] border border-white/[0.06] px-4 py-3 text-[14px] text-white placeholder:text-[#2a2a2a] focus:outline-none focus:border-white/[0.15] focus:ring-1 focus:ring-white/[0.05] transition-all duration-200"
              />
              <button
                type="submit"
                disabled={loading || !domain}
                className="rounded-xl bg-white text-[#080808] font-semibold text-[13px] px-5 py-3 transition-all duration-200 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_32px_rgba(255,255,255,0.1)] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {loading ? "Adding..." : "Add"}
              </button>
            </form>
          </div>
        </WizardCard>
      )}

      {step === 2 && (
        <WizardCard
          title="DNS Records"
          description="Add these to your domain registrar"
          icon={
            <svg className="w-5 h-5 text-[#a3a3a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
            </svg>
          }
        >
          <div className="space-y-5">
            {dnsRecords && (
              <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4 space-y-4">
                {Object.entries(dnsRecords).map(
                  ([key, record]: [string, any]) => (
                    <div key={key} className="text-[13px]">
                      <p className="text-[#a3a3a3] font-medium mb-1.5">
                        {record.note}
                      </p>
                      <div className="flex gap-4 text-[12px] text-[#3a3a3a]">
                        <span>Type: {record.type}</span>
                        <span>Host: {record.host}</span>
                      </div>
                      <p className="text-[#525252] break-all mt-1 font-mono text-[12px]">
                        {record.value}
                      </p>
                    </div>
                  )
                )}
              </div>
            )}
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4">
              <p className="text-[11px] text-[#3a3a3a] uppercase tracking-wider font-medium mb-3">
                How to add DNS records
              </p>
              <ol className="text-[13px] text-[#525252] space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-[#3a3a3a] mt-0.5">1.</span>
                  <span>Log in to your domain registrar</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#3a3a3a] mt-0.5">2.</span>
                  <span>Find DNS management</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#3a3a3a] mt-0.5">3.</span>
                  <span>Add each record above</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#3a3a3a] mt-0.5">4.</span>
                  <span>Wait 5-30 minutes for propagation</span>
                </li>
              </ol>
            </div>
            <button
              onClick={() => setStep(3)}
              className="w-full rounded-xl bg-white text-[#080808] font-semibold text-[13px] py-3 transition-all duration-200 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_32px_rgba(255,255,255,0.1)] active:scale-[0.98]"
            >
              I&apos;ve Added DNS Records
            </button>
          </div>
        </WizardCard>
      )}

      {step === 3 && (
        <WizardCard
          title="Verify"
          description="Check your DNS records"
          icon={
            <svg className="w-5 h-5 text-[#a3a3a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          }
        >
          <div className="space-y-4">
            {domains
              .filter((d) => d.status === "pending")
              .map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#fbbf24]" />
                    <div>
                      <p className="text-[13px] text-white font-medium">
                        {d.domain}
                      </p>
                      <p className="text-[12px] text-[#3a3a3a]">
                        Pending verification
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleVerify(d.id)}
                    disabled={loading}
                    className="rounded-xl bg-white text-[#080808] font-semibold text-[13px] px-5 py-2.5 transition-all duration-200 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_32px_rgba(255,255,255,0.1)] active:scale-[0.98] disabled:opacity-30"
                  >
                    {loading ? "Checking..." : "Verify"}
                  </button>
                </div>
              ))}
          </div>
        </WizardCard>
      )}
    </WizardLayout>
  );
}
