import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/DashboardShell";
import { DashboardContent } from "@/components/DashboardContent";
import { getUser, getOrg, getUserRole, getOrgConfig } from "@/lib/auth";

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

  let onboardingIncomplete = true;
  try {
    const config = await getOrgConfig(org.id);
    if (config?.company_name) onboardingIncomplete = false;
  } catch {
    // assume incomplete if we can't check
  }

  return (
    <DashboardShell
      orgPlan={org.plan}
      userEmail={user.email}
      userName={user.name}
      userRole={role}
      onboardingIncomplete={onboardingIncomplete}
    >
      <DashboardContent>
        {children}
      </DashboardContent>
    </DashboardShell>
  );
}
