"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useFinora } from "@/context/finora-context";
import { formatIDR } from "@/lib/formatters";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface IncomeAnalysisCardProps {
  period?: string;
  periodType?: "Mingguan" | "Bulanan" | "Tahunan";
  selectedMonth?: number; // 0 - 11
  selectedYear?: number;
  weekOffset?: number;
}

interface BarItem {
  key: string;
  label: string;
  fullName: string;
  income: number;
}

export function IncomeAnalysisCard({
  period = "Bulanan",
  periodType = "Bulanan",
  selectedMonth = new Date().getMonth(),
  selectedYear = new Date().getFullYear(),
  weekOffset = 0,
}: IncomeAnalysisCardProps) {
  const { transactions } = useFinora();
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [isAnimated, setIsAnimated] = useState(false);

  // Generate chart data based on active periodType and actual transactions
  const chartData = useMemo<BarItem[]>(() => {
    const monthShortNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ];

    if (periodType === "Mingguan") {
      // 7 days of the week: Senin - Minggu
      const dayNames = [
        { label: "Sen", fullName: "Senin" },
        { label: "Sel", fullName: "Selasa" },
        { label: "Rab", fullName: "Rabu" },
        { label: "Kam", fullName: "Kamis" },
        { label: "Jum", fullName: "Jumat" },
        { label: "Sab", fullName: "Sabtu" },
        { label: "Min", fullName: "Minggu" },
      ];

      const nowDate = new Date();
      const startOfWeek = new Date(nowDate);
      const day = nowDate.getDay();
      const diff =
        nowDate.getDate() - day + (day === 0 ? -6 : 1) + weekOffset * 7;
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);

      return dayNames.map((d, i) => {
        const targetDate = new Date(startOfWeek);
        targetDate.setDate(startOfWeek.getDate() + i);

        const y = targetDate.getFullYear();
        const m = targetDate.getMonth();
        const dateNum = targetDate.getDate();

        const dayTxs = transactions.filter((tx) => {
          if (tx.type !== "INCOME") return false;
          const dt = new Date(tx.transactionAt);
          return (
            dt.getFullYear() === y &&
            dt.getMonth() === m &&
            dt.getDate() === dateNum
          );
        });

        const income = dayTxs.reduce((sum, t) => sum + t.amount, 0);

        return {
          key: `day-${i}-${y}-${m}-${dateNum}`,
          label: d.label,
          fullName: `${d.fullName}, ${dateNum} ${monthShortNames[m]}`,
          income,
        };
      });
    }

    if (periodType === "Tahunan") {
      // 12 months: Januari - Desember
      const monthFullNames = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
      ];

      const currentRealMonth = new Date().getMonth();
      const currentRealYear = new Date().getFullYear();

      return monthShortNames.map((shortName, mIdx) => {
        const isFuture =
          selectedYear > currentRealYear ||
          (selectedYear === currentRealYear && mIdx > currentRealMonth);

        if (isFuture) {
          return {
            key: `month-${mIdx}`,
            label: shortName,
            fullName: monthFullNames[mIdx],
            income: 0,
          };
        }

        // Sum actual transactions for that month & year
        const monthTxs = transactions.filter((tx) => {
          if (tx.type !== "INCOME") return false;
          const dt = new Date(tx.transactionAt);
          return dt.getFullYear() === selectedYear && dt.getMonth() === mIdx;
        });

        const income = monthTxs.reduce((sum, t) => sum + t.amount, 0);

        return {
          key: `month-${mIdx}`,
          label: shortName,
          fullName: monthFullNames[mIdx],
          income,
        };
      });
    }

    // Default: Bulanan (4 Minggu dalam 1 Bulan)
    const weekLabels = [
      { label: "Mgg 1", fullName: "Minggu 1 (Tgl 1 - 7)" },
      { label: "Mgg 2", fullName: "Minggu 2 (Tgl 8 - 14)" },
      { label: "Mgg 3", fullName: "Minggu 3 (Tgl 15 - 21)" },
      { label: "Mgg 4", fullName: "Minggu 4 (Tgl 22 - Selesai)" },
    ];

    // Filter transactions for selected month & year
    const monthIncomeTxs = transactions.filter((tx) => {
      if (tx.type !== "INCOME") return false;
      const dt = new Date(tx.transactionAt);
      return dt.getFullYear() === selectedYear && dt.getMonth() === selectedMonth;
    });

    return weekLabels.map((w, wIdx) => {
      const weekTxs = monthIncomeTxs.filter((tx) => {
        const date = new Date(tx.transactionAt).getDate();
        if (wIdx === 0) return date >= 1 && date <= 7;
        if (wIdx === 1) return date >= 8 && date <= 14;
        if (wIdx === 2) return date >= 15 && date <= 21;
        return date >= 22;
      });

      const income = weekTxs.reduce((sum, t) => sum + t.amount, 0);

      return {
        key: `week-${wIdx}`,
        label: w.label,
        fullName: w.fullName,
        income,
      };
    });
  }, [periodType, selectedMonth, selectedYear, weekOffset, transactions]);

  // Set default active index when chart data changes
  useEffect(() => {
    if (periodType === "Tahunan") {
      const currentRealMonth = new Date().getMonth();
      const currentRealYear = new Date().getFullYear();
      if (selectedYear === currentRealYear) {
        setActiveIdx(currentRealMonth);
      } else {
        const maxIdx = chartData.reduce(
          (maxI, item, i, arr) => (item.income > arr[maxI].income ? i : maxI),
          0
        );
        setActiveIdx(maxIdx);
      }
    } else if (periodType === "Mingguan") {
      if (weekOffset === 0) {
        const nowDate = new Date();
        const jsDay = nowDate.getDay();
        const dayIdx = jsDay === 0 ? 6 : jsDay - 1;
        setActiveIdx(dayIdx);
      } else {
        const maxIdx = chartData.reduce(
          (maxI, item, i, arr) => (item.income > arr[maxI].income ? i : maxI),
          0
        );
        setActiveIdx(maxIdx);
      }
    } else {
      const maxIdx = chartData.reduce(
        (maxI, item, i, arr) => (item.income > arr[maxI].income ? i : maxI),
        0
      );
      setActiveIdx(maxIdx);
    }

    setIsAnimated(false);
    const timer = setTimeout(() => setIsAnimated(true), 60);
    return () => clearTimeout(timer);
  }, [periodType, selectedMonth, selectedYear, weekOffset, chartData]);

  const totalPeriodIncome = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.income, 0);
  }, [chartData]);

  const maxIncome = useMemo(() => {
    const highest = Math.max(...chartData.map((d) => d.income), 0);
    return highest > 0 ? highest : 100000;
  }, [chartData]);

  return (
    <div className="rounded-[28px] border border-black/[0.04] bg-white p-5 shadow-sm dark:bg-[#16161C] dark:border-white/[0.08] space-y-3.5 transition-colors">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm sm:text-base font-bold text-foreground">
          Analisis Pemasukan
        </h3>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/10 text-muted-foreground">
          {period}
        </span>
      </div>

      {/* Figures Row & Badge */}
      <div className="flex items-center gap-2.5">
        <span className="text-2xl sm:text-3xl font-black text-foreground tabular-nums tracking-tight">
          {formatIDR(totalPeriodIncome)}
        </span>
        <div className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] dark:bg-emerald-950/60 dark:text-emerald-300 text-[11px] font-bold tabular-nums">
          <ArrowUpRight className="h-3 w-3 stroke-[2.5]" />
          <span>Arus Positif</span>
        </div>
      </div>

      {/* Bar Chart Area */}
      <div className="pt-14 pb-1">
        <div className="relative h-40 flex items-end justify-between gap-1.5 sm:gap-2 px-1">
          {chartData.map((item, idx) => {
            const isActive = idx === activeIdx;
            const targetHeight =
              maxIncome > 0 ? Math.round((item.income / maxIncome) * 100) : 0;
            const currentHeight = isAnimated ? Math.max(targetHeight, 6) : 0;

            // Bar max width adjusts based on count (12 bars for yearly vs 4 for monthly)
            const maxWidthClass =
              periodType === "Tahunan"
                ? "max-w-[22px] sm:max-w-[26px]"
                : periodType === "Mingguan"
                ? "max-w-[34px] sm:max-w-[40px]"
                : "max-w-[48px] sm:max-w-[56px]";

            return (
              <div
                key={item.key}
                onClick={() => setActiveIdx(idx)}
                className="flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-pointer relative"
              >
                {/* Floating Tooltip Bubble */}
                {isActive && item.income > 0 && (
                  <div
                    key={`tooltip-${item.key}`}
                    className="absolute z-20 flex flex-col items-center pointer-events-none animate-in fade-in slide-in-from-bottom-3 zoom-in-95 duration-300"
                    style={{
                      bottom: `calc(${currentHeight}% + 18px)`,
                    }}
                  >
                    <div className="rounded-2xl bg-[#121215] text-white px-3 py-1.5 shadow-2xl text-center whitespace-nowrap border border-white/10">
                      <span className="text-[8px] block uppercase font-bold tracking-wider text-zinc-400">
                        {item.fullName}
                      </span>
                      <span className="text-[11px] font-black tabular-nums text-white">
                        {formatIDR(item.income)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Pillar Bar */}
                <div
                  className={cn(
                    "w-full h-full flex items-end relative",
                    maxWidthClass
                  )}
                >
                  <div
                    key={item.key + (isActive ? "-active" : "-inactive")}
                    className={cn(
                      "w-full rounded-2xl relative transition-all duration-700",
                      isActive
                        ? "bg-[#6C4EF5] shadow-lg shadow-violet-500/30 animate-bar-shoot-up"
                        : item.income === 0
                        ? "bg-black/[0.04] dark:bg-white/5 opacity-40"
                        : "bg-hatch-pattern dark:bg-hatch-pattern-dark opacity-80 group-hover:opacity-100"
                    )}
                    style={{
                      height: `${currentHeight}%`,
                      transitionDelay: !isActive ? `${idx * 40}ms` : undefined,
                    }}
                  >
                    {/* Active Top Tip Dot */}
                    {isActive && item.income > 0 && (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 h-3.5 w-3.5 rounded-full bg-[#121215] border-2 border-white shadow-md z-10 animate-in zoom-in-50 duration-300" />
                    )}
                  </div>
                </div>

                {/* X-Axis Label */}
                <span
                  className={cn(
                    "transition-colors",
                    periodType === "Tahunan"
                      ? "text-[9px] sm:text-[10px]"
                      : "text-[11px]",
                    isActive
                      ? "text-violet-600 dark:text-violet-400 font-extrabold"
                      : "text-muted-foreground font-semibold"
                  )}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
