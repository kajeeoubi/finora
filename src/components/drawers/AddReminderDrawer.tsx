"use client";

import React, { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useFinora } from "@/context/finora-context";
import { formatIDR, formatDateIndo } from "@/lib/formatters";
import { CategoryIcon } from "@/components/shared/CategoryIcon";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Calendar as CalendarIcon,
  Check,
  ChevronDown,
  X,
  Wallet as WalletIcon,
} from "lucide-react";

export function AddReminderDrawer() {
  const {
    isAddReminderModalOpen,
    setIsAddReminderModalOpen,
    categories,
    wallets,
    addReminder,
  } = useFinora();

  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");

  const [title, setTitle] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [categoryId, setCategoryId] = useState<string>(
    expenseCategories[0]?.id || ""
  );
  const [walletId, setWalletId] = useState<string>("");
  const [note, setNote] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const selectedWallet = wallets.find((w) => w.id === walletId);

  const resetForm = () => {
    setTitle("");
    setAmountStr("");
    setSelectedDate(undefined);
    setCategoryId(expenseCategories[0]?.id || "");
    setWalletId("");
    setNote("");
    setErrorMsg("");
    setIsSuccess(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!title.trim()) {
      setErrorMsg("Tulis nama tagihan");
      return;
    }

    const numericAmount = parseInt(amountStr.replace(/\D/g, ""), 10);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMsg("Nominal tagihan harus lebih dari Rp 0");
      return;
    }

    if (!selectedDate) {
      setErrorMsg("Pilih tanggal jatuh tempo tagihan");
      return;
    }

    const result = addReminder({
      title: title.trim(),
      amount: numericAmount,
      dueDate: selectedDate.toISOString(),
      categoryId: categoryId || undefined,
      walletId: walletId || undefined,
      isPaid: false,
      note: note.trim() || undefined,
    });

    if (result.success) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsAddReminderModalOpen(false);
        resetForm();
      }, 1000);
    } else {
      setErrorMsg(result.error || "Gagal menyimpan pengingat tagihan");
    }
  };

  return (
    <Drawer
      open={isAddReminderModalOpen}
      onOpenChange={(open) => {
        setIsAddReminderModalOpen(open);
        if (!open) resetForm();
      }}
    >
      <DrawerContent>
        <DrawerHeader className="p-0 text-left pb-1">
          <DrawerTitle className="text-base sm:text-lg font-black text-zinc-900 dark:text-white">
            Tambah Tagihan
          </DrawerTitle>
        </DrawerHeader>

        {isSuccess ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center animate-scale-in">
            <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Check className="h-8 w-8" />
            </div>
            <h4 className="text-lg font-bold text-zinc-900 dark:text-white">
              Tagihan Berhasil Disimpan!
            </h4>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {errorMsg && (
              <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 text-xs font-bold">
                {errorMsg}
              </div>
            )}

            {/* Nama Tagihan */}
            <div className="space-y-1">
              <Label className="text-xs text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-wider">
                Nama Tagihan
              </Label>
              <input
                type="text"
                placeholder="Tulis nama tagihan..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-12 rounded-2xl bg-[#F5F5F7] dark:bg-[#202028] text-zinc-900 dark:text-white border border-black/[0.08] dark:border-white/10 px-4 text-base sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
            </div>

            {/* Nominal Tagihan */}
            <div className="space-y-1">
              <Label className="text-xs text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-wider">
                Nominal Tagihan
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-zinc-400">
                  Rp
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Tulis nominal tagihan..."
                  value={
                    amountStr
                      ? Number(
                          amountStr.replace(/\D/g, "")
                        ).toLocaleString("id-ID")
                      : ""
                  }
                  onChange={(e) =>
                    setAmountStr(e.target.value.replace(/\D/g, ""))
                  }
                  className="w-full h-12 pl-12 pr-4 rounded-2xl bg-[#F5F5F7] dark:bg-[#202028] text-zinc-900 dark:text-white border border-black/[0.08] dark:border-white/10 text-base sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-600 tabular-nums"
                />
              </div>
            </div>

            {/* Tanggal Jatuh Tempo */}
            <div className="space-y-1">
              <Label className="text-xs text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-wider">
                Tanggal Jatuh Tempo
              </Label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="w-full h-12 px-4 rounded-2xl bg-[#F5F5F7] dark:bg-[#202028] text-zinc-900 dark:text-white border border-black/[0.08] dark:border-white/10 text-sm font-semibold flex items-center justify-between hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-zinc-500" />
                      <span>
                        {selectedDate
                          ? formatDateIndo(selectedDate.toISOString())
                          : "Pilih tanggal jatuh tempo..."}
                      </span>
                    </div>
                    {selectedDate && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDate(undefined);
                        }}
                        className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full text-zinc-400"
                      >
                        <X className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 rounded-2xl shadow-xl border border-black/[0.08] dark:border-white/10"
                  align="start"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setIsCalendarOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Kategori Tagihan */}
            <div className="space-y-1">
              <Label className="text-xs text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-wider">
                Kategori
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger className="w-full h-12 inline-flex items-center justify-between px-4 rounded-2xl border border-black/[0.08] bg-[#F5F5F7] dark:bg-[#202028] dark:border-white/10 text-sm font-bold text-zinc-900 dark:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-all cursor-pointer outline-none">
                  <div className="flex items-center gap-2.5">
                    {selectedCategory ? (
                      <>
                        <CategoryIcon
                          iconName={selectedCategory.icon}
                          size="sm"
                          bgColor={
                            selectedCategory.color
                              ? `${selectedCategory.color}20`
                              : undefined
                          }
                          iconColor={selectedCategory.color || undefined}
                        />
                        <span>{selectedCategory.name}</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground font-normal text-xs">
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
                  {expenseCategories.map((cat) => {
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
                            bgColor={
                              cat.color ? `${cat.color}20` : undefined
                            }
                            iconColor={cat.color || undefined}
                          />
                          <span className="font-bold text-sm">{cat.name}</span>
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

            {/* Dompet Pembayaran Pilihan */}
            {wallets.length > 0 && (
              <div className="space-y-1">
                <Label className="text-xs text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-wider">
                  Dompet Pembayaran (Opsional)
                </Label>
                <DropdownMenu>
                  <DropdownMenuTrigger className="w-full h-12 inline-flex items-center justify-between px-4 rounded-2xl border border-black/[0.08] bg-[#F5F5F7] dark:bg-[#202028] dark:border-white/10 text-sm font-bold text-zinc-900 dark:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-all cursor-pointer outline-none">
                    <div className="flex items-center gap-2.5">
                      <WalletIcon className="h-4 w-4 text-[#6C4EF5]" />
                      {selectedWallet ? (
                        <span>
                          {selectedWallet.name} —{" "}
                          <span className="text-xs text-muted-foreground font-semibold">
                            Saldo {formatIDR(selectedWallet.balance)}
                          </span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground font-normal text-xs">
                          Pilih saat membayar
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
                      onClick={() => setWalletId("")}
                      className="flex items-center justify-between py-2 cursor-pointer"
                    >
                      <span className="text-xs text-muted-foreground font-medium">
                        Pilih saat membayar
                      </span>
                      {!walletId && (
                        <Check className="h-4 w-4 text-[#6C4EF5]" />
                      )}
                    </DropdownMenuItem>
                    {wallets.map((w) => {
                      const isSelected = walletId === w.id;
                      return (
                        <DropdownMenuItem
                          key={w.id}
                          onClick={() => setWalletId(w.id)}
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

            {/* Catatan */}
            <div className="space-y-1">
              <Label className="text-xs text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-wider">
                Catatan (Opsional)
              </Label>
              <input
                type="text"
                placeholder="Tulis catatan tagihan..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full h-12 rounded-2xl bg-[#F5F5F7] dark:bg-[#202028] text-zinc-900 dark:text-white border border-black/[0.08] dark:border-white/10 px-4 text-base sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
            </div>

            <div className="pt-2 pb-1">
              <Button
                type="submit"
                className="w-full h-12 rounded-2xl bg-[#6C4EF5] hover:bg-[#5638D6] text-white text-sm font-bold shadow-md shadow-violet-500/25 cursor-pointer"
              >
                Simpan Tagihan
              </Button>
            </div>
          </form>
        )}
      </DrawerContent>
    </Drawer>
  );
}
