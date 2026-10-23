import { createServiceClient } from "@/lib/supabase";

/** Return an authenticated platform administrator, if the token belongs to one. */
export async function getPlatformAdmin(token: string): Promise<{ id: string; email: string } | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;

  const user = data.user;
  const allowedIds = (process.env.ADMIN_USER_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  const isAdmin = user.app_metadata?.platform_admin === true
    || user.app_metadata?.role === "platform_admin"
    || allowedIds.includes(user.id);
  return isAdmin ? { id: user.id, email: user.email || "" } : null;
}
