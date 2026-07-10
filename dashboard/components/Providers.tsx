"use client";

import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#1a1a1a",
            border: "1px solid #2a2a2a",
            color: "#e5e5e5",
            fontSize: "14px",
          },
          classNames: {
            success: "!bg-green-500/10 !border-green-500/20 !text-green-400",
            error: "!bg-red-500/10 !border-red-500/20 !text-red-400",
            warning: "!bg-yellow-500/10 !border-yellow-500/20 !text-yellow-400",
            info: "!bg-blue-500/10 !border-blue-500/20 !text-blue-400",
          },
        }}
        closeButton
        richColors
        duration={3000}
      />
    </>
  );
}
