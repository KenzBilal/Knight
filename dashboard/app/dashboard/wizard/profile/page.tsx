"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WizardLayout, WizardCard, WizardComplete } from "@/components/WizardLayout";
import { toast } from "sonner";

const STEPS = [
  { id: "welcome", title: "Welcome" },
  { id: "company", title: "Company Info" },
  { id: "services", title: "Services" },
  { id: "preview", title: "Preview" },
  { id: "done", title: "Done" },
];

const SERVICE_SUGGESTIONS = [
  "Web Design", "Web Development", "SEO", "PPC Advertising", "Social Media Marketing",
  "Content Marketing", "Logo Design", "Brand Identity", "Email Marketing", "Copywriting",
  "Video Production", "Photography", "App Development", "UI/UX Design", "Graphic Design",
  "Business Consulting", "Financial Planning", "Legal Services", "Accounting", "Recruiting",
];

export default function ProfileWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [customService, setCustomService] = useState("");
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    fetch("/api/config")
      .then(r => r.json())
      .then(data => {
        if (data.company_name) setCompanyName(data.company_name);
        if (data.company_website) setCompanyWebsite(data.company_website);
        if (data.services_offered) setServices(data.services_offered);
      })
      .catch(() => {});
  }, []);

  function toggleService(service: string) {
    setServices(prev =>
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  }

  function addCustomService() {
    if (customService && !services.includes(customService)) {
      setServices(prev => [...prev, customService]);
      setCustomService("");
    }
  }

  async function handleComplete() {
    setSaving(true);
    const promise = fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_name: companyName,
        company_website: companyWebsite,
        services_offered: services,
      }),
    }).then(async res => {
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    });

    toast.promise(promise, {
      loading: "Saving profile...",
      success: "Profile saved!",
      error: "Failed to save",
    });

    await promise;
    setSaving(false);
    setCompleted(true);
    setStep(4);
  }

  if (completed) {
    return (
      <WizardLayout
        title="Company Profile"
        steps={STEPS}
        currentStep={step}
        onStepChange={setStep}
        backHref="/dashboard"
      >
        <WizardComplete
          title="Profile Complete!"
          description="Knight now knows about your business and will generate personalized pitches for your prospects."
          icon="🏢"
          onContinue={() => router.push("/dashboard")}
          onSetupMore={() => router.push("/dashboard/wizard/calendly")}
        />
      </WizardLayout>
    );
  }

  return (
    <WizardLayout
      title="Company Profile"
      subtitle="Tell Knight about your business"
      steps={STEPS}
      currentStep={step}
      onStepChange={setStep}
      backHref="/dashboard"
      onComplete={step === 3 ? handleComplete : undefined}
      completeLabel="Save Profile"
      isSubmitting={saving}
    >
      {step === 0 && (
        <WizardCard
          title="Welcome to Knight"
          description="Let&apos;s set up your company profile"
          icon={<span className="text-2xl">🚀</span>}
        >
          <div className="space-y-4">
            <p className="text-sm text-paper-300">
              Knight uses your company information to generate personalized outreach emails
              and audit reports for your prospects. The more we know, the better the pitches.
            </p>
            <div className="rounded-lg bg-ink-950 border border-line p-4 space-y-2">
              <p className="text-xs text-paper-400 font-medium">We&apos;ll ask for:</p>
              <div className="flex items-center gap-2 text-xs text-paper-300">
                <span className="text-flash-500">1.</span>
                <span>Company name & website</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-paper-300">
                <span className="text-flash-500">2.</span>
                <span>Services you offer</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-paper-300">
                <span className="text-flash-500">3.</span>
                <span>Preview how pitches will look</span>
              </div>
            </div>
          </div>
        </WizardCard>
      )}

      {step === 1 && (
        <WizardCard
          title="Company Information"
          description="Your business details"
          icon={<span className="text-2xl">🏢</span>}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-paper-300 mb-1.5">
                Company Name <span className="text-danger-500">*</span>
              </label>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="e.g., PixelPerfect Agency"
                className="w-full rounded-lg bg-ink-950 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500 focus:ring-1 focus:ring-flash-500/20 transition-all"
              />
              <p className="text-xs text-paper-500 mt-1">
                Used in outreach emails: &quot;Hi, I&apos;m from <strong>{companyName || "Your Company"}</strong>...&quot;
              </p>
            </div>

            <div>
              <label className="block text-sm text-paper-300 mb-1.5">
                Website URL
              </label>
              <input
                type="url"
                value={companyWebsite}
                onChange={e => setCompanyWebsite(e.target.value)}
                placeholder="https://yoursite.com"
                className="w-full rounded-lg bg-ink-950 border border-line px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500 focus:ring-1 focus:ring-flash-500/20 transition-all"
              />
              <p className="text-xs text-paper-500 mt-1">
                Shown in your email signature
              </p>
            </div>
          </div>
        </WizardCard>
      )}

      {step === 2 && (
        <WizardCard
          title="Your Services"
          description="What do you offer? Select all that apply"
          icon={<span className="text-2xl">🛠</span>}
        >
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {SERVICE_SUGGESTIONS.map(service => (
                <button
                  key={service}
                  onClick={() => toggleService(service)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    services.includes(service)
                      ? "bg-flash-500 text-ink-950"
                      : "bg-ink-800 text-paper-300 hover:bg-ink-700 border border-line"
                  }`}
                >
                  {services.includes(service) ? "✓ " : ""}{service}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={customService}
                onChange={e => setCustomService(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addCustomService())}
                placeholder="Add custom service..."
                className="flex-1 rounded-lg bg-ink-950 border border-line px-4 py-2 text-sm text-paper-100 placeholder:text-paper-400 focus:outline-none focus:border-flash-500 focus:ring-1 focus:ring-flash-500/20 transition-all"
              />
              <button
                type="button"
                onClick={addCustomService}
                disabled={!customService}
                className="rounded-lg bg-ink-800 text-paper-300 font-medium px-4 py-2 text-sm hover:bg-ink-700 transition-colors disabled:opacity-50 border border-line"
              >
                Add
              </button>
            </div>

            {services.length > 0 && (
              <div className="rounded-lg bg-ink-950 border border-line p-3">
                <p className="text-xs text-paper-400 mb-2">Selected ({services.length}):</p>
                <div className="flex flex-wrap gap-1.5">
                  {services.map(s => (
                    <span key={s} className="flex items-center gap-1 px-2 py-1 rounded-full bg-flash-500/10 text-flash-500 text-xs">
                      {s}
                      <button onClick={() => toggleService(s)} className="hover:text-flash-400">×</button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </WizardCard>
      )}

      {step === 3 && (
        <WizardCard
          title="Preview"
          description="How Knight will introduce your business"
          icon={<span className="text-2xl">👁</span>}
        >
          <div className="space-y-4">
            <div className="rounded-lg bg-ink-950 border border-line p-6">
              <div className="text-xs text-paper-500 mb-3">Email preview:</div>
              <div className="space-y-3 text-sm text-paper-300">
                <p>Hi {"{{contact_name}}"},</p>
                <p>
                  I&apos;m from <strong>{companyName || "Your Company"}</strong>.
                  {services.length > 0 && (
                    <> We specialize in {services.slice(0, 3).join(", ")}
                    {services.length > 3 && ` and ${services.length - 3} more`}.</>
                  )}
                </p>
                <p>
                  I noticed your website could use some improvements.
                  We&apos;ve helped businesses like yours increase their online presence
                  and generate more leads.
                </p>
                <p>
                  Would you be open to a quick chat about how we can help?
                </p>
                <p>
                  Best,<br />
                  Your Name
                </p>
                {companyWebsite && (
                  <p className="text-xs text-paper-400">{companyWebsite}</p>
                )}
              </div>
            </div>

            <div className="rounded-lg bg-ink-950 border border-line p-4 space-y-2">
              <p className="text-xs text-paper-400 font-medium">Your profile:</p>
              <div className="text-xs text-paper-300 space-y-1">
                <p>Company: <strong>{companyName || "Not set"}</strong></p>
                <p>Website: <strong>{companyWebsite || "Not set"}</strong></p>
                <p>Services: <strong>{services.length > 0 ? services.join(", ") : "Not set"}</strong></p>
              </div>
            </div>
          </div>
        </WizardCard>
      )}
    </WizardLayout>
  );
}
