"use client";

import React, { useState } from "react";
import { useFinora } from "@/context/finora-context";
import { formatIDR } from "@/lib/formatters";
import { CategoryIcon } from "@/components/shared/CategoryIcon";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CategoriesPage() {
  const { categories, deleteCategory, setIsAddCategoryModalOpen } =
    useFinora();
  const [activeTab, setActiveTab] = useState<"EXPENSE" | "INCOME">("EXPENSE");

  const expenseCount = categories.filter((c) => c.type === "EXPENSE").length;
  const incomeCount = categories.filter((c) => c.type === "INCOME").length;
  const filtered = categories.filter((c) => c.type === activeTab);

  return (
    <div className="space-y-5">
      {/* Full-Width Clean Heading */}
      <div className="space-y-1 animate-card-enter">
        <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          Kategori Keuangan
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Klasifikasi transaksi dan batasan pengeluaran bulanan
        </p>
      </div>

      {/* Action and Tabs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-card-enter stagger-1">
        {/* Tabs with Micro Badges */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#EAEAEE] dark:bg-[#1C1C24] w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("EXPENSE")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
              activeTab === "EXPENSE"
                ? "bg-white dark:bg-[#121216] text-[#EF4444] dark:text-rose-400 shadow-sm"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            )}
          >
            <span>Pengeluaran</span>
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-[11px] font-black tabular-nums transition-colors",
                activeTab === "EXPENSE"
                  ? "bg-red-100 dark:bg-red-950/80 text-[#EF4444] dark:text-rose-300"
                  : "bg-black/[0.06] dark:bg-white/10 text-zinc-600 dark:text-zinc-400"
              )}
            >
              {expenseCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("INCOME")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
              activeTab === "INCOME"
                ? "bg-white dark:bg-[#121216] text-[#22C55E] dark:text-emerald-400 shadow-sm"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            )}
          >
            <span>Pemasukan</span>
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-[11px] font-black tabular-nums transition-colors",
                activeTab === "INCOME"
                  ? "bg-emerald-100 dark:bg-emerald-950/80 text-[#22C55E] dark:text-emerald-300"
                  : "bg-black/[0.06] dark:bg-white/10 text-zinc-600 dark:text-zinc-400"
              )}
            >
              {incomeCount}
            </span>
          </button>
        </div>

        <Button
          onClick={() => setIsAddCategoryModalOpen(true)}
          className="h-11 rounded-2xl bg-[#6C4EF5] hover:bg-[#5638D6] text-white text-xs font-bold gap-1.5 shadow-md shadow-violet-500/25 cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Tambah Kategori</span>
        </Button>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 animate-card-enter stagger-2">
        {filtered.map((cat) => (
          <div
            key={cat.id}
            tabIndex={0}
            className="p-4 sm:p-5 rounded-[28px] bg-white dark:bg-[#16161C] border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col justify-between items-center text-center gap-2.5 relative group transition-colors focus:outline-none focus:ring-1 focus:ring-violet-500/20 dark:focus:ring-violet-500/30"
          >
            <CategoryIcon
              iconName={cat.icon}
              size="lg"
              bgColor={cat.color ? `${cat.color}20` : undefined}
              iconColor={cat.color || undefined}
            />

            <div className="space-y-1 w-full">
              <h4 className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-white truncate">
                {cat.name}
              </h4>
              {cat.type === "EXPENSE" && (
                <div>
                  {cat.expenseLimit ? (
                    <span className="text-[10px] sm:text-[11px] font-bold text-zinc-600 dark:text-zinc-300 bg-[#F5F5F7] dark:bg-[#202028] px-2.5 py-0.5 rounded-full inline-block tabular-nums">
                      {formatIDR(cat.expenseLimit)}
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                      Tanpa batasan
                    </span>
                  )}
                </div>
              )}
            </div>

            {!cat.isDefault && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => deleteCategory(cat.id)}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 group-focus:opacity-100 p-1.5 text-zinc-400 hover:text-red-500 rounded-lg transition-opacity cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  Hapus Kategori
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
