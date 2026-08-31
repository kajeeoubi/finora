"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFinora } from "@/context/finora-context";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Check,
  Moon,
  Sun,
  LogOut,
  Trash2,
  Loader2,
  FileSpreadsheet,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ExportImportDrawer } from "@/components/drawers/ExportImportDrawer";

export default function SettingsPage() {
  const router = useRouter();
  const {
    user,
    wallets,
    categories,
    transactions,
    transfers,
    budgets,
    wishlists,
    reminders,
    updateUser,
    logout,
    resetUserData,
  } = useFinora();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [isSaved, setIsSaved] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isExportImportModalOpen, setIsExportImportModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  useEffect(() => {
    setName(user.name);
    setEmail(user.email);
  }, [user]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("finora_theme");
      if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
        setIsDarkMode(true);
        document.documentElement.classList.add("dark");
      } else {
        setIsDarkMode(false);
        document.documentElement.classList.remove("dark");
      }
    }
  }, []);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("finora_theme", "light");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("finora_theme", "dark");
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

  // Reset seluruh data keuangan (semua dompet/kartu, kategori kustom, transaksi, transfer, budget, wishlist, reminder)
  const handleResetData = async () => {
    setIsResetting(true);
    setResetError(null);
    const res = await resetUserData();
    setIsResetting(false);

    if (res.success) {
      setIsResetDialogOpen(false);
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 5000);
    } else {
      setResetError(res.error || "Gagal melakukan reset data");
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

      {/* Export & Import Data Excel */}
      <div className="rounded-[28px] border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#16161C] p-6 shadow-sm space-y-4 transition-colors animate-card-enter stagger-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Export & Import Data
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                  Format Excel (.xlsx)
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Cadangkan seluruh data kategori, transaksi, kartu/dompet, anggaran, impian, dan pengingat, atau pulihkan data dari file Excel
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={() => setIsExportImportModalOpen(true)}
            className="h-11 rounded-2xl bg-[#6C4EF5] hover:bg-[#5638D6] text-white text-xs font-bold px-5 shadow-md shadow-violet-500/20 gap-2 cursor-pointer shrink-0"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Kelola Data (Excel)</span>
          </Button>
        </div>

        {/* Ringkasan status data */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-black/[0.04] dark:border-white/[0.06] text-center">
          <div className="p-2.5 rounded-2xl bg-[#F5F5F7] dark:bg-[#202028]">
            <span className="text-[10px] font-semibold text-zinc-500 block">Dompet/Kartu</span>
            <span className="text-xs font-extrabold text-zinc-900 dark:text-white">{wallets.length} Akun</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-[#F5F5F7] dark:bg-[#202028]">
            <span className="text-[10px] font-semibold text-zinc-500 block">Kategori</span>
            <span className="text-xs font-extrabold text-zinc-900 dark:text-white">{categories.length} Kategori</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-[#F5F5F7] dark:bg-[#202028]">
            <span className="text-[10px] font-semibold text-zinc-500 block">Transaksi</span>
            <span className="text-xs font-extrabold text-zinc-900 dark:text-white">{transactions.length} Transaksi</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-[#F5F5F7] dark:bg-[#202028]">
            <span className="text-[10px] font-semibold text-zinc-500 block">Total Item Data</span>
            <span className="text-xs font-extrabold text-violet-600 dark:text-violet-400">
              {wallets.length + categories.length + transactions.length + transfers.length + budgets.length + wishlists.length + reminders.length} Total
            </span>
          </div>
        </div>
      </div>

      {/* Reset Data */}
      <div className="rounded-[28px] border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#16161C] p-5 shadow-sm transition-colors animate-card-enter stagger-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-sm font-bold text-zinc-900 dark:text-white block">
            Reset Data
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Hapus seluruh dompet, transaksi, dan kategori kustom
          </span>
        </div>

        <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="h-11 rounded-2xl border-red-200 dark:border-red-950 bg-red-50/80 hover:bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/60 text-xs font-bold gap-2 cursor-pointer shrink-0"
            >
              <Trash2 className="h-4 w-4" />
              <span>Reset Data</span>
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md p-6 rounded-[28px] bg-white dark:bg-[#16161C] border border-black/[0.08] dark:border-white/10 shadow-2xl">
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-base font-bold text-zinc-900 dark:text-white">
                Reset Data
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Seluruh dompet, transaksi, transfer, anggaran, impian, dan pengingat akan dihapus permanen. Akun tetap tersimpan.
              </DialogDescription>
            </DialogHeader>

            {resetError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-semibold text-center">
                {resetError}
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={isResetting}
                onClick={() => setIsResetDialogOpen(false)}
                className="flex-1 h-11 rounded-2xl bg-[#F5F5F7] dark:bg-[#202028] border-black/[0.08] dark:border-white/10 text-zinc-700 dark:text-zinc-300 font-bold text-xs hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="button"
                disabled={isResetting}
                onClick={handleResetData}
                className="flex-1 h-11 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs gap-1.5 shadow-md shadow-red-600/30 cursor-pointer"
              >
                {isResetting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Mereset...</span>
                  </>
                ) : (
                  <span>Hapus Data</span>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {resetSuccess && (
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Check className="h-4 w-4 shrink-0" />
          <span>Data berhasil direset</span>
        </div>
      )}

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

      {/* Drawer Export & Import Data Excel */}
      <ExportImportDrawer
        open={isExportImportModalOpen}
        onOpenChange={setIsExportImportModalOpen}
      />
    </div>
  );
}
