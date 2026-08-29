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
import { formatDateIndo } from "@/lib/formatters";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { AlertCircle, Check, Calendar as CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function AddWishlistDrawer() {
  const { isAddWishlistModalOpen, setIsAddWishlistModalOpen, addWishlistItem } =
    useFinora();

  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [savedAmount, setSavedAmount] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [note, setNote] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Nama impian wajib diisi");
      return;
    }

    const cleanTarget = Number(targetAmount.replace(/\D/g, ""));
    if (!cleanTarget || cleanTarget <= 0) {
      setErrorMsg("Target dana harus lebih dari Rp 0");
      return;
    }

    const cleanSaved = Number(savedAmount.replace(/\D/g, "")) || 0;

    const res = addWishlistItem({
      name: name.trim(),
      targetAmount: cleanTarget,
      savedAmount: cleanSaved,
      targetDate: selectedDate ? selectedDate.toISOString() : undefined,
      note: note.trim() || undefined,
    });

    if (res.success) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsAddWishlistModalOpen(false);
        setName("");
        setTargetAmount("");
        setSavedAmount("");
        setSelectedDate(undefined);
        setNote("");
      }, 700);
    } else {
      setErrorMsg(res.error || "Gagal membuat wishlist");
    }
  };

  return (
    <Drawer
      open={isAddWishlistModalOpen}
      onOpenChange={setIsAddWishlistModalOpen}
    >
      <DrawerContent>
        <DrawerHeader className="p-0 text-left pb-1">
          <DrawerTitle className="text-base sm:text-lg font-black text-zinc-900 dark:text-white">
            Tambah Wishlist
          </DrawerTitle>
        </DrawerHeader>

        {isSuccess ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="h-16 w-16 rounded-full bg-[#DCFCE7] dark:bg-emerald-950/60 flex items-center justify-center text-[#15803D] dark:text-emerald-400 animate-bounce">
              <Check className="h-8 w-8" />
            </div>
            <h4 className="text-lg font-bold text-zinc-900 dark:text-white">
              Wishlist Tersimpan!
            </h4>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 pt-2">
            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-red-50 text-red-700 text-xs font-bold border border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Nama Impian */}
            <div className="space-y-1">
              <Label className="text-xs text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-wider">
                Nama Wishlist
              </Label>
              <input
                type="text"
                placeholder="Tulis nama wishlist..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 rounded-2xl bg-[#F5F5F7] dark:bg-[#202028] text-zinc-900 dark:text-white border border-black/[0.08] dark:border-white/10 px-4 text-base sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
            </div>

            {/* Target Dana & Dana Terkumpul Awal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-wider">
                  Target Dana
                </Label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-zinc-400">
                    Rp
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Tulis target nominal dana..."
                    value={
                      targetAmount
                        ? Number(
                            targetAmount.replace(/\D/g, "")
                          ).toLocaleString("id-ID")
                        : ""
                    }
                    onChange={(e) =>
                      setTargetAmount(e.target.value.replace(/\D/g, ""))
                    }
                    className="w-full h-11 pl-10 pr-4 rounded-2xl bg-[#F5F5F7] dark:bg-[#202028] text-zinc-900 dark:text-white border border-black/[0.08] dark:border-white/10 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-600 tabular-nums"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-wider">
                  Dana Terkumpul Saat Ini
                </Label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-zinc-400">
                    Rp
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={
                      savedAmount
                        ? Number(
                            savedAmount.replace(/\D/g, "")
                          ).toLocaleString("id-ID")
                        : ""
                    }
                    onChange={(e) =>
                      setSavedAmount(e.target.value.replace(/\D/g, ""))
                    }
                    className="w-full h-11 pl-10 pr-4 rounded-2xl bg-[#F5F5F7] dark:bg-[#202028] text-zinc-900 dark:text-white border border-black/[0.08] dark:border-white/10 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-600 tabular-nums"
                  />
                </div>
              </div>
            </div>

            {/* Target Tanggal (Calendar Component) & Catatan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-wider">
                  Target Tanggal Tercapai
                </Label>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "w-full h-11 px-3.5 rounded-2xl bg-[#F5F5F7] dark:bg-[#202028] text-zinc-900 dark:text-white border border-black/[0.08] dark:border-white/10 text-xs font-semibold flex items-center justify-between hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-all cursor-pointer",
                        !selectedDate && "text-zinc-400 dark:text-zinc-500"
                      )}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <CalendarIcon className="h-4 w-4 text-[#6C4EF5] shrink-0" />
                        <span className="truncate">
                          {selectedDate
                            ? formatDateIndo(selectedDate.toISOString())
                            : "Pilih tanggal target"}
                        </span>
                      </span>
                      {selectedDate && (
                        <span
                          role="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDate(undefined);
                          }}
                          className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-red-500 transition-colors"
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
                    <Calendar
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

              <div className="space-y-1">
                <Label className="text-xs text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-wider">
                  Catatan (Opsional)
                </Label>
                <input
                  type="text"
                  placeholder="Tulis catatan atau motivasi..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full h-11 px-4 rounded-2xl bg-[#F5F5F7] dark:bg-[#202028] text-zinc-900 dark:text-white border border-black/[0.08] dark:border-white/10 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-600"
                />
              </div>
            </div>

            <div className="pt-2 pb-1">
              <Button
                type="submit"
                className="w-full h-11 rounded-2xl bg-[#6C4EF5] hover:bg-[#5638D6] text-white font-bold text-sm shadow-md shadow-violet-500/25 cursor-pointer"
              >
                Simpan Target Impian
              </Button>
            </div>
          </form>
        )}
      </DrawerContent>
    </Drawer>
  );
}
