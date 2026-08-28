"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useFinora } from "@/context/finora-context";
import { formatIDR } from "@/lib/formatters";
import { HatchProgressBar } from "@/components/shared/HatchProgressBar";
import { ArrowUpRight, ChevronRight, Check, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function BudgetOverviewCard() {
  const { getBudgetCalculations, getTopBudgetNearLimit } = useFinora();
  const now = new Date();
  const budgetCalcs = getBudgetCalculations(now.getMonth() + 1, now.getFullYear());
  const topBudget = getTopBudgetNearLimit();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  if (budgetCalcs.length === 0) {
    return (
      <div className="rounded-[28px] border border-black/[0.04] bg-white p-5 shadow-sm dark:bg-[#16161C] dark:border-white/[0.08]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Batas Pengeluaran
          </span>
          <Link
            href="/budgets"
            className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-0.5"
          >
            Buat Anggaran <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Belum ada anggaran bulanan yang diatur.
        </p>
      </div>
    );
  }

  // Find active budget by selected category or default to topBudget or first
  const activeBudget =
    budgetCalcs.find((b) => b.category.id === selectedCategoryId) ||
    topBudget ||
    budgetCalcs[0];

  const { category, spent, budget, percentage, status, remaining } = activeBudget;

  return (
    <div className="rounded-[28px] border border-black/[0.04] bg-white p-5 shadow-sm dark:bg-[#16161C] dark:border-white/[0.08] space-y-3.5 transition-colors">
      {/* Header Row: Title on Left (Batas Pengeluaran CategoryName without ()), Funnel Filter Icon on Right */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-foreground">
          Batas Pengeluaran {category.name}
        </span>

        {/* Funnel Filter Icon Button */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="h-8 w-8 rounded-full flex items-center justify-center bg-[#F5F5F7] dark:bg-[#202028] text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all cursor-pointer outline-none shadow-sm"
            title="Filter Kategori"
          >
            <Filter className="h-3.5 w-3.5 text-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 p-1.5">
            <DropdownMenuLabel>Pilih Kategori</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {budgetCalcs.map((b) => {
              const isSelected = b.category.id === category.id;
              return (
                <DropdownMenuItem
                  key={b.category.id}
                  onClick={() => setSelectedCategoryId(b.category.id)}
                  className="flex items-center justify-between"
                >
                  <span>{b.category.name}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-[#6C4EF5]" />}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Figures Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl sm:text-3xl font-black text-foreground tabular-nums tracking-tight">
            {formatIDR(spent)}
          </h3>
          <span className="text-xs text-muted-foreground font-semibold">
            dari {formatIDR(budget.amount)}
          </span>
        </div>

        {/* Badge indicator */}
        <div className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#15803D] dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-bold tabular-nums">
          <ArrowUpRight className="h-3.5 w-3.5 stroke-[2.5]" />
          <span>{percentage}%</span>
        </div>
      </div>

      {/* Signature Hatch Progress Bar */}
      <HatchProgressBar
        percentage={percentage}
        status={status}
        height="h-5"
        className="shadow-inner"
      />

      <div className="flex justify-between items-center text-xs text-muted-foreground font-medium pt-0.5">
        <span>Terpakai <strong className="text-foreground">{percentage}%</strong></span>
        <span>Sisa <strong className="text-foreground">{formatIDR(remaining)}</strong></span>
      </div>
    </div>
  );
}
