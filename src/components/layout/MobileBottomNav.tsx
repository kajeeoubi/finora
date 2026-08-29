"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  BarChart3,
  Target,
  Plus,
  Wallet as WalletIcon,
  Settings,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFinora } from "@/context/finora-context";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { setIsAddTransactionModalOpen } = useFinora();

  const isHome = pathname === "/dashboard";
  const isReports = pathname === "/reports";
  const isPlanning = pathname === "/planning" || pathname === "/budgets";
  const isReminders = pathname === "/reminders";
  const isWallets = pathname === "/wallets";
  const isSettings = pathname === "/settings";

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1.5rem)] max-w-md">
      <nav className="flex items-center justify-between px-3 py-2 rounded-full bg-white/95 dark:bg-[#16161C]/95 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] shadow-[0_16px_36px_rgba(0,0,0,0.16)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.6)]">
        {/* Item 1: Beranda */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/dashboard"
              className={cn(
                "relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full transition-colors shrink-0",
                isHome
                  ? "text-white dark:text-[#121215]"
                  : "text-zinc-500 hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
              )}
            >
              {isHome && (
                <motion.div
                  layoutId="activeMobileNavIndicator"
                  className="absolute inset-0 rounded-full bg-[#121215] dark:bg-white shadow-sm"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <Home className="relative z-10 h-4 w-4" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="top">Beranda</TooltipContent>
        </Tooltip>

        {/* Item 2: Analitik */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/reports"
              className={cn(
                "relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full transition-colors shrink-0",
                isReports
                  ? "text-white dark:text-[#121215]"
                  : "text-zinc-500 hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
              )}
            >
              {isReports && (
                <motion.div
                  layoutId="activeMobileNavIndicator"
                  className="absolute inset-0 rounded-full bg-[#121215] dark:bg-white shadow-sm"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <BarChart3 className="relative z-10 h-4 w-4" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="top">Analitik</TooltipContent>
        </Tooltip>

        {/* Item 3: Planning */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/planning"
              className={cn(
                "relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full transition-colors shrink-0",
                isPlanning
                  ? "text-white dark:text-[#121215]"
                  : "text-zinc-500 hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
              )}
            >
              {isPlanning && (
                <motion.div
                  layoutId="activeMobileNavIndicator"
                  className="absolute inset-0 rounded-full bg-[#121215] dark:bg-white shadow-sm"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <Target className="relative z-10 h-4 w-4" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="top">Planning</TooltipContent>
        </Tooltip>

        {/* Center Prominent Button: Add Transaction */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => setIsAddTransactionModalOpen(true)}
              className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-[#6C4EF5] hover:bg-[#5638D6] text-white shadow-lg shadow-violet-500/40 active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <Plus className="h-5 w-5 stroke-[2.5]" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">Tambah Transaksi</TooltipContent>
        </Tooltip>

        {/* Item 4: Tagihan */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/reminders"
              className={cn(
                "relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full transition-colors shrink-0",
                isReminders
                  ? "text-white dark:text-[#121215]"
                  : "text-zinc-500 hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
              )}
            >
              {isReminders && (
                <motion.div
                  layoutId="activeMobileNavIndicator"
                  className="absolute inset-0 rounded-full bg-[#121215] dark:bg-white shadow-sm"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <Bell className="relative z-10 h-4 w-4" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="top">Tagihan</TooltipContent>
        </Tooltip>

        {/* Item 5: Dompet */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/wallets"
              className={cn(
                "relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full transition-colors shrink-0",
                isWallets
                  ? "text-white dark:text-[#121215]"
                  : "text-zinc-500 hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
              )}
            >
              {isWallets && (
                <motion.div
                  layoutId="activeMobileNavIndicator"
                  className="absolute inset-0 rounded-full bg-[#121215] dark:bg-white shadow-sm"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <WalletIcon className="relative z-10 h-4 w-4" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="top">Dompet</TooltipContent>
        </Tooltip>

        {/* Item 6: Pengaturan / Akun */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/settings"
              className={cn(
                "relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full transition-colors shrink-0",
                isSettings
                  ? "text-white dark:text-[#121215]"
                  : "text-zinc-500 hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
              )}
            >
              {isSettings && (
                <motion.div
                  layoutId="activeMobileNavIndicator"
                  className="absolute inset-0 rounded-full bg-[#121215] dark:bg-white shadow-sm"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <Settings className="relative z-10 h-4 w-4" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="top">Pengaturan</TooltipContent>
        </Tooltip>
      </nav>
    </div>
  );
}
