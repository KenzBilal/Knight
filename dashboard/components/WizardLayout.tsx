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
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link
            href={backHref}
            className="text-sm text-[#666] hover:text-[#111] transition-colors inline-flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {backLabel}
          </Link>
          <span className="text-xs text-[#888]">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>

        <FadeIn>
          <div className="mb-8">
            <div className="mb-6">
              <h1 className="font-display text-2xl text-[#111]">{title}</h1>
              {subtitle && <p className="text-sm text-[#666] mt-1">{subtitle}</p>}
            </div>

            <div className="flex items-center gap-2">
              {steps.map((step, i) => (
                <div key={step.id} className="flex items-center gap-2 flex-1">
                  <button
                    onClick={() => i <= currentStep && onStepChange(i)}
                    disabled={i > currentStep}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all flex-shrink-0 ${
                      i < currentStep
                        ? "bg-[#111] text-white"
                        : i === currentStep
                        ? "bg-[#e5e5e5] text-[#111] ring-2 ring-[#ccc]"
                        : "bg-[#f0f0f0] text-[#888]"
                    } ${i <= currentStep ? "cursor-pointer hover:scale-105" : "cursor-not-allowed"}`}
                  >
                    {i < currentStep ? "✓" : i + 1}
                  </button>
                  {i < steps.length - 1 && (
                    <div className={`h-0.5 flex-1 rounded-full transition-colors ${
                      i < currentStep ? "bg-[#111]" : "bg-[#f0f0f0]"
                    }`} />
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-start gap-2 mt-3">
              {steps.map((step, i) => (
                <div key={step.id} className="flex-1 text-center">
                  <p className={`text-xs font-medium ${
                    i <= currentStep ? "text-[#444]" : "text-[#999]"
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
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#ebebeb]">
            <button
              onClick={() => onStepChange(currentStep - 1)}
              disabled={isFirstStep}
              className={`rounded-lg border font-medium px-5 py-2.5 text-sm transition-all ${
                isFirstStep
                  ? "border-[#ebebeb] text-[#999] cursor-not-allowed opacity-50"
                  : "border-[#ddd] text-[#444] hover:bg-[#f0f0f0] active:scale-[0.98]"
              }`}
            >
              Previous
            </button>

            {isLastStep ? (
              <button
                onClick={onComplete}
                disabled={isSubmitting}
                className="rounded-lg bg-[#111] text-white font-medium px-6 py-2.5 text-sm hover:bg-[#333] transition-all disabled:opacity-50 active:scale-[0.98] flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  completeLabel
                )}
              </button>
            ) : (
              <button
                onClick={() => onStepChange(currentStep + 1)}
                className="rounded-lg bg-[#111] text-white font-medium px-6 py-2.5 text-sm hover:bg-[#333] transition-all active:scale-[0.98]"
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
    <div className="rounded-2xl border border-[#ebebeb] bg-white p-6" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" }}>
      <div className="flex items-start gap-4 mb-6">
        {icon && (
          <div className="w-12 h-12 rounded-xl bg-[#f0f0f0] flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
        )}
        <div>
          <h2 className="font-display text-lg text-[#111]">{title}</h2>
          {description && <p className="text-sm text-[#666] mt-1">{description}</p>}
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
    <div className="rounded-2xl border border-[#ebebeb] bg-white p-8 text-center" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" }}>
      <div className="text-5xl mb-4">{icon || "✓"}</div>
      <h2 className="font-display text-2xl text-[#111] mb-2">{title}</h2>
      <p className="text-sm text-[#666] mb-8 max-w-md mx-auto">{description}</p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={onContinue}
          className="rounded-lg bg-[#111] text-white font-medium px-6 py-2.5 text-sm hover:bg-[#333] transition-colors"
        >
          {continueLabel}
        </button>
        {onSetupMore && (
          <button
            onClick={onSetupMore}
            className="rounded-lg border border-[#ddd] text-[#444] font-medium px-6 py-2.5 text-sm hover:bg-[#f0f0f0] transition-colors"
          >
            Setup More
          </button>
        )}
      </div>
    </div>
  );
}
