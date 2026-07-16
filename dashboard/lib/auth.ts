import { cookies } from "next/headers";
import { createServiceClient } from "./supabase";

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface Org {
  id: string;
  name: string;
  slug: string;
  plan: string;
}

export type UserRole = "owner" | "admin" | "member";

export interface OrgConfig {
  id: string;
  org_id: string;
  company_name: string | null;
  company_website: string | null;
  services_offered: string[];
  tone: string;
  calendly_link: string | null;
  sniper_keywords: string[];
  sender_email: string;
  sender_domain: string | null;
  auto_send_threshold: number;
  daily_email_limit: number;
  telegram_enabled: boolean;
  telegram_mode: string | null;
  telegram_phone: string | null;
  telegram_bot_token: string | null;
  telegram_admin_chat_id: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Get the current user from the knight_token cookie.
 * Returns null if not authenticated.
 */
export async function getUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("knight_token")?.value;
  if (!token) return null;

  const serviceClient = createServiceClient();
  const { data: { user } } = await serviceClient.auth.getUser(token);
  if (!user) return null;
  return { id: user.id, email: user.email!, name: user.user_metadata?.name };
}

/**
 * Get the user's role in the org.
 */
export async function getUserRole(userId: string, orgId: string): Promise<UserRole> {
  try {
    const serviceClient = createServiceClient();
    const { data, error } = await serviceClient
      .from("org_members")
      .select("role")
      .eq("user_id", userId)
      .eq("org_id", orgId)
      .maybeSingle();
    if (error) {
      console.error("[getUserRole] DB error:", error.message);
      return "member";
    }
    return (data?.role as UserRole) || "member";
  } catch (err) {
    console.error("[getUserRole] Exception:", err);
    return "member";
  }
}

/**
 * Get the user's org (from org_members).
 * Returns null if user has no org.
 */
export async function getOrg(userId: string): Promise<Org | null> {
  const serviceClient = createServiceClient();
  const { data: member } = await serviceClient
    .from("org_members")
    .select("org_id, orgs(id, name, slug, plan)")
    .eq("user_id", userId)
    .maybeSingle();

  if (!member?.orgs) return null;
  return member.orgs as unknown as Org;
}

/**
 * Get the org config (engine settings).
 */
export async function getOrgConfig(orgId: string): Promise<OrgConfig | null> {
  const serviceClient = createServiceClient();
  const { data } = await serviceClient
    .from("org_config")
    .select("*")
    .eq("org_id", orgId)
    .maybeSingle();

  return data as unknown as OrgConfig | null;
}

/**
 * Require authentication. Throws if not logged in.
 * Returns user + org.
 */
export async function requireAuth(): Promise<{ user: User; org: Org }> {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  const org = await getOrg(user.id);
  if (!org) throw new Error("No organization found");

  return { user, org };
}

/**
 * Require authentication via cookie token.
 * Used by API routes that read the session cookie directly.
 */
export async function requireAuthFromToken(token: string): Promise<{ user: User; org: Org }> {
  const serviceClient = createServiceClient();
  const { data: { user: authUser } } = await serviceClient.auth.getUser(token);

  if (!authUser) throw new Error("Unauthorized");

  const user: User = { id: authUser.id, email: authUser.email!, name: authUser.user_metadata?.name };
  const org = await getOrg(user.id);
  if (!org) throw new Error("No organization found");

  return { user, org };
}
