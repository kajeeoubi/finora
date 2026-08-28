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
import { INDONESIAN_MONTHS } from "@/lib/formatters";
import { AlertCircle, Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { CategoryIcon } from "@/components/shared/CategoryIcon";

export function AddBudgetDrawer() {
  const {
    categories,
    isAddBudgetModalOpen,
    setIsAddBudgetModalOpen,
    addBudget,
  } = useFinora();

  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const [categoryId, setCategoryId] = useState(
    expenseCategories[0]?.id || ""
  );
  const [amountStr, setAmountStr] = useState("");
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const selectedCategory =
    expenseCategories.find((c) => c.id === categoryId) || expenseCategories[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      setErrorMsg("Pilih kategori budget");
      return;
    }

    const amount = parseInt(amountStr.replace(/\D/g, ""), 10) || 0;
    if (amount <= 0) {
      setErrorMsg("Batas budget harus lebih besar dari Rp 0");
      return;
    }

    const res = addBudget({
      categoryId,
      amount,
      month,
      year,
    });

    if (res.success) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsAddBudgetModalOpen(false);
      }, 700);
    } else {
      setErrorMsg(res.error || "Gagal membuat budget");
    }
  };

  return (
    <Drawer open={isAddBudgetModalOpen} onOpenChange={setIsAddBudgetModalOpen}>
      <DrawerContent>
        <DrawerHeader className="p-0">
          <DrawerTitle>
            Buat Anggaran Bulanan
          </DrawerTitle>
        </DrawerHeader>

        {isSuccess ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="h-16 w-16 rounded-full bg-[#DCFCE7] dark:bg-emerald-950/60 flex items-center justify-center text-[#15803D] dark:text-emerald-400 animate-bounce">
              <Check className="h-8 w-8" />
            </div>
            <h4 className="text-lg font-bold text-zinc-900 dark:text-white">
              Budget Berhasil Dibuat!
            </h4>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-red-50 text-red-700 text-xs font-bold border border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-wider">
                Kategori Pengeluaran
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger className="w-full h-12 inline-flex items-center justify-between px-4 rounded-2xl border border-black/[0.08] bg-[#F5F5F7] dark:bg-[#202028] dark:border-white/10 text-sm font-bold text-zinc-900 dark:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-all cursor-pointer outline-none">
                  <div className="flex items-center gap-2.5">
                    {selectedCategory && (
                      <CategoryIcon
                        iconName={selectedCategory.icon}
                        size="sm"
                        bgColor={selectedCategory.color ? `${selectedCategory.color}20` : undefined}
                        iconColor={selectedCategory.color || undefined}
                      />
                    )}
                    <span>{selectedCategory?.name || "Pilih Kategori"}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-56 overflow-y-auto p-1.5">
                  {expenseCategories.map((c) => (
                    <DropdownMenuItem
                      key={c.id}
                      onClick={() => {
                        setCategoryId(c.id);
                        setErrorMsg("");
                      }}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <CategoryIcon
                          iconName={c.icon}
                          size="sm"
                          bgColor={c.color ? `${c.color}20` : undefined}
                          iconColor={c.color || undefined}
                        />
                        <span>{c.name}</span>
                      </div>
                      {categoryId === c.id && <Check className="h-4 w-4 text-[#6C4EF5]" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-wider">
                Batas Pengeluaran Bulanan
              </Label>
              <div className="relative flex items-center">
                <span className="absolute left-4 font-black text-zinc-900 dark:text-white text-base">
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
                    setAmountStr(e.target.value.replace(/\D/g, ""));
                    setErrorMsg("");
                  }}
                  placeholder="0"
                  className="w-full h-12 pl-12 pr-4 rounded-2xl border border-black/[0.08] bg-[#F5F5F7] text-base font-black text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-600 dark:bg-[#202028] dark:border-white/10 tabular-nums"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-wider">
                  Bulan
                </Label>
                <DropdownMenu>
                  <DropdownMenuTrigger className="w-full h-12 inline-flex items-center justify-between px-3.5 rounded-2xl border border-black/[0.08] bg-[#F5F5F7] dark:bg-[#202028] dark:border-white/10 text-xs font-bold text-zinc-900 dark:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-all cursor-pointer outline-none">
                    <span>{INDONESIAN_MONTHS[month - 1]}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-48 overflow-y-auto p-1.5">
                    {INDONESIAN_MONTHS.map((m, idx) => (
                      <DropdownMenuItem
                        key={idx + 1}
                        onClick={() => setMonth(idx + 1)}
                        className="flex items-center justify-between"
                      >
                        <span>{m}</span>
                        {month === idx + 1 && <Check className="h-3.5 w-3.5 text-[#6C4EF5]" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-wider">
                  Tahun
                </Label>
                <DropdownMenu>
                  <DropdownMenuTrigger className="w-full h-12 inline-flex items-center justify-between px-3.5 rounded-2xl border border-black/[0.08] bg-[#F5F5F7] dark:bg-[#202028] dark:border-white/10 text-xs font-bold text-zinc-900 dark:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-all cursor-pointer outline-none">
                    <span>{year}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[var(--radix-dropdown-menu-trigger-width)] p-1.5">
                    {[2026, 2027, 2025].map((y) => (
                      <DropdownMenuItem
                        key={y}
                        onClick={() => setYear(y)}
                        className="flex items-center justify-between"
                      >
                        <span>{y}</span>
                        {year === y && <Check className="h-3.5 w-3.5 text-[#6C4EF5]" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full h-12 rounded-2xl bg-[#6C4EF5] hover:bg-[#5638D6] text-white font-bold text-sm shadow-md shadow-violet-500/25 cursor-pointer"
              >
                Simpan Anggaran
              </Button>
            </div>
          </form>
        )}
      </DrawerContent>
    </Drawer>
  );
}
