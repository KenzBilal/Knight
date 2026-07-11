"use client";

import { usePathname } from "next/navigation";
import { OnboardingChecklist } from "./OnboardingChecklist";

interface DashboardContentProps {
  children: React.ReactNode;
}

export function DashboardContent({ children }: DashboardContentProps) {
  const pathname = usePathname();
  const isOverview = pathname === "/dashboard";

  return (
    <main className="flex-1 overflow-auto">
      {isOverview && <OnboardingChecklist />}
      {children}
    </main>
  );
}
