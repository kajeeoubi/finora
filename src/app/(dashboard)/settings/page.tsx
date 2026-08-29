"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFinora } from "@/context/finora-context";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  User,
  RotateCcw,
  Globe,
  Check,
  Moon,
  Sun,
  LogOut,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const {
    user,
    categories,
    updateUser,
    resetToDefaultData,
    logout,
  } = useFinora();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [isSaved, setIsSaved] = useState(false);
  const [isResetDone, setIsResetDone] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setName(user.name);
    setEmail(user.email);
  }, [user]);

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

  const getUserInitials = (userName: string) => {
    if (!userName) return "FN";
    const parts = userName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Simpan perubahan profil
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name: name.trim() || user.name,
      email: email.trim() || user.email,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleReset = () => {
    if (
      window.confirm(
        "Apakah Anda yakin ingin mengembalikan seluruh data ke nilai awal bawaan?"
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
          Kelola profil pengguna dan pengaturan sistem
        </p>
      </div>

      {/* Kartu Profil Pengguna */}
      <div className="rounded-[28px] border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#16161C] p-6 shadow-sm space-y-5 transition-colors animate-card-enter stagger-1">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
          Profil Pengguna
        </h3>

        {/* Avatar Inisial Nama */}
        <div className="flex items-center gap-4 pb-1">
          <div className="h-16 w-16 rounded-full bg-[#6C4EF5] text-white flex items-center justify-center text-xl font-black shadow-md shadow-violet-600/20 ring-4 ring-violet-500/10 shrink-0 select-none">
            {getUserInitials(name || user.name)}
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h4 className="text-lg font-extrabold text-zinc-900 dark:text-white">
                {name || user.name}
              </h4>
              <span className="px-2.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950/70 text-violet-700 dark:text-violet-300 text-[10px] font-bold">
                Akun Aktif
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {email || user.email}
            </p>
          </div>
        </div>

        {/* Formulir Ubah Nama & Email */}
        <form
          onSubmit={handleSaveProfile}
          className="space-y-3.5 pt-2 border-t border-black/[0.04] dark:border-white/[0.06]"
        >
          <div className="space-y-1">
            <Label className="text-xs text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-wider">
              Nama Lengkap
            </Label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tulis nama lengkap..."
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
              placeholder="Tulis alamat email..."
              className="w-full h-12 rounded-2xl bg-[#F5F5F7] dark:bg-[#202028] text-zinc-900 dark:text-white border border-black/[0.08] dark:border-white/10 px-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-600 transition-all"
            />
          </div>

          <div className="pt-2 flex items-center gap-3">
            <Button
              type="submit"
              className="h-11 rounded-2xl bg-[#6C4EF5] hover:bg-[#5638D6] text-white text-xs font-bold px-6 shadow-md shadow-violet-500/25 cursor-pointer"
            >
              {isSaved ? "Tersimpan" : "Perbarui Profil"}
            </Button>
            {isSaved && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <Check className="h-3.5 w-3.5" /> Profil berhasil diperbarui
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Preferensi & Tema */}
      <div className="rounded-[28px] border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#16161C] p-6 shadow-sm space-y-4 transition-colors animate-card-enter stagger-2">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
          Preferensi Sistem
        </h3>

        <div className="divide-y divide-black/[0.06] dark:divide-white/[0.08] text-xs">
          {/* Pilihan Tema */}
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

          {/* Kategori Keuangan */}
          <div className="flex items-center justify-between py-3.5">
            <div>
              <span className="font-bold block text-zinc-900 dark:text-white text-sm">
                Kategori Keuangan
              </span>
              <span className="text-zinc-500 dark:text-zinc-400">
                Kelola kategori transaksi dan batasan
              </span>
            </div>
            <Link
              href="/categories"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#F5F5F7] dark:bg-[#202028] border border-black/[0.06] dark:border-white/10 font-bold text-xs text-foreground hover:bg-muted active:scale-95 transition-all cursor-pointer"
            >
              <span>{categories.length} Kategori</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Reset Data Bawaan & Keluar */}
      <div className="rounded-[28px] border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/25 p-6 space-y-3 transition-colors animate-card-enter stagger-3">
        <div className="text-amber-800 dark:text-amber-300 font-extrabold text-sm">
          Reset Data Bawaan
        </div>
        <p className="text-xs text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
          Kembalikan seluruh data transaksi, saldo dompet, dan batas anggaran ke nilai awal bawaan.
        </p>
        <Button
          onClick={handleReset}
          variant="outline"
          className="h-11 rounded-2xl border-amber-300 bg-white text-amber-800 hover:bg-amber-100 text-xs font-bold dark:bg-amber-900/80 dark:text-white dark:border-amber-700/80 cursor-pointer"
        >
          {isResetDone ? "Data Telah Direset" : "Reset ke Data Awal"}
        </Button>
      </div>

      {/* Tombol Keluar Akun */}
      <div className="rounded-[28px] border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#16161C] p-5 shadow-sm transition-colors animate-card-enter stagger-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-sm font-bold text-zinc-900 dark:text-white block">
            Keluar dari Finora
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Kunci kembali akses aplikasi dan kembali ke halaman masuk
          </span>
        </div>
        <Button
          onClick={() => {
            logout();
            router.replace("/login");
          }}
          variant="outline"
          className="h-11 rounded-2xl border-red-200 dark:border-red-950 bg-red-50/80 hover:bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/60 text-xs font-bold gap-2 cursor-pointer shrink-0"
        >
          <LogOut className="h-4 w-4" />
          <span>Keluar Akun</span>
        </Button>
      </div>
    </div>
  );
}
