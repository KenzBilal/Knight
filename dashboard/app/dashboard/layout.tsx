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
    <div className="flex h-screen bg-[#080808]">
      <Sidebar
        orgPlan={org.plan}
        orgName={org.name}
        userEmail={user.email}
        userName={user.name}
      />
      <DashboardContent>{children}</DashboardContent>
    </div>
  );
}
