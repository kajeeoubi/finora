"use client";

import React, { useState, useMemo } from "react";
import { useFinora } from "@/context/finora-context";
import { formatIDR, formatDateIndo } from "@/lib/formatters";
import { CategoryIcon } from "@/components/shared/CategoryIcon";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Trash2,
  CheckCircle2,
  Calendar,
  ChevronDown,
  Check,
  Clock,
  AlertTriangle,
  Wallet as WalletIcon,
  RotateCcw,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BillReminder } from "@/types";

type FilterTab = "ALL" | "UNPAID" | "PAID";

export default function RemindersPage() {
  const {
    reminders,
    categories,
    wallets,
    setIsAddReminderModalOpen,
    deleteReminder,
    payReminder,
    unpayReminder,
  } = useFinora();

  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");

  // State for Quick Pay Drawer
  const [payingReminderId, setPayingReminderId] = useState<string | null>(null);
  const [payWalletId, setPayWalletId] = useState<string>("");
  const [payError, setPayError] = useState("");

  // Stats calculation
  const totalUnpaid = useMemo(() => {
    return reminders
      .filter((r) => !r.isPaid)
      .reduce((sum, r) => sum + r.amount, 0);
  }, [reminders]);

  const countUnpaid = useMemo(() => {
    return reminders.filter((r) => !r.isPaid).length;
  }, [reminders]);

  const totalPaid = useMemo(() => {
    return reminders
      .filter((r) => r.isPaid)
      .reduce((sum, r) => sum + r.amount, 0);
  }, [reminders]);

  const countPaid = useMemo(() => {
    return reminders.filter((r) => r.isPaid).length;
  }, [reminders]);

  // Nearest upcoming unpaid reminder
  const nearestUpcoming = useMemo(() => {
    const unpaid = reminders.filter((r) => !r.isPaid);
    if (unpaid.length === 0) return null;
    const sorted = [...unpaid].sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
    return sorted[0];
  }, [reminders]);

  // Filtered Reminders
  const filteredReminders = useMemo(() => {
    let list = [...reminders];
    if (activeTab === "UNPAID") {
      list = list.filter((r) => !r.isPaid);
    } else if (activeTab === "PAID") {
      list = list.filter((r) => r.isPaid);
    }

    // Sort: Unpaid first sorted by dueDate ascending, then Paid
    return list.sort((a, b) => {
      if (a.isPaid !== b.isPaid) {
        return a.isPaid ? 1 : -1;
      }
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [reminders, activeTab]);

  // Helper to determine due date urgency
  const getDueStatus = (dueDateStr: string, isPaid: boolean) => {
    if (isPaid) {
      return {
        label: "Lunas",
        color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300",
        icon: CheckCircle2,
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);

    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        label: `Terlewat ${Math.abs(diffDays)} hari`,
        color: "bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300",
        icon: AlertTriangle,
      };
    }
    if (diffDays === 0) {
      return {
        label: "Jatuh Tempo Hari Ini",
        color: "bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300",
        icon: Clock,
      };
    }
    if (diffDays <= 3) {
      return {
        label: `${diffDays} hari lagi`,
        color: "bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300",
        icon: Clock,
      };
    }
    return {
      label: `${diffDays} hari lagi`,
      color: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
      icon: Clock,
    };
  };

  const handleOpenPay = (reminder: BillReminder) => {
    setPayingReminderId(reminder.id);
    setPayWalletId(reminder.walletId || "");
    setPayError("");
  };

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingReminderId) return;

    const res = payReminder(payingReminderId, payWalletId || undefined);
    if (res.success) {
      setPayingReminderId(null);
      setPayWalletId("");
      setPayError("");
    } else {
      setPayError(res.error || "Gagal memproses pembayaran");
    }
  };

  const payingReminderItem = reminders.find((r) => r.id === payingReminderId);
  const selectedPayWallet = wallets.find((w) => w.id === payWalletId);

  return (
    <div className="space-y-6">
      {/* Header Halaman Pengingat Tagihan */}
      <div className="flex items-center justify-between animate-card-enter">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Pengingat Tagihan
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Pantau dan kelola jadwal tagihan yang harus dibayar
          </p>
        </div>

        <Button
          onClick={() => setIsAddReminderModalOpen(true)}
          size="sm"
          className="h-9 rounded-xl bg-[#6C4EF5] hover:bg-[#5638D6] text-white text-xs font-bold gap-1 shadow-sm cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Tambah Tagihan</span>
        </Button>
      </div>

      {/* ========================================================================= */}
      {/* RINGKASAN TAGIHAN (SUMMARY CARDS)                                         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 animate-card-enter stagger-1">
        {/* Card 1: Total Belum Bayar */}
        <div className="p-5 rounded-[24px] bg-white dark:bg-[#16161C] border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Belum Dibayar
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300 tabular-nums">
              {countUnpaid} Tagihan
            </span>
          </div>
          <div className="space-y-0.5">
            <div className="text-xl sm:text-2xl font-black text-foreground tabular-nums tracking-tight">
              {formatIDR(totalUnpaid)}
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              {countUnpaid > 0 ? "Perlu segera dibayar" : "Semua tagihan lunas"}
            </p>
          </div>
        </div>

        {/* Card 2: Tagihan Terdekat */}
        <div className="p-5 rounded-[24px] bg-white dark:bg-[#16161C] border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider truncate">
              Jatuh Tempo Terdekat
            </span>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 tabular-nums shrink-0">
              {nearestUpcoming
                ? formatDateIndo(nearestUpcoming.dueDate)
                : "Aman"}
            </span>
          </div>
          <div className="space-y-0.5">
            <div className="text-xl sm:text-2xl font-black text-foreground tabular-nums tracking-tight">
              {nearestUpcoming ? formatIDR(nearestUpcoming.amount) : "Rp 0"}
            </div>
            <p className="text-xs text-muted-foreground font-medium truncate">
              {nearestUpcoming ? nearestUpcoming.title : "Tidak ada tagihan tertunda"}
            </p>
          </div>
        </div>

        {/* Card 3: Sudah Dibayar */}
        <div className="p-5 rounded-[24px] bg-white dark:bg-[#16161C] border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Sudah Dibayar
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 tabular-nums">
              {countPaid} Lunas
            </span>
          </div>
          <div className="space-y-0.5">
            <div className="text-xl sm:text-2xl font-black text-foreground tabular-nums tracking-tight">
              {formatIDR(totalPaid)}
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              {countPaid > 0 ? "Telah diselesaikan" : "Belum ada pembayaran"}
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FILTER TABS                                                               */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#EAEAEE] dark:bg-[#1C1C24] w-fit animate-card-enter stagger-2">
        <button
          type="button"
          onClick={() => setActiveTab("ALL")}
          className={cn(
            "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
            activeTab === "ALL"
              ? "bg-white dark:bg-[#121216] text-zinc-900 dark:text-white shadow-sm"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          )}
        >
          <span>Semua</span>
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-[11px] font-black tabular-nums transition-colors",
              activeTab === "ALL"
                ? "bg-black/[0.08] dark:bg-white/15 text-zinc-900 dark:text-white"
                : "bg-black/[0.06] dark:bg-white/10 text-zinc-600 dark:text-zinc-400"
            )}
          >
            {reminders.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("UNPAID")}
          className={cn(
            "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
            activeTab === "UNPAID"
              ? "bg-white dark:bg-[#121216] text-[#EF4444] dark:text-rose-400 shadow-sm"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          )}
        >
          <span>Belum Bayar</span>
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-[11px] font-black tabular-nums transition-colors",
              activeTab === "UNPAID"
                ? "bg-red-100 dark:bg-red-950/80 text-[#EF4444] dark:text-rose-300"
                : "bg-black/[0.06] dark:bg-white/10 text-zinc-600 dark:text-zinc-400"
            )}
          >
            {countUnpaid}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("PAID")}
          className={cn(
            "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
            activeTab === "PAID"
              ? "bg-white dark:bg-[#121216] text-[#22C55E] dark:text-emerald-400 shadow-sm"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          )}
        >
          <span>Sudah Bayar</span>
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-[11px] font-black tabular-nums transition-colors",
              activeTab === "PAID"
                ? "bg-emerald-100 dark:bg-emerald-950/80 text-[#22C55E] dark:text-emerald-300"
                : "bg-black/[0.06] dark:bg-white/10 text-zinc-600 dark:text-zinc-400"
            )}
          >
            {countPaid}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* DAFTAR KARTU TAGIHAN (SINGLE COLUMN GRID)                                 */}
      {/* ========================================================================= */}
      <section className="space-y-3.5 animate-card-enter stagger-3">
        {filteredReminders.length === 0 ? (
          <div className="p-10 text-center rounded-[28px] bg-white dark:bg-[#16161C] border border-black/[0.06] dark:border-white/[0.08] space-y-3">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {activeTab === "UNPAID"
                ? "Tidak ada tagihan yang belum dibayar. Luar biasa!"
                : activeTab === "PAID"
                ? "Belum ada riwayat tagihan yang sudah dibayar."
                : "Belum ada daftar pengingat tagihan."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {filteredReminders.map((item) => {
              const category = categories.find((c) => c.id === item.categoryId);
              const wallet = wallets.find((w) => w.id === item.walletId);
              const dueStatus = getDueStatus(item.dueDate, item.isPaid);
              const StatusIcon = dueStatus.icon;

              return (
                <div
                  key={item.id}
                  tabIndex={0}
                  className={cn(
                    "rounded-[28px] border bg-white p-5 shadow-sm dark:bg-[#16161C] space-y-3.5 transition-colors relative group focus:outline-none focus:ring-1 focus:ring-violet-500/20 dark:focus:ring-violet-500/30",
                    item.isPaid
                      ? "border-black/[0.04] dark:border-white/[0.06] opacity-80"
                      : "border-black/[0.06] dark:border-white/[0.08]"
                  )}
                >
                  {/* Top Row: Category Icon & Title on Left, Action on Right */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {category ? (
                        <CategoryIcon
                          iconName={category.icon}
                          size="md"
                          bgColor={category.color ? `${category.color}20` : undefined}
                          iconColor={category.color || undefined}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
                          <CreditCard className="h-5 w-5" />
                        </div>
                      )}

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-extrabold text-base text-zinc-900 dark:text-white leading-tight">
                            {item.title}
                          </h3>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tabular-nums",
                              dueStatus.color
                            )}
                          >
                            <StatusIcon className="h-3 w-3" />
                            <span>{dueStatus.label}</span>
                          </span>
                        </div>

                        {item.note && (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                            {item.note}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Delete Tooltip */}
                    <div className="flex items-center opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 group-focus:opacity-100 transition-opacity shrink-0">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => deleteReminder(item.id)}
                            className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-all cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          Hapus Tagihan
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex-wrap gap-2">
                    <div className="space-y-0.5">
                      <div className="text-lg sm:text-xl font-black text-foreground tabular-nums tracking-tight">
                        {formatIDR(item.amount)}
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-2.5 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDateIndo(item.dueDate)}</span>
                        </div>
                        {wallet && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <WalletIcon className="h-3 w-3" />
                            <span>{wallet.name}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {item.isPaid ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Lunas</span>
                        </span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => unpayReminder(item.id)}
                              className="h-8 px-2.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs font-bold cursor-pointer"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="left">
                            Ulangi tagihan ke bulan berikutnya
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleOpenPay(item)}
                        className="h-9 px-4 rounded-xl bg-[#6C4EF5] hover:bg-[#5638D6] text-white text-xs font-bold gap-1.5 shadow-sm shadow-violet-500/20 cursor-pointer"
                      >
                        <CreditCard className="h-3.5 w-3.5" />
                        <span>Bayar</span>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <Drawer
        open={!!payingReminderId}
        onOpenChange={(open) => {
          if (!open) {
            setPayingReminderId(null);
            setPayWalletId("");
            setPayError("");
          }
        }}
      >
        <DrawerContent>
          <DrawerHeader className="p-0 text-left pb-1">
            <DrawerTitle className="text-base sm:text-lg font-black text-zinc-900 dark:text-white">
              Bayar Tagihan
            </DrawerTitle>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Konfirmasi pembayaran tagihan {payingReminderItem?.title}
            </p>
          </DrawerHeader>

          {payError && (
            <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 text-xs font-bold">
              {payError}
            </div>
          )}

          {payingReminderItem && (
            <form onSubmit={handlePaySubmit} className="space-y-4 pt-2">
              {/* Detail Tagihan Box */}
              <div className="p-4 rounded-2xl bg-[#F5F5F7] dark:bg-[#202028] border border-black/[0.04] dark:border-white/10 space-y-1">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                  Nominal Tagihan
                </span>
                <div className="text-2xl font-black text-foreground tabular-nums">
                  {formatIDR(payingReminderItem.amount)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Jatuh tempo {formatDateIndo(payingReminderItem.dueDate)}
                </div>
              </div>

              {/* Pilihan Dompet Pemotong Saldo */}
              {wallets.length > 0 && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider block">
                    Potong Saldo Dompet (Opsional)
                  </label>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="w-full h-12 inline-flex items-center justify-between px-4 rounded-2xl border border-black/[0.08] bg-[#F5F5F7] dark:bg-[#202028] dark:border-white/10 text-sm font-bold text-zinc-900 dark:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-all cursor-pointer outline-none">
                      <div className="flex items-center gap-2.5">
                        <WalletIcon className="h-4 w-4 text-[#6C4EF5]" />
                        {selectedPayWallet ? (
                          <span>
                            {selectedPayWallet.name} —{" "}
                            <span className="text-xs text-muted-foreground font-semibold">
                              Saldo {formatIDR(selectedPayWallet.balance)}
                            </span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground font-normal text-xs">
                            Tandai lunas tanpa potong saldo dompet
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
                        onClick={() => setPayWalletId("")}
                        className="flex items-center justify-between py-2 cursor-pointer"
                      >
                        <span className="text-xs text-muted-foreground font-medium">
                          Tandai lunas tanpa potong saldo dompet
                        </span>
                        {!payWalletId && (
                          <Check className="h-4 w-4 text-[#6C4EF5]" />
                        )}
                      </DropdownMenuItem>
                      {wallets.map((w) => {
                        const isSelected = payWalletId === w.id;
                        return (
                          <DropdownMenuItem
                            key={w.id}
                            onClick={() => setPayWalletId(w.id)}
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

              <div className="pt-2 pb-1">
                <Button
                  type="submit"
                  className="w-full h-12 rounded-2xl bg-[#6C4EF5] hover:bg-[#5638D6] text-white text-sm font-bold shadow-md shadow-violet-500/25 cursor-pointer"
                >
                  Konfirmasi Pembayaran
                </Button>
              </div>
            </form>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
