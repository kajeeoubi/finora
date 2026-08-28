"use client";

import React, { useState } from "react";
import { useFinora } from "@/context/finora-context";
import { formatIDR, INDONESIAN_MONTHS } from "@/lib/formatters";
import { HatchProgressBar } from "@/components/shared/HatchProgressBar";
import { CategoryIcon } from "@/components/shared/CategoryIcon";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ChevronDown, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export function BudgetsPage() {
  const {
    getBudgetCalculations,
    deleteBudget,
    setIsAddBudgetModalOpen,
  } = useFinora();

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const budgetCalcs = getBudgetCalculations(selectedMonth, selectedYear);

  const totalBudgeted = budgetCalcs.reduce(
    (sum, b) => sum + b.budget.amount,
    0
  );
  const totalSpent = budgetCalcs.reduce((sum, b) => sum + b.spent, 0);
  const overallPercentage =
    totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Full-Width Clean Heading */}
      <div className="space-y-1 animate-card-enter">
        <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          Anggaran Bulanan
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Pantau dan batasi pengeluaran per kategori secara real-time
        </p>
      </div>

      {/* Action Row */}
      <div className="flex items-center gap-2.5 animate-card-enter stagger-1">
        {/* Styled Month Selector Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex-1 h-11 inline-flex items-center justify-between px-4 rounded-2xl bg-white dark:bg-[#16161C] border border-black/[0.08] dark:border-white/10 text-xs font-bold text-zinc-900 dark:text-white shadow-sm hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-all cursor-pointer outline-none">
            <span>{INDONESIAN_MONTHS[selectedMonth - 1]} {selectedYear}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-60 overflow-y-auto p-1.5">
            {INDONESIAN_MONTHS.map((m, idx) => (
              <DropdownMenuItem
                key={idx + 1}
                onClick={() => setSelectedMonth(idx + 1)}
                className="flex items-center justify-between"
              >
                <span>{m} {selectedYear}</span>
                {selectedMonth === idx + 1 && <Check className="h-3.5 w-3.5 text-[#6C4EF5]" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          onClick={() => setIsAddBudgetModalOpen(true)}
          className="flex-1 h-11 rounded-2xl bg-[#6C4EF5] hover:bg-[#5638D6] text-white text-xs font-bold gap-1.5 shadow-md shadow-violet-500/25 cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Buat Anggaran</span>
        </Button>
      </div>

      {/* Overall Budget Status Card */}
      <div className="p-6 rounded-[32px] bg-[#121215] text-white border border-white/[0.08] shadow-xl space-y-4 animate-card-enter stagger-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Total Anggaran {INDONESIAN_MONTHS[selectedMonth - 1]}
          </span>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/10 text-zinc-200">
            {overallPercentage}% Terpakai
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <div className="space-y-0.5">
            <span className="text-3xl sm:text-4xl font-black text-white tabular-nums tracking-tight">
              {formatIDR(totalSpent)}
            </span>
            <span className="text-xs text-zinc-400 ml-2 font-semibold">
              dari {formatIDR(totalBudgeted)}
            </span>
          </div>
        </div>

        {/* Signature Hatch Bar */}
        <HatchProgressBar
          percentage={overallPercentage}
          status={
            overallPercentage >= 100
              ? "EXCEEDED"
              : overallPercentage >= 80
              ? "WARNING"
              : "NORMAL"
          }
          height="h-5"
        />

        <div className="flex justify-between text-xs text-zinc-400 font-medium">
          <span>{budgetCalcs.length} Kategori Dibatasi</span>
          <span>Sisa Alokasi: <strong className="text-white">{formatIDR(Math.max(0, totalBudgeted - totalSpent))}</strong></span>
        </div>
      </div>

      {/* Budget Items List */}
      <div className="space-y-3 animate-card-enter stagger-3">
        <h3 className="text-base font-bold text-zinc-900 dark:text-white">
          Rincian Anggaran Per Kategori
        </h3>

        {budgetCalcs.length === 0 ? (
          <div className="p-8 text-center rounded-[28px] bg-white dark:bg-[#16161C] border border-black/[0.06] dark:border-white/[0.08] space-y-3">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Belum ada anggaran untuk bulan {INDONESIAN_MONTHS[selectedMonth - 1]}.
            </p>
            <Button
              onClick={() => setIsAddBudgetModalOpen(true)}
              className="rounded-2xl bg-[#6C4EF5] hover:bg-[#5638D6] text-white text-xs font-bold px-4 py-2"
            >
              + Buat Anggaran Pertama
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {budgetCalcs.map((item) => {
              const { budget, category, spent, remaining, percentage, status } =
                item;

              return (
                <div
                  key={budget.id}
                  className="p-5 rounded-[28px] bg-white dark:bg-[#16161C] border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-3 relative group transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CategoryIcon
                        iconName={category.icon}
                        size="md"
                        bgColor={category.color ? `${category.color}18` : undefined}
                        iconColor={category.color || undefined}
                      />
                      <div>
                        <h4 className="font-extrabold text-base text-zinc-900 dark:text-white leading-tight">
                          {category.name}
                        </h4>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          Batas {formatIDR(budget.amount)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {status === "EXCEEDED" && (
                        <span className="px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-300 text-xs font-bold">
                          {percentage}% Melebihi
                        </span>
                      )}
                      {status === "WARNING" && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 text-xs font-bold">
                          {percentage}% Waspada
                        </span>
                      )}
                      {status === "NORMAL" && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                          {percentage}% Normal
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => deleteBudget(budget.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-400 hover:text-red-500 rounded-lg transition-opacity cursor-pointer"
                        title="Hapus Budget"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Figure row */}
                  <div className="flex justify-between items-baseline text-xs pt-1">
                    <span className="font-black text-zinc-900 dark:text-white tabular-nums text-lg">
                      {formatIDR(spent)}
                    </span>
                    <span className="text-zinc-500 dark:text-zinc-400">
                      Sisa <strong className="text-zinc-900 dark:text-white">{formatIDR(remaining)}</strong>
                    </span>
                  </div>

                  {/* Signature Hatch Progress Bar */}
                  <HatchProgressBar
                    percentage={percentage}
                    status={status}
                    height="h-4"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default BudgetsPage;
