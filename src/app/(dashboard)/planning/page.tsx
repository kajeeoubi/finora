"use client";

import { useFinora } from "@/context/finora-context";
import { formatIDR, formatDateIndo } from "@/lib/formatters";
import { HatchProgressBar } from "@/components/shared/HatchProgressBar";
import { CategoryIcon } from "@/components/shared/CategoryIcon";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  Plus,
  Trash2,
  PiggyBank,
  CheckCircle2,
  ArrowUpRight,
  Calendar,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PlanningPage() {
  const {
    categories,
    transactions,
    updateCategory,
    wishlists,
    deleteWishlistItem,
    setIsAddWishlistModalOpen,
    setSavingTargetWishlistId,
    setLimitCategoryData,
  } = useFinora();

  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");

  const expenseLimitCategories = expenseCategories
    .filter((c) => c.expenseLimit && c.expenseLimit > 0)
    .map((cat) => {
      const spent = transactions
        .filter(
          (t) =>
            t.categoryId === cat.id &&
            t.type === "EXPENSE" &&
            new Date(t.transactionAt).getMonth() === new Date().getMonth() &&
            new Date(t.transactionAt).getFullYear() === new Date().getFullYear()
        )
        .reduce((sum, t) => sum + t.amount, 0);

      const limit = cat.expenseLimit || 0;
      const remaining = Math.max(0, limit - spent);
      const percentage =
        limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;

      let status: "NORMAL" | "WARNING" | "EXCEEDED" = "NORMAL";
      if (percentage >= 100) status = "EXCEEDED";
      else if (percentage >= 80) status = "WARNING";

      return {
        category: cat,
        spent,
        limit,
        remaining,
        percentage,
        status,
      };
    });

  const totalSavedWishlist = wishlists.reduce(
    (sum, item) => sum + item.savedAmount,
    0
  );
  const totalTargetWishlist = wishlists.reduce(
    (sum, item) => sum + item.targetAmount,
    0
  );

  const completedWishlistsCount = wishlists.filter(
    (w) => w.isCompleted || w.savedAmount >= w.targetAmount
  ).length;

  const handleOpenAddLimit = (catId?: string, currentLimit?: number) => {
    setLimitCategoryData({
      categoryId: catId,
      initialLimit: currentLimit,
    });
  };

  const handleDeleteLimit = (catId: string) => {
    updateCategory(catId, { expenseLimit: undefined });
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman Rencana Keuangan */}
      <div className="space-y-1 animate-card-enter">
        <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          Rencana Keuangan
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Kelola batasan pengeluaran dan daftar wishlist
        </p>
      </div>

      <section className="space-y-4 animate-card-enter stagger-1">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-zinc-900 dark:text-white">
            Batasan Pengeluaran
          </h2>

          <Button
            onClick={() => handleOpenAddLimit()}
            size="sm"
            className="h-9 rounded-xl bg-[#6C4EF5] hover:bg-[#5638D6] text-white text-xs font-bold gap-1 shadow-sm cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Tambah Batasan</span>
          </Button>
        </div>

        {expenseLimitCategories.length === 0 ? (
          <div className="p-8 text-center rounded-[28px] bg-white dark:bg-[#16161C] border border-black/[0.06] dark:border-white/[0.08] space-y-3">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Belum ada batasan pengeluaran.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {expenseLimitCategories.map((item) => {
              const {
                category,
                spent,
                limit,
                remaining,
                percentage,
                status,
              } = item;

              return (
                <div
                  key={category.id}
                  tabIndex={0}
                  className="rounded-[28px] border border-black/[0.04] bg-white p-5 shadow-sm dark:bg-[#16161C] dark:border-white/[0.08] space-y-3.5 transition-colors relative group focus:outline-none focus:ring-1 focus:ring-violet-500/20 dark:focus:ring-violet-500/30"
                >
                  {/* Header Row: Title on Left, Edit & Delete on Right */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <CategoryIcon
                        iconName={category.icon}
                        size="sm"
                        bgColor={
                          category.color ? `${category.color}20` : undefined
                        }
                        iconColor={category.color || undefined}
                      />
                      <span className="text-sm font-bold text-foreground">
                        {category.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 group-focus:opacity-100 transition-opacity">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenAddLimit(category.id, category.expenseLimit)
                            }
                            className="p-1.5 text-zinc-400 hover:text-violet-600 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-all cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          Ubah Batasan
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => handleDeleteLimit(category.id)}
                            className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-all cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          Hapus Batasan
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  {/* Figures Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-2xl font-black text-foreground tabular-nums tracking-tight">
                        {formatIDR(spent)}
                      </h3>
                      <span className="text-xs text-muted-foreground font-semibold">
                        dari {formatIDR(limit)}
                      </span>
                    </div>

                    <div
                      className={cn(
                        "text-xs font-black tabular-nums px-2.5 py-1 rounded-full",
                        status === "EXCEEDED"
                          ? "bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300"
                          : status === "WARNING"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300"
                      )}
                    >
                      {percentage}%
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <HatchProgressBar
                    percentage={percentage}
                    status={status}
                    height="h-5"
                    className="shadow-inner"
                  />

                  {/* Footer Row */}
                  <div className="flex items-center justify-between text-xs font-bold pt-1 border-t border-black/[0.04] dark:border-white/[0.06]">
                    <span className="text-muted-foreground font-semibold">
                      Sisa Anggaran
                    </span>
                    <span
                      className={cn(
                        "tabular-nums font-black",
                        remaining === 0 ? "text-red-500" : "text-foreground"
                      )}
                    >
                      {formatIDR(remaining)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: IMPIAN & WISHLIST                                              */}
      {/* ========================================================================= */}
      <section className="space-y-4 animate-card-enter stagger-2">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-base font-extrabold text-zinc-900 dark:text-white">
              Wishlist & Tabungan
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Kumpulkan dana untuk impian dan target masa depan
            </p>
          </div>

          <Button
            onClick={() => setIsAddWishlistModalOpen(true)}
            size="sm"
            className="h-9 rounded-xl bg-[#6C4EF5] hover:bg-[#5638D6] text-white text-xs font-bold gap-1 shadow-sm cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Tambah Wishlist</span>
          </Button>
        </div>

        {/* Ringkasan Akumulasi Wishlist */}
        {wishlists.length > 0 && (
          <div className="p-5 rounded-[24px] bg-white dark:bg-[#16161C] border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <PiggyBank className="h-6 w-6" />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                  Total Terkumpul
                </span>
                <div className="text-xl sm:text-2xl font-black text-foreground tabular-nums tracking-tight">
                  {formatIDR(totalSavedWishlist)}
                  <span className="text-xs font-normal text-muted-foreground ml-2">
                    dari {formatIDR(totalTargetWishlist)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#F5F5F7] dark:bg-[#202028] text-zinc-700 dark:text-zinc-300">
                {completedWishlistsCount} dari {wishlists.length} Tercapai
              </span>
            </div>
          </div>
        )}

        {/* Daftar Kartu Wishlist */}
        {wishlists.length === 0 ? (
          <div className="p-10 text-center rounded-[28px] bg-white dark:bg-[#16161C] border border-black/[0.06] dark:border-white/[0.08] space-y-3">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Belum ada target wishlist. Mulai rencanakan impian Anda!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {wishlists.map((item) => {
              const percentage =
                item.targetAmount > 0
                  ? Math.min(
                      100,
                      Math.round((item.savedAmount / item.targetAmount) * 100)
                    )
                  : 0;
              const remaining = Math.max(
                0,
                item.targetAmount - item.savedAmount
              );
              const isCompleted = item.isCompleted || percentage >= 100;

              return (
                <div
                  key={item.id}
                  tabIndex={0}
                  className="rounded-[28px] border border-black/[0.04] bg-white p-5 shadow-sm dark:bg-[#16161C] dark:border-white/[0.08] space-y-3.5 transition-colors relative group focus:outline-none focus:ring-1 focus:ring-violet-500/20 dark:focus:ring-violet-500/30"
                >
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-extrabold text-base text-zinc-900 dark:text-white leading-tight">
                        {item.name}
                      </h4>
                      {item.note && (
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                          {item.note}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => deleteWishlistItem(item.id)}
                            className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 group-focus:opacity-100 p-1.5 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-all cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          Hapus Wishlist
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  {/* Figures Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-2xl font-black text-foreground tabular-nums tracking-tight">
                        {formatIDR(item.savedAmount)}
                      </h3>
                      <span className="text-xs text-muted-foreground font-semibold">
                        dari {formatIDR(item.targetAmount)}
                      </span>
                    </div>

                    <div
                      className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold tabular-nums",
                        isCompleted
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300"
                      )}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Tercapai (100%)</span>
                        </>
                      ) : (
                        <span>{percentage}%</span>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <HatchProgressBar
                    percentage={percentage}
                    status="NORMAL"
                    height="h-5"
                    className="shadow-inner"
                  />

                  {/* Footer Row & Quick Action */}
                  <div className="flex items-center justify-between pt-1 border-t border-black/[0.04] dark:border-white/[0.06]">
                    <div className="text-[11px] text-muted-foreground space-y-0.5">
                      {item.targetDate && (
                        <span className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 font-medium">
                          <Calendar className="h-3 w-3" />{" "}
                          {formatDateIndo(item.targetDate)}
                        </span>
                      )}
                      <span>
                        Sisa{" "}
                        <strong className="text-foreground">
                          {formatIDR(remaining)}
                        </strong>
                      </span>
                    </div>

                    {!isCompleted && (
                      <Button
                        size="sm"
                        onClick={() => setSavingTargetWishlistId(item.id)}
                        className="h-8 px-3 rounded-xl bg-[#6C4EF5] hover:bg-[#5638D6] text-white text-[11px] font-bold gap-1 shadow-sm cursor-pointer"
                      >
                        <PiggyBank className="h-3.5 w-3.5" />
                        <span>Tabung</span>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
