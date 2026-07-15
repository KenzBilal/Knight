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
    <div className="flex h-screen overflow-hidden bg-[#e5e5e5] relative items-center justify-center p-4">
      {/* Sleek abstract gradient background */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(circle at 0% 0%, #ffffff 0%, transparent 50%), radial-gradient(circle at 100% 100%, #d4d4d4 0%, transparent 50%)',
      }} />
      
      {/* Glassmorphic App Container */}
      <div className="flex w-full h-full max-w-[1600px] bg-white/60 backdrop-blur-2xl rounded-[40px] shadow-[0_8px_32px_rgba(0,0,0,0.06)] overflow-hidden border border-white/60 relative z-10">
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
