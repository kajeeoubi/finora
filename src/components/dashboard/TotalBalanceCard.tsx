"use client";

import React from "react";
import { ArrowUpRight, ArrowDownRight, Plus } from "lucide-react";
import { useFinora } from "@/context/finora-context";
import { formatIDR } from "@/lib/formatters";

export function TotalBalanceCard() {
  const {
    totalBalance,
    monthlyIncome,
    monthlyExpense,
    setIsTransferModalOpen,
    setIsAddTransactionModalOpen,
  } = useFinora();

  return (
    <div
      className="relative rounded-[32px] p-6 text-white shadow-2xl shadow-black/25 border border-white/[0.08] transition-all"
      style={{
        backgroundColor: "#121215",
        backgroundImage: `
          radial-gradient(circle at 100% 0%, rgba(108, 78, 245, 0.22) 0%, rgba(108, 78, 245, 0.05) 35%, transparent 60%),
          radial-gradient(circle at 0% 100%, rgba(182, 242, 61, 0.10) 0%, rgba(182, 242, 61, 0.02) 30%, transparent 55%)
        `,
      }}
    >
      {/* Top row */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-zinc-400 tracking-tight">
          Total Saldo
        </span>
      </div>

      {/* Balance Amount (Large bold typography) */}
      <div className="my-3">
        <h2 className="text-3xl sm:text-[40px] font-extrabold tracking-tight text-white tabular-nums leading-tight">
          {formatIDR(totalBalance)}
        </h2>
      </div>

      {/* Income & Expense Quick Badges using Arrow Icons only */}
      <div className="flex items-center gap-3 py-2 border-t border-white/[0.08] text-xs">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <ArrowUpRight className="h-3.5 w-3.5 text-[#4ADE80] stroke-[2.5]" />
          <span className="font-extrabold text-[#4ADE80] tabular-nums">
            {formatIDR(monthlyIncome)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20">
          <ArrowDownRight className="h-3.5 w-3.5 text-[#F87171] stroke-[2.5]" />
          <span className="font-extrabold text-[#F87171] tabular-nums">
            {formatIDR(monthlyExpense)}
          </span>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="mt-4 flex items-center gap-2.5">
        {/* Violet Pill Transfer Button */}
        <button
          type="button"
          onClick={() => setIsTransferModalOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 h-12 rounded-full bg-[#6C4EF5] hover:bg-[#5638D6] active:scale-[0.98] text-white font-bold text-sm shadow-lg shadow-violet-600/30 transition-all cursor-pointer"
        >
          <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
          <span>Transfer</span>
        </button>

        {/* Secondary Translucent Pill Button */}
        <button
          type="button"
          onClick={() => setIsAddTransactionModalOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 h-12 rounded-full bg-white/10 hover:bg-white/15 active:scale-[0.98] text-white font-semibold text-sm border border-white/10 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Catat Transaksi</span>
        </button>
      </div>
    </div>
  );
}
