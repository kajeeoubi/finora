"use client";

import React from "react";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { TransferDrawer } from "@/components/drawers/TransferDrawer";
import { AddTransactionDrawer } from "@/components/drawers/AddTransactionDrawer";
import { AddWalletDrawer } from "@/components/drawers/AddWalletDrawer";
import { AddBudgetDrawer } from "@/components/drawers/AddBudgetDrawer";
import { AddCategoryDrawer } from "@/components/drawers/AddCategoryDrawer";
import { AddWishlistDrawer } from "@/components/drawers/AddWishlistDrawer";
import { AddReminderDrawer } from "@/components/drawers/AddReminderDrawer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F5F5F7] text-foreground dark:bg-[#0B0B0E] transition-colors flex justify-center">
      {/* Centered single-column layout with expansive desktop max-width */}
      <div className="w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl min-h-screen flex flex-col relative pb-32 pt-6 sm:pt-8 md:pt-10 px-4 sm:px-6 md:px-8">
        <main className="flex-1 w-full">
          {children}
        </main>

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
    </div>
  );
}
