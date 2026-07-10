import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { getUser, getOrg } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect("/auth/login");

  const org = await getOrg(user.id);
  if (!org) redirect("/auth/signup");

  return (
    <div className="flex min-h-screen">
      <Sidebar orgPlan={org.plan} orgName={org.name} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
