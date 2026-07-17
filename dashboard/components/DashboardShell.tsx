"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import type { UserRole } from "@/lib/auth";

interface SidebarContextType {
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType>({ toggleSidebar: () => {} });
export const useSidebar = () => useContext(SidebarContext);

export function DashboardShell({
  children,
  orgPlan,
  userEmail,
  userName,
  userRole,
  onboardingIncomplete,
}: {
  children: React.ReactNode;
  orgPlan?: string;
  userEmail?: string;
  userName?: string;
  userRole?: UserRole;
  onboardingIncomplete?: boolean;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  useEffect(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <SidebarContext.Provider value={{ toggleSidebar }}>
      <div className="flex h-screen overflow-hidden bg-[#080808]">
        {/* Backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 z-50 w-[240px] transform transition-transform duration-200 ease-out
          lg:relative lg:translate-x-0 lg:z-auto
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}>
          <Sidebar
            orgPlan={orgPlan}
            userEmail={userEmail}
            userName={userName}
            userRole={userRole}
            onboardingIncomplete={onboardingIncomplete}
            onClose={() => setSidebarOpen(false)}
          />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col h-full min-w-0">
          {children}
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
