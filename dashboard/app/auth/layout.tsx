"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { AuthHero } from "@/components/AuthHero";
import { useState, useEffect, useRef } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLogin = pathname === "/auth/login";

  const formW = 480;
  const slide: [number, number, number, number] = [0.32, 0.72, 0, 1];
  const SLIDE_MS = 550;

  // Delay content swap so text doesn't change before white panel hides
  const [displayedChildren, setDisplayedChildren] = useState(children);
  const [contentVisible, setContentVisible] = useState(true);
  const prevPathname = useRef(pathname);
  const swapTimer = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (pathname !== prevPathname.current) {
      const slidingOut = prevPathname.current === "/auth/login";

      // Fade out immediately
      setContentVisible(false);

      // Sliding out (login→signup): longer delay so content appears after panel is hidden
      // Sliding in (signup→login): shorter delay so content appears as panel enters
      const delay = slidingOut ? SLIDE_MS * 0.7 : SLIDE_MS * 0.35;

      swapTimer.current = setTimeout(() => {
        setDisplayedChildren(children);
        requestAnimationFrame(() => setContentVisible(true));
      }, delay);

      prevPathname.current = pathname;
      return () => { if (swapTimer.current) clearTimeout(swapTimer.current); };
    } else {
      setDisplayedChildren(children);
    }
  }, [pathname, children]);

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
        <motion.div
          className="flex-1 flex flex-col"
          animate={{ opacity: contentVisible ? 1 : 0 }}
          transition={{ duration: 0.15 }}
        >
          {displayedChildren}
        </motion.div>
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
