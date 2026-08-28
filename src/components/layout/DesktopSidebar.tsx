"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BarChart3,
  ReceiptText,
  Wallet as WalletIcon,
  PieChart,
  Tags,
  Settings,
  Plus,
  ArrowRightLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFinora } from "@/context/finora-context";
import { formatIDR } from "@/lib/formatters";

export function DesktopSidebar() {
  const pathname = usePathname();
  const {
    totalBalance,
    setIsAddTransactionModalOpen,
    setIsTransferModalOpen,
  } = useFinora();

  const links = [
    { label: "Beranda", href: "/dashboard", icon: Home },
    { label: "Analitik & Laporan", href: "/reports", icon: BarChart3 },
    { label: "Riwayat Transaksi", href: "/transactions", icon: ReceiptText },
    { label: "Dompet & Rekening", href: "/wallets", icon: WalletIcon },
    { label: "Anggaran / Budget", href: "/budgets", icon: PieChart },
    { label: "Kategori", href: "/categories", icon: Tags },
    { label: "Pengaturan", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 bg-white dark:bg-[#121216] border-r border-black/[0.06] dark:border-white/[0.08] min-h-screen p-5 justify-between transition-colors">
      <div className="space-y-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-2">
          <div className="h-10 w-10 rounded-2xl bg-[#6C4EF5] flex items-center justify-center text-white font-black text-xl shadow-md shadow-violet-500/30">
            F
          </div>
          <div>
            <span className="font-extrabold text-lg text-zinc-900 dark:text-white tracking-tight">
              Finora
            </span>
            <span className="text-[10px] block font-bold text-[#6C4EF5] tracking-widest uppercase">
              Personal Finance
            </span>
          </div>
        </div>

        {/* Total Balance Card in Sidebar */}
        <div className="p-4 rounded-2xl bg-[#F5F5F7] dark:bg-[#1C1C24] border border-black/[0.04] dark:border-white/[0.06] space-y-1.5 transition-colors">
          <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
            Total Saldo Aktif
          </span>
          <p className="text-xl font-black text-zinc-900 dark:text-white tabular-nums tracking-tight">
            {formatIDR(totalBalance)}
          </p>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsTransferModalOpen(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-white dark:bg-[#282834] text-xs font-bold text-zinc-800 dark:text-zinc-100 border border-black/[0.06] dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-[#323242] shadow-sm transition-all cursor-pointer"
            >
              <ArrowRightLeft className="h-3.5 w-3.5 text-[#6C4EF5]" />
              <span>Transfer</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAddTransactionModalOpen(true)}
              className="flex-1 flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl bg-[#6C4EF5] hover:bg-[#5638D6] text-xs font-bold text-white shadow-md shadow-violet-500/25 transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah</span>
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                  isActive
                    ? "bg-[#121215] text-white shadow-sm dark:bg-white dark:text-[#121215]"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-black/[0.04] dark:border-white/[0.06] text-xs text-zinc-500 dark:text-zinc-400 space-y-0.5">
        <p className="font-bold text-zinc-800 dark:text-zinc-200">Finora v2.0 MVP</p>
        <p className="text-[11px]">Sesuai PRD & Design System.</p>
      </div>
    </aside>
  );
}
