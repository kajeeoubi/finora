"use client";

import React, { useState } from "react";
import { IncomeAnalysisCard } from "@/components/reports/IncomeAnalysisCard";
import { ExpenseCategoryDonut } from "@/components/reports/ExpenseCategoryDonut";
import { useFinora } from "@/context/finora-context";
import { formatIDR } from "@/lib/formatters";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, addDays } from "date-fns";
import { id as localeId } from "date-fns/locale";

type PeriodType = "Harian" | "Mingguan" | "Bulanan" | "Tahunan";

export default function ReportsPage() {
  const { monthlyIncome, monthlyExpense } = useFinora();
  const [period, setPeriod] = useState<PeriodType>("Bulanan");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Period multiplier simulations for quick metrics
  let incomeMultiplier = 1;
  let expenseMultiplier = 1;

  if (period === "Harian") {
    incomeMultiplier = 1 / 30;
    expenseMultiplier = 1 / 30;
  } else if (period === "Mingguan") {
    incomeMultiplier = 1 / 4;
    expenseMultiplier = 1 / 4;
  } else if (period === "Tahunan") {
    incomeMultiplier = 12;
    expenseMultiplier = 12;
  }

  const currentIncome = Math.round(monthlyIncome * incomeMultiplier);
  const currentExpense = Math.round(monthlyExpense * expenseMultiplier);
  const netSavings = currentIncome - currentExpense;
  const savingsRate = currentIncome > 0 ? Math.round((netSavings / currentIncome) * 100) : 0;

  const periods: PeriodType[] = ["Harian", "Mingguan", "Bulanan", "Tahunan"];

  // Compute period display label dynamically based on active period & chosen date
  const getPeriodLabel = () => {
    if (!selectedDate) {
      return "Pilih Periode";
    }

    if (period === "Harian") {
      return format(selectedDate, "d MMMM yyyy", { locale: localeId });
    }

    if (period === "Mingguan") {
      const endDate = addDays(selectedDate, 6);
      return `${format(selectedDate, "d MMM", { locale: localeId })} – ${format(endDate, "d MMM yyyy", { locale: localeId })}`;
    }

    if (period === "Bulanan") {
      return format(selectedDate, "MMMM yyyy", { locale: localeId });
    }

    if (period === "Tahunan") {
      return `Tahun ${format(selectedDate, "yyyy", { locale: localeId })}`;
    }

    return "Pilih Periode";
  };

  const periodLabelForCards = selectedDate ? getPeriodLabel() : period;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="animate-card-enter space-y-1">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Analitik & Laporan
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Visualisasi data arus kas masuk dan keluar
        </p>
      </div>

      {/* Unified Global Filter Bar with Period Pills + shadcn Date Picker Popover */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2 rounded-[24px] bg-white dark:bg-[#16161C] border border-black/[0.06] dark:border-white/[0.08] shadow-sm animate-card-enter stagger-1 transition-colors">
        {/* Period Selector Pills */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-[#F5F5F7] dark:bg-[#202028] overflow-x-auto">
          {periods.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setPeriod(p);
              }}
              className={cn(
                "flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                period === p
                  ? "bg-white dark:bg-[#121216] text-[#6C4EF5] dark:text-violet-400 shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              )}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Date Picker (shadcn UI Popover + Calendar) */}
        <div className="flex items-center gap-1.5">
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  "h-10 px-3.5 rounded-xl border flex items-center justify-between gap-2 text-xs font-bold transition-all cursor-pointer outline-none w-full sm:w-auto",
                  selectedDate
                    ? "bg-[#6C4EF5] text-white border-[#6C4EF5] shadow-md shadow-violet-500/25"
                    : "bg-[#F5F5F7] dark:bg-[#202028] border-black/[0.04] dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                )}
              >
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  <span>{getPeriodLabel()}</span>
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-auto p-3">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                  setIsCalendarOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>

          {selectedDate && (
            <button
              type="button"
              onClick={() => setSelectedDate(undefined)}
              className="h-10 w-10 rounded-xl bg-[#F5F5F7] dark:bg-[#202028] border border-black/[0.04] dark:border-white/10 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
              title="Reset Tanggal"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Cashflow Pill Summary */}
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5 animate-card-enter stagger-2">
        <div className="p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-[#16161C] border border-black/[0.06] dark:border-white/[0.08] text-center transition-colors shadow-sm">
          <span className="text-[9px] sm:text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
            Pemasukan
          </span>
          <span className="text-xs sm:text-sm font-black text-[#22C55E] dark:text-emerald-400 tabular-nums">
            {formatIDR(currentIncome)}
          </span>
        </div>

        <div className="p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-[#16161C] border border-black/[0.06] dark:border-white/[0.08] text-center transition-colors shadow-sm">
          <span className="text-[9px] sm:text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
            Pengeluaran
          </span>
          <span className="text-xs sm:text-sm font-black text-[#EF4444] dark:text-rose-400 tabular-nums">
            {formatIDR(currentExpense)}
          </span>
        </div>

        <div className="p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-[#16161C] border border-black/[0.06] dark:border-white/[0.08] text-center transition-colors shadow-sm">
          <span className="text-[9px] sm:text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
            Sisa Tabungan
          </span>
          <span className="text-xs sm:text-sm font-black text-violet-600 dark:text-violet-400 tabular-nums">
            {formatIDR(netSavings)}
          </span>
        </div>
      </div>

      {/* Screen 2 Card 1: Income Analysis with Hatch Bar Chart (Single Column) */}
      <div className="animate-card-enter stagger-3">
        <IncomeAnalysisCard period={periodLabelForCards} />
      </div>

      {/* Screen 2 Card 2: Expense Category with Donut / Gauge Chart (Single Column) */}
      <div className="animate-card-enter stagger-4">
        <ExpenseCategoryDonut period={periodLabelForCards} />
      </div>
    </div>
  );
}
