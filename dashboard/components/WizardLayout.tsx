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
    <div className="min-h-screen bg-ink-950">
      {/* Top bar */}
      <div className="border-b border-line bg-ink-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href={backHref}
            className="text-sm text-paper-400 hover:text-paper-200 transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {backLabel}
          </Link>
          <span className="text-xs text-paper-500">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Progress bar */}
        <FadeIn>
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h1 className="font-display text-2xl text-paper-100">{title}</h1>
                {subtitle && <p className="text-sm text-paper-400 mt-1">{subtitle}</p>}
              </div>
            </div>

            {/* Step indicators */}
            <div className="flex items-center gap-2 mt-6">
              {steps.map((step, i) => (
                <div key={step.id} className="flex items-center gap-2 flex-1">
                  <button
                    onClick={() => i <= currentStep && onStepChange(i)}
                    disabled={i > currentStep}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all flex-shrink-0 ${
                      i < currentStep
                        ? "bg-green-500 text-ink-950"
                        : i === currentStep
                        ? "bg-flash-500 text-ink-950 ring-2 ring-flash-500/20"
                        : "bg-ink-800 text-paper-400"
                    } ${i <= currentStep ? "cursor-pointer hover:scale-105" : "cursor-not-allowed"}`}
                  >
                    {i < currentStep ? "✓" : i + 1}
                  </button>
                  {i < steps.length - 1 && (
                    <div className={`h-0.5 flex-1 rounded-full transition-colors ${
                      i < currentStep ? "bg-green-500" : "bg-ink-800"
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step labels */}
            <div className="flex items-start gap-2 mt-3">
              {steps.map((step, i) => (
                <div key={step.id} className="flex-1 text-center">
                  <p className={`text-xs font-medium ${
                    i <= currentStep ? "text-paper-200" : "text-paper-500"
                  }`}>
                    {step.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Step content */}
        <FadeIn delay={100}>
          <div className="min-h-[400px]">
            {children}
          </div>
        </FadeIn>

        {/* Navigation */}
        <FadeIn delay={200}>
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-line">
            <button
              onClick={() => onStepChange(currentStep - 1)}
              disabled={isFirstStep}
              className={`rounded-lg border font-medium px-5 py-2.5 text-sm transition-all ${
                isFirstStep
                  ? "border-line text-paper-500 cursor-not-allowed opacity-50"
                  : "border-line text-paper-300 hover:bg-ink-800 active:scale-[0.98]"
              }`}
            >
              Previous
            </button>

            {isLastStep ? (
              <button
                onClick={onComplete}
                disabled={isSubmitting}
                className="rounded-lg bg-flash-500 text-ink-950 font-medium px-6 py-2.5 text-sm hover:bg-flash-400 transition-all disabled:opacity-50 active:scale-[0.98] flex items-center gap-2"
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
                className="rounded-lg bg-flash-500 text-ink-950 font-medium px-6 py-2.5 text-sm hover:bg-flash-400 transition-all active:scale-[0.98]"
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

/* Step card wrapper for consistent styling */
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
    <div className="rounded-xl border border-line bg-ink-900 p-6">
      <div className="flex items-start gap-4 mb-6">
        {icon && (
          <div className="w-12 h-12 rounded-xl bg-flash-500/10 flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
        )}
        <div>
          <h2 className="font-display text-lg text-paper-100">{title}</h2>
          {description && <p className="text-sm text-paper-400 mt-1">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

/* Success screen component */
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
    <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-8 text-center">
      <div className="text-5xl mb-4">{icon || "✓"}</div>
      <h2 className="font-display text-2xl text-paper-100 mb-2">{title}</h2>
      <p className="text-sm text-paper-400 mb-8 max-w-md mx-auto">{description}</p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={onContinue}
          className="rounded-lg bg-flash-500 text-ink-950 font-medium px-6 py-2.5 text-sm hover:bg-flash-400 transition-colors"
        >
          {continueLabel}
        </button>
        {onSetupMore && (
          <button
            onClick={onSetupMore}
            className="rounded-lg border border-line text-paper-300 font-medium px-6 py-2.5 text-sm hover:bg-ink-800 transition-colors"
          >
            Setup More
          </button>
        )}
      </div>
    </div>
  );
}
