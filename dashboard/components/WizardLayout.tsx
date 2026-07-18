"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface WizardStep {
  id: string;
  title: string;
  description?: string;
}

interface WizardLayoutProps {
  title: string;
  subtitle?: string;
  steps: WizardStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  onComplete?: () => void;
  completeLabel?: string;
  isSubmitting?: boolean;
  hideNext?: boolean;
}

export function WizardLayout({
  title,
  subtitle,
  steps,
  currentStep,
  onStepChange,
  children,
  backHref = "/dashboard",
  backLabel = "Back to Dashboard",
  onComplete,
  completeLabel = "Finish",
  isSubmitting = false,
  hideNext = false,
}: WizardLayoutProps) {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;
  const [mounted, setMounted] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const [transitionDirection, setTransitionDirection] = useState<"forward" | "back">("forward");

  useEffect(() => {
    setMounted(true);
  }, []);

  function handleStepChange(newStep: number) {
    setTransitionDirection(newStep > currentStep ? "forward" : "back");
    setAnimKey((k) => k + 1);
    onStepChange(newStep);
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "#080808" }}>
      {/* Ambient background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(255,255,255,0.03) 0%, transparent 70%)",
        }}
      />
      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.018]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-5 border-b border-white/[0.04]">
          <Link
            href={backHref}
            className="group flex items-center gap-2 text-[13px] text-[#525252] hover:text-white transition-colors duration-200"
          >
            <svg
              className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            {backLabel}
          </Link>

          {/* Step counter pill */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.02]">
            <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
            <span className="text-[11px] font-medium text-[#525252] tracking-wider uppercase">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 flex flex-col items-center justify-start px-4 py-10 sm:py-14">
          <div className="w-full max-w-2xl">

            {/* Progress section */}
            <div className="mb-10">
              {/* Step dots */}
              <div className="flex items-center gap-0 mb-6">
                {steps.map((step, i) => {
                  const isCompleted = i < currentStep;
                  const isCurrent = i === currentStep;
                  return (
                    <div key={step.id} className="flex items-center flex-1 last:flex-none">
                      <button
                        onClick={() => i <= currentStep && handleStepChange(i)}
                        disabled={i > currentStep}
                        title={step.title}
                        className="relative flex-shrink-0 group focus:outline-none"
                      >
                        <div
                          className={`relative w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold transition-all duration-300 ${
                            isCompleted
                              ? "bg-white text-[#080808] cursor-pointer"
                              : isCurrent
                              ? "bg-white/[0.08] border border-white/40 text-white cursor-default"
                              : "bg-white/[0.03] border border-white/[0.06] text-[#2a2a2a] cursor-not-allowed"
                          }`}
                        >
                          {isCompleted ? (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          ) : (
                            <span>{i + 1}</span>
                          )}
                          {isCurrent && (
                            <span className="absolute inset-0 rounded-full animate-ping opacity-20 bg-white" />
                          )}
                        </div>
                        {/* Tooltip label */}
                        <span className={`absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] whitespace-nowrap font-medium transition-all duration-200 ${
                          isCurrent ? "text-white" : isCompleted ? "text-[#525252]" : "text-[#2a2a2a]"
                        }`}>
                          {step.title}
                        </span>
                      </button>
                      {/* Connector line */}
                      {i < steps.length - 1 && (
                        <div className="flex-1 mx-1.5 h-px relative overflow-hidden">
                          <div className="absolute inset-0 bg-white/[0.06]" />
                          <div
                            className="absolute inset-y-0 left-0 bg-white transition-all duration-500 ease-out"
                            style={{ width: i < currentStep ? "100%" : "0%" }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Progress bar */}
              <div className="mt-8 h-[2px] bg-white/[0.04] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${progress}%`,
                    background: "linear-gradient(90deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,1) 100%)",
                    boxShadow: "0 0 8px rgba(255,255,255,0.3)",
                  }}
                />
              </div>
            </div>

            {/* Page title */}
            <div className="mb-8">
              <h1 className="text-[30px] sm:text-[36px] font-display font-semibold text-white tracking-tight leading-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-[15px] text-[#525252] mt-2 leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Step content with animation */}
            <div className="min-h-[300px]">
              <div
                key={animKey}
                className={`transition-all duration-300 ease-out ${
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                }`}
                style={{
                  animation: mounted
                    ? transitionDirection === "forward"
                      ? "wizardSlideInRight 0.28s cubic-bezier(0.16, 1, 0.3, 1)"
                      : "wizardSlideInLeft 0.28s cubic-bezier(0.16, 1, 0.3, 1)"
                    : "none",
                }}
              >
                {children}
              </div>
            </div>

            {/* Footer navigation */}
            <div className="flex items-center justify-between mt-10 pt-7 border-t border-white/[0.04]">
              <button
                onClick={() => handleStepChange(currentStep - 1)}
                disabled={isFirstStep}
                className={`group inline-flex items-center gap-2 text-[13px] font-medium transition-all duration-200 rounded-lg px-3 py-2 ${
                  isFirstStep
                    ? "text-[#1f1f1f] cursor-not-allowed"
                    : "text-[#525252] hover:text-white hover:bg-white/[0.04] cursor-pointer"
                }`}
              >
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${!isFirstStep ? "group-hover:-translate-x-0.5" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Previous
              </button>

              {isLastStep && onComplete ? (
                <button
                  onClick={onComplete}
                  disabled={isSubmitting}
                  className="group relative inline-flex items-center gap-2.5 rounded-xl font-semibold text-[14px] px-7 py-3 transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: isSubmitting ? "rgba(255,255,255,0.8)" : "#ffffff",
                    color: "#080808",
                    boxShadow: "0 0 0 1px rgba(255,255,255,0.1), 0 4px 20px rgba(255,255,255,0.08)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) {
                      (e.currentTarget as HTMLButtonElement).style.boxShadow =
                        "0 0 0 1px rgba(255,255,255,0.15), 0 8px 32px rgba(255,255,255,0.14)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      "0 0 0 1px rgba(255,255,255,0.1), 0 4px 20px rgba(255,255,255,0.08)";
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#080808]/20 border-t-[#080808] rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {completeLabel}
                      <svg
                        className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </>
                  )}
                </button>
              ) : !hideNext && !isLastStep ? (
                <button
                  onClick={() => handleStepChange(currentStep + 1)}
                  className="group relative inline-flex items-center gap-2.5 rounded-xl font-semibold text-[14px] px-7 py-3 transition-all duration-200 active:scale-[0.98]"
                  style={{
                    background: "#ffffff",
                    color: "#080808",
                    boxShadow: "0 0 0 1px rgba(255,255,255,0.1), 0 4px 20px rgba(255,255,255,0.08)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      "0 0 0 1px rgba(255,255,255,0.15), 0 8px 32px rgba(255,255,255,0.14)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      "0 0 0 1px rgba(255,255,255,0.1), 0 4px 20px rgba(255,255,255,0.08)";
                  }}
                >
                  Continue
                  <svg
                    className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              ) : (
                <div />
              )}
            </div>
          </div>
        </main>
      </div>

      <style>{`
        @keyframes wizardSlideInRight {
          from { opacity: 0; transform: translateX(18px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes wizardSlideInLeft {
          from { opacity: 0; transform: translateX(-18px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

export function WizardCard({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #0f0f0f 0%, #0a0a0a 100%)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.02), 0 4px 40px rgba(0,0,0,0.5)",
      }}
    >
      {/* Top edge highlight */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.10] to-transparent" />
      {/* Subtle inner glow top-left */}
      <div
        className="pointer-events-none absolute top-0 left-0 w-64 h-64 opacity-[0.04]"
        style={{
          background: "radial-gradient(circle, white 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 p-6 sm:p-7">
        {(title || icon) && (
          <div className="flex items-start gap-4 mb-6">
            {icon && (
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
                }}
              >
                {icon}
              </div>
            )}
            <div className="pt-0.5 flex-1">
              <h2 className="text-[17px] font-semibold text-white tracking-tight leading-snug">
                {title}
              </h2>
              {description && (
                <p className="text-[13px] text-[#525252] mt-1 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export function WizardInfoRow({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      {children}
    </div>
  );
}

export function WizardBenefitList({
  items,
}: {
  items: { label: string; icon?: React.ReactNode }[];
}) {
  return (
    <div className="space-y-2.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)" }}
          >
            {item.icon ?? (
              <svg className="w-2.5 h-2.5 text-[#4ade80]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            )}
          </div>
          <span className="text-[13px] text-[#a3a3a3]">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export function WizardComplete({
  title,
  description,
  onContinue,
  continueLabel = "Go to Dashboard",
  onSetupMore,
}: {
  title: string;
  description: string;
  onContinue: () => void;
  continueLabel?: string;
  onSetupMore?: () => void;
}) {
  return (
    <div
      className="relative rounded-2xl overflow-hidden text-center"
      style={{
        background: "linear-gradient(160deg, #0f0f0f 0%, #0a0a0a 100%)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.02), 0 4px 40px rgba(0,0,0,0.5)",
      }}
    >
      {/* Top highlight in green */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#4ade80]/30 to-transparent" />
      {/* Green ambient glow */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-64 h-40 opacity-[0.06]"
        style={{ background: "radial-gradient(circle, #4ade80 0%, transparent 70%)" }}
      />

      <div className="relative z-10 p-8 sm:p-12">
        {/* Success icon */}
        <div className="inline-flex items-center justify-center mb-7">
          <div
            className="relative w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{
              background: "rgba(74,222,128,0.08)",
              border: "1px solid rgba(74,222,128,0.2)",
              boxShadow: "0 0 40px rgba(74,222,128,0.12), inset 0 1px 0 rgba(74,222,128,0.1)",
            }}
          >
            <svg className="w-9 h-9 text-[#4ade80]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {/* Pulse rings */}
            <span
              className="absolute inset-0 rounded-2xl animate-ping opacity-10"
              style={{ background: "#4ade80" }}
            />
          </div>
        </div>

        <h2 className="text-[26px] font-display font-semibold text-white mb-3 tracking-tight">
          {title}
        </h2>
        <p className="text-[14px] text-[#525252] mb-9 max-w-sm mx-auto leading-relaxed">
          {description}
        </p>

        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={onContinue}
            className="group inline-flex items-center gap-2.5 rounded-xl font-semibold text-[14px] px-8 py-3.5 transition-all duration-200 active:scale-[0.98]"
            style={{
              background: "#ffffff",
              color: "#080808",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.1), 0 4px 20px rgba(255,255,255,0.08)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 0 0 1px rgba(255,255,255,0.15), 0 8px 32px rgba(255,255,255,0.14)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 0 0 1px rgba(255,255,255,0.1), 0 4px 20px rgba(255,255,255,0.08)";
            }}
          >
            {continueLabel}
            <svg
              className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
          {onSetupMore && (
            <button
              onClick={onSetupMore}
              className="inline-flex items-center gap-2 rounded-xl font-medium text-[14px] px-7 py-3.5 transition-all duration-200 hover:bg-white/[0.04] hover:text-white active:scale-[0.98]"
              style={{
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#525252",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.14)";
                (e.currentTarget as HTMLButtonElement).style.color = "#a3a3a3";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.08)";
                (e.currentTarget as HTMLButtonElement).style.color = "#525252";
              }}
            >
              Setup More
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
