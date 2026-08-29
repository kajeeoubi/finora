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
import { useFinora } from "@/context/finora-context";
import { formatIDR } from "@/lib/formatters";
import { CategoryIcon } from "@/components/shared/CategoryIcon";
import { TransactionType } from "@/types";
import { AlertCircle, Check, ChevronDown, Wallet as WalletIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export function AddTransactionDrawer() {
  const {
    wallets,
    categories,
    isAddTransactionModalOpen,
    setIsAddTransactionModalOpen,
    addTransaction,
  } = useFinora();

  const [type, setType] = useState<TransactionType>("EXPENSE");
  const [amountStr, setAmountStr] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [walletId, setWalletId] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const filteredCategories = categories.filter((c) => c.type === type);

  // Inisialisasi default category dan wallet saat modal dibuka / data tersedia
  useEffect(() => {
    if (isAddTransactionModalOpen) {
      if (filteredCategories.length > 0 && (!categoryId || !filteredCategories.some(c => c.id === categoryId))) {
        setCategoryId(filteredCategories[0].id);
      }
      if (wallets.length > 0 && (!walletId || !wallets.some(w => w.id === walletId))) {
        setWalletId(wallets[0].id);
      }
      setErrorMsg("");
      setIsSuccess(false);
    }
  }, [isAddTransactionModalOpen, type]);

  const selectedWallet = wallets.find((w) => w.id === walletId) || wallets[0];
  const selectedCategory = categories.find((c) => c.id === categoryId) || filteredCategories[0];

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const newCats = categories.filter((c) => c.type === newType);
    if (newCats.length > 0) {
      setCategoryId(newCats[0].id);
    }
    setErrorMsg("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const numericAmount = parseInt(amountStr, 10);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMsg("Masukkan nominal transaksi yang valid");
      return;
    }

    const activeCatId = categoryId || selectedCategory?.id;
    if (!activeCatId) {
      setErrorMsg("Pilih kategori transaksi");
      return;
    }

    const activeWalletId = walletId || selectedWallet?.id;
    if (!activeWalletId) {
      setErrorMsg("Pilih dompet sumber / tujuan");
      return;
    }

    const targetWallet = wallets.find(w => w.id === activeWalletId) || selectedWallet;
    if (type === "EXPENSE" && targetWallet && targetWallet.balance < numericAmount) {
      setErrorMsg(
        `Saldo ${targetWallet.name} tidak mencukupi (${formatIDR(
          targetWallet.balance
        )})`
      );
      return;
    }

    const result = addTransaction({
      walletId: activeWalletId,
      categoryId: activeCatId,
      type,
      amount: numericAmount,
      note: note.trim() || undefined,
      transactionAt: new Date().toISOString(),
    });

    if (result.success) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsAddTransactionModalOpen(false);
        setAmountStr("");
        setNote("");
      }, 700);
    } else {
      setErrorMsg(result.error || "Gagal menyimpan transaksi");
    }
  };

  return (
    <Drawer
      open={isAddTransactionModalOpen}
      onOpenChange={setIsAddTransactionModalOpen}
    >
      <DrawerContent>
        <DrawerHeader className="p-0">
          <DrawerTitle>
            Tambah Transaksi Baru
          </DrawerTitle>
        </DrawerHeader>

        {isSuccess ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="h-16 w-16 rounded-full bg-[#DCFCE7] dark:bg-emerald-950/60 flex items-center justify-center text-[#15803D] dark:text-emerald-400 animate-bounce">
              <Check className="h-8 w-8" />
            </div>
            <h4 className="text-lg font-bold text-zinc-900 dark:text-white">
              Transaksi Berhasil Dicatat!
            </h4>
            <p className="text-xs text-muted-foreground">
              Saldo dompet Anda telah diperbarui seketika.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-red-50 text-red-700 text-xs font-bold border border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Segmented Type Toggle */}
            <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-[#F5F5F7] dark:bg-[#202028]">
              <button
                type="button"
                onClick={() => handleTypeChange("EXPENSE")}
                className={cn(
                  "py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer",
                  type === "EXPENSE"
                    ? "bg-white text-[#EF4444] shadow-sm dark:bg-[#16161C] dark:text-rose-400"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                )}
              >
                Pengeluaran
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange("INCOME")}
                className={cn(
                  "py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer",
                  type === "INCOME"
                    ? "bg-white text-[#22C55E] shadow-sm dark:bg-[#16161C] dark:text-emerald-400"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                )}
              >
                Pemasukan
              </button>
            </div>

            {/* Amount Input */}
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-wider">
                Nominal Transaksi
              </Label>
              <div className="relative flex items-center">
                <span className="absolute left-4 font-black text-zinc-900 dark:text-white text-lg">
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
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    setAmountStr(raw);
                    setErrorMsg("");
                  }}
                  placeholder="0"
                  className="w-full h-14 pl-12 pr-4 rounded-2xl border border-black/[0.08] bg-[#F5F5F7] text-xl font-black text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-600 dark:bg-[#202028] dark:border-white/10 tabular-nums"
                />
              </div>
            </div>

            {/* Category Selector Dropdown */}
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-wider">
                Pilih Kategori
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger className="w-full h-12 inline-flex items-center justify-between px-4 rounded-2xl border border-black/[0.08] bg-[#F5F5F7] dark:bg-[#202028] dark:border-white/10 text-sm font-bold text-zinc-900 dark:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-all cursor-pointer outline-none">
                  <div className="flex items-center gap-2.5">
                    {selectedCategory ? (
                      <>
                        <CategoryIcon
                          iconName={selectedCategory.icon}
                          size="sm"
                          bgColor={selectedCategory.color ? `${selectedCategory.color}20` : undefined}
                          iconColor={selectedCategory.color || undefined}
                        />
                        <span>{selectedCategory.name}</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground font-normal text-xs">Pilih Kategori...</span>
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-60 overflow-y-auto p-1.5"
                >
                  {filteredCategories.map((cat) => {
                    const isSelected = (categoryId || selectedCategory?.id) === cat.id;
                    return (
                      <DropdownMenuItem
                        key={cat.id}
                        onSelect={() => {
                          setCategoryId(cat.id);
                          setErrorMsg("");
                        }}
                        className="flex items-center justify-between py-2 cursor-pointer font-bold"
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
                        {isSelected && <Check className="h-4 w-4 text-[#6C4EF5]" />}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Styled Wallet Selector Dropdown */}
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-wider">
                {type === "EXPENSE" ? "Bayar Menggunakan" : "Simpan ke Dompet"}
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger className="w-full h-12 inline-flex items-center justify-between px-4 rounded-2xl border border-black/[0.08] bg-[#F5F5F7] dark:bg-[#202028] dark:border-white/10 text-sm font-bold text-zinc-900 dark:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-all cursor-pointer outline-none">
                  <div className="flex items-center gap-2.5">
                    <WalletIcon className="h-4 w-4 text-[#6C4EF5]" />
                    <span>{selectedWallet?.name} — Saldo {formatIDR(selectedWallet?.balance || 0)}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] p-1.5">
                  {wallets.map((w) => (
                    <DropdownMenuItem
                      key={w.id}
                      onSelect={() => {
                        setWalletId(w.id);
                        setErrorMsg("");
                      }}
                      className="flex items-center justify-between py-2 cursor-pointer font-bold"
                    >
                      <div>
                        <span className="font-bold block text-sm">{w.name}</span>
                        <span className="text-[11px] text-muted-foreground">Saldo {formatIDR(w.balance)}</span>
                      </div>
                      {(walletId || selectedWallet?.id) === w.id && <Check className="h-4 w-4 text-[#6C4EF5]" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Note Input */}
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-wider">
                Catatan (Opsional)
              </Label>
              <input
                type="text"
                placeholder="Tulis catatan transaksi..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full h-12 rounded-2xl bg-[#F5F5F7] dark:bg-[#202028] text-zinc-900 dark:text-white border border-black/[0.08] dark:border-white/10 px-4 text-base sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                className="w-full h-14 rounded-2xl bg-[#6C4EF5] hover:bg-[#5638D6] text-white font-bold text-base shadow-lg shadow-violet-500/25 active:scale-[0.98] transition-all cursor-pointer"
              >
                Simpan Transaksi
              </Button>
            </div>
          </form>
        )}
      </DrawerContent>
    </Drawer>
  );
}
