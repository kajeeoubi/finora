"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useFinora } from "@/context/finora-context";
import { formatIDR } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { Transaction } from "@/types";

interface ExpenseCategoryDonutProps {
  period?: string;
  filteredTransactions?: Transaction[];
}

export function ExpenseCategoryDonut({
  period = "Bulanan",
  filteredTransactions,
}: ExpenseCategoryDonutProps) {
  const { categories, transactions: allTransactions, getExpenseByCategory } = useFinora();
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null);
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    setIsAnimated(false);
    const timer = setTimeout(() => setIsAnimated(true), 80);
    return () => clearTimeout(timer);
  }, [period]);

  const expenseData = useMemo(() => {
    if (!filteredTransactions) {
      return getExpenseByCategory();
    }

    const categoryMap: { [catId: string]: number } = {};
    let totalExp = 0;

    filteredTransactions.forEach((tx) => {
      if (tx.type !== "EXPENSE") return;
      categoryMap[tx.categoryId] = (categoryMap[tx.categoryId] || 0) + tx.amount;
      totalExp += tx.amount;
    });

    return Object.entries(categoryMap).map(([catId, amount]) => {
      const cat = categories.find((c) => c.id === catId) || {
        id: catId,
        name: "Lainnya",
        type: "EXPENSE" as const,
        icon: "Package",
        color: "#64748B",
      };
      const percentage = totalExp > 0 ? Math.round((amount / totalExp) * 100) : 0;
      return {
        category: cat,
        amount,
        percentage,
      };
    });
  }, [filteredTransactions, categories, getExpenseByCategory]);

  const totalExpense = useMemo(() => {
    return expenseData.reduce((sum, item) => sum + item.amount, 0);
  }, [expenseData]);

  const SEGMENT_COLORS = [
    "#6C4EF5", // violet-600
    "#0EA5E9", // sky
    "#F59E0B", // amber
    "#A855F7", // purple
    "#64748B", // slate
    "#EF4444", // red
  ];

  // Calculate cumulative percentages and arc midpoint coordinates for direct anchoring
  let runningPct = 0;
  const layeredSegments = expenseData.map((item, idx) => {
    const startPct = runningPct;
    const endPct = runningPct + item.percentage;
    runningPct = endPct;
    const midPct = (startPct + endPct) / 200; // 0 to 1 fraction
    const x = 100 - 75 * Math.cos(Math.PI * midPct);
    const y = 100 - 75 * Math.sin(Math.PI * midPct);

    return {
      ...item,
      color: item.category.color || SEGMENT_COLORS[idx % SEGMENT_COLORS.length],
      cumulativePercentage: Math.min(100, endPct),
      midX: x, // SVG coordinate X in [0, 200]
      midY: y, // SVG coordinate Y in [0, 115]
      index: idx,
    };
  });

  // Reverse so deepest cumulative segment (100%) is at the bottom, and first segment is on top
  const reversedLayers = [...layeredSegments].reverse();
  const SEMI_CIRCUMFERENCE = 235.62; // Math.PI * 75

  const hoveredItem = layeredSegments.find(
    (item) => item.category.id === hoveredCategoryId
  );

  return (
    <div className="rounded-[28px] border border-black/[0.04] bg-white p-5 shadow-sm dark:bg-[#16161C] dark:border-white/[0.08] space-y-3.5 transition-colors">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm sm:text-base font-bold text-foreground">
          Kategori Pengeluaran
        </h3>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/10 text-muted-foreground">
          {period}
        </span>
      </div>

      {/* SVG Semi-Donut Gauge Chart with Tooltip anchored directly on the Donut */}
      <div className="relative flex flex-col items-center justify-center py-2">
        <div className="relative w-64 h-36 flex items-center justify-center overflow-visible">
          {/* Tooltip anchored directly on the hovered donut segment */}
          {hoveredItem && (
            <div
              className="absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-full mb-2 flex flex-col items-center animate-in fade-in zoom-in-95 duration-150"
              style={{
                left: `${(hoveredItem.midX / 200) * 100}%`,
                top: `${(hoveredItem.midY / 115) * 100}%`,
              }}
            >
              <div className="rounded-2xl border border-white/15 bg-[#121215] px-3 py-1 text-[11px] font-bold text-white shadow-2xl flex items-center gap-1.5 whitespace-nowrap">
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: hoveredItem.color }}
                />
                <span>{hoveredItem.category.name}</span>
                <span className="text-[#B6F23D] tabular-nums font-black">
                  {formatIDR(hoveredItem.amount)}
                </span>
                <span className="text-zinc-400">({hoveredItem.percentage}%)</span>
              </div>
              {/* Tooltip pointer arrow beak */}
              <div className="w-2 h-2 bg-[#121215] border-r border-b border-white/15 rotate-45 -mt-1" />
            </div>
          )}

          <svg viewBox="0 0 200 115" className="w-full h-full overflow-visible">
            <defs>
              {/* Subtle Drop Shadow Filter for Layered Stack Effect */}
              <filter id="stack-shadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="2" dy="1" stdDeviation="2" floodColor="#000000" floodOpacity="0.25" />
              </filter>
            </defs>

            {/* Background Track */}
            <path
              d="M 25 100 A 75 75 0 0 1 175 100"
              fill="none"
              stroke="#ECECEF"
              strokeWidth="24"
              strokeLinecap="round"
              className="dark:stroke-[#262632]"
            />

            {/* Overlapping Category Layers */}
            {reversedLayers.map((layer, revIdx) => {
              const pct = layer.cumulativePercentage / 100;
              const dashLength = pct * SEMI_CIRCUMFERENCE;
              const currentDash = isAnimated ? dashLength : 0;
              const isHovered = hoveredCategoryId === layer.category.id;

              return (
                <path
                  key={layer.category.id}
                  d="M 25 100 A 75 75 0 0 1 175 100"
                  fill="none"
                  stroke={layer.color}
                  strokeWidth={isHovered ? 26 : 24}
                  strokeDasharray={`${currentDash} ${SEMI_CIRCUMFERENCE}`}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                  filter={revIdx > 0 ? "url(#stack-shadow)" : undefined}
                  onMouseEnter={() => setHoveredCategoryId(layer.category.id)}
                  onMouseLeave={() => setHoveredCategoryId(null)}
                  className="transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer"
                />
              );
            })}
          </svg>

          {/* Center Label (Displays Hovered Category or 100% Total) */}
          <div className="absolute bottom-1 flex flex-col items-center justify-center text-center pointer-events-none transition-all duration-200">
            {hoveredItem ? (
              <>
                <span
                  className="text-xl sm:text-2xl font-black tracking-tight tabular-nums"
                  style={{ color: hoveredItem.color }}
                >
                  {hoveredItem.percentage}%
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-foreground tracking-tight tabular-nums">
                  {formatIDR(hoveredItem.amount)}
                </span>
              </>
            ) : (
              <>
                <span className="text-xl sm:text-2xl font-black text-foreground tracking-tight tabular-nums">
                  100%
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-muted-foreground tracking-tight tabular-nums">
                  {formatIDR(totalExpense)}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Category Breakdown Chips (Optimized for Mobile with clean no-wrap proportions) */}
      <div className="grid grid-cols-2 gap-2 sm:gap-2.5 pt-2 border-t border-black/[0.04] dark:border-white/[0.06]">
        {layeredSegments.map((item) => {
          const isHovered = hoveredCategoryId === item.category.id;

          return (
            <div
              key={item.category.id}
              onMouseEnter={() => setHoveredCategoryId(item.category.id)}
              onMouseLeave={() => setHoveredCategoryId(null)}
              className={cn(
                "flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer",
                isHovered
                  ? "bg-violet-50/80 border-[#6C4EF5]/40 dark:bg-violet-950/40 dark:border-violet-600/40"
                  : "bg-[#F5F5F7] dark:bg-[#202028] border-black/[0.02] dark:border-white/[0.04] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
              )}
            >
              <div className="flex items-center gap-1.5 overflow-hidden min-w-0 pr-1">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[11px] font-bold text-foreground truncate">
                  {item.category.name}
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[11px] font-black text-foreground block tabular-nums">
                  {formatIDR(item.amount)}
                </span>
                <span className="text-[9px] font-semibold text-muted-foreground">
                  {item.percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
