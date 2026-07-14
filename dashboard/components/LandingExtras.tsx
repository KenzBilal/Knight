"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

// ─── Scroll Reveal Hook ───────────────────────────────────────────────────────
function useReveal() {
  useEffect(() => {
    const items = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add("revealed");
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -8% 0px" }
    );
    items.forEach((item) => {
      const rect = item.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        (item as HTMLElement).classList.add("revealed");
      } else {
        observer.observe(item);
      }
    });
    return () => observer.disconnect();
  });
}

// ─── 1. HERO VIDEO PLACEHOLDER ────────────────────────────────────────────────
export function HeroVideo() {
  const [open, setOpen] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const modalVideoRef = useRef<HTMLVideoElement>(null);

  // Autoplay modal video when opened
  useEffect(() => {
    if (open && modalVideoRef.current) {
      modalVideoRef.current.play().catch(() => {});
    }
  }, [open]);

  // Close modal on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <section ref={sectionRef} className="py-12 md:py-20">
      <div className="mx-auto max-w-5xl px-6">
        {/* Browser chrome mockup */}
        <div className="reveal rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0d0d0d] shadow-[0_32px_96px_rgba(0,0,0,0.6)]">
          {/* Browser topbar */}
          <div className="flex items-center gap-2 px-4 py-3 bg-[#111] border-b border-white/[0.06]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2a2a2a]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#2a2a2a]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#2a2a2a]" />
            <div className="flex-1 mx-4 h-6 rounded bg-[#1a1a1a] flex items-center px-3">
              <span className="text-[11px] font-mono text-[#444]">app.knight.ai — Dashboard</span>
            </div>
          </div>

          {/* Inline Video Thumbnail — Autoplays on scroll/load, click opens modal */}
          <div
            className="relative aspect-video bg-[#080808] cursor-pointer group"
            onClick={() => setOpen(true)}
          >
            <video
              src="/intro.mp4"
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
              autoPlay
              loop
              muted
              playsInline
            />

            {/* Subtle dark overlay — visible only on hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Play button — centered, pops on hover */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
              <div className="w-[72px] h-[72px] rounded-full bg-white/[0.12] backdrop-blur-md border border-white/[0.2] flex items-center justify-center group-hover:bg-white/[0.22] group-hover:scale-110 transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <span className="text-white font-medium tracking-wide drop-shadow-md">Demo video</span>
            </div>
          </div>
        </div>

        {/* Video modal */}
        {open && (
          <div
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
            onClick={() => setOpen(false)}
          >
            <div
              className="relative w-full max-w-4xl bg-[#0a0a0a] border border-white/[0.1] rounded-2xl overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.8)] animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-white/30 animate-pulse" />
                  <p className="text-sm text-white font-medium">Knight — Demo video</p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-[#525252] hover:text-white transition-all"
                  aria-label="Close"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              {/* Video */}
              <div className="aspect-video bg-black">
                <video
                  ref={modalVideoRef}
                  src="/intro.mp4"
                  className="w-full h-full object-contain"
                  controls
                  playsInline
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── 2. INTERACTIVE PRODUCT DEMO ─────────────────────────────────────────────
const DEMO_LEADS = [
  {
    id: 1,
    name: "Green Valley Plumbing",
    city: "Austin, TX",
    phone: "+1 512-555-0183",
    website: "greenvalleyplumbing.com",
    score: 28,
    issues: ["No SSL certificate", "Missing meta descriptions", "Page speed: 31/100", "No Google Analytics"],
    email: `Hi Sarah,\n\nI was looking at greenvalleyplumbing.com and noticed a few issues that might be costing you customers.\n\nYour site loads in 4.8 seconds (industry avg: 2.1s) and is missing SSL, which Google flags as "not secure" in Chrome — likely hurting your local ranking.\n\nI help plumbing businesses in Austin fix exactly this. Would a quick 15-minute call make sense this week?\n\nBest,\nYour Name`,
    status: "Meeting Booked",
  },
  {
    id: 2,
    name: "Pacific Coast HVAC",
    city: "San Diego, CA",
    phone: "+1 619-555-0247",
    website: "pacificcoasthvac.com",
    score: 44,
    issues: ["Poor mobile layout", "No schema markup", "Missing alt tags (23 images)", "Slow server response"],
    email: `Hi Marcus,\n\nI came across pacificcoasthvac.com while researching HVAC companies in San Diego.\n\nYour site has 23 images with no alt tags, which means Google can't index them — and your mobile layout is breaking on most phones, which accounts for 67% of local searches.\n\nI help HVAC businesses rank higher and convert more visitors. Worth a quick chat?\n\nBest,\nYour Name`,
    status: "Replied",
  },
  {
    id: 3,
    name: "Metro Auto Repair",
    city: "Chicago, IL",
    phone: "+1 312-555-0391",
    website: "metroautorepair.com",
    score: 19,
    issues: ["No website found", "Google Maps only", "No online booking", "No reviews widget"],
    email: `Hi James,\n\nI noticed Metro Auto Repair doesn't have a website — just a Google Maps listing.\n\nYour competitors in Chicago are booking jobs online 24/7. Without a site, you're invisible to the 73% of customers who research before calling.\n\nI can have you live with a conversion-focused site in 7 days. Would love to show you what it looks like.\n\nBest,\nYour Name`,
    status: "Email Sent",
  },
];

type DemoStep = "search" | "leads" | "audit" | "email" | "booked";

export function InteractiveDemo() {
  useReveal();
  const [step, setStep] = useState<DemoStep>("search");
  const [selectedLead, setSelectedLead] = useState(DEMO_LEADS[0]);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("Plumbing companies");
  const [location, setLocation] = useState("Austin, TX");
  const [typed, setTyped] = useState("");

  const steps: { id: DemoStep; label: string }[] = [
    { id: "search", label: "Find Leads" },
    { id: "leads", label: "Qualified List" },
    { id: "audit", label: "Site Audit" },
    { id: "email", label: "AI Outreach" },
    { id: "booked", label: "Meeting Booked" },
  ];

  const handleSearch = () => {
    setSearching(true);
    setTimeout(() => {
      setSearching(false);
      setStep("leads");
    }, 1800);
  };

  const handleAudit = (lead: typeof DEMO_LEADS[0]) => {
    setSelectedLead(lead);
    setStep("audit");
  };

  const handleGenerateEmail = () => {
    setStep("email");
    let i = 0;
    const text = selectedLead.email;
    setTyped("");
    const interval = setInterval(() => {
      i++;
      setTyped(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, 18);
  };

  const stepIndex = steps.findIndex((s) => s.id === step);

  return (
    <section id="demo" className="py-28 md:py-36 border-t border-white/[0.04]">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="text-center mb-16 reveal">
          <p className="text-xs font-mono text-[#3a3a3a] uppercase tracking-widest mb-3">Try it live</p>
          <h2 className="font-display text-3xl md:text-5xl font-700 text-white leading-tight mb-4">
            See Knight work in real-time
          </h2>
          <p className="text-[#525252] text-base max-w-lg mx-auto">
            No signup required. Enter a business type and city to watch Knight find, audit, and pitch a prospect.
          </p>
        </div>

        {/* Step progress */}
        <div className="flex items-center gap-0 mb-10 reveal reveal-delay-1 overflow-x-auto pb-2">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center flex-shrink-0">
              <button
                onClick={() => {
                  if (i <= stepIndex) setStep(s.id);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  s.id === step
                    ? "bg-white text-black"
                    : i < stepIndex
                    ? "text-[#a3a3a3] hover:text-white"
                    : "text-[#3a3a3a] cursor-default"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono flex-shrink-0 ${
                    s.id === step
                      ? "bg-black text-white"
                      : i < stepIndex
                      ? "bg-white/[0.1] text-[#a3a3a3]"
                      : "bg-white/[0.04] text-[#3a3a3a]"
                  }`}
                >
                  {i < stepIndex ? "✓" : i + 1}
                </span>
                {s.label}
              </button>
              {i < steps.length - 1 && (
                <div className={`h-px w-6 mx-1 ${i < stepIndex ? "bg-white/[0.2]" : "bg-white/[0.04]"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Demo panels */}
        <div className="card border border-white/[0.08] bg-[#0a0a0a] min-h-[420px] reveal reveal-delay-2">
          {/* STEP: SEARCH */}
          {step === "search" && (
            <div className="p-8 flex flex-col items-center justify-center min-h-[420px] gap-6">
              <div className="text-center mb-2">
                <p className="text-white text-lg font-display font-600 mb-1">Who are you targeting?</p>
                <p className="text-[#525252] text-sm">Knight will find and qualify real businesses in seconds.</p>
              </div>
              <div className="w-full max-w-md space-y-3">
                <div>
                  <label className="text-[11px] text-[#525252] uppercase tracking-widest font-mono block mb-1.5">Business type</label>
                  <input
                    className="input-base"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. HVAC contractors, dental clinics…"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#525252] uppercase tracking-widest font-mono block mb-1.5">Location</label>
                  <input
                    className="input-base"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Austin, TX"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={searching}
                  className="btn-primary w-full py-3 font-semibold"
                >
                  {searching ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeLinecap="round" />
                      </svg>
                      Scanning Google Maps…
                    </span>
                  ) : (
                    "Find qualified leads →"
                  )}
                </button>
              </div>
              <p className="text-[11px] text-[#3a3a3a]">Demo mode · No real emails are sent</p>
            </div>
          )}

          {/* STEP: LEADS */}
          {step === "leads" && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-white font-medium text-sm">
                    Found <span className="text-[#a3a3a3]">3</span> qualified leads
                  </p>
                  <p className="text-[#525252] text-xs mt-0.5">&ldquo;{query}&rdquo; &middot; {location} &middot; Sorted by opportunity score</p>
                </div>
                <span className="badge badge-success">Scored</span>
              </div>
              <div className="space-y-3">
                {DEMO_LEADS.map((lead) => (
                  <div
                    key={lead.id}
                    className="group flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all cursor-pointer"
                    onClick={() => handleAudit(lead)}
                  >
                    <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0 text-base">
                      🏢
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">{lead.name}</p>
                      <p className="text-[#525252] text-xs truncate">{lead.city} · {lead.website}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-[10px] text-[#3a3a3a] mb-0.5">Site score</p>
                        <span
                          className={`font-mono text-sm font-bold ${
                            lead.score < 35 ? "text-red-400" : lead.score < 55 ? "text-yellow-400" : "text-green-400"
                          }`}
                        >
                          {lead.score}/100
                        </span>
                      </div>
                      <svg
                        className="w-4 h-4 text-[#3a3a3a] group-hover:text-white transition-colors"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP: AUDIT */}
          {step === "audit" && (
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setStep("leads")} className="text-[#525252] hover:text-white transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 5l-7 7 7 7" />
                  </svg>
                </button>
                <div>
                  <p className="text-white font-medium text-sm">{selectedLead.name}</p>
                  <p className="text-[#525252] text-xs">{selectedLead.website}</p>
                </div>
                <div className="ml-auto">
                  <span
                    className={`font-mono text-2xl font-bold ${
                      selectedLead.score < 35 ? "text-red-400" : selectedLead.score < 55 ? "text-yellow-400" : "text-green-400"
                    }`}
                  >
                    {selectedLead.score}
                    <span className="text-sm text-[#3a3a3a]">/100</span>
                  </span>
                </div>
              </div>

              <div className="mb-5">
                <div className="progress-bar mb-1">
                  <div className="progress-bar-fill" style={{ width: `${selectedLead.score}%`, background: selectedLead.score < 35 ? "#f87171" : selectedLead.score < 55 ? "#facc15" : "#4ade80" }} />
                </div>
                <p className="text-[11px] text-[#3a3a3a]">
                  {selectedLead.score < 35 ? "Poor — high-opportunity lead" : selectedLead.score < 55 ? "Fair — moderate opportunity" : "Good — lower priority"}
                </p>
              </div>

              <p className="text-xs text-[#3a3a3a] uppercase tracking-widest font-mono mb-3">Issues found</p>
              <div className="grid sm:grid-cols-2 gap-2 mb-6">
                {selectedLead.issues.map((issue) => (
                  <div key={issue} className="flex items-start gap-2 p-3 rounded-lg bg-red-500/[0.06] border border-red-500/[0.12]">
                    <svg className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <p className="text-red-300 text-xs">{issue}</p>
                  </div>
                ))}
              </div>

              <button onClick={handleGenerateEmail} className="btn-primary w-full py-3 font-semibold">
                Generate personalized pitch →
              </button>
            </div>
          )}

          {/* STEP: EMAIL */}
          {step === "email" && (
            <div className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <button onClick={() => setStep("audit")} className="text-[#525252] hover:text-white transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 5l-7 7 7 7" />
                  </svg>
                </button>
                <p className="text-white font-medium text-sm">AI-generated pitch for {selectedLead.name}</p>
                <span className="ml-auto badge badge-success">Personalized</span>
              </div>

              <div className="bg-[#080808] border border-white/[0.06] rounded-xl p-5 mb-5 font-mono text-xs text-[#a3a3a3] leading-relaxed whitespace-pre-wrap min-h-[200px]">
                {typed || selectedLead.email}
              </div>

              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: "Day 1", desc: "Initial email" },
                  { label: "Day 3", desc: "Follow-up" },
                  { label: "Day 7", desc: "Breakup email" },
                ].map((seq) => (
                  <div key={seq.label} className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-center">
                    <p className="text-white text-xs font-medium">{seq.label}</p>
                    <p className="text-[#525252] text-[10px]">{seq.desc}</p>
                  </div>
                ))}
              </div>

              <button onClick={() => setStep("booked")} className="btn-primary w-full py-3 font-semibold">
                Send sequence →
              </button>
            </div>
          )}

          {/* STEP: BOOKED */}
          {step === "booked" && (
            <div className="p-8 flex flex-col items-center justify-center min-h-[420px] text-center gap-6">
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-2xl animate-scale-in">
                🎉
              </div>
              <div>
                <p className="text-white text-xl font-display font-700 mb-2">Meeting booked with {selectedLead.name}</p>
                <p className="text-[#525252] text-sm max-w-sm mx-auto">
                  Sarah replied within 4 hours. Knight handled the thread and confirmed a 15-minute discovery call on Thursday at 2PM.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
                {[
                  { label: "Time spent", value: "0 min" },
                  { label: "Emails sent", value: "1" },
                  { label: "Outcome", value: "Booked" },
                ].map((m) => (
                  <div key={m.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                    <p className="text-[10px] text-[#525252] mb-1">{m.label}</p>
                    <p className="text-white text-sm font-bold font-mono">{m.value}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setStep("search"); setTyped(""); }}
                  className="btn-ghost px-5 py-2.5 text-sm"
                >
                  Try again
                </button>
                <Link href="/auth/signup" className="btn-primary px-5 py-2.5 text-sm font-semibold">
                  Start for free →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── 3. ANIMATED WORKFLOW ─────────────────────────────────────────────────────
const WORKFLOW_STEPS = [
  { icon: "🗺️", label: "Lead Discovery", desc: "Google Maps scraped for qualified businesses" },
  { icon: "🔍", label: "Website Audit", desc: "30+ signals checked, scored 0–100" },
  { icon: "🤖", label: "AI Analysis", desc: "Gemini identifies exact pain points" },
  { icon: "✍️", label: "Personalized Pitch", desc: "Email written around specific site issues" },
  { icon: "📬", label: "Email Sequence", desc: "3-touch sequence sent automatically" },
  { icon: "📨", label: "Reply Detection", desc: "Intent classified, response drafted" },
  { icon: "📅", label: "Meeting Booked", desc: "Calendar invite confirmed" },
];

export function AnimatedWorkflow() {
  useReveal();

  return (
    <section className="py-28 md:py-36 border-t border-white/[0.04]">
      <div className="mx-auto max-w-4xl px-6">
        <div className="text-center mb-16 reveal">
          <p className="text-xs font-mono text-[#3a3a3a] uppercase tracking-widest mb-3">How Knight thinks</p>
          <h2 className="font-display text-3xl md:text-5xl font-700 text-white leading-tight mb-4">
            Prospect to meeting.<br className="hidden md:block" /> Fully automated.
          </h2>
          <p className="text-[#525252] text-base max-w-md mx-auto">
            Seven intelligent steps, zero manual work. Knight runs the entire pipeline while you focus on closing.
          </p>
        </div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/[0.06] to-transparent" />

          <div className="space-y-4">
            {WORKFLOW_STEPS.map((s, i) => (
              <div
                key={s.label}
                className={`reveal reveal-delay-${Math.min(i + 1, 5)} flex items-center gap-6 ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Content */}
                <div className={`flex-1 pl-16 md:pl-0 ${i % 2 === 0 ? "md:text-right md:pr-8" : "md:text-left md:pl-8"}`}>
                  <p className="text-white text-sm font-semibold mb-0.5">{s.label}</p>
                  <p className="text-[#525252] text-xs">{s.desc}</p>
                </div>

                {/* Icon node */}
                <div className="absolute left-0 md:relative md:left-auto flex-shrink-0 w-12 h-12 rounded-full bg-[#111] border border-white/[0.1] flex items-center justify-center text-xl z-10">
                  {s.icon}
                </div>

                {/* Spacer for alternating layout */}
                <div className="flex-1 hidden md:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 4. TESTIMONIALS ──────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    name: "Ryan Caldwell",
    title: "Founder",
    company: "Caldwell Digital",
    avatar: "RC",
    rating: 5,
    quote: "I was spending 3 hours a day on prospecting. Knight eliminated that completely. We booked 8 qualified discovery calls in our first week — more than the previous month combined.",
  },
  {
    name: "Priya Sharma",
    title: "Head of Growth",
    company: "Apex Web Studio",
    avatar: "PS",
    rating: 5,
    quote: "The site audit feature is what sold me. Prospects reply because Knight references actual problems on their site — not generic cold emails. Our reply rate went from 2% to 11%.",
  },
  {
    name: "Marcus Webb",
    title: "CEO",
    company: "Webb Agency Co.",
    avatar: "MW",
    rating: 5,
    quote: "We closed a $12,000 contract in the first 10 days. Knight paid for itself 40x over. I genuinely can't believe this tool exists at this price point.",
  },
  {
    name: "Layla Hassan",
    title: "Business Development",
    company: "Horizon Marketing",
    avatar: "LH",
    rating: 5,
    quote: "The AI reads the prospect's actual website and writes something specific. Clients keep saying 'how did you know about that issue?' We look like geniuses.",
  },
  {
    name: "Derek Fontaine",
    title: "Solo Consultant",
    company: "Freelance",
    avatar: "DF",
    rating: 5,
    quote: "As a one-person shop, Knight is like having a full SDR team working 24/7. I focus on closing. Knight handles everything before the call.",
  },
  {
    name: "Sana Mirza",
    title: "Director of Sales",
    company: "TechFlow Solutions",
    avatar: "SM",
    rating: 5,
    quote: "We piloted Knight against our existing SDR process. Knight generated 3x more qualified meetings at 1/10th the cost. The board approved scaling immediately.",
  },
];

export function Testimonials() {
  useReveal();
  return (
    <section id="testimonials" className="py-28 md:py-36 border-t border-white/[0.04] bg-[#0a0a0a]">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-16 reveal">
          <p className="text-xs font-mono text-[#3a3a3a] uppercase tracking-widest mb-3">Social proof</p>
          <h2 className="font-display text-3xl md:text-5xl font-700 text-white leading-tight mb-4">
            Teams closing more deals with Knight
          </h2>
          <p className="text-[#525252] text-base max-w-md mx-auto">
            Real results from founders, agencies, and sales teams who replaced manual prospecting with Knight.
          </p>
        </div>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.name}
              className={`reveal reveal-delay-${(i % 3) + 1} break-inside-avoid card card-hover p-6 mb-4`}
            >
              {/* Rating */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <svg key={j} className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p className="text-[#a3a3a3] text-sm leading-relaxed mb-5">&ldquo;{t.quote}&rdquo;</p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/[0.08] border border-white/[0.06] flex items-center justify-center text-xs font-mono text-[#a3a3a3] flex-shrink-0">
                  {t.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-semibold">{t.name}</p>
                  <p className="text-[#525252] text-xs truncate">{t.title} · {t.company}</p>
                </div>
                <span className="flex items-center gap-1 text-[10px] text-[#4ade80] bg-green-500/[0.08] border border-green-500/[0.12] rounded px-2 py-0.5 flex-shrink-0">
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Verified
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 5. CASE STUDIES ──────────────────────────────────────────────────────────
const CASE_STUDIES = [
  {
    company: "Caldwell Digital",
    industry: "Web Design Agency",
    problem: "Spending 20+ hours/week manually finding and emailing prospects. Low reply rates, inconsistent pipeline.",
    solution: "Deployed Knight to target local service businesses in 3 cities. Knight ran daily audits and personalized outreach automatically.",
    workflow: ["200 leads found/week", "30-point audit per site", "Personalized email sent", "Replies handled by AI"],
    results: [
      { metric: "11x", label: "Reply rate increase" },
      { metric: "34", label: "Meetings in 30 days" },
      { metric: "$48K", label: "New MRR generated" },
      { metric: "22h", label: "Time saved weekly" },
    ],
    roi: "ROI in 6 days",
  },
  {
    company: "Apex Web Studio",
    industry: "SEO & Web Agency",
    problem: "Relied on referrals. Needed a repeatable outbound channel without hiring an SDR ($80K+ salary).",
    solution: "Used Knight's Telegram agent and email outreach in parallel to reach SMBs in 5 verticals across 2 regions.",
    workflow: ["Targeting setup in 2 min", "Dual-channel outreach", "Follow-up automated", "Hot leads to pipeline"],
    results: [
      { metric: "3x", label: "Pipeline growth" },
      { metric: "$120K", label: "Annual revenue added" },
      { metric: "91%", label: "Cost saving vs SDR" },
      { metric: "0h", label: "Prospecting time" },
    ],
    roi: "ROI in first week",
  },
];

export function CaseStudies() {
  useReveal();
  return (
    <section className="py-28 md:py-36 border-t border-white/[0.04]">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-16 reveal">
          <p className="text-xs font-mono text-[#3a3a3a] uppercase tracking-widest mb-3">Success stories</p>
          <h2 className="font-display text-3xl md:text-5xl font-700 text-white leading-tight mb-4">
            Real outcomes.<br className="hidden md:block" /> Real numbers.
          </h2>
          <p className="text-[#525252] text-base max-w-md mx-auto">
            See how agencies and sales teams replaced manual prospecting with a system that generates pipeline around the clock.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {CASE_STUDIES.map((cs, i) => (
            <div
              key={cs.company}
              className={`reveal reveal-delay-${i + 1} card border border-white/[0.08] p-8 flex flex-col`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-white font-display font-700 text-lg">{cs.company}</p>
                  <p className="text-[#525252] text-xs mt-0.5">{cs.industry}</p>
                </div>
                <span className="badge badge-success text-xs">{cs.roi}</span>
              </div>

              {/* Problem */}
              <div className="mb-4">
                <p className="text-[10px] font-mono text-[#3a3a3a] uppercase tracking-widest mb-1.5">The problem</p>
                <p className="text-[#737373] text-sm leading-relaxed">{cs.problem}</p>
              </div>

              {/* Solution */}
              <div className="mb-5">
                <p className="text-[10px] font-mono text-[#3a3a3a] uppercase tracking-widest mb-1.5">How they used Knight</p>
                <p className="text-[#737373] text-sm leading-relaxed">{cs.solution}</p>
              </div>

              {/* Workflow */}
              <div className="flex gap-2 flex-wrap mb-6">
                {cs.workflow.map((w, j) => (
                  <div key={w} className="flex items-center gap-1.5">
                    <span className="text-xs text-[#525252] bg-white/[0.04] border border-white/[0.06] rounded-full px-3 py-1">{w}</span>
                    {j < cs.workflow.length - 1 && <span className="text-[#2a2a2a] text-xs">→</span>}
                  </div>
                ))}
              </div>

              {/* Results */}
              <div className="grid grid-cols-2 gap-3 mt-auto">
                {cs.results.map((r) => (
                  <div key={r.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                    <p className="text-white text-xl font-display font-700 mb-0.5">{r.metric}</p>
                    <p className="text-[#525252] text-xs">{r.label}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10 reveal">
          <Link href="/auth/signup" className="btn-primary px-8 py-3.5 text-sm font-semibold">
            Start building your pipeline →
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── 6. ROI CALCULATOR ────────────────────────────────────────────────────────
export function ROICalculator() {
  useReveal();
  const [prospects, setProspects] = useState(200);
  const [dealValue, setDealValue] = useState(3000);
  const [closeRate, setCloseRate] = useState(5);
  const [hoursPerWeek, setHoursPerWeek] = useState(10);
  const [reps, setReps] = useState(1);

  const hoursSaved = hoursPerWeek * reps * 4;
  const meetingsGenerated = Math.round((prospects * (closeRate / 100)) * 2.5);
  const revenueAdded = Math.round(meetingsGenerated * (closeRate / 100) * dealValue);
  const roiMultiple = Math.round(revenueAdded / 49);

  const Slider = ({
    label, value, min, max, step, onChange, format,
  }: {
    label: string; value: number; min: number; max: number; step: number;
    onChange: (n: number) => void; format: (n: number) => string;
  }) => (
    <div>
      <div className="flex justify-between mb-2">
        <label className="text-xs text-[#525252]">{label}</label>
        <span className="text-xs text-white font-mono font-medium">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 bg-white/[0.08] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"
      />
    </div>
  );

  return (
    <section className="py-28 md:py-36 border-t border-white/[0.04] bg-[#0a0a0a]">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center mb-16 reveal">
          <p className="text-xs font-mono text-[#3a3a3a] uppercase tracking-widest mb-3">ROI calculator</p>
          <h2 className="font-display text-3xl md:text-5xl font-700 text-white leading-tight mb-4">
            How much is your time worth?
          </h2>
          <p className="text-[#525252] text-base max-w-md mx-auto">
            Plug in your numbers. See exactly what automated outbound means for your revenue.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 reveal reveal-delay-1">
          {/* Inputs */}
          <div className="card border border-white/[0.08] p-7 space-y-6">
            <p className="text-white font-medium text-sm mb-2">Your current situation</p>
            <Slider
              label="Monthly prospects contacted"
              value={prospects} min={20} max={1000} step={10}
              onChange={setProspects} format={(v) => `${v}`}
            />
            <Slider
              label="Average deal value"
              value={dealValue} min={500} max={20000} step={500}
              onChange={setDealValue} format={(v) => `$${v.toLocaleString()}`}
            />
            <Slider
              label="Current close rate"
              value={closeRate} min={1} max={30} step={1}
              onChange={setCloseRate} format={(v) => `${v}%`}
            />
            <Slider
              label="Hours/week spent prospecting"
              value={hoursPerWeek} min={1} max={40} step={1}
              onChange={setHoursPerWeek} format={(v) => `${v}h`}
            />
            <Slider
              label="Sales reps / team size"
              value={reps} min={1} max={20} step={1}
              onChange={setReps} format={(v) => `${v}`}
            />
          </div>

          {/* Results */}
          <div className="flex flex-col gap-4">
            {[
              { label: "Hours saved per month", value: `${hoursSaved}h`, sub: "Back in your team's calendar", color: "text-white" },
              { label: "Qualified meetings generated", value: `${meetingsGenerated}`, sub: "Estimated monthly from Knight", color: "text-white" },
              { label: "Revenue potential added", value: `$${revenueAdded.toLocaleString()}`, sub: "Monthly at your current close rate", color: "text-green-400" },
              { label: "ROI vs Knight subscription", value: `${roiMultiple}x`, sub: "Starting at $49/mo", color: "text-green-400" },
            ].map((r) => (
              <div key={r.label} className="card border border-white/[0.08] p-5 flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-[#525252] text-xs mb-1">{r.label}</p>
                  <p className="text-[10px] text-[#3a3a3a]">{r.sub}</p>
                </div>
                <p className={`font-display text-3xl font-700 ${r.color} flex-shrink-0`}>{r.value}</p>
              </div>
            ))}

            <Link href="/auth/signup" className="btn-primary py-3.5 text-sm font-semibold text-center mt-2">
              Start capturing this revenue →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 7. COMPARISON TABLE ──────────────────────────────────────────────────────
const COMPARISON_ROWS = [
  { label: "Setup time", knight: "2 minutes", manual: "Days of research", sdr: "3–6 month ramp" },
  { label: "Cost per month", knight: "From $49", manual: "$0 but 20h+ of your time", sdr: "$6,000–$12,000 salary" },
  { label: "Leads per day", knight: "Unlimited", manual: "5–15 (manual limit)", sdr: "20–50" },
  { label: "Personalization", knight: "Real site audit per lead", manual: "Copy-paste templates", sdr: "Variable quality" },
  { label: "Availability", knight: "24/7 always on", manual: "Business hours only", sdr: "Business hours + PTO" },
  { label: "Follow-ups", knight: "Automated 3-touch", manual: "Often forgotten", sdr: "Inconsistent" },
  { label: "Reply handling", knight: "AI-classified + drafted", manual: "Manual every time", sdr: "Manual every time" },
  { label: "Scalability", knight: "Instant, no hiring", manual: "Doesn't scale", sdr: "Months to hire & train" },
  { label: "Pipeline visibility", knight: "Full Kanban CRM", manual: "Spreadsheets", sdr: "Depends on tooling" },
];

export function ComparisonTable() {
  useReveal();
  return (
    <section className="py-28 md:py-36 border-t border-white/[0.04]">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center mb-16 reveal">
          <p className="text-xs font-mono text-[#3a3a3a] uppercase tracking-widest mb-3">Why Knight</p>
          <h2 className="font-display text-3xl md:text-5xl font-700 text-white leading-tight mb-4">
            Knight vs. the alternatives
          </h2>
          <p className="text-[#525252] text-base max-w-md mx-auto">
            Manual prospecting and SDR hires both have a ceiling. Knight scales infinitely at a fraction of the cost.
          </p>
        </div>

        <div className="reveal reveal-delay-1 overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left py-4 pr-4 text-[11px] font-mono text-[#3a3a3a] uppercase tracking-widest w-1/4">Capability</th>
                <th className="py-4 px-4 text-center w-1/4">
                  <div className="inline-flex flex-col items-center gap-1">
                    <span className="text-white text-sm font-semibold">Knight</span>
                    <span className="badge badge-success text-[9px]">Recommended</span>
                  </div>
                </th>
                <th className="py-4 px-4 text-center text-[#525252] text-sm font-medium w-1/4">Manual Prospecting</th>
                <th className="py-4 px-4 text-center text-[#525252] text-sm font-medium w-1/4">Hiring an SDR</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, i) => (
                <tr
                  key={row.label}
                  className={`border-b border-white/[0.04] ${i % 2 === 0 ? "" : "bg-white/[0.01]"}`}
                >
                  <td className="py-4 pr-4 text-[#525252] text-xs font-medium">{row.label}</td>
                  <td className="py-4 px-4 text-center">
                    <span className="text-white text-xs font-medium bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-1.5 inline-block">
                      {row.knight}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center text-[#525252] text-xs">{row.manual}</td>
                  <td className="py-4 px-4 text-center text-[#525252] text-xs">{row.sdr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-center mt-12 reveal">
          <Link href="/auth/signup" className="btn-primary px-8 py-3.5 text-sm font-semibold">
            Start free — no card required →
          </Link>
          <p className="text-[#3a3a3a] text-xs mt-3">Free plan includes 50 leads and 50 emails/month</p>
        </div>
      </div>
    </section>
  );
}
