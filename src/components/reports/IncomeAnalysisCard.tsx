"use client";

import React, { useState, useEffect } from "react";
import { useFinora } from "@/context/finora-context";
import { formatIDR } from "@/lib/formatters";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface IncomeAnalysisCardProps {
  period?: string;
}

export function IncomeAnalysisCard({ period = "Bulanan" }: IncomeAnalysisCardProps) {
  const { getMonthlyTrends } = useFinora();
  const trends = getMonthlyTrends();
  const [activeMonthIdx, setActiveMonthIdx] = useState(4); // Default to latest (Agustus)
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    setIsAnimated(false);
    const timer = setTimeout(() => setIsAnimated(true), 60);
    return () => clearTimeout(timer);
  }, [period]);

  const activeData = trends[activeMonthIdx] || trends[trends.length - 1];
  const maxIncome = Math.max(...trends.map((t) => t.income), 7000000);

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
          {formatIDR(activeData.income)}
        </span>
        <div className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] dark:bg-emerald-950/60 dark:text-emerald-300 text-[11px] font-bold tabular-nums">
          <ArrowUpRight className="h-3 w-3 stroke-[2.5]" />
          <span>10%</span>
        </div>
      </div>

      {/* Bar Chart with Signature Diagonal Hatch Texture & Dynamic Growing Animation */}
      <div className="pt-14 pb-1">
        <div className="relative h-40 flex items-end justify-between gap-2.5 px-1">
          {trends.map((item, idx) => {
            const isActive = idx === activeMonthIdx;
            const targetHeight = Math.round((item.income / maxIncome) * 100);
            const currentHeight = isAnimated ? targetHeight : 0;

            return (
              <div
                key={item.monthName}
                onClick={() => setActiveMonthIdx(idx)}
                className="flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-pointer relative"
              >
                {/* Floating Tooltip Bubble with ample space above the top dot */}
                {isActive && (
                  <div
                    key={`tooltip-${item.monthName}`}
                    className="absolute z-20 flex flex-col items-center pointer-events-none animate-in fade-in slide-in-from-bottom-3 zoom-in-95 duration-300"
                    style={{
                      bottom: `calc(${currentHeight}% + 18px)`,
                    }}
                  >
                    <div className="rounded-2xl bg-[#121215] text-white px-3 py-1.5 shadow-2xl text-center whitespace-nowrap border border-white/10">
                      <span className="text-[8px] block uppercase font-bold tracking-wider text-zinc-400">
                        Total Pemasukan
                      </span>
                      <span className="text-[11px] font-black tabular-nums text-white">
                        {formatIDR(item.income)}
                      </span>
                    </div>
                  </div>
                )}

                {/* The Pillar Bar */}
                <div className="w-full max-w-[44px] h-full flex items-end relative">
                  <div
                    key={item.monthName + (isActive ? "-active" : "-inactive")}
                    className={cn(
                      "w-full rounded-2xl relative",
                      isActive
                        ? "bg-[#6C4EF5] shadow-lg shadow-violet-500/30 animate-bar-shoot-up"
                        : "bg-hatch-pattern dark:bg-hatch-pattern-dark opacity-80 group-hover:opacity-100 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    )}
                    style={{
                      height: `${currentHeight}%`,
                      transitionDelay: !isActive ? `${idx * 70}ms` : undefined,
                    }}
                  >
                    {/* Dot placed at the very top tip of the pillar */}
                    {isActive && (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 h-3.5 w-3.5 rounded-full bg-[#121215] border-2 border-white shadow-md z-10 animate-in zoom-in-50 duration-300" />
                    )}
                  </div>
                </div>

                {/* Month Name */}
                <span
                  className={cn(
                    "text-[11px] transition-colors",
                    isActive
                      ? "text-violet-600 dark:text-violet-400 font-extrabold"
                      : "text-muted-foreground font-semibold"
                  )}
                >
                  {item.monthName}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
