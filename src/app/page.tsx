"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFinora } from "@/context/finora-context";

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useFinora();

  useEffect(() => {
    if (isHydrated) {
      if (isAuthenticated) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    }
  }, [isHydrated, isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#0B0B0E] flex items-center justify-center">
      <div className="h-10 w-10 rounded-2xl bg-[#6C4EF5] animate-pulse flex items-center justify-center text-white font-black text-lg">
        F
      </div>
    </div>
  );
}
