import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { getUser, getOrg } from "@/lib/auth";
import { DashboardContent } from "@/components/DashboardContent";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect("/auth/login");

  const org = await getOrg(user.id);
  if (!org) redirect("/auth/signup");

  return (
    <div className="flex h-screen">
      <Sidebar orgPlan={org.plan} orgName={org.name} />
      <DashboardContent orgName={org.name}>{children}</DashboardContent>
    </div>
  );
}
