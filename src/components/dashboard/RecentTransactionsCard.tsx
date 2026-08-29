"use client";

import React from "react";
import Link from "next/link";
import { useFinora } from "@/context/finora-context";
import { formatIDR, formatRelativeDateIndo } from "@/lib/formatters";
import { CategoryIcon } from "@/components/shared/CategoryIcon";
import { MarqueeText } from "@/components/shared/MarqueeText";
import { ArrowRightLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

export function RecentTransactionsCard() {
  const { transactions, transfers, categories, wallets } = useFinora();

  const recentItems = React.useMemo(() => {
    const txItems = transactions.map((t) => ({
      id: t.id,
      itemType: "TRANSACTION" as const,
      type: t.type,
      amount: t.amount,
      walletId: t.walletId,
      categoryId: t.categoryId,
      note: t.note,
      date: t.transactionAt,
    }));

    const trfItems = transfers.map((tr) => ({
      id: tr.id,
      itemType: "TRANSFER" as const,
      type: "TRANSFER" as const,
      amount: tr.amount,
      fromWalletId: tr.fromWalletId,
      toWalletId: tr.toWalletId,
      note: tr.note,
      date: tr.transferAt,
    }));

    const combined = [...txItems, ...trfItems];
    combined.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return combined.slice(0, 5);
  }, [transactions, transfers]);

  return (
    <div className="rounded-[28px] border border-black/[0.04] bg-white p-5 shadow-sm dark:bg-[#16161C] dark:border-white/[0.08] space-y-4 transition-colors">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-foreground">
          Aktivitas Terkini
        </h3>

        {/* View All Icon Link */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/transactions"
              className="h-8 w-8 rounded-full flex items-center justify-center bg-[#F5F5F7] dark:bg-[#202028] text-zinc-600 dark:text-zinc-300 hover:bg-violet-100 hover:text-[#6C4EF5] dark:hover:bg-violet-950/60 dark:hover:text-violet-300 transition-all cursor-pointer shadow-sm"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            Lihat Semua Riwayat Transaksi
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Transaction List */}
      <div className="divide-y divide-black/[0.04] dark:divide-white/[0.06]">
        {recentItems.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Belum ada transaksi.
          </div>
        ) : (
          recentItems.map((item) => {
            if (item.itemType === "TRANSFER") {
              const fromW = wallets.find((w) => w.id === item.fromWalletId);
              const toW = wallets.find((w) => w.id === item.toWalletId);
              const fromName = fromW ? fromW.name.split(" ")[0] : "BCA";
              const toName = toW ? toW.name.split(" ")[0] : "Cash";

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0 hover:bg-black/[0.01] dark:hover:bg-white/[0.02] rounded-2xl px-1 transition-colors gap-3"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <CategoryIcon isTransfer size="md" />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5 truncate">
                        <span>{fromName}</span>
                        <ArrowRightLeft className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span>{toName}</span>
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="px-1.5 py-0.5 rounded-md bg-violet-50 dark:bg-violet-950/70 text-[10px] font-bold text-[#6C4EF5] dark:text-violet-300 shrink-0">
                          Transfer
                        </span>
                        <span className="text-[11px] text-zinc-400 font-medium shrink-0">
                          {formatRelativeDateIndo(item.date)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 max-w-[140px] sm:max-w-[200px]">
                    <span className="text-sm font-extrabold text-violet-600 dark:text-violet-400 tabular-nums block">
                      {formatIDR(item.amount)}
                    </span>
                    {item.note && (
                      <MarqueeText
                        text={item.note}
                        className="text-[11px] text-muted-foreground max-w-full justify-end text-right"
                      />
                    )}
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
                className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0 hover:bg-black/[0.01] dark:hover:bg-white/[0.02] rounded-2xl px-1 transition-colors gap-3"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <CategoryIcon
                    iconName={cat?.icon}
                    size="md"
                    bgColor={cat?.color ? `${cat.color}18` : undefined}
                    iconColor={cat?.color || undefined}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="max-w-[140px] sm:max-w-[220px]">
                      <MarqueeText
                        text={cat?.name || "Transaksi"}
                        className="text-sm font-bold text-foreground"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="px-1.5 py-0.5 rounded-md bg-[#F0F0F4] dark:bg-[#202028] text-[10px] font-bold text-zinc-600 dark:text-zinc-300 shrink-0">
                        {wal?.name.split(" ")[0] || "Dompet"}
                      </span>
                      <span className="text-[11px] text-zinc-400 font-medium shrink-0">
                        {formatRelativeDateIndo(item.date)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 max-w-[140px] sm:max-w-[200px]">
                  <span
                    className={cn(
                      "text-sm font-extrabold tabular-nums block",
                      isIncome
                        ? "text-[#22C55E] dark:text-emerald-400"
                        : "text-[#EF4444] dark:text-rose-400"
                    )}
                  >
                    {formatIDR(item.amount)}
                  </span>
                  {item.note && (
                    <MarqueeText
                      text={item.note}
                      className="text-[11px] text-muted-foreground max-w-full justify-end text-right"
                    />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
