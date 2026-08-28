"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useFinora } from "@/context/finora-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  User,
  RotateCcw,
  Globe,
  Check,
  Moon,
  Sun,
} from "lucide-react";

export default function SettingsPage() {
  const {
    user,
    categories,
    resetToDefaultData,
  } = useFinora();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [isSaved, setIsSaved] = useState(false);
  const [isResetDone, setIsResetDone] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    }
  }, []);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleReset = () => {
    if (
      window.confirm(
        "Apakah Anda yakin ingin mengembalikan seluruh data ke data demo PRD (Saldo Rp7.250.000, 4 dompet, transaksi awal)?"
      )
    ) {
      resetToDefaultData();
      setIsResetDone(true);
      setTimeout(() => setIsResetDone(false), 2500);
    }
  };

  return (
    <div className="w-full space-y-5">
      <div className="animate-card-enter">
        <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
          Pengaturan
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Kelola profil pengguna, tema tampilan dan data Finora
        </p>
      </div>

      {/* Profile Card */}
      <div className="rounded-[28px] border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#16161C] p-6 shadow-sm space-y-5 transition-colors animate-card-enter stagger-1">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <User className="h-4 w-4 text-[#6C4EF5]" />
          <span>Profil Pengguna</span>
        </h3>

        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 ring-2 ring-violet-600/30">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback className="text-base font-bold text-violet-700 dark:text-violet-300">
              AS
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="text-lg font-extrabold text-zinc-900 dark:text-white">
              {user.name}
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {user.email}
            </p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950/70 text-violet-700 dark:text-violet-300 text-[10px] font-bold">
              Akun Aktif
            </span>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-3.5 pt-1">
          <div className="space-y-1">
            <Label className="text-xs text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-wider">
              Nama Lengkap
            </Label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-12 rounded-2xl bg-[#F5F5F7] dark:bg-[#202028] text-zinc-900 dark:text-white border border-black/[0.08] dark:border-white/10 px-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-600 transition-all"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-wider">
              Alamat Email
            </Label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 rounded-2xl bg-[#F5F5F7] dark:bg-[#202028] text-zinc-900 dark:text-white border border-black/[0.08] dark:border-white/10 px-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-600 transition-all"
            />
          </div>

          <div className="pt-1 flex items-center gap-3">
            <Button
              type="submit"
              className="h-11 rounded-2xl bg-[#6C4EF5] hover:bg-[#5638D6] text-white text-xs font-bold px-6 shadow-md shadow-violet-500/25 cursor-pointer"
            >
              {isSaved ? "Tersimpan ✓" : "Perbarui Profil"}
            </Button>
            {isSaved && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <Check className="h-3.5 w-3.5" /> Tersimpan
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Preferences & Theme Card */}
      <div className="rounded-[28px] border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#16161C] p-6 shadow-sm space-y-4 transition-colors animate-card-enter stagger-2">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <Globe className="h-4 w-4 text-[#6C4EF5]" />
          <span>Preferensi Tampilan & Sistem</span>
        </h3>

        <div className="divide-y divide-black/[0.06] dark:divide-white/[0.08] text-xs">
          {/* Dark Mode Switch */}
          <div className="flex items-center justify-between py-3.5">
            <div>
              <span className="font-bold block text-zinc-900 dark:text-white text-sm">
                Tema Tampilan
              </span>
              <span className="text-zinc-500 dark:text-zinc-400">
                {isDarkMode ? "Mode Gelap" : "Mode Terang"}
              </span>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#F5F5F7] dark:bg-[#202028] border border-black/[0.06] dark:border-white/10 font-bold text-xs text-foreground hover:bg-muted active:scale-95 transition-all cursor-pointer"
            >
              {isDarkMode ? (
                <>
                  <Sun className="h-4 w-4 text-amber-400" />
                  <span>Terang</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-zinc-600" />
                  <span>Gelap</span>
                </>
              )}
            </button>
          </div>

          {/* Menu Kategori Keuangan */}
          <div className="flex items-center justify-between py-3.5">
            <div>
              <span className="font-bold block text-zinc-900 dark:text-white text-sm">
                Kategori Keuangan
              </span>
              <span className="text-zinc-500 dark:text-zinc-400">
                Kelola {categories.length} kategori pemasukan dan pengeluaran
              </span>
            </div>
            <Link
              href="/categories"
              className="font-bold text-zinc-800 dark:text-zinc-200 bg-[#F5F5F7] dark:bg-[#202028] px-3.5 py-1.5 rounded-xl text-xs border border-black/[0.04] dark:border-white/10 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              Kelola
            </Link>
          </div>


          <div className="flex items-center justify-between py-3.5">
            <div>
              <span className="font-bold block text-zinc-900 dark:text-white text-sm">
                Bahasa Tampilan
              </span>
              <span className="text-zinc-500 dark:text-zinc-400">
                Bahasa Indonesia (ID)
              </span>
            </div>
            <span className="font-bold text-zinc-800 dark:text-zinc-200 bg-[#F5F5F7] dark:bg-[#202028] px-3.5 py-1.5 rounded-xl text-xs">
              Indonesia
            </span>
          </div>
        </div>
      </div>

      {/* Reset Data Card */}
      <div className="rounded-[28px] border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/25 p-6 space-y-3 transition-colors animate-card-enter stagger-3">
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-extrabold text-sm">
          <RotateCcw className="h-4 w-4" />
          <span>Reset Data Demo PRD</span>
        </div>
        <p className="text-xs text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
          Kembalikan seluruh data transaksi, saldo dompet, dan batas anggaran ke nilai awal PRD §10 & §15.
        </p>
        <Button
          onClick={handleReset}
          variant="outline"
          className="h-11 rounded-2xl border-amber-300 bg-white text-amber-800 hover:bg-amber-100 text-xs font-bold dark:bg-amber-900/80 dark:text-white dark:border-amber-700/80 cursor-pointer"
        >
          {isResetDone ? "Data Telah Direset! ✓" : "Reset ke Data Default PRD"}
        </Button>
      </div>
    </div>
  );
}
