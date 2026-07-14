"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";


type FormData = {
  firstName: string;
  lastName: string;
  workEmail: string;
  companyName: string;
  teamSize: string;
  useCase: string;
  annualRevenue: string;
  currentWorkflow: string;
  contactMethod: "email" | "video" | "phone";
};

const initialForm: FormData = {
  firstName: "",
  lastName: "",
  workEmail: "",
  companyName: "",
  teamSize: "",
  useCase: "",
  annualRevenue: "",
  currentWorkflow: "",
  contactMethod: "email",
};

const inputClass =
  "bg-[#0f0f0f] border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder-[#525252] focus:outline-none focus:border-white/20 w-full transition-colors text-sm";
const labelClass = "text-sm text-[#a3a3a3] mb-2 block";
const selectClass =
  "bg-[#0f0f0f] border border-white/[0.08] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/20 w-full transition-colors text-sm appearance-none cursor-pointer";

const steps = [
  {
    number: "01",
    title: "Review your request",
    description:
      "Our sales team reviews your submission and researches your company within 24 hours.",
  },
  {
    number: "02",
    title: "Schedule intro call",
    description:
      "We reach out via your preferred contact method to schedule a 30-minute discovery call.",
  },
  {
    number: "03",
    title: "Custom proposal",
    description:
      "You receive a tailored Knight plan with pricing, onboarding timeline, and integration support.",
  },
];

export default function ContactSalesPage() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRadio = (value: FormData["contactMethod"]) => {
    setForm((prev) => ({ ...prev, contactMethod: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setSubmitted(true);
    } catch (err: any) {
      alert(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808]">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="pt-32 pb-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-xs text-[#a3a3a3] font-mono mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-white/60 inline-block" />
                Sales team responds within 24 hours
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-semibold text-white leading-tight mb-4">
                Talk to our
                <br />
                sales team
              </h1>
              <p className="text-[#a3a3a3] text-lg leading-relaxed">
                Tell us about your business and we&apos;ll build a Knight plan that fits your sales workflow, team size, and revenue goals.
              </p>
            </div>
          </div>
        </section>

        {/* Two-column layout */}
        <section className="pb-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 items-start">
              {/* LEFT — Form */}
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8">
                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-full bg-white/[0.06] flex items-center justify-center mb-6">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    </div>
                    <h2 className="font-display text-2xl font-semibold text-white mb-3">
                      Message received
                    </h2>
                    <p className="text-[#a3a3a3] text-base max-w-sm leading-relaxed">
                      We&apos;ll be in touch within 24 hours. Check{" "}
                      <span className="text-white">{form.workEmail}</span> for
                      a response from our sales team.
                    </p>
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setForm(initialForm);
                      }}
                      className="mt-8 text-sm text-[#525252] hover:text-[#a3a3a3] transition-colors underline underline-offset-4"
                    >
                      Submit another request
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <h2 className="font-display text-xl font-semibold text-white mb-1">
                        Contact information
                      </h2>
                      <p className="text-sm text-[#525252]">
                        All fields are required unless marked optional.
                      </p>
                    </div>

                    {/* Name row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass} htmlFor="firstName">
                          First Name
                        </label>
                        <input
                          id="firstName"
                          name="firstName"
                          type="text"
                          required
                          placeholder="Alex"
                          value={form.firstName}
                          onChange={handleChange}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass} htmlFor="lastName">
                          Last Name
                        </label>
                        <input
                          id="lastName"
                          name="lastName"
                          type="text"
                          required
                          placeholder="Johnson"
                          value={form.lastName}
                          onChange={handleChange}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    {/* Work Email */}
                    <div>
                      <label className={labelClass} htmlFor="workEmail">
                        Work Email
                      </label>
                      <input
                        id="workEmail"
                        name="workEmail"
                        type="email"
                        required
                        placeholder="alex@company.com"
                        value={form.workEmail}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </div>

                    {/* Company Name */}
                    <div>
                      <label className={labelClass} htmlFor="companyName">
                        Company Name
                      </label>
                      <input
                        id="companyName"
                        name="companyName"
                        type="text"
                        required
                        placeholder="Acme Corp"
                        value={form.companyName}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </div>

                    {/* Team Size + Use Case */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass} htmlFor="teamSize">
                          Team Size
                        </label>
                        <div className="relative">
                          <select
                            id="teamSize"
                            name="teamSize"
                            required
                            value={form.teamSize}
                            onChange={handleChange}
                            className={selectClass}
                          >
                            <option value="" disabled>
                              Select size
                            </option>
                            <option value="1-10">1–10</option>
                            <option value="11-50">11–50</option>
                            <option value="51-200">51–200</option>
                            <option value="201-500">201–500</option>
                            <option value="500+">500+</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                            <svg
                              className="w-4 h-4 text-[#525252]"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className={labelClass} htmlFor="useCase">
                          Use Case
                        </label>
                        <div className="relative">
                          <select
                            id="useCase"
                            name="useCase"
                            required
                            value={form.useCase}
                            onChange={handleChange}
                            className={selectClass}
                          >
                            <option value="" disabled>
                              Select use case
                            </option>
                            <option value="agency">Agency</option>
                            <option value="freelancer">Freelancer</option>
                            <option value="enterprise">
                              Enterprise Sales Team
                            </option>
                            <option value="other">Other</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                            <svg
                              className="w-4 h-4 text-[#525252]"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Annual Revenue */}
                    <div>
                      <label className={labelClass} htmlFor="annualRevenue">
                        Annual Revenue Range
                      </label>
                      <div className="relative">
                        <select
                          id="annualRevenue"
                          name="annualRevenue"
                          required
                          value={form.annualRevenue}
                          onChange={handleChange}
                          className={selectClass}
                        >
                          <option value="" disabled>
                            Select range
                          </option>
                          <option value="<100k">&lt;$100K</option>
                          <option value="100k-500k">$100K–$500K</option>
                          <option value="500k-2m">$500K–$2M</option>
                          <option value="2m-10m">$2M–$10M</option>
                          <option value="10m+">$10M+</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                          <svg
                            className="w-4 h-4 text-[#525252]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Current Sales Workflow */}
                    <div>
                      <label className={labelClass} htmlFor="currentWorkflow">
                        Current Sales Workflow{" "}
                        <span className="text-[#3a3a3a]">(optional)</span>
                      </label>
                      <textarea
                        id="currentWorkflow"
                        name="currentWorkflow"
                        rows={4}
                        placeholder="Describe how your team currently finds, qualifies, and closes leads. What tools do you use? Where are the biggest bottlenecks?"
                        value={form.currentWorkflow}
                        onChange={handleChange}
                        className={`${inputClass} resize-none leading-relaxed`}
                      />
                    </div>

                    {/* Preferred Contact Method */}
                    <div>
                      <label className={labelClass}>
                        Preferred Contact Method
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {(
                          [
                            {
                              value: "email",
                              label: "Email",
                              icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>,
                            },
                            {
                              value: "video",
                              label: "Video Call",
                              icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,
                            },
                            {
                              value: "phone",
                              label: "Phone",
                              icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .73h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>,
                            },
                          ] as const
                        ).map(({ value, label, icon }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => handleRadio(value)}
                            className={`flex flex-col items-center gap-2 px-3 py-4 rounded-lg border text-sm font-medium transition-all ${
                              form.contactMethod === value
                                ? "border-white/30 bg-white/[0.06] text-white"
                                : "border-white/[0.08] bg-[#0f0f0f] text-[#525252] hover:border-white/[0.14] hover:text-[#a3a3a3]"
                            }`}
                          >
                            {icon}
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-white text-black px-5 py-3 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <svg
                            className="animate-spin w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8z"
                            />
                          </svg>
                          Sending…
                        </>
                      ) : (
                        <>
                          Get in touch
                           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </>
                      )}
                    </button>

                    <p className="text-xs text-[#3a3a3a] text-center leading-relaxed">
                      By submitting this form you agree to our{" "}
                      <a
                        href="/privacy"
                        className="text-[#525252] hover:text-[#a3a3a3] underline underline-offset-2 transition-colors"
                      >
                        Privacy Policy
                      </a>
                      . We never sell your data.
                    </p>
                  </form>
                )}
              </div>

              {/* RIGHT — Info Panel */}
              <div className="space-y-6 lg:sticky lg:top-28">
                {/* What happens next */}
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
                  <h3 className="font-display text-base font-semibold text-white mb-5">
                    What happens next?
                  </h3>
                  <div className="space-y-5">
                    {steps.map((step, i) => (
                      <div key={step.number} className="flex gap-4">
                        <div className="flex-shrink-0 flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
                            <span className="font-mono text-xs text-[#525252]">
                              {step.number}
                            </span>
                          </div>
                          {i < steps.length - 1 && (
                            <div className="w-px flex-1 bg-white/[0.06] mt-2" />
                          )}
                        </div>
                        <div className="pb-5 last:pb-0">
                          <p className="text-sm font-medium text-white mb-1">
                            {step.title}
                          </p>
                          <p className="text-xs text-[#525252] leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick access cards */}
                <div className="space-y-3">
                  {/* Book a Demo */}
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 flex items-start gap-4">
                    <div className="w-9 h-9 rounded-lg bg-white/[0.05] flex items-center justify-center flex-shrink-0">
                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a3a3a3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white mb-0.5">
                        Book a Demo
                      </p>
                      <p className="text-xs text-[#525252]">Coming soon</p>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3a3a3a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </div>

                  {/* Schedule a Call */}
                  <a
                    href="https://cal.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 flex items-start gap-4 hover:border-white/[0.10] hover:bg-white/[0.03] transition-all group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-white/[0.05] flex items-center justify-center flex-shrink-0">
                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a3a3a3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white mb-0.5">
                        Schedule a Call
                      </p>
                      <p className="text-xs text-[#525252]">
                        Pick a time on cal.com
                      </p>
                    </div>
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3a3a3a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5 group-hover:stroke-[#525252] transition-colors"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </a>

                  {/* Enterprise Consultation */}
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 flex items-start gap-4">
                    <div className="w-9 h-9 rounded-lg bg-white/[0.05] flex items-center justify-center flex-shrink-0">
                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a3a3a3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white mb-0.5">
                        Enterprise Consultation
                      </p>
                      <p className="text-xs text-[#525252]">
                        Custom integrations, SLAs, and dedicated support for large teams.
                      </p>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3a3a3a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </div>
                </div>

                {/* Contact email */}
                <div className="border border-white/[0.06] rounded-xl p-4 flex items-center gap-3">
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#525252" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>
                  <div className="text-xs text-[#525252]">
                    Prefer email?{" "}
                    <a
                      href="mailto:sales@knight.app"
                      className="text-[#a3a3a3] hover:text-white transition-colors"
                    >
                      sales@knight.app
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
