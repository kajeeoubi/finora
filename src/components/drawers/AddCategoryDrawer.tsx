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
import { CategoryType } from "@/types";
import { CategoryIcon, ICON_MAP } from "@/components/shared/CategoryIcon";
import { AlertCircle, Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const AVAILABLE_ICONS = Object.keys(ICON_MAP).filter(
  (k) => k !== "ArrowRightLeft"
);

const AVAILABLE_COLORS = [
  "#6C4EF5",
  "#22C55E",
  "#F59E0B",
  "#EF4444",
  "#0EA5E9",
  "#A855F7",
  "#EC4899",
  "#64748B",
];

export function AddCategoryDrawer() {
  const { isAddCategoryModalOpen, setIsAddCategoryModalOpen, addCategory } =
    useFinora();

  const [name, setName] = useState("");
  const [type, setType] = useState<CategoryType>("EXPENSE");
  const [icon, setIcon] = useState("Utensils");
  const [color, setColor] = useState("#6C4EF5");
  const [iconSearch, setIconSearch] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const filteredIcons = AVAILABLE_ICONS.filter((iconKey) =>
    iconKey.toLowerCase().includes(iconSearch.toLowerCase().trim())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Nama kategori wajib diisi");
      return;
    }

    const res = addCategory({
      name: name.trim(),
      type,
      icon,
      color,
    });

    if (res.success) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsAddCategoryModalOpen(false);
        setName("");
        setIconSearch("");
      }, 700);
    } else {
      setErrorMsg(res.error || "Gagal membuat kategori");
    }
  };

  return (
    <Drawer
      open={isAddCategoryModalOpen}
      onOpenChange={setIsAddCategoryModalOpen}
    >
      <DrawerContent>
        <DrawerHeader className="p-0 text-left pb-1">
          <DrawerTitle className="text-base sm:text-lg font-black text-zinc-900 dark:text-white">
            Tambah Kategori Baru
          </DrawerTitle>
        </DrawerHeader>

        {isSuccess ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="h-16 w-16 rounded-full bg-[#DCFCE7] dark:bg-emerald-950/60 flex items-center justify-center text-[#15803D] dark:text-emerald-400 animate-bounce">
              <Check className="h-8 w-8" />
            </div>
            <h4 className="text-lg font-bold text-zinc-900 dark:text-white">
              Kategori Tersimpan!
            </h4>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
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
                onClick={() => setType("EXPENSE")}
                className={cn(
                  "py-2 text-xs font-bold rounded-xl transition-all cursor-pointer",
                  type === "EXPENSE"
                    ? "bg-white text-[#EF4444] shadow-sm dark:bg-[#16161C] dark:text-rose-400"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                )}
              >
                Pengeluaran
              </button>
              <button
                type="button"
                onClick={() => setType("INCOME")}
                className={cn(
                  "py-2 text-xs font-bold rounded-xl transition-all cursor-pointer",
                  type === "INCOME"
                    ? "bg-white text-[#22C55E] shadow-sm dark:bg-[#16161C] dark:text-emerald-400"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                )}
              >
                Pemasukan
              </button>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-wider">
                Nama Kategori
              </Label>
              <input
                type="text"
                placeholder="Tulis nama kategori..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 rounded-2xl bg-[#F5F5F7] dark:bg-[#202028] text-zinc-900 dark:text-white border border-black/[0.08] dark:border-white/10 px-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-600"
                autoFocus
              />
            </div>

            {/* Icon Picker with Bounded Scrollable Container */}
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-wider block">
                Pilih Ikon ({filteredIcons.length})
              </Label>

              {/* Search Bar for Icons */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Cari ikon..."
                  value={iconSearch}
                  onChange={(e) => setIconSearch(e.target.value)}
                  className="w-full pl-9 pr-3 h-9 rounded-xl bg-[#F5F5F7] dark:bg-[#202028] text-xs font-semibold text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-violet-600 border border-black/[0.04] dark:border-white/10"
                />
              </div>

              {/* Explicit Bounded Scroll Box with Clean Single Border on Selected Icon */}
              <div className="border border-black/[0.08] dark:border-white/10 bg-[#F5F5F7] dark:bg-[#202028] rounded-2xl p-2.5 h-48 overflow-y-auto overscroll-contain">
                <div className="grid grid-cols-6 sm:grid-cols-7 gap-2">
                  {filteredIcons.length === 0 ? (
                    <div className="col-span-full py-6 text-center text-xs text-muted-foreground">
                      Ikon tidak ditemukan
                    </div>
                  ) : (
                    filteredIcons.map((iconKey) => {
                      const isSelected = icon === iconKey;
                      return (
                        <button
                          key={iconKey}
                          type="button"
                          onClick={() => setIcon(iconKey)}
                          className={cn(
                            "flex items-center justify-center h-10 w-10 rounded-xl transition-all cursor-pointer mx-auto",
                            isSelected
                              ? "scale-105 border-2 shadow-sm"
                              : "border border-transparent opacity-70 hover:opacity-100 hover:scale-105"
                          )}
                          style={
                            isSelected
                              ? {
                                  borderColor: color,
                                  backgroundColor: `${color}20`,
                                }
                              : {
                                  backgroundColor: `${color}10`,
                                }
                          }
                          title={iconKey}
                        >
                          <CategoryIcon
                            iconName={iconKey}
                            size="sm"
                            bgColor="transparent"
                            iconColor={color}
                          />
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Accent Color Picker without clipping */}
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-wider block">
                Pilih Warna Aksen
              </Label>
              <div className="flex items-center gap-3 py-2 px-1">
                {AVAILABLE_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={cn(
                      "h-7 w-7 rounded-full transition-all cursor-pointer shrink-0 flex items-center justify-center",
                      color === c
                        ? "ring-2 ring-offset-2 dark:ring-offset-[#16161C] scale-110"
                        : "hover:scale-105 opacity-80 hover:opacity-100"
                    )}
                    style={{
                      backgroundColor: c,
                      ...(color === c ? { boxShadow: `0 0 0 2px ${c}` } : {}),
                    }}
                  >
                    {color === c && (
                      <Check className="h-3.5 w-3.5 text-white stroke-[3]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-1.5 pb-1">
              <Button
                type="submit"
                className="w-full h-11 rounded-2xl bg-[#6C4EF5] hover:bg-[#5638D6] text-white font-bold text-sm shadow-md shadow-violet-500/25 cursor-pointer"
              >
                Buat Kategori
              </Button>
            </div>
          </form>
        )}
      </DrawerContent>
    </Drawer>
  );
}
