"use client";

import React, { useState, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useFinora } from "@/context/finora-context";
import { formatIDR } from "@/lib/formatters";
import {
  Wallet,
  Check,
  AlertCircle,
  CreditCard,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export function TransferDrawer() {
  const {
    wallets,
    isTransferModalOpen,
    setIsTransferModalOpen,
    createTransfer,
  } = useFinora();

  const [fromWalletId, setFromWalletId] = useState<string>("");
  const [toWalletId, setToWalletId] = useState<string>("");
  const [amountStr, setAmountStr] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (wallets.length >= 2) {
      if (!fromWalletId) setFromWalletId(wallets[0].id);
      if (!toWalletId) setToWalletId(wallets[1].id);
    } else if (wallets.length === 1) {
      setFromWalletId(wallets[0].id);
    }
  }, [wallets, fromWalletId, toWalletId]);

  const sourceWallet = wallets.find((w) => w.id === fromWalletId) || wallets[0];
  const destWallet = wallets.find((w) => w.id === toWalletId) || wallets[1];

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "");
    setAmountStr(rawVal);
    setErrorMsg("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const numericAmount = parseInt(amountStr, 10);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMsg("Masukkan jumlah transfer yang valid");
      return;
    }

    if (fromWalletId === toWalletId) {
      setErrorMsg("Dompet asal dan tujuan tidak boleh sama");
      return;
    }

    if (sourceWallet && sourceWallet.balance < numericAmount) {
      setErrorMsg(
        `Saldo ${sourceWallet.name} tidak cukup (${formatIDR(
          sourceWallet.balance
        )})`
      );
      return;
    }

    const result = createTransfer(
      fromWalletId,
      toWalletId,
      numericAmount,
      note.trim() || undefined
    );

    if (result.success) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsTransferModalOpen(false);
        setAmountStr("");
        setNote("");
      }, 700);
    } else {
      setErrorMsg(result.error || "Gagal melakukan transfer");
    }
  };

  return (
    <Drawer open={isTransferModalOpen} onOpenChange={setIsTransferModalOpen}>
      <DrawerContent>
        <DrawerHeader className="p-0">
          <DrawerTitle>
            Transfer Antar Dompet
          </DrawerTitle>
        </DrawerHeader>

        {isSuccess ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="h-16 w-16 rounded-full bg-[#DCFCE7] dark:bg-emerald-950/60 flex items-center justify-center text-[#15803D] dark:text-emerald-400 animate-bounce">
              <Check className="h-8 w-8" />
            </div>
            <h4 className="text-lg font-bold text-foreground">
              Transfer Berhasil!
            </h4>
            <p className="text-xs text-muted-foreground">
              Saldo dompet telah diperbarui seketika.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Source Wallet Card (Full Width Trigger & Matching Dropdown) */}
            <DropdownMenu>
              <DropdownMenuTrigger className="w-full p-3.5 rounded-2xl bg-[#F5F5F7] dark:bg-[#202028] border border-black/[0.04] dark:border-white/5 text-left outline-none cursor-pointer flex flex-col gap-1 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Dari Dompet Asal
                </span>
                <div className="flex items-center justify-between gap-3 w-full">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-2xl bg-[#6C4EF5] text-white flex items-center justify-center shrink-0 shadow-md shadow-violet-500/20">
                      <Wallet className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-foreground truncate">
                        {sourceWallet?.name || "Pilih Dompet"}
                      </h4>
                      <span className="text-xs text-muted-foreground font-mono block">
                        Saldo {formatIDR(sourceWallet?.balance || 0)}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] p-1.5">
                {wallets.map((w) => (
                  <DropdownMenuItem
                    key={w.id}
                    onClick={() => {
                      setFromWalletId(w.id);
                      setErrorMsg("");
                    }}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold block">{w.name}</span>
                      <span className="text-[11px] text-muted-foreground">Saldo {formatIDR(w.balance)}</span>
                    </div>
                    {w.id === fromWalletId && <Check className="h-4 w-4 text-[#6C4EF5]" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Destination Wallet Card (Full Width Trigger & Matching Dropdown) */}
            <DropdownMenu>
              <DropdownMenuTrigger className="w-full p-3.5 rounded-2xl bg-[#F5F5F7] dark:bg-[#202028] border border-black/[0.04] dark:border-white/5 text-left outline-none cursor-pointer flex flex-col gap-1 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Ke Dompet Tujuan
                </span>
                <div className="flex items-center justify-between gap-3 w-full">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-2xl bg-[#22C55E] text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-foreground truncate">
                        {destWallet?.name || "Pilih Dompet"}
                      </h4>
                      <span className="text-xs text-muted-foreground font-mono block">
                        Saldo {formatIDR(destWallet?.balance || 0)}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] p-1.5">
                {wallets.map((w) => (
                  <DropdownMenuItem
                    key={w.id}
                    disabled={w.id === fromWalletId}
                    onClick={() => {
                      setToWalletId(w.id);
                      setErrorMsg("");
                    }}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold block">{w.name}</span>
                      <span className="text-[11px] text-muted-foreground">Saldo {formatIDR(w.balance)}</span>
                    </div>
                    {w.id === toWalletId && <Check className="h-4 w-4 text-[#22C55E]" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Total Amount Input */}
            <div className="space-y-1.5 pt-1">
              <Label className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                Jumlah Transfer
              </Label>
              <div className="relative flex items-center">
                <span className="absolute left-4 font-black text-foreground text-lg">
                  Rp
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={
                    amountStr
                      ? new Intl.NumberFormat("id-ID").format(
                          parseInt(amountStr, 10) || 0
                        )
                      : ""
                  }
                  onChange={handleAmountChange}
                  placeholder="0"
                  className="w-full h-14 pl-12 pr-16 rounded-2xl border border-black/[0.06] bg-[#F5F5F7] text-lg font-black text-foreground focus:outline-none focus:ring-2 focus:ring-violet-600 dark:bg-[#202028] dark:border-white/10 tabular-nums"
                />
                <span className="absolute right-4 text-xs font-bold text-muted-foreground bg-white dark:bg-[#16161C] px-2.5 py-1 rounded-xl border border-border">
                  IDR
                </span>
              </div>
            </div>

            {/* Optional Note */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                Catatan (Opsional)
              </Label>
              <Input
                type="text"
                placeholder="Tulis catatan transfer..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="h-12 rounded-2xl bg-[#F5F5F7] dark:bg-[#202028] border-black/[0.06] dark:border-white/10"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                className="w-full h-14 rounded-2xl bg-[#6C4EF5] hover:bg-[#5638D6] text-white font-bold text-base shadow-xl shadow-violet-600/30 active:scale-[0.98] transition-all cursor-pointer"
              >
                Kirim Transfer
              </Button>
            </div>
          </form>
        )}
      </DrawerContent>
    </Drawer>
  );
}
