"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useFinora } from "@/context/finora-context";
import { formatIDR } from "@/lib/formatters";
import { CategoryIcon } from "@/components/shared/CategoryIcon";
import { TransactionType } from "@/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AlertCircle, Check, ArrowLeft, ArrowRightLeft, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function NewTransactionPage() {
  const router = useRouter();
  const {
    wallets,
    categories,
    addTransaction,
    createTransfer,
  } = useFinora();

  const [mode, setMode] = useState<"TRANSACTION" | "TRANSFER">("TRANSACTION");
  const [type, setType] = useState<TransactionType>("EXPENSE");
  const [amountStr, setAmountStr] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [walletId, setWalletId] = useState("");
  const [fromWalletId, setFromWalletId] = useState("");
  const [toWalletId, setToWalletId] = useState("");
  const [note, setNote] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const filteredCategories = categories.filter((c) => c.type === type);

  React.useEffect(() => {
    if (filteredCategories.length > 0 && !categoryId) {
      setCategoryId(filteredCategories[0].id);
    }
  }, [filteredCategories, categoryId]);

  React.useEffect(() => {
    if (wallets.length >= 2) {
      if (!fromWalletId) setFromWalletId(wallets[0].id);
      if (!toWalletId) setToWalletId(wallets[1].id);
    }
    if (wallets.length > 0 && !walletId) {
      setWalletId(wallets[0].id);
    }
  }, [wallets, fromWalletId, toWalletId, walletId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const numericAmount = parseInt(amountStr.replace(/\D/g, ""), 10);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMsg("Masukkan nominal yang valid");
      return;
    }

    if (mode === "TRANSFER") {
      if (fromWalletId === toWalletId) {
        setErrorMsg("Dompet asal dan tujuan tidak boleh sama");
        return;
      }
      const res = createTransfer(fromWalletId, toWalletId, numericAmount, note.trim() || undefined);
      if (res.success) {
        setIsSuccess(true);
        setTimeout(() => router.push("/dashboard"), 800);
      } else {
        setErrorMsg(res.error || "Gagal melakukan transfer");
      }
      return;
    }

    const res = addTransaction({
      walletId,
      categoryId,
      type,
      amount: numericAmount,
      note: note.trim() || undefined,
      transactionAt: new Date().toISOString(),
    });

    if (res.success) {
      setIsSuccess(true);
      setTimeout(() => router.push("/dashboard"), 800);
    } else {
      setErrorMsg(res.error || "Gagal menyimpan transaksi");
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="h-10 w-10 rounded-full bg-white dark:bg-[#17171B] border border-black/[0.06] dark:border-white/10 flex items-center justify-center text-foreground hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Catat Keuangan
          </h2>
          <p className="text-xs text-muted-foreground">
            Tambah transaksi pengeluaran, pemasukan atau transfer
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-black/[0.04] bg-white p-6 shadow-sm dark:bg-[#17171B] dark:border-white/[0.06]">
        {isSuccess ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 animate-bounce">
              <Check className="h-8 w-8" />
            </div>
            <h4 className="text-lg font-bold text-foreground">
              Berhasil Disimpan!
            </h4>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-red-50 text-red-700 text-xs font-medium border border-red-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Mode Switcher: Transaksi vs Transfer */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#EAEAEE] dark:bg-[#222228]">
              <button
                type="button"
                onClick={() => setMode("TRANSACTION")}
                className={cn(
                  "py-2.5 text-xs font-semibold rounded-xl transition-all",
                  mode === "TRANSACTION"
                    ? "bg-white text-foreground shadow-sm dark:bg-[#17171B]"
                    : "text-muted-foreground"
                )}
              >
                Transaksi Masuk dan Keluar
              </button>
              <button
                type="button"
                onClick={() => setMode("TRANSFER")}
                className={cn(
                  "py-2.5 text-xs font-semibold rounded-xl transition-all",
                  mode === "TRANSFER"
                    ? "bg-white text-foreground shadow-sm dark:bg-[#17171B]"
                    : "text-muted-foreground"
                )}
              >
                Transfer Antar Dompet
              </button>
            </div>

            {mode === "TRANSACTION" && (
              <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#F4F4F6] dark:bg-[#222228]">
                <button
                  type="button"
                  onClick={() => setType("EXPENSE")}
                  className={cn(
                    "py-2 text-xs font-semibold rounded-xl transition-all",
                    type === "EXPENSE"
                      ? "bg-white text-[#EF4444] shadow-sm dark:bg-[#17171B]"
                      : "text-muted-foreground"
                  )}
                >
                  Pengeluaran
                </button>
                <button
                  type="button"
                  onClick={() => setType("INCOME")}
                  className={cn(
                    "py-2 text-xs font-semibold rounded-xl transition-all",
                    type === "INCOME"
                      ? "bg-white text-[#22C55E] shadow-sm dark:bg-[#17171B]"
                      : "text-muted-foreground"
                  )}
                >
                  Pemasukan
                </button>
              </div>
            )}

            {/* Amount */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-semibold">
                Nominal
              </Label>
              <div className="relative flex items-center">
                <span className="absolute left-4 font-bold text-foreground text-lg">
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
                  onChange={(e) => setAmountStr(e.target.value.replace(/\D/g, ""))}
                  placeholder="0"
                  className="w-full h-14 pl-12 pr-4 rounded-2xl border border-black/[0.06] bg-[#F4F4F6] text-xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-violet-600 dark:bg-[#222228] dark:border-white/10 tabular-nums"
                />
              </div>
            </div>

            {mode === "TRANSACTION" ? (
              <>
                {/* Category Dropdown */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground font-semibold">
                    Kategori
                  </Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="w-full h-12 inline-flex items-center justify-between px-4 rounded-2xl border border-black/[0.06] bg-[#F4F4F6] text-sm font-bold text-foreground hover:bg-black/[0.04] dark:bg-[#222228] dark:border-white/10 dark:hover:bg-white/[0.06] transition-all cursor-pointer outline-none">
                      <div className="flex items-center gap-2.5">
                        {categories.find((c) => c.id === categoryId) ? (
                          <>
                            <CategoryIcon
                              iconName={categories.find((c) => c.id === categoryId)!.icon}
                              size="sm"
                              bgColor={categories.find((c) => c.id === categoryId)!.color ? `${categories.find((c) => c.id === categoryId)!.color}20` : undefined}
                              iconColor={categories.find((c) => c.id === categoryId)!.color || undefined}
                            />
                            <span>{categories.find((c) => c.id === categoryId)!.name}</span>
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
                        const isSelected = categoryId === cat.id;
                        return (
                          <DropdownMenuItem
                            key={cat.id}
                            onClick={() => setCategoryId(cat.id)}
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
                            {isSelected && <Check className="h-4 w-4 text-[#6C4EF5]" />}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Wallet */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground font-semibold">
                    Dompet
                  </Label>
                  <select
                    value={walletId}
                    onChange={(e) => setWalletId(e.target.value)}
                    className="w-full h-12 rounded-2xl border border-black/[0.06] bg-[#F4F4F6] px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-violet-600 font-medium dark:bg-[#222228] dark:border-white/10"
                  >
                    {wallets.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} — {formatIDR(w.balance)}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground font-semibold">
                    Dari Dompet
                  </Label>
                  <select
                    value={fromWalletId}
                    onChange={(e) => setFromWalletId(e.target.value)}
                    className="w-full h-12 rounded-2xl border border-black/[0.06] bg-[#F4F4F6] px-4 text-sm text-foreground font-medium dark:bg-[#222228] dark:border-white/10"
                  >
                    {wallets.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} — {formatIDR(w.balance)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground font-semibold">
                    Ke Dompet Tujuan
                  </Label>
                  <select
                    value={toWalletId}
                    onChange={(e) => setToWalletId(e.target.value)}
                    className="w-full h-12 rounded-2xl border border-black/[0.06] bg-[#F4F4F6] px-4 text-sm text-foreground font-medium dark:bg-[#222228] dark:border-white/10"
                  >
                    {wallets.map((w) => (
                      <option key={w.id} value={w.id} disabled={w.id === fromWalletId}>
                        {w.name} — {formatIDR(w.balance)}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Note */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-semibold">
                Catatan (Opsional)
              </Label>
              <Input
                placeholder="Tulis catatan..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="h-12 rounded-2xl"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full h-14 rounded-2xl bg-[#6C4EF5] hover:bg-[#5638D6] text-white font-semibold text-base shadow-lg shadow-violet-500/20"
              >
                Simpan
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
