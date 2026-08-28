"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BarChart3,
  Plus,
  Wallet as WalletIcon,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFinora } from "@/context/finora-context";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { setIsAddTransactionModalOpen } = useFinora();

  const isHome = pathname === "/dashboard";
  const isReports = pathname === "/reports";
  const isWallets = pathname === "/wallets";
  const isSettings = pathname === "/settings" || pathname === "/categories" || pathname === "/budgets";

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-sm">
      <nav className="flex items-center justify-between px-3 py-2 rounded-full bg-white/95 dark:bg-[#16161C]/95 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] shadow-[0_16px_36px_rgba(0,0,0,0.16)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.6)]">
        {/* Item 1: Beranda */}
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-1.5 rounded-full transition-all text-xs font-bold",
            isHome
              ? "bg-[#121215] text-white px-4 py-2.5 shadow-sm dark:bg-white dark:text-[#121215]"
              : "text-zinc-500 hover:text-foreground p-2.5"
          )}
        >
          <Home className="h-4 w-4 shrink-0" />
          {isHome && <span>Beranda</span>}
        </Link>

        {/* Item 2: Analitik */}
        <Link
          href="/reports"
          className={cn(
            "flex items-center gap-1.5 rounded-full transition-all text-xs font-bold",
            isReports
              ? "bg-[#121215] text-white px-4 py-2.5 shadow-sm dark:bg-white dark:text-[#121215]"
              : "text-zinc-500 hover:text-foreground p-2.5"
          )}
        >
          <BarChart3 className="h-4 w-4 shrink-0" />
          {isReports && <span>Analitik</span>}
        </Link>

        {/* Center Prominent Button: Add Transaction */}
        <button
          type="button"
          onClick={() => setIsAddTransactionModalOpen(true)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#6C4EF5] hover:bg-[#5638D6] text-white shadow-lg shadow-violet-500/40 active:scale-95 transition-all shrink-0 cursor-pointer"
          title="Tambah Transaksi"
        >
          <Plus className="h-5 w-5 stroke-[2.5]" />
        </button>

        {/* Item 3: Dompet */}
        <Link
          href="/wallets"
          className={cn(
            "flex items-center gap-1.5 rounded-full transition-all text-xs font-bold",
            isWallets
              ? "bg-[#121215] text-white px-4 py-2.5 shadow-sm dark:bg-white dark:text-[#121215]"
              : "text-zinc-500 hover:text-foreground p-2.5"
          )}
        >
          <WalletIcon className="h-4 w-4 shrink-0" />
          {isWallets && <span>Dompet</span>}
        </Link>

        {/* Item 4: Pengaturan */}
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-1.5 rounded-full transition-all text-xs font-bold",
            isSettings
              ? "bg-[#121215] text-white px-4 py-2.5 shadow-sm dark:bg-white dark:text-[#121215]"
              : "text-zinc-500 hover:text-foreground p-2.5"
          )}
        >
          <Settings className="h-4 w-4 shrink-0" />
          {isSettings && <span>Akun</span>}
        </Link>
      </nav>
    </div>
  );
}
