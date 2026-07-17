"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WizardLayout, WizardCard } from "@/components/WizardLayout";
import { toast } from "sonner";

const STEPS = [
  { id: "welcome", title: "Welcome" },
  { id: "company", title: "Company" },
  { id: "services", title: "Services" },
  { id: "preview", title: "Preview" },
];

const SERVICE_SUGGESTIONS = [
  "Web Design",
  "Web Development",
  "SEO",
  "PPC Advertising",
  "Social Media Marketing",
  "Content Marketing",
  "Logo Design",
  "Brand Identity",
  "Email Marketing",
  "Copywriting",
  "Video Production",
  "Photography",
  "App Development",
  "UI/UX Design",
  "Graphic Design",
  "Business Consulting",
  "Financial Planning",
  "Legal Services",
  "Accounting",
  "Recruiting",
];

export default function ProfileWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [customService, setCustomService] = useState("");
  const [saving, setSaving] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((data) => {
        if (data.company_name) setCompanyName(data.company_name);
        if (data.company_website) setCompanyWebsite(data.company_website);
        if (data.services_offered) setServices(data.services_offered);
        if (data.user_name) setUserName(data.user_name);
      })
      .catch(() => {});
  }, []);

  function toggleService(service: string) {
    setServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  }

  function addCustomService() {
    if (customService && !services.includes(customService)) {
      setServices((prev) => [...prev, customService]);
      setCustomService("");
    }
  }

  async function handleComplete() {
    setSaving(true);
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: companyName,
          company_website: companyWebsite,
          services_offered: services,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Profile saved!");
      router.replace("/dashboard");
    } catch {
      toast.error("Failed to save");
      setSaving(false);
    }
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
          title="Welcome"
          description="Let's set up your company"
          icon={
            <svg className="w-5 h-5 text-[#a3a3a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            </svg>
          }
        >
          <div className="space-y-5">
            <p className="text-[13px] text-[#525252] leading-relaxed">
              Knight uses your company info to generate personalized pitches.
            </p>
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4">
              <p className="text-[11px] text-[#3a3a3a] uppercase tracking-wider font-medium mb-3">
                We&apos;ll ask for
              </p>
              <div className="text-[13px] text-[#525252] space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[#3a3a3a]">1.</span>
                  <span>Company name & website</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#3a3a3a]">2.</span>
                  <span>Services you offer</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#3a3a3a]">3.</span>
                  <span>Preview</span>
                </div>
              </div>
            </div>
          </div>
        </WizardCard>
      )}

      {step === 1 && (
        <WizardCard
          title="Company Information"
          description="Your business details"
          icon={
            <svg className="w-5 h-5 text-[#a3a3a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
          }
        >
          <div className="space-y-5">
            <div>
              <label className="block text-[12px] font-medium text-[#525252] uppercase tracking-wider mb-2">
                Company Name <span className="text-[#f87171]">*</span>
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Your agency name"
                className="w-full rounded-xl bg-[#080808] border border-white/[0.06] px-4 py-3 text-[14px] text-white placeholder:text-[#2a2a2a] focus:outline-none focus:border-white/[0.15] focus:ring-1 focus:ring-white/[0.05] transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#525252] uppercase tracking-wider mb-2">
                Website
              </label>
              <input
                type="url"
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
                placeholder="https://yoursite.com"
                className="w-full rounded-xl bg-[#080808] border border-white/[0.06] px-4 py-3 text-[14px] text-white placeholder:text-[#2a2a2a] focus:outline-none focus:border-white/[0.15] focus:ring-1 focus:ring-white/[0.05] transition-all duration-200"
              />
            </div>
          </div>
        </WizardCard>
      )}

      {step === 2 && (
        <WizardCard
          title="Your Services"
          description="What do you offer?"
          icon={
            <svg className="w-5 h-5 text-[#a3a3a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.1-5.1m0 0L11.42 4.97m-5.1 5.1H21M3 3v18" />
            </svg>
          }
        >
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              {SERVICE_SUGGESTIONS.map((service) => (
                <button
                  key={service}
                  onClick={() => toggleService(service)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150 ${
                    services.includes(service)
                      ? "bg-white text-[#080808]"
                      : "bg-white/[0.04] text-[#525252] hover:bg-white/[0.06] hover:text-[#a3a3a3] border border-white/[0.06]"
                  }`}
                >
                  {services.includes(service) && (
                    <svg className="w-3 h-3 inline-block mr-1 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                  {service}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customService}
                onChange={(e) => setCustomService(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addCustomService())
                }
                placeholder="Add custom service..."
                className="flex-1 rounded-xl bg-[#080808] border border-white/[0.06] px-4 py-2.5 text-[13px] text-white placeholder:text-[#2a2a2a] focus:outline-none focus:border-white/[0.15] focus:ring-1 focus:ring-white/[0.05] transition-all duration-200"
              />
              <button
                type="button"
                onClick={addCustomService}
                disabled={!customService}
                className="rounded-xl bg-white/[0.04] text-[#525252] font-medium text-[12px] px-4 py-2.5 hover:bg-white/[0.06] hover:text-white transition-colors disabled:opacity-30 border border-white/[0.06]"
              >
                Add
              </button>
            </div>
            {services.length > 0 && (
              <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4">
                <p className="text-[11px] text-[#3a3a3a] uppercase tracking-wider font-medium mb-3">
                  Selected ({services.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {services.map((s) => (
                    <span
                      key={s}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] text-[#a3a3a3] text-[12px] border border-white/[0.06]"
                    >
                      {s}
                      <button
                        onClick={() => toggleService(s)}
                        className="hover:text-white transition-colors ml-0.5"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
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
          icon={
            <svg className="w-5 h-5 text-[#a3a3a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        >
          <div className="space-y-5">
            {/* Email card */}
            <div className="rounded-xl bg-[#111] border border-white/[0.06] overflow-hidden">
              {/* Email header */}
              <div className="px-5 py-3.5 border-b border-white/[0.04] flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="text-[#525252]">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <div>
                  <p className="text-[11px] text-[#3a3a3a] font-medium">Sample Outreach Email</p>
                  <p className="text-[10px] text-[#2a2a2a]">How your prospects will see you</p>
                </div>
              </div>

              {/* Email body */}
              <div className="p-5 space-y-4 text-[13px] text-[#737373] leading-relaxed">
                <p>
                  Hi <span className="inline-block text-[#a3a3a3] bg-white/[0.06] px-2 py-0.5 rounded-md text-[12px] font-mono border border-white/[0.06]">John</span>,
                </p>
                <p>
                  I&apos;m from <strong className="text-white font-semibold">{companyName || "Your Company"}</strong>.
                  {services.length > 0 && (
                    <>
                      {" "}We specialize in{" "}
                      {services.slice(0, 3).map((s, i) => (
                        <span key={s} className="inline-block">
                          <span className="inline-block text-[#a3a3a3] bg-white/[0.06] px-2 py-0.5 rounded-md text-[12px] font-mono border border-white/[0.06]">{s}</span>
                          {i < Math.min(services.length, 3) - 1 ? ", " : ""}
                        </span>
                      ))}.
                    </>
                  )}
                </p>
                <p>
                  I noticed your website could use improvements. Would you be open to a quick chat?
                </p>
                <p className="text-[#525252]">
                  Best,<br />
                  {userName || "Your Name"}
                </p>
              </div>

              {/* Website link */}
              {companyWebsite && (
                <div className="px-5 py-3 border-t border-white/[0.04] flex items-center gap-2">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="text-[#3a3a3a]">
                    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                  <span className="text-[12px] text-[#525252]">{companyWebsite}</span>
                </div>
              )}
            </div>

            <p className="text-[11px] text-[#3a3a3a] text-center">
              This is a preview. Actual emails are personalized per prospect.
            </p>
          </div>
        </WizardCard>
      )}
    </WizardLayout>
  );
}
