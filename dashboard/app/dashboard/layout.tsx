import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { DashboardContent } from "@/components/DashboardContent";
import { getUser, getOrg } from "@/lib/auth";

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
    <div className="flex h-screen overflow-hidden bg-[#fdfdfd] relative">
      {/* Sleek abstract gradient background */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(circle at 0% 0%, #ffffff 0%, transparent 50%), radial-gradient(circle at 100% 100%, #f0f0f0 0%, transparent 50%)',
      }} />
      
      {/* Glassmorphic App Container */}
      <div className="flex w-full h-full bg-white/60 backdrop-blur-3xl overflow-hidden relative z-10">
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
