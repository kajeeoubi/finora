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
import { formatIDR } from "@/lib/formatters";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Check, ChevronDown, Wallet as WalletIcon } from "lucide-react";

export function AddSavingsDrawer() {
  const {
    savingTargetWishlistId,
    setSavingTargetWishlistId,
    wishlists,
    wallets,
    addSavingsToWishlist,
  } = useFinora();

  const [savingAmount, setSavingAmount] = useState("");
  const [savingWalletId, setSavingWalletId] = useState("");
  const [savingError, setSavingError] = useState("");

  const targetWishlist = wishlists.find(
    (w) => w.id === savingTargetWishlistId
  );

  useEffect(() => {
    if (savingTargetWishlistId) {
      setSavingAmount("");
      setSavingWalletId("");
      setSavingError("");
    }
  }, [savingTargetWishlistId]);

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

  return (
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
            {targetWishlist?.name}
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
  );
}
