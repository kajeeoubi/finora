"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  Search,
  Bell,
  Moon,
  Sun,
  RotateCcw,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFinora } from "@/context/finora-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
}

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  const pathname = usePathname();
  const { user, resetToDefaultData } = useFinora();
  const [hasNotifications, setHasNotifications] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    }
  };

  const getPageTitle = () => {
    if (title) return title;
    if (pathname === "/dashboard") return "Beranda";
    if (pathname === "/reports") return "Analitik";
    if (pathname === "/wallets") return "Dompet";
    if (pathname === "/transactions") return "Riwayat Transaksi";
    if (pathname === "/budgets") return "Anggaran Bulanan";
    if (pathname === "/planning") return "Rencana Keuangan";
    if (pathname === "/reminders") return "Pengingat Tagihan";
    if (pathname === "/categories") return "Kategori";
    if (pathname === "/settings") return "Pengaturan";
    return "Finora";
  };

  const isDashboard = pathname === "/dashboard";

  const getUserInitials = (name: string) => {
    if (!name) return "FN";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const userInitials = getUserInitials(user.name);

  return (
    <header className="w-full px-4 pt-4 pb-2">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        {/* Left Side: Menu Drawer Trigger */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-white dark:bg-[#16161C] border border-black/[0.06] dark:border-white/[0.08] text-foreground shadow-sm hover:bg-muted active:scale-95 transition-all cursor-pointer"
                  >
                    <Menu className="h-5 w-5 text-foreground" />
                  </button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Menu Navigasi
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="start" className="w-56 p-2 rounded-2xl">
              <DropdownMenuLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Menu Finora
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="cursor-pointer font-semibold text-sm">
                  Beranda
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/reports" className="cursor-pointer font-semibold text-sm">
                  Analitik & Laporan
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/transactions" className="cursor-pointer font-semibold text-sm">
                  Riwayat Transaksi
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/wallets" className="cursor-pointer font-semibold text-sm">
                  Dompet & Rekening
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/budgets" className="cursor-pointer font-semibold text-sm">
                  Anggaran Bulanan
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/planning" className="cursor-pointer font-semibold text-sm">
                  Rencana Keuangan
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/reminders" className="cursor-pointer font-semibold text-sm">
                  Pengingat Tagihan
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/categories" className="cursor-pointer font-semibold text-sm">
                  Kategori
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer font-semibold text-sm">
                  Pengaturan
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Center Title when not on Dashboard (e.g. "Analytic", "Dompet") */}
        {!isDashboard && (
          <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white tracking-tight">
            {getPageTitle()}
          </h2>
        )}

        {/* Right Side: Theme Toggle, Search, Notification & Avatar */}
        <div className="flex items-center gap-2">
          {/* Theme switcher */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={toggleTheme}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white dark:bg-[#16161C] border border-black/[0.06] dark:border-white/[0.08] text-foreground shadow-sm hover:bg-muted active:scale-95 transition-all cursor-pointer"
              >
                {isDarkMode ? (
                  <Sun className="h-4 w-4 text-amber-400" />
                ) : (
                  <Moon className="h-4 w-4 text-zinc-600" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {isDarkMode ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
            </TooltipContent>
          </Tooltip>

          {/* Search button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/transactions"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white dark:bg-[#16161C] border border-black/[0.06] dark:border-white/[0.08] text-foreground shadow-sm hover:bg-muted active:scale-95 transition-all cursor-pointer"
              >
                <Search className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Cari Transaksi
            </TooltipContent>
          </Tooltip>

          {/* Notification Bell */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white dark:bg-[#16161C] border border-black/[0.06] dark:border-white/[0.08] text-foreground shadow-sm hover:bg-muted active:scale-95 transition-all cursor-pointer"
                  >
                    <Bell className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
                    {hasNotifications && (
                      <span className="absolute top-2.5 right-2.5 h-2.5 w-2.5 rounded-full bg-[#EF4444] ring-2 ring-white dark:ring-[#16161C]" />
                    )}
                  </button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Pemberitahuan
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="w-72 p-3 rounded-2xl">
              <DropdownMenuLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Pemberitahuan Finora
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="space-y-2 text-xs py-1">
                <div className="p-3 rounded-2xl bg-violet-50 dark:bg-violet-950/40 border border-violet-100 dark:border-violet-900/50">
                  <p className="font-bold text-violet-700 dark:text-violet-300">
                    Target Anggaran Makanan
                  </p>
                  <p className="text-muted-foreground mt-1 leading-relaxed">
                    Pengeluaran kategori Food & Drink telah mencapai 75% (Rp750.000 dari Rp1.000.000).
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-[#F4F4F6] dark:bg-[#202028]">
                  <p className="font-bold text-foreground">
                    Gaji Pokok Masuk
                  </p>
                  <p className="text-muted-foreground mt-1 leading-relaxed">
                    Pemasukan Rp6.000.000 telah ditambahkan ke saldo BCA Main Account.
                  </p>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile Avatar */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="h-11 w-11 rounded-full bg-[#6C4EF5] hover:bg-[#5638D6] text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-violet-600/20 hover:ring-violet-600 transition-all cursor-pointer ml-1 select-none"
                  >
                    {userInitials}
                  </button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Profil Pengguna
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="w-60 p-2 rounded-2xl">
              <div className="flex items-center gap-3 p-2">
                <div className="h-10 w-10 rounded-full bg-[#6C4EF5] text-white flex items-center justify-center font-bold text-sm shrink-0 select-none">
                  {userInitials}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                    {user.name}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                    {user.email}
                  </span>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="cursor-pointer font-medium">
                  Beranda
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/wallets" className="cursor-pointer font-medium">
                  Dompet
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/budgets" className="cursor-pointer font-medium">
                  Anggaran
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/planning" className="cursor-pointer font-medium">
                  Rencana & Wishlist
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/categories" className="cursor-pointer font-medium">
                  Kategori
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer font-medium">
                  Pengaturan
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={resetToDefaultData}
                className="text-amber-600 dark:text-amber-400 focus:text-amber-700 cursor-pointer flex items-center gap-2 font-medium"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Data Demo PRD</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Headline on Dashboard: "Selamat Datang, Adit 👋" (Matching Welcome Adit🔥 in mockup) */}
      {isDashboard && (
        <div className="pt-3 pb-1">
          <h2 className="text-[28px] font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-1.5">
            Selamat Datang, {user.name.split(" ")[0]} <span>👋</span>
          </h2>
        </div>
      )}
    </header>
  );
}
