import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { DashboardContent } from "@/components/DashboardContent";
import { getUser, getOrg } from "@/lib/auth";
import { AbstractBackground } from "@/components/AbstractBackground";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) redirect("/auth/login");

  const org = await getOrg(user.id);
  if (!org) redirect("/auth/signup");

  return (
    <div className="relative flex h-screen w-full overflow-hidden p-4 sm:p-6 lg:p-8">
      <AbstractBackground />
      
      {/* The main glass container */}
      <div 
        className="flex flex-1 overflow-hidden bg-white/40 backdrop-blur-[60px] rounded-[32px] sm:rounded-[40px] border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)]"
      >
        <Sidebar
          orgPlan={org.plan}
          userEmail={user.email}
          userName={user.name}
        />
        <DashboardContent userEmail={user.email} userName={user.name}>
          {children}
        </DashboardContent>
      </div>
    </div>
  );
}
