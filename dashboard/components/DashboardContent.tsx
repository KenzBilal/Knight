"use client";

import { usePathname } from "next/navigation";
import { OnboardingChecklist } from "./OnboardingChecklist";

interface DashboardContentProps {
  children: React.ReactNode;
  orgName?: string;
}

const WIZARD_ROUTES = ["/dashboard/wizard/"];

export function DashboardContent({ children }: DashboardContentProps) {
  const pathname = usePathname();
  const isWizard = WIZARD_ROUTES.some(route => pathname.startsWith(route));

  return (
    <main className="flex-1 overflow-auto">
      {!isWizard && <OnboardingChecklist />}
      {children}
    </main>
  );
}
