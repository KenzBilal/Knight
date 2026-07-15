"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { AuthHero } from "@/components/AuthHero";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLogin = pathname === "/auth/login";

  const formW = 480;
  const slide = [0.32, 0.72, 0, 1];

  return (
    <div className="h-screen w-full overflow-hidden bg-white relative">
      {/* ── Mobile: full-width form, no sphere ── */}
      <div className="md:hidden h-full w-full bg-white relative z-10">
        {children}
      </div>

      {/* ── Desktop: form panel (white) — behind sphere ── */}
      <motion.div
        className="hidden md:flex absolute top-0 bottom-0 right-0 z-0 flex-col bg-white"
        initial={false}
        animate={{
          width: formW,
          x: isLogin ? 0 : `calc(-100vw + ${formW}px)`,
        }}
        transition={{ duration: 0.55, ease: slide }}
      >
        {children}
      </motion.div>

      {/* ── Desktop: sphere panel (black) — in front ── */}
      <motion.div
        className="hidden md:block absolute top-0 bottom-0 left-0 z-10"
        initial={false}
        animate={{
          x: isLogin ? 0 : formW,
          width: `calc(100vw - ${formW}px)`,
        }}
        transition={{ duration: 0.55, ease: slide }}
      >
        <AuthHero mode={isLogin ? "login" : "signup"} />
      </motion.div>
    </div>
  );
}
