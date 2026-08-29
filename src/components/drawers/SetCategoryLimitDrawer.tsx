"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useFinora } from "@/context/finora-context";
import { CategoryIcon } from "@/components/shared/CategoryIcon";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Check } from "lucide-react";

export function SetCategoryLimitDrawer() {
  const {
    limitCategoryData,
    setLimitCategoryData,
    categories,
    updateCategory,
    addBudget,
  } = useFinora();

  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === "EXPENSE"),
    [categories]
  );

  const [selectedCatId, setSelectedCatId] = useState("");
  const [limitAmountStr, setLimitAmountStr] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const isEditMode = Boolean(limitCategoryData?.categoryId);

  // Inisialisasi state saat drawer dibuka
  useEffect(() => {
    if (limitCategoryData) {
      const defaultId =
        limitCategoryData.categoryId || expenseCategories[0]?.id || "";
      setSelectedCatId(defaultId);
      setLimitAmountStr(
        limitCategoryData.initialLimit
          ? limitCategoryData.initialLimit.toString()
          : ""
      );
      setErrorMsg("");
    }
  }, [limitCategoryData]);

  const selectedCategory = expenseCategories.find((c) => c.id === selectedCatId) || expenseCategories[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = selectedCatId || selectedCategory?.id;
    if (!targetId) {
      setErrorMsg("Pilih kategori pengeluaran");
      return;
    }

    const cleanLimit = Number(limitAmountStr.replace(/\D/g, ""));
    if (!cleanLimit || cleanLimit <= 0) {
      setErrorMsg("Nominal batasan harus lebih dari Rp 0");
      return;
    }

    // 1. Update expenseLimit on category
    updateCategory(targetId, { expenseLimit: cleanLimit });

    // 2. Sync to budget model for current month
    const now = new Date();
    addBudget({
      categoryId: targetId,
      amount: cleanLimit,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    });

    setLimitCategoryData(null);
    setSelectedCatId("");
    setLimitAmountStr("");
    setErrorMsg("");
  };

  return (
    <Drawer
      open={!!limitCategoryData}
      onOpenChange={(open) => {
        if (!open) {
          setLimitCategoryData(null);
          setSelectedCatId("");
          setLimitAmountStr("");
          setErrorMsg("");
        }
      }}
    >
      <DrawerContent>
        <DrawerHeader className="p-0 text-left pb-1">
          <DrawerTitle className="text-base sm:text-lg font-black text-zinc-900 dark:text-white">
            {isEditMode ? "Ubah Batasan Pengeluaran" : "Tambah Batasan Pengeluaran"}
          </DrawerTitle>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {isEditMode
              ? `Sesuaikan nominal batas maksimal ${selectedCategory?.name || "kategori"}`
              : "Tentukan batas maksimal belanja bulanan pada kategori pilihan"}
          </p>
        </DrawerHeader>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 text-xs font-bold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Pilihan Kategori */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider block">
              Kategori Pengeluaran
            </label>

            {isEditMode ? (
              <div className="w-full h-12 flex items-center justify-between px-4 rounded-2xl border border-black/[0.08] bg-[#F5F5F7] dark:bg-[#202028] dark:border-white/10 text-sm font-bold text-zinc-900 dark:text-white opacity-85 select-none">
                <div className="flex items-center gap-2.5">
                  <CategoryIcon
                    iconName={selectedCategory?.icon}
                    size="sm"
                    bgColor={
                      selectedCategory?.color
                        ? `${selectedCategory.color}20`
                        : undefined
                    }
                    iconColor={selectedCategory?.color || undefined}
                  />
                  <span>{selectedCategory?.name}</span>
                </div>
              </div>
            ) : (
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
                      <span className="text-zinc-400 font-normal">Pilih Kategori...</span>
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-60 overflow-y-auto p-1.5"
                >
                  {expenseCategories.map((c) => {
                    const isSelected = (selectedCatId || selectedCategory?.id) === c.id;
                    return (
                      <DropdownMenuItem
                        key={c.id}
                        onSelect={() => {
                          setSelectedCatId(c.id);
                          setErrorMsg("");
                        }}
                        className="flex items-center justify-between py-2 cursor-pointer font-bold"
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
                        {isSelected && <Check className="h-4 w-4 text-[#6C4EF5]" />}
                      </DropdownMenuItem>
                    );
                  })}
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
                onChange={(e) => {
                  setLimitAmountStr(e.target.value.replace(/\D/g, ""));
                  setErrorMsg("");
                }}
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
  );
}
