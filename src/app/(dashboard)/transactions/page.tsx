"use client";

import React, { useState } from "react";
import { useFinora } from "@/context/finora-context";
import { formatIDR, formatDateIndo } from "@/lib/formatters";
import { CategoryIcon } from "@/components/shared/CategoryIcon";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Search,
  ArrowRightLeft,
  Trash2,
  Filter,
  ChevronDown,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function TransactionsPage() {
  const {
    transactions,
    transfers,
    categories,
    wallets,
    deleteTransaction,
    setIsAddTransactionModalOpen,
    setIsTransferModalOpen,
  } = useFinora();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "EXPENSE" | "INCOME" | "TRANSFER">("ALL");
  const [filterWalletId, setFilterWalletId] = useState<string>("ALL");
  const [filterCategoryId, setFilterCategoryId] = useState<string>("ALL");

  const combinedList = React.useMemo(() => {
    const txItems = transactions.map((t) => ({
      id: t.id,
      itemType: "TRANSACTION" as const,
      type: t.type,
      amount: t.amount,
      walletId: t.walletId,
      categoryId: t.categoryId,
      note: t.note || "",
      date: t.transactionAt,
    }));

    const trfItems = transfers.map((tr) => ({
      id: tr.id,
      itemType: "TRANSFER" as const,
      type: "TRANSFER" as const,
      amount: tr.amount,
      fromWalletId: tr.fromWalletId,
      toWalletId: tr.toWalletId,
      note: tr.note || "",
      date: tr.transferAt,
    }));

    let all = [...txItems, ...trfItems];

    if (filterType !== "ALL") {
      all = all.filter((item) => item.type === filterType);
    }

    if (filterWalletId !== "ALL") {
      all = all.filter((item) => {
        if (item.itemType === "TRANSACTION") {
          return item.walletId === filterWalletId;
        }
        return (
          item.fromWalletId === filterWalletId ||
          item.toWalletId === filterWalletId
        );
      });
    }

    if (filterCategoryId !== "ALL") {
      all = all.filter(
        (item) => item.itemType === "TRANSACTION" && item.categoryId === filterCategoryId
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      all = all.filter((item) => {
        if (item.itemType === "TRANSACTION") {
          const cat = categories.find((c) => c.id === item.categoryId);
          const wal = wallets.find((w) => w.id === item.walletId);
          return (
            (cat && cat.name.toLowerCase().includes(q)) ||
            (wal && wal.name.toLowerCase().includes(q)) ||
            item.note.toLowerCase().includes(q)
          );
        } else {
          return item.note.toLowerCase().includes(q) || "transfer".includes(q);
        }
      });
    }

    all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return all;
  }, [transactions, transfers, filterType, filterWalletId, filterCategoryId, searchQuery, categories, wallets]);

  const selectedWalletName =
    filterWalletId === "ALL"
      ? "Semua Dompet"
      : wallets.find((w) => w.id === filterWalletId)?.name || "Dompet";

  return (
    <div className="space-y-5">
      {/* Full-Width Clean Heading */}
      <div className="space-y-1 animate-card-enter">
        <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          Riwayat Transaksi
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Catatan seluruh arus kas masuk, keluar, dan transfer
        </p>
      </div>

      {/* Action Buttons Row */}
      <div className="flex items-center gap-2.5 animate-card-enter stagger-1">
        <Button
          onClick={() => setIsTransferModalOpen(true)}
          variant="outline"
          className="flex-1 h-11 rounded-2xl text-xs font-bold gap-1.5 border-black/[0.08] dark:border-white/10 dark:bg-[#16161C] dark:text-white cursor-pointer shadow-sm"
        >
          <ArrowRightLeft className="h-4 w-4 text-[#6C4EF5]" />
          <span>Transfer</span>
        </Button>
        <Button
          onClick={() => setIsAddTransactionModalOpen(true)}
          className="flex-1 h-11 rounded-2xl bg-[#6C4EF5] hover:bg-[#5638D6] text-white text-xs font-bold gap-1.5 shadow-md shadow-violet-500/25 cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Catat Transaksi</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-[28px] border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#16161C] p-4 shadow-sm space-y-3 transition-colors animate-card-enter stagger-2">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari transaksi atau catatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 h-11 rounded-2xl bg-[#F5F5F7] dark:bg-[#202028] text-zinc-900 dark:text-white border-none text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-600 transition-all placeholder:text-zinc-400"
          />
        </div>

        {/* Filter Pills and Styled Wallet Dropdown */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F5F5F7] dark:bg-[#202028] text-xs font-bold overflow-x-auto no-scrollbar w-full sm:w-auto">
            {(["ALL", "EXPENSE", "INCOME", "TRANSFER"] as const).map((t) => {
              const labels = {
                ALL: "Semua",
                EXPENSE: "Pengeluaran",
                INCOME: "Pemasukan",
                TRANSFER: "Transfer",
              };
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFilterType(t)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0",
                    filterType === t
                      ? "bg-white dark:bg-[#16161C] text-zinc-900 dark:text-white shadow-sm font-extrabold"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                  )}
                >
                  {labels[t]}
                </button>
              );
            })}
          </div>

          {/* Styled Wallet Dropdown Menu */}
          <div className="self-end sm:self-auto shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-1 text-xs font-bold text-zinc-800 dark:text-zinc-200 bg-[#F5F5F7] dark:bg-[#202028] px-3.5 py-2 rounded-xl border border-black/[0.04] dark:border-white/5 hover:bg-black/[0.05] dark:hover:bg-white/[0.06] transition-all cursor-pointer outline-none">
                <span>{selectedWalletName}</span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 p-1.5">
                <DropdownMenuItem
                  onClick={() => setFilterWalletId("ALL")}
                  className="flex items-center justify-between"
                >
                  <span>Semua Dompet</span>
                  {filterWalletId === "ALL" && <Check className="h-3.5 w-3.5 text-[#6C4EF5]" />}
                </DropdownMenuItem>
                {wallets.map((w) => (
                  <DropdownMenuItem
                    key={w.id}
                    onClick={() => setFilterWalletId(w.id)}
                    className="flex items-center justify-between"
                  >
                    <span>{w.name}</span>
                    {filterWalletId === w.id && <Check className="h-3.5 w-3.5 text-[#6C4EF5]" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="rounded-[28px] border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#16161C] p-5 shadow-sm transition-colors animate-card-enter stagger-3">
        {combinedList.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
              <Filter className="h-6 w-6" />
            </div>
            <h4 className="text-base font-bold text-zinc-900 dark:text-white">
              Tidak Ada Transaksi Ditemukan
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              Tidak ada catatan transaksi yang sesuai dengan filter atau kata kunci pencarian.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-black/[0.06] dark:divide-white/[0.08]">
            {combinedList.map((item) => {
              if (item.itemType === "TRANSFER") {
                const fromW = wallets.find((w) => w.id === item.fromWalletId);
                const toW = wallets.find((w) => w.id === item.toWalletId);

                return (
                  <div
                    key={item.id}
                    className="flex items-start justify-between py-3.5 sm:py-4 first:pt-0 last:pb-0 hover:bg-black/[0.01] dark:hover:bg-white/[0.02] rounded-2xl px-1.5 sm:px-2 transition-colors gap-3 group"
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="shrink-0 mt-0.5">
                        <CategoryIcon isTransfer size="md" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5 truncate">
                          <span className="truncate">{fromW?.name || "BCA"}</span>
                          <ArrowRightLeft className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                          <span className="truncate">{toW?.name || "Cash"}</span>
                        </h5>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className="px-1.5 py-0.5 rounded-md bg-violet-50 dark:bg-violet-950/70 text-[10px] font-bold text-[#6C4EF5] dark:text-violet-300 shrink-0">
                            Transfer
                          </span>
                          <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium shrink-0">
                            {formatDateIndo(item.date)}
                          </span>
                        </div>
                        {item.note && (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 break-words line-clamp-2 leading-relaxed">
                            "{item.note}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 text-right pl-2 flex flex-col items-end">
                      <span className="text-sm sm:text-base font-extrabold text-violet-600 dark:text-violet-400 tabular-nums whitespace-nowrap block">
                        {formatIDR(item.amount)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 dark:text-zinc-500 mt-0.5 whitespace-nowrap">
                        Transfer
                      </span>
                    </div>
                  </div>
                );
              }

              const cat = categories.find((c) => c.id === item.categoryId);
              const wal = wallets.find((w) => w.id === item.walletId);
              const isIncome = item.type === "INCOME";

              return (
                <div
                  key={item.id}
                  className="flex items-start justify-between py-3.5 sm:py-4 first:pt-0 last:pb-0 hover:bg-black/[0.01] dark:hover:bg-white/[0.02] rounded-2xl px-1.5 sm:px-2 transition-colors gap-3 group"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="shrink-0 mt-0.5">
                      <CategoryIcon
                        iconName={cat?.icon}
                        size="md"
                        bgColor={cat?.color ? `${cat.color}18` : undefined}
                        iconColor={cat?.color || undefined}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                        {cat?.name || "Transaksi"}
                      </h5>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className="px-1.5 py-0.5 rounded-md bg-[#F0F0F4] dark:bg-[#202028] text-[10px] font-bold text-zinc-600 dark:text-zinc-300 shrink-0">
                          {wal?.name.split(" ")[0] || "Dompet"}
                        </span>
                        <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium shrink-0">
                          {formatDateIndo(item.date)}
                        </span>
                      </div>
                      {item.note && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 break-words line-clamp-2 leading-relaxed">
                          "{item.note}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-2 shrink-0 text-right pl-2">
                    <div className="flex flex-col items-end">
                      <span
                        className={cn(
                          "text-sm sm:text-base font-extrabold tabular-nums whitespace-nowrap block",
                          isIncome
                            ? "text-[#22C55E] dark:text-emerald-400"
                            : "text-[#EF4444] dark:text-rose-400"
                        )}
                      >
                        {formatIDR(item.amount)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 dark:text-zinc-500 mt-0.5 whitespace-nowrap">
                        {isIncome ? "Pemasukan" : "Pengeluaran"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteTransaction(item.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-all cursor-pointer -mr-1 mt-0.5 shrink-0 hidden sm:block"
                      title="Hapus Transaksi"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
