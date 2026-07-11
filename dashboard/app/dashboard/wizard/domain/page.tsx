"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WizardLayout, WizardCard, WizardComplete } from "@/components/WizardLayout";
import { toast } from "sonner";

interface EmailDomain { id: string; domain: string; status: string; }

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
    fetch("/api/settings/domain").then(r => r.json()).then(data => { if (data.domains) setDomains(data.domains); }).catch(() => {});
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
      setDomains(prev => [data.domain, ...prev]);
      setDnsRecords(data.dnsRecords);
      setDomain("");
      toast.success("Domain added. Add DNS records to verify.");
      setStep(2);
    } catch (err: any) { toast.error(err.message); } finally { setLoading(false); }
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
      setDomains(prev => prev.map(d => d.id === domainId ? { ...d, status: "verified" } : d));
      toast.success("Domain verified!");
      setCompleted(true);
      setStep(4);
    } catch { toast.error("Verification failed. Check DNS records."); } finally { setLoading(false); }
  }

  if (completed) {
    return (
      <WizardLayout title="Email Domain" steps={STEPS} currentStep={step} onStepChange={setStep} backHref="/dashboard">
        <WizardComplete title="Domain Verified!" description="Your emails will be sent from your verified domain." icon="✉️"
          onContinue={() => router.push("/dashboard")} onSetupMore={() => router.push("/dashboard/wizard/keys")} />
      </WizardLayout>
    );
  }

  return (
    <WizardLayout title="Email Domain" subtitle="Send emails from your business domain" steps={STEPS} currentStep={step} onStepChange={setStep} backHref="/dashboard">
      {step === 0 && (
        <WizardCard title="Why Verify?" description="Improve email deliverability" icon={<span className="text-2xl">✉️</span>}>
          <div className="space-y-4">
            <p className="text-sm text-neutral-400">
              By default, Knight sends from <code className="text-paper-100">onboarding@resend.dev</code>.
              Verifying your domain sends from <code className="text-paper-100">you@yourdomain.com</code>.
            </p>
            <div className="rounded-lg bg-neutral-950 border border-neutral-800 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs text-neutral-400"><span className="text-green-500">✓</span> Higher inbox placement</div>
              <div className="flex items-center gap-2 text-xs text-neutral-400"><span className="text-green-500">✓</span> Professional sender identity</div>
              <div className="flex items-center gap-2 text-xs text-neutral-400"><span className="text-green-500">✓</span> Better open rates</div>
            </div>
          </div>
        </WizardCard>
      )}

      {step === 1 && (
        <WizardCard title="Add Domain" description="Enter your domain" icon={<span className="text-2xl">🌐</span>}>
          <div className="space-y-4">
            {domains.length > 0 && (
              <div className="space-y-2">
                {domains.map(d => (
                  <div key={d.id} className="flex items-center justify-between p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${d.status === "verified" ? "bg-green-500" : "bg-yellow-500"}`} />
                      <span className="text-sm text-paper-100">{d.domain}</span>
                    </div>
                    {d.status === "pending" && <button onClick={() => handleVerify(d.id)} disabled={loading} className="text-xs text-neutral-400 hover:text-paper-100">Verify</button>}
                  </div>
                ))}
              </div>
            )}
            <form onSubmit={handleAddDomain} className="flex gap-2">
              <input type="text" value={domain} onChange={e => setDomain(e.target.value)} placeholder="yourdomain.com"
                className="flex-1 rounded-lg bg-neutral-950 border border-neutral-800 px-4 py-2.5 text-sm text-paper-100 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600 transition-all" />
              <button type="submit" disabled={loading || !domain}
                className="rounded-lg bg-paper-100 text-neutral-950 font-medium px-4 py-2.5 text-sm hover:bg-paper-200 transition-all disabled:opacity-50 active:scale-[0.98]">
                {loading ? "Adding..." : "Add Domain"}
              </button>
            </form>
          </div>
        </WizardCard>
      )}

      {step === 2 && (
        <WizardCard title="DNS Records" description="Add these to your domain registrar" icon={<span className="text-2xl">⚙️</span>}>
          <div className="space-y-4">
            {dnsRecords && (
              <div className="rounded-lg bg-neutral-950 border border-neutral-800 p-4 space-y-3">
                {Object.entries(dnsRecords).map(([key, record]: [string, any]) => (
                  <div key={key} className="text-xs">
                    <p className="text-neutral-300 font-medium mb-1">{record.note}</p>
                    <div className="flex gap-4 text-neutral-500"><span>Type: {record.type}</span><span>Host: {record.host}</span></div>
                    <p className="text-neutral-400 break-all mt-1">Value: {record.value}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="rounded-lg bg-neutral-950 border border-neutral-800 p-4">
              <p className="text-xs text-neutral-500 mb-2">How to add DNS records:</p>
              <ol className="text-xs text-neutral-400 space-y-1 list-decimal list-inside">
                <li>Log in to your domain registrar</li>
                <li>Find DNS management</li>
                <li>Add each record above</li>
                <li>Wait 5-30 minutes for propagation</li>
              </ol>
            </div>
            <button onClick={() => setStep(3)} className="rounded-lg bg-paper-100 text-neutral-950 font-medium px-5 py-2.5 text-sm hover:bg-paper-200 transition-colors">
              I&apos;ve Added DNS Records
            </button>
          </div>
        </WizardCard>
      )}

      {step === 3 && (
        <WizardCard title="Verify" description="Check your DNS records" icon={<span className="text-2xl">🔍</span>}>
          <div className="space-y-4">
            {domains.filter(d => d.status === "pending").map(d => (
              <div key={d.id} className="flex items-center justify-between p-4 rounded-lg bg-neutral-950 border border-neutral-800">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div>
                    <p className="text-sm text-paper-100 font-medium">{d.domain}</p>
                    <p className="text-xs text-neutral-500">Pending verification</p>
                  </div>
                </div>
                <button onClick={() => handleVerify(d.id)} disabled={loading}
                  className="rounded-lg bg-paper-100 text-neutral-950 font-medium px-4 py-2 text-sm hover:bg-paper-200 transition-colors">
                  {loading ? "Checking..." : "Verify Domain"}
                </button>
              </div>
            ))}
          </div>
        </WizardCard>
      )}
    </WizardLayout>
  );
}
