"use client";

import React, { useState, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useFinora } from "@/context/finora-context";
import { formatIDR, formatDateIndo } from "@/lib/formatters";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Check, ChevronDown, Wallet as WalletIcon } from "lucide-react";

export function PayReminderDrawer() {
  const { payReminderItem, setPayReminderItem, wallets, payReminder } =
    useFinora();

  const [payWalletId, setPayWalletId] = useState<string>("");
  const [payError, setPayError] = useState<string>("");

  useEffect(() => {
    if (payReminderItem) {
      setPayWalletId(payReminderItem.walletId || "");
      setPayError("");
    }
  }, [payReminderItem]);

  const selectedPayWallet = wallets.find((w) => w.id === payWalletId);

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payReminderItem) return;

    const res = payReminder(
      payReminderItem.id,
      payWalletId || undefined
    );

    if (res.success) {
      setPayReminderItem(null);
      setPayWalletId("");
      setPayError("");
    } else {
      setPayError(res.error || "Gagal memproses pembayaran");
    }
  };

  return (
    <Drawer
      open={!!payReminderItem}
      onOpenChange={(open) => {
        if (!open) {
          setPayReminderItem(null);
          setPayWalletId("");
          setPayError("");
        }
      }}
    >
      <DrawerContent>
        <DrawerHeader className="p-0 text-left pb-1">
          <DrawerTitle className="text-base sm:text-lg font-black text-zinc-900 dark:text-white">
            Bayar Tagihan
          </DrawerTitle>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Konfirmasi pembayaran tagihan {payReminderItem?.title}
          </p>
        </DrawerHeader>

        {payError && (
          <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 text-xs font-bold">
            {payError}
          </div>
        )}

        {payReminderItem && (
          <form onSubmit={handlePaySubmit} className="space-y-4 pt-2">
            {/* Detail Tagihan Box */}
            <div className="p-4 rounded-2xl bg-[#F5F5F7] dark:bg-[#202028] border border-black/[0.04] dark:border-white/10 space-y-1">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                Nominal Tagihan
              </span>
              <div className="text-2xl font-black text-foreground tabular-nums">
                {formatIDR(payReminderItem.amount)}
              </div>
              <div className="text-xs text-muted-foreground">
                Jatuh tempo {formatDateIndo(payReminderItem.dueDate)}
              </div>
            </div>

            {/* Pilihan Dompet Pemotong Saldo */}
            {wallets.length > 0 && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider block">
                  Potong Saldo Dompet (Opsional)
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger className="w-full h-12 inline-flex items-center justify-between px-4 rounded-2xl border border-black/[0.08] bg-[#F5F5F7] dark:bg-[#202028] dark:border-white/10 text-sm font-bold text-zinc-900 dark:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-all cursor-pointer outline-none">
                    <div className="flex items-center gap-2.5">
                      <WalletIcon className="h-4 w-4 text-[#6C4EF5]" />
                      {selectedPayWallet ? (
                        <span>
                          {selectedPayWallet.name} —{" "}
                          <span className="text-xs text-muted-foreground font-semibold">
                            Saldo {formatIDR(selectedPayWallet.balance)}
                          </span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground font-normal text-xs">
                          Tandai lunas tanpa potong saldo dompet
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
                      onClick={() => setPayWalletId("")}
                      className="flex items-center justify-between py-2 cursor-pointer"
                    >
                      <span className="text-xs text-muted-foreground font-medium">
                        Tandai lunas tanpa potong saldo dompet
                      </span>
                      {!payWalletId && (
                        <Check className="h-4 w-4 text-[#6C4EF5]" />
                      )}
                    </DropdownMenuItem>
                    {wallets.map((w) => {
                      const isSelected = payWalletId === w.id;
                      return (
                        <DropdownMenuItem
                          key={w.id}
                          onClick={() => setPayWalletId(w.id)}
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
                Konfirmasi Pembayaran
              </Button>
            </div>
          </form>
        )}
      </DrawerContent>
    </Drawer>
  );
}
