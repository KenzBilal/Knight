import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/DashboardShell";
import { DashboardContent } from "@/components/DashboardContent";
import { getUser, getOrg, getUserRole } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) redirect("/auth/login");

  const org = await getOrg(user.id);
  if (!org) redirect("/auth/signup");

  let role: "owner" | "admin" | "member" = "member";
  try {
    role = await getUserRole(user.id, org.id);
  } catch {
    // default to member if role query fails
  }

  return (
    <DashboardShell
      orgPlan={org.plan}
      userEmail={user.email}
      userName={user.name}
      userRole={role}
    >
      <DashboardContent userEmail={user.email} userName={user.name} userRole={role}>
        {children}
      </DashboardContent>
    </DashboardShell>
  );
}
