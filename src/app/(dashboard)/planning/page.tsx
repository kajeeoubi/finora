"use client";

import React, { useState } from "react";
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
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Plus,
  Trash2,
  PiggyBank,
  CheckCircle2,
  ArrowUpRight,
  Calendar,
  Pencil,
  ChevronDown,
  Check,
  Wallet as WalletIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function PlanningPage() {
  const {
    categories,
    transactions,
    updateCategory,
    wishlists,
    deleteWishlistItem,
    addSavingsToWishlist,
    setIsAddWishlistModalOpen,
    wallets,
  } = useFinora();

  const [isLimitDrawerOpen, setIsLimitDrawerOpen] = useState(false);
  const [isEditLimit, setIsEditLimit] = useState(false);
  const [selectedLimitCatId, setSelectedLimitCatId] = useState("");
  const [limitAmountStr, setLimitAmountStr] = useState("");
  const [limitError, setLimitError] = useState("");

  const [savingTargetWishlistId, setSavingTargetWishlistId] = useState<
    string | null
  >(null);
  const [savingAmount, setSavingAmount] = useState("");
  const [savingWalletId, setSavingWalletId] = useState<string>("");
  const [savingError, setSavingError] = useState("");

  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");

  const expenseLimitCategories = expenseCategories
    .filter((c) => c.expenseLimit && c.expenseLimit > 0)
    .map((cat) => {
      const spent = transactions
        .filter((t) => t.type === "EXPENSE" && t.categoryId === cat.id)
        .reduce((sum, t) => sum + t.amount, 0);
      const limit = cat.expenseLimit || 0;
      const remaining = Math.max(0, limit - spent);
      const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;
      const status: "NORMAL" | "WARNING" | "EXCEEDED" =
        percentage >= 100
          ? "EXCEEDED"
          : percentage >= 80
          ? "WARNING"
          : "NORMAL";

      return {
        category: cat,
        limit,
        spent,
        remaining,
        percentage,
        status,
      };
    });

  // Overall Wishlist Stats
  const totalWishlistTarget = wishlists.reduce(
    (sum, w) => sum + w.targetAmount,
    0
  );
  const totalWishlistSaved = wishlists.reduce(
    (sum, w) => sum + w.savedAmount,
    0
  );
  const overallWishlistPercentage =
    totalWishlistTarget > 0
      ? Math.round((totalWishlistSaved / totalWishlistTarget) * 100)
      : 0;

  const handleOpenAddLimit = (catId?: string, currentLimit?: number) => {
    if (catId) {
      setIsEditLimit(true);
      setSelectedLimitCatId(catId);
      setLimitAmountStr(currentLimit ? currentLimit.toString() : "");
    } else {
      setIsEditLimit(false);
      setSelectedLimitCatId(expenseCategories[0]?.id || "");
      setLimitAmountStr("");
    }
    setLimitError("");
    setIsLimitDrawerOpen(true);
  };

  const handleSaveLimitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLimitCatId) {
      setLimitError("Pilih kategori terlebih dahulu");
      return;
    }

    const numLimit = Number(limitAmountStr.replace(/\D/g, ""));
    if (!numLimit || numLimit <= 0) {
      setLimitError("Nominal batasan harus lebih dari Rp 0");
      return;
    }

    const res = updateCategory(selectedLimitCatId, {
      expenseLimit: numLimit,
    });

    if (res.success) {
      setIsLimitDrawerOpen(false);
      setSelectedLimitCatId("");
      setLimitAmountStr("");
      setLimitError("");
    } else {
      setLimitError(res.error || "Gagal menyimpan batasan pengeluaran");
    }
  };

  const handleDeleteLimit = (catId: string) => {
    updateCategory(catId, { expenseLimit: undefined });
  };

  const handleSaveToWishlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!savingTargetWishlistId) return;

    const numAmount = Number(savingAmount.replace(/\D/g, ""));
    if (!numAmount || numAmount <= 0) {
      setSavingError("Nominal tabungan harus lebih dari Rp 0");
      return;
    }

    const res = addSavingsToWishlist(
      savingTargetWishlistId,
      numAmount,
      savingWalletId || undefined
    );
    if (res.success) {
      setSavingTargetWishlistId(null);
      setSavingAmount("");
      setSavingWalletId("");
      setSavingError("");
    } else {
      setSavingError(res.error || "Gagal menambahkan tabungan");
    }
  };

  const selectedCategoryForLimit = expenseCategories.find(
    (c) => c.id === selectedLimitCatId
  );

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
                      <h3 className="text-2xl sm:text-3xl font-black text-foreground tabular-nums tracking-tight">
                        {formatIDR(spent)}
                      </h3>
                      <span className="text-xs text-muted-foreground font-semibold">
                        dari {formatIDR(limit)}
                      </span>
                    </div>

                    {/* Badge indicator */}
                    <div
                      className={cn(
                        "inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-xs font-bold tabular-nums",
                        status === "EXCEEDED"
                          ? "bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300"
                          : status === "WARNING"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300"
                          : "bg-[#DCFCE7] text-[#15803D] dark:bg-emerald-950/60 dark:text-emerald-300"
                      )}
                    >
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

                  {/* Footer Row */}
                  <div className="flex justify-between items-center text-xs text-muted-foreground font-medium pt-0.5">
                    <span>
                      Terpakai{" "}
                      <strong className="text-foreground">
                        {percentage}%
                      </strong>
                    </span>
                    <span>
                      Sisa{" "}
                      <strong className="text-foreground">
                        {formatIDR(remaining)}
                      </strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-4 animate-card-enter stagger-2 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-zinc-900 dark:text-white">
            Daftar Wishlist
          </h2>

          <Button
            onClick={() => setIsAddWishlistModalOpen(true)}
            size="sm"
            className="h-9 rounded-xl bg-[#6C4EF5] hover:bg-[#5638D6] text-white text-xs font-bold gap-1 shadow-sm cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Tambah Wishlist</span>
          </Button>
        </div>

        {/* Kartu Ringkasan Progres Wishlist */}
        {wishlists.length > 0 && (
          <div className="p-5 rounded-[28px] bg-gradient-to-br from-[#121215] to-[#1E1E26] text-white border border-white/[0.08] shadow-lg space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Total Tabungan Wishlist
              </span>
              <span
                className={cn(
                  "text-xs font-bold px-2.5 py-0.5 rounded-full transition-colors",
                  overallWishlistPercentage >= 100
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-white/10 text-amber-300"
                )}
              >
                {wishlists.filter((w) => w.isCompleted).length} dari{" "}
                {wishlists.length} Tercapai
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div className="space-y-0.5">
                <span className="text-2xl sm:text-3xl font-black text-white tabular-nums tracking-tight">
                  {formatIDR(totalWishlistSaved)}
                </span>
                <span className="text-xs text-zinc-400 ml-2 font-semibold">
                  dari {formatIDR(totalWishlistTarget)}
                </span>
              </div>
              <span
                className={cn(
                  "text-sm font-extrabold tabular-nums transition-colors",
                  overallWishlistPercentage >= 100
                    ? "text-emerald-400"
                    : "text-amber-400"
                )}
              >
                {overallWishlistPercentage}%
              </span>
            </div>

            <HatchProgressBar
              percentage={overallWishlistPercentage}
              status="NORMAL"
              height="h-4"
            />
          </div>
        )}

        {wishlists.length === 0 ? (
          <div className="p-8 text-center rounded-[28px] bg-white dark:bg-[#16161C] border border-black/[0.06] dark:border-white/[0.08] space-y-3">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Belum ada daftar wishlist.
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
                          <span>Tercapai</span>
                        </>
                      ) : (
                        <>
                          <ArrowUpRight className="h-3.5 w-3.5 stroke-[2.5]" />
                          <span>{percentage}%</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Signature Hatch Progress Bar */}
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
                        onClick={() => {
                          setSavingTargetWishlistId(item.id);
                          setSavingAmount("");
                          setSavingError("");
                        }}
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

      <Drawer
        open={isLimitDrawerOpen}
        onOpenChange={(open) => {
          setIsLimitDrawerOpen(open);
          if (!open) {
            setSelectedLimitCatId("");
            setLimitAmountStr("");
            setLimitError("");
          }
        }}
      >
        <DrawerContent>
          <DrawerHeader className="p-0 text-left pb-1">
            <DrawerTitle className="text-base sm:text-lg font-black text-zinc-900 dark:text-white">
              {isEditLimit
                ? "Ubah Batasan Pengeluaran"
                : "Tambah Batasan Pengeluaran"}
            </DrawerTitle>
          </DrawerHeader>

          {limitError && (
            <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 text-xs font-bold">
              {limitError}
            </div>
          )}

          <form onSubmit={handleSaveLimitSubmit} className="space-y-4 pt-2">
            {/* Kategori Pengeluaran */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider block">
                Kategori Pengeluaran
              </label>
              {isEditLimit ? (
                <div className="w-full h-12 inline-flex items-center px-4 rounded-2xl border border-black/[0.06] bg-[#F5F5F7] dark:bg-[#202028] dark:border-white/10 text-sm font-bold text-zinc-900 dark:text-white">
                  <div className="flex items-center gap-2.5">
                    {selectedCategoryForLimit && (
                      <CategoryIcon
                        iconName={selectedCategoryForLimit.icon}
                        size="sm"
                        bgColor={
                          selectedCategoryForLimit.color
                            ? `${selectedCategoryForLimit.color}20`
                            : undefined
                        }
                        iconColor={selectedCategoryForLimit.color || undefined}
                      />
                    )}
                    <span>{selectedCategoryForLimit?.name}</span>
                  </div>
                </div>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger className="w-full h-12 inline-flex items-center justify-between px-4 rounded-2xl border border-black/[0.08] bg-[#F5F5F7] dark:bg-[#202028] dark:border-white/10 text-sm font-bold text-zinc-900 dark:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-all cursor-pointer outline-none">
                    <div className="flex items-center gap-2.5">
                      {selectedCategoryForLimit ? (
                        <>
                          <CategoryIcon
                            iconName={selectedCategoryForLimit.icon}
                            size="sm"
                            bgColor={
                              selectedCategoryForLimit.color
                                ? `${selectedCategoryForLimit.color}20`
                                : undefined
                            }
                            iconColor={
                              selectedCategoryForLimit.color || undefined
                            }
                          />
                          <span>{selectedCategoryForLimit.name}</span>
                        </>
                      ) : (
                        <span className="text-muted-foreground font-normal">
                          Pilih Kategori...
                        </span>
                      )}
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-60 overflow-y-auto p-1.5"
                  >
                    {expenseCategories.map((cat) => (
                      <DropdownMenuItem
                        key={cat.id}
                        onClick={() => setSelectedLimitCatId(cat.id)}
                        className="flex items-center justify-between py-2 cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <CategoryIcon
                            iconName={cat.icon}
                            size="sm"
                            bgColor={cat.color ? `${cat.color}20` : undefined}
                            iconColor={cat.color || undefined}
                          />
                          <span className="font-bold text-sm">{cat.name}</span>
                        </div>
                        {cat.id === selectedLimitCatId && (
                          <Check className="h-4 w-4 text-[#6C4EF5]" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Nominal Batasan */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider block">
                Nominal Batasan Pengeluaran
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-zinc-400">
                  Rp
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Tulis nominal batasan..."
                  value={
                    limitAmountStr
                      ? Number(
                          limitAmountStr.replace(/\D/g, "")
                        ).toLocaleString("id-ID")
                      : ""
                  }
                  onChange={(e) =>
                    setLimitAmountStr(e.target.value.replace(/\D/g, ""))
                  }
                  className="w-full h-12 pl-12 pr-4 rounded-2xl bg-[#F5F5F7] dark:bg-[#202028] text-zinc-900 dark:text-white border border-black/[0.08] dark:border-white/10 text-base sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-600 tabular-nums"
                />
              </div>
            </div>

            <div className="pt-2 pb-1">
              <Button
                type="submit"
                className="w-full h-12 rounded-2xl bg-[#6C4EF5] hover:bg-[#5638D6] text-white text-sm font-bold shadow-md shadow-violet-500/25 cursor-pointer"
              >
                Simpan Batasan
              </Button>
            </div>
          </form>
        </DrawerContent>
      </Drawer>

      <Drawer
        open={!!savingTargetWishlistId}
        onOpenChange={(open) => {
          if (!open) {
            setSavingTargetWishlistId(null);
            setSavingAmount("");
            setSavingWalletId("");
            setSavingError("");
          }
        }}
      >
        <DrawerContent>
          <DrawerHeader className="p-0 text-left pb-1">
            <DrawerTitle className="text-base sm:text-lg font-black text-zinc-900 dark:text-white">
              Tambah Tabungan Wishlist
            </DrawerTitle>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {
                wishlists.find((w) => w.id === savingTargetWishlistId)?.name
              }
            </p>
          </DrawerHeader>

          {savingError && (
            <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 text-xs font-bold">
              {savingError}
            </div>
          )}

          <form onSubmit={handleSaveToWishlistSubmit} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider block">
                Nominal Tambahan Tabungan
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-zinc-400">
                  Rp
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Tulis nominal tabungan..."
                  value={
                    savingAmount
                      ? Number(
                          savingAmount.replace(/\D/g, "")
                        ).toLocaleString("id-ID")
                      : ""
                  }
                  onChange={(e) =>
                    setSavingAmount(e.target.value.replace(/\D/g, ""))
                  }
                  className="w-full h-12 pl-12 pr-4 rounded-2xl bg-[#F5F5F7] dark:bg-[#202028] text-zinc-900 dark:text-white border border-black/[0.08] dark:border-white/10 text-base sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-600 tabular-nums"
                />
              </div>
            </div>

            {wallets.length > 0 && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider block">
                  Potong Dari Dompet (Opsional)
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger className="w-full h-12 inline-flex items-center justify-between px-4 rounded-2xl border border-black/[0.08] bg-[#F5F5F7] dark:bg-[#202028] dark:border-white/10 text-sm font-bold text-zinc-900 dark:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-all cursor-pointer outline-none">
                    <div className="flex items-center gap-2.5">
                      <WalletIcon className="h-4 w-4 text-[#6C4EF5]" />
                      {savingWalletId ? (
                        <span>
                          {wallets.find((w) => w.id === savingWalletId)?.name} —{" "}
                          <span className="text-xs text-muted-foreground font-semibold">
                            Saldo {formatIDR(wallets.find((w) => w.id === savingWalletId)?.balance || 0)}
                          </span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground font-normal text-xs">
                          Tanpa potong saldo dompet
                        </span>
                      )}
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-60 overflow-y-auto p-1.5"
                  >
                    <DropdownMenuItem
                      onClick={() => setSavingWalletId("")}
                      className="flex items-center justify-between py-2 cursor-pointer"
                    >
                      <span className="text-xs text-muted-foreground font-medium">
                        Tanpa potong saldo dompet
                      </span>
                      {!savingWalletId && (
                        <Check className="h-4 w-4 text-[#6C4EF5]" />
                      )}
                    </DropdownMenuItem>
                    {wallets.map((w) => {
                      const isSelected = savingWalletId === w.id;
                      return (
                        <DropdownMenuItem
                          key={w.id}
                          onClick={() => setSavingWalletId(w.id)}
                          className="flex items-center justify-between py-2 cursor-pointer"
                        >
                          <div>
                            <span className="font-bold text-sm block">
                              {w.name}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              Saldo {formatIDR(w.balance)}
                            </span>
                          </div>
                          {isSelected && (
                            <Check className="h-4 w-4 text-[#6C4EF5]" />
                          )}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            <div className="pt-2 pb-1">
              <Button
                type="submit"
                className="w-full h-12 rounded-2xl bg-[#6C4EF5] hover:bg-[#5638D6] text-white text-sm font-bold shadow-md shadow-violet-500/25 cursor-pointer"
              >
                Simpan Tabungan
              </Button>
            </div>
          </form>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
