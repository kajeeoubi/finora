"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFinora } from "@/context/finora-context";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { TransferDrawer } from "@/components/drawers/TransferDrawer";
import { AddTransactionDrawer } from "@/components/drawers/AddTransactionDrawer";
import { AddWalletDrawer } from "@/components/drawers/AddWalletDrawer";
import { AddBudgetDrawer } from "@/components/drawers/AddBudgetDrawer";
import { AddCategoryDrawer } from "@/components/drawers/AddCategoryDrawer";
import { AddWishlistDrawer } from "@/components/drawers/AddWishlistDrawer";
import { AddReminderDrawer } from "@/components/drawers/AddReminderDrawer";
import { PayReminderDrawer } from "@/components/drawers/PayReminderDrawer";
import { AddSavingsDrawer } from "@/components/drawers/AddSavingsDrawer";
import { SetCategoryLimitDrawer } from "@/components/drawers/SetCategoryLimitDrawer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useFinora();

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isHydrated, isAuthenticated, router]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#0B0B0E] flex items-center justify-center">
        <div className="h-10 w-10 rounded-2xl bg-[#6C4EF5] animate-pulse flex items-center justify-center text-white font-black text-lg">
          F
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-foreground dark:bg-[#0B0B0E] transition-colors flex justify-center">
      {/* Centered single-column layout with expansive desktop max-width */}
      <div className="w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl min-h-screen flex flex-col relative pb-32 pt-6 sm:pt-8 md:pt-10 px-4 sm:px-6 md:px-8">
        <main className="flex-1 w-full">{children}</main>

        {/* Floating Bottom Navigation */}
        <MobileBottomNav />
      </div>

      {/* Global Bottom Sheet Drawers */}
      <TransferDrawer />
      <AddTransactionDrawer />
      <AddWalletDrawer />
      <AddBudgetDrawer />
      <AddCategoryDrawer />
      <AddWishlistDrawer />
      <AddReminderDrawer />
      <PayReminderDrawer />
      <AddSavingsDrawer />
      <SetCategoryLimitDrawer />
    </div>
  );
}
