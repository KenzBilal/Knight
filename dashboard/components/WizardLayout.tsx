"use client";

import Link from "next/link";
import { FadeIn } from "./Animations";

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
}: WizardLayoutProps) {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link
            href={backHref}
            className="text-sm text-[#525252] hover:text-white transition-colors inline-flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {backLabel}
          </Link>
          <span className="text-xs text-[#525252]">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>

        <FadeIn>
          <div className="mb-8">
            <div className="mb-6">
              <h1 className="font-display text-2xl text-white">{title}</h1>
              {subtitle && <p className="text-sm text-[#525252] mt-1">{subtitle}</p>}
            </div>

            <div className="flex items-center gap-2">
              {steps.map((step, i) => (
                <div key={step.id} className="flex items-center gap-2 flex-1">
                  <button
                    onClick={() => i <= currentStep && onStepChange(i)}
                    disabled={i > currentStep}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all flex-shrink-0 ${
                      i < currentStep
                        ? "bg-white text-[#080808]"
                        : i === currentStep
                        ? "bg-white/20 text-white ring-2 ring-white/30"
                        : "bg-white/[0.06] text-[#525252]"
                    } ${i <= currentStep ? "cursor-pointer hover:scale-105" : "cursor-not-allowed"}`}
                  >
                    {i < currentStep ? "✓" : i + 1}
                  </button>
                  {i < steps.length - 1 && (
                    <div className={`h-0.5 flex-1 rounded-full transition-colors ${
                      i < currentStep ? "bg-white" : "bg-white/[0.06]"
                    }`} />
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-start gap-2 mt-3">
              {steps.map((step, i) => (
                <div key={step.id} className="flex-1 text-center">
                  <p className={`text-xs font-medium ${
                    i <= currentStep ? "text-[#a3a3a3]" : "text-[#3a3a3a]"
                  }`}>
                    {step.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={100}>
          <div className="min-h-[400px]">
            {children}
          </div>
        </FadeIn>

        <FadeIn delay={200}>
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/[0.06]">
            <button
              onClick={() => onStepChange(currentStep - 1)}
              disabled={isFirstStep}
              className={`rounded-xl border font-medium px-5 py-2.5 text-sm transition-all ${
                isFirstStep
                  ? "border-white/[0.06] text-[#3a3a3a] cursor-not-allowed opacity-50"
                  : "border-white/[0.12] text-[#a3a3a3] hover:bg-white/[0.04] hover:text-white active:scale-[0.98]"
              }`}
            >
              Previous
            </button>

            {isLastStep ? (
              <button
                onClick={onComplete}
                disabled={isSubmitting}
                className="rounded-xl bg-white text-[#080808] font-semibold px-6 py-2.5 text-sm hover:bg-white/90 transition-all disabled:opacity-50 active:scale-[0.98] flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#080808]/30 border-t-[#080808] rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  completeLabel
                )}
              </button>
            ) : (
              <button
                onClick={() => onStepChange(currentStep + 1)}
                className="rounded-xl bg-white text-[#080808] font-semibold px-6 py-2.5 text-sm hover:bg-white/90 transition-all active:scale-[0.98]"
              >
                Continue
              </button>
            )}
          </div>
        </FadeIn>
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
    <div className="dash-card rounded-xl p-6">
      <div className="flex items-start gap-4 mb-6">
        {icon && (
          <div className="w-12 h-12 rounded-xl bg-white/[0.06] flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
        )}
        <div>
          <h2 className="font-display text-lg text-white">{title}</h2>
          {description && <p className="text-sm text-[#525252] mt-1">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

export function WizardComplete({
  title,
  description,
  icon,
  onContinue,
  continueLabel = "Go to Dashboard",
  onSetupMore,
}: {
  title: string;
  description: string;
  icon?: React.ReactNode;
  onContinue: () => void;
  continueLabel?: string;
  onSetupMore?: () => void;
}) {
  return (
    <div className="dash-card rounded-xl p-8 text-center">
      <div className="text-5xl mb-4">{icon || "✓"}</div>
      <h2 className="font-display text-2xl text-white mb-2">{title}</h2>
      <p className="text-sm text-[#525252] mb-8 max-w-md mx-auto">{description}</p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={onContinue}
          className="rounded-xl bg-white text-[#080808] font-semibold px-6 py-2.5 text-sm hover:bg-white/90 transition-colors"
        >
          {continueLabel}
        </button>
        {onSetupMore && (
          <button
            onClick={onSetupMore}
            className="rounded-xl border border-white/[0.12] text-[#a3a3a3] font-medium px-6 py-2.5 text-sm hover:bg-white/[0.04] hover:text-white transition-colors"
          >
            Setup More
          </button>
        )}
      </div>
    </div>
  );
}
