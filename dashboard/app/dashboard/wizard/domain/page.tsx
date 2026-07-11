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
  { id: "why", title: "Why Verify" },
  { id: "domain", title: "Add Domain" },
  { id: "dns", title: "DNS Records" },
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
      .then(r => r.json())
      .then(data => {
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
      if (!res.ok) throw new Error(data.error || "Failed to add domain");

      setDomains(prev => [data.domain, ...prev]);
      setDnsRecords(data.dnsRecords);
      setDomain("");
      toast.success("Domain added! Now configure DNS.");
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

      setDomains(prev =>
        prev.map(d => d.id === domainId ? { ...d, status: "verified" } : d)
      );
      toast.success("Domain verified!");
      setCompleted(true);
      setStep(4);
    } catch (err: any) {
      toast.error("Verification failed. Check DNS records.");
    } finally {
      setLoading(false);
    }
  }

  if (completed) {
    return (
      <WizardLayout
        title="Email Domain Setup"
        steps={STEPS}
        currentStep={step}
        onStepChange={setStep}
        backHref="/dashboard"
      >
        <WizardComplete
          title="Domain Verified!"
          description="Your emails will now be sent from your verified business domain, improving deliverability and trust."
          icon="✉️"
          onContinue={() => router.push("/dashboard")}
          onSetupMore={() => router.push("/dashboard/wizard/keys")}
        />
      </WizardLayout>
    );
  }

  return (
    <WizardLayout
      title="Email Domain Setup"
      subtitle="Send emails from your business domain"
      steps={STEPS}
      currentStep={step}
      onStepChange={setStep}
      backHref="/dashboard"
    >
      {step === 0 && (
        <WizardCard
          title="Why Verify Your Domain?"
          description="Improve email deliverability and sender reputation"
          icon={<span className="text-2xl">✉️</span>}
        >
          <div className="space-y-4">
            <p className="text-sm text-paper-300">
              By default, Knight sends emails from <code className="text-flash-500">onboarding@resend.dev</code>.
              This works for testing, but prospects may mark it as spam.
            </p>
            <p className="text-sm text-paper-300">
              Verifying your own domain lets you send from{" "}
              <code className="text-flash-500">you@yourdomain.com</code> — much higher trust and deliverability.
            </p>
            <div className="rounded-lg bg-ink-950 border border-line p-4 space-y-2">
              <p className="text-xs text-paper-400 font-medium">Benefits:</p>
              <div className="flex items-center gap-2 text-xs text-paper-300">
                <span className="text-green-500">✓</span>
                <span>Higher inbox placement rates</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-paper-300">
                <span className="text-green-500">✓</span>
                <span>Professional sender identity</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-paper-300">
                <span className="text-green-500">✓</span>
                <span>Better open rates from prospects</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-paper-300">
                <span className="text-green-500">✓</span>
                <span>SPF/DKIM authentication</span>
              </div>
            </div>
          </div>
        </WizardCard>
      )}

      {step === 1 && (
        <WizardCard
          title="Add Your Domain"
          description="Enter the domain you want to send emails from"
          icon={<span className="text-2xl">🌐</span>}
        >
          <div className="space-y-4">
            {domains.length > 0 && (
              <div className="space-y-2">
                {domains.map(d => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-ink-950 border border-line"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        d.status === "verified" ? "bg-green-500" : "bg-yellow-500"
                      }`} />
                      <span className="text-sm text-paper-100">{d.domain}</span>
                      <span className="text-xs text-paper-400 capitalize">{d.status}</span>
                    </div>
                    {d.status === "pending" && (
                      <button
                        onClick={() => handleVerify(d.id)}
                        disabled={loading}
                        className="text-xs text-flash-500 hover:text-flash-400"
                      >
                        Verify
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleAddDomain} className="flex gap-2">
              <input
                type="text"
                value={domain}
                onChange={e => setDomain(e.target.value)}
                placeholder="yourdomain.com"
                className="flex-1 rounded-lg bg-ink-950 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500 focus:ring-1 focus:ring-flash-500/20 transition-all"
              />
              <button
                type="submit"
                disabled={loading || !domain}
                className="rounded-lg bg-flash-500 text-ink-950 font-medium px-4 py-2.5 text-sm hover:bg-flash-400 transition-all disabled:opacity-50 active:scale-[0.98] flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Adding...
                  </>
                ) : (
                  "Add Domain"
                )}
              </button>
            </form>

            {!domain && (
              <p className="text-xs text-yellow-500">
                You can skip this for now and add it later in Settings.
              </p>
            )}
          </div>
        </WizardCard>
      )}

      {step === 2 && (
        <WizardCard
          title="Configure DNS"
          description="Add these records to your domain registrar"
          icon={<span className="text-2xl">⚙️</span>}
        >
          <div className="space-y-4">
            {dnsRecords && (
              <div className="rounded-lg bg-ink-950 border border-line p-4 space-y-3">
                {Object.entries(dnsRecords).map(([key, record]: [string, any]) => (
                  <div key={key} className="text-xs">
                    <p className="text-paper-300 font-medium mb-1">{record.note}</p>
                    <div className="flex gap-4 text-paper-400">
                      <span>Type: {record.type}</span>
                      <span>Host: {record.host}</span>
                    </div>
                    <p className="text-paper-300 break-all mt-1">Value: {record.value}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-lg bg-ink-950 border border-line p-4">
              <p className="text-xs text-paper-400 mb-2">How to add DNS records:</p>
              <ol className="text-xs text-paper-300 space-y-1 list-decimal list-inside">
                <li>Log in to your domain registrar (GoDaddy, Namecheap, etc.)</li>
                <li>Find DNS management or DNS records</li>
                <li>Add each record shown above</li>
                <li>Save changes and wait 5-30 minutes for propagation</li>
              </ol>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(3)}
                className="rounded-lg bg-flash-500 text-ink-950 font-medium px-5 py-2.5 text-sm hover:bg-flash-400 transition-colors"
              >
                I&apos;ve Added DNS Records
              </button>
              <button
                onClick={() => {
                  const pending = domains.find(d => d.status === "pending");
                  if (pending) handleVerify(pending.id);
                }}
                disabled={loading}
                className="rounded-lg border border-line text-paper-300 font-medium px-5 py-2.5 text-sm hover:bg-ink-800 transition-colors"
              >
                Verify Now
              </button>
            </div>
          </div>
        </WizardCard>
      )}

      {step === 3 && (
        <WizardCard
          title="Verify Domain"
          description="Check that your DNS records are configured correctly"
          icon={<span className="text-2xl">🔍</span>}
        >
          <div className="space-y-4">
            <p className="text-sm text-paper-300">
              Click verify to check if your DNS records have propagated. This may take a few minutes after adding them.
            </p>

            {domains.filter(d => d.status === "pending").map(d => (
              <div
                key={d.id}
                className="flex items-center justify-between p-4 rounded-lg bg-ink-950 border border-line"
              >
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div>
                    <p className="text-sm text-paper-100 font-medium">{d.domain}</p>
                    <p className="text-xs text-paper-400">Pending verification</p>
                  </div>
                </div>
                <button
                  onClick={() => handleVerify(d.id)}
                  disabled={loading}
                  className="rounded-lg bg-flash-500 text-ink-950 font-medium px-4 py-2 text-sm hover:bg-flash-400 transition-colors flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Checking...
                    </>
                  ) : (
                    "Verify Domain"
                  )}
                </button>
              </div>
            ))}

            <div className="rounded-lg bg-ink-950 border border-line p-4">
              <p className="text-xs text-paper-400">
                DNS propagation can take 5-30 minutes. If verification fails, wait a few minutes and try again.
              </p>
            </div>
          </div>
        </WizardCard>
      )}
    </WizardLayout>
  );
}
