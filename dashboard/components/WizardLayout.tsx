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
  const [transitionDirection, setTransitionDirection] = useState<"forward" | "back">("forward");

  useEffect(() => {
    setMounted(true);
  }, []);

  function handleStepChange(newStep: number) {
    setTransitionDirection(newStep > currentStep ? "forward" : "back");
    onStepChange(newStep);
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 lg:p-10">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <Link
            href={backHref}
            className="group text-[13px] text-[#525252] hover:text-white transition-all duration-200 inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            {backLabel}
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-medium text-[#3a3a3a] uppercase tracking-widest">
              {currentStep + 1} / {steps.length}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-10">
          <div className="h-[2px] bg-white/[0.04] rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-4">
            {steps.map((step, i) => (
              <button
                key={step.id}
                onClick={() => i <= currentStep && handleStepChange(i)}
                disabled={i > currentStep}
                className={`text-[11px] font-medium transition-all duration-200 ${
                  i < currentStep
                    ? "text-[#a3a3a3] cursor-pointer hover:text-white"
                    : i === currentStep
                    ? "text-white"
                    : "text-[#2a2a2a] cursor-not-allowed"
                }`}
              >
                {step.title}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="mb-10">
          <h1 className="text-[28px] sm:text-[32px] font-display font-semibold text-white tracking-tight leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[15px] text-[#525252] mt-2 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Content with step transition animation */}
        <div className="min-h-[320px]">
          <div
            className={`transition-all duration-300 ease-out ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            } ${transitionDirection === "forward" ? "animate-[slideInRight_0.3s_ease-out]" : "animate-[slideInLeft_0.3s_ease-out]"}`}
            key={currentStep}
          >
            {children}
          </div>
        </div>

        {/* Footer — only render the Finish button if onComplete is provided AND isLastStep */}
        <div className="flex items-center justify-between mt-12 pt-8 border-t border-white/[0.04]">
          <button
            onClick={() => handleStepChange(currentStep - 1)}
            disabled={isFirstStep}
            className={`group text-[13px] font-medium transition-all duration-200 ${
              isFirstStep
                ? "text-[#1f1f1f] cursor-not-allowed"
                : "text-[#525252] hover:text-white cursor-pointer"
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${!isFirstStep ? "group-hover:-translate-x-0.5" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Previous
            </span>
          </button>

          {isLastStep && onComplete ? (
            <button
              onClick={onComplete}
              disabled={isSubmitting}
              className="group relative inline-flex items-center gap-2 rounded-xl bg-white text-[#080808] font-semibold text-[14px] px-7 py-3 transition-all duration-200 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_32px_rgba(255,255,255,0.1)] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#080808]/20 border-t-[#080808] rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {completeLabel}
                  <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </>
              )}
            </button>
          ) : !hideNext && !isLastStep ? (
            <button
              onClick={() => handleStepChange(currentStep + 1)}
              className="group relative inline-flex items-center gap-2 rounded-xl bg-white text-[#080808] font-semibold text-[14px] px-7 py-3 transition-all duration-200 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_32px_rgba(255,255,255,0.1)] active:scale-[0.98]"
            >
              Continue
              <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          ) : (
            <div />
          )}
        </div>
      </div>
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
  children: React.ReactNode;
}) {
  return (
    <div className="relative rounded-2xl bg-[#0c0c0c] border border-white/[0.04] overflow-hidden">
      {/* Subtle gradient accent on top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      
      <div className="p-6 sm:p-7">
        <div className="flex items-start gap-4 mb-6">
          {icon && (
            <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
              {icon}
            </div>
          )}
          <div className="pt-0.5">
            <h2 className="text-[17px] font-semibold text-white tracking-tight">{title}</h2>
            {description && (
              <p className="text-[13px] text-[#525252] mt-1 leading-relaxed">{description}</p>
            )}
          </div>
        </div>
        {children}
      </div>
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
    <div className="relative rounded-2xl bg-[#0c0c0c] border border-white/[0.04] overflow-hidden text-center">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#4ade80]/20 to-transparent" />
      
      <div className="p-8 sm:p-10">
        {/* Success icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#4ade80]/10 border border-[#4ade80]/20 mb-6">
          <svg className="w-8 h-8 text-[#4ade80]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h2 className="text-[24px] font-display font-semibold text-white mb-2 tracking-tight">
          {title}
        </h2>
        <p className="text-[14px] text-[#525252] mb-8 max-w-sm mx-auto leading-relaxed">
          {description}
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={onContinue}
            className="group inline-flex items-center gap-2 rounded-xl bg-white text-[#080808] font-semibold text-[14px] px-7 py-3 transition-all duration-200 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_32px_rgba(255,255,255,0.1)] active:scale-[0.98]"
          >
            {continueLabel}
            <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
          {onSetupMore && (
            <button
              onClick={onSetupMore}
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] text-[#a3a3a3] font-medium text-[14px] px-7 py-3 transition-all duration-200 hover:bg-white/[0.03] hover:text-white hover:border-white/[0.12]"
            >
              Setup More
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
