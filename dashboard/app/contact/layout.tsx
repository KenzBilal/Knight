import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const h = await headers();
  // Prevent browser from caching the contact page (avoids stale form code)
  return (
    <div>
      {children}
    </div>
  );
}
