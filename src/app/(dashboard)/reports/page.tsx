"use client";

import { useState, useMemo } from "react";
import { IncomeAnalysisCard } from "@/components/reports/IncomeAnalysisCard";
import { ExpenseCategoryDonut } from "@/components/reports/ExpenseCategoryDonut";
import { useFinora } from "@/context/finora-context";
import { formatIDR, formatDateIndo } from "@/lib/formatters";
import { ChevronLeft, ChevronRight, Calendar, FileDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

type PeriodType = "Mingguan" | "Bulanan" | "Tahunan";

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export default function ReportsPage() {
  const {
    monthlyIncome,
    monthlyExpense,
    transactions,
    categories,
    wallets,
    user,
  } = useFinora();

  const now = new Date();
  const currentRealMonth = now.getMonth(); // 0-indexed
  const currentRealYear = now.getFullYear();

  const [period, setPeriod] = useState<PeriodType>("Bulanan");
  const [selectedMonth, setSelectedMonth] = useState<number>(currentRealMonth);
  const [selectedYear, setSelectedYear] = useState<number>(currentRealYear);
  const [weekOffset, setWeekOffset] = useState<number>(0);

  const periods: PeriodType[] = ["Mingguan", "Bulanan", "Tahunan"];

  const isNextDisabled = useMemo(() => {
    if (period === "Bulanan") {
      return (
        selectedYear > currentRealYear ||
        (selectedYear === currentRealYear && selectedMonth >= currentRealMonth)
      );
    }
    if (period === "Tahunan") {
      return selectedYear >= currentRealYear;
    }
    if (period === "Mingguan") {
      return weekOffset >= 0;
    }
    return false;
  }, [
    period,
    selectedYear,
    selectedMonth,
    weekOffset,
    currentRealYear,
    currentRealMonth,
  ]);

  // Navigasi periode sebelumnya
  const handlePrev = () => {
    if (period === "Bulanan") {
      if (selectedMonth === 0) {
        setSelectedMonth(11);
        setSelectedYear((y) => y - 1);
      } else {
        setSelectedMonth((m) => m - 1);
      }
    } else if (period === "Mingguan") {
      setWeekOffset((w) => w - 1);
    } else if (period === "Tahunan") {
      setSelectedYear((y) => y - 1);
    }
  };

  // Navigasi periode berikutnya (mentok di periode saat ini)
  const handleNext = () => {
    if (isNextDisabled) return;

    if (period === "Bulanan") {
      if (selectedMonth === 11) {
        if (selectedYear < currentRealYear) {
          setSelectedMonth(0);
          setSelectedYear((y) => y + 1);
        }
      } else {
        if (
          selectedYear < currentRealYear ||
          (selectedYear === currentRealYear && selectedMonth < currentRealMonth)
        ) {
          setSelectedMonth((m) => m + 1);
        }
      }
    } else if (period === "Mingguan") {
      setWeekOffset((w) => Math.min(0, w + 1));
    } else if (period === "Tahunan") {
      if (selectedYear < currentRealYear) {
        setSelectedYear((y) => y + 1);
      }
    }
  };

  // Label periode aktif
  const currentPeriodLabel = useMemo(() => {
    if (period === "Bulanan") {
      return `${MONTH_NAMES[selectedMonth]} ${selectedYear}`;
    }
    if (period === "Tahunan") {
      return `Tahun ${selectedYear}`;
    }
    if (period === "Mingguan") {
      if (weekOffset === 0) return "Minggu Ini";
      if (weekOffset === -1) return "Minggu Lalu";
      if (weekOffset > 0) return `${weekOffset} Minggu ke Depan`;
      return `${Math.abs(weekOffset)} Minggu Lalu`;
    }
    return "Bulanan";
  }, [period, selectedMonth, selectedYear, weekOffset]);

  // Filter daftar transaksi sesuai periode
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        const dt = new Date(tx.transactionAt);
        if (period === "Bulanan") {
          return (
            dt.getFullYear() === selectedYear && dt.getMonth() === selectedMonth
          );
        }
        if (period === "Tahunan") {
          return dt.getFullYear() === selectedYear;
        }
        if (period === "Mingguan") {
          const nowDate = new Date();
          const startOfWeek = new Date(nowDate);
          const day = nowDate.getDay();
          const diff =
            nowDate.getDate() - day + (day === 0 ? -6 : 1) + weekOffset * 7;
          startOfWeek.setDate(diff);
          startOfWeek.setHours(0, 0, 0, 0);

          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          endOfWeek.setHours(23, 59, 59, 999);

          return dt >= startOfWeek && dt <= endOfWeek;
        }
        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.transactionAt).getTime() -
          new Date(a.transactionAt).getTime()
      );
  }, [transactions, period, selectedMonth, selectedYear, weekOffset]);

  // Kalkulasi total arus kas berdasarkan transaksi terfilter periode ini
  const currentIncome = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === "INCOME")
      .reduce((acc, t) => acc + t.amount, 0);
  }, [filteredTransactions]);

  const currentExpense = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((acc, t) => acc + t.amount, 0);
  }, [filteredTransactions]);

  const netSavings = currentIncome - currentExpense;

  // Total angka untuk tabel cetak PDF
  const totalPrintIncome = currentIncome;
  const totalPrintExpense = currentExpense;
  const totalPrintNet = netSavings;

  // Export PDF Handler (Membuka dialog print yang otomatis merender format tabel laporan)
  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div>
      {/* ========================================================================= */}
      {/* TAMPILAN INTERAKTIF LAYAR / SCREEN VIEW (DISEMBUNYIKAN SAAT PRINT)       */}
      {/* ========================================================================= */}
      <div className="space-y-4 sm:space-y-5 print:hidden">
        {/* Header */}
        <div className="animate-card-enter space-y-1">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Analitik & Laporan
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Visualisasi data arus kas masuk dan keluar
          </p>
        </div>

        {/* Filter Bar Periode Terpadu */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2 rounded-[24px] bg-white dark:bg-[#16161C] border border-black/[0.06] dark:border-white/[0.08] shadow-sm animate-card-enter stagger-1 transition-colors">
          {/* Tombol Pilihan Periode: Mingguan | Bulanan | Tahunan */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-[#F5F5F7] dark:bg-[#202028]">
            {periods.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setPeriod(p);
                  setWeekOffset(0);
                  setSelectedMonth(currentRealMonth);
                  setSelectedYear(currentRealYear);
                }}
                className={cn(
                  "flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                  period === p
                    ? "bg-white dark:bg-[#121216] text-[#6C4EF5] dark:text-violet-400 shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                )}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:items-center sm:justify-end sm:w-auto">
            {/* Navigator Periode */}
            <div className="flex items-center justify-between w-full sm:w-[180px] bg-[#F5F5F7] dark:bg-[#202028] rounded-2xl p-1 border border-black/[0.04] dark:border-white/10 select-none">
              {/* Tombol Geser Mundur */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="h-7 w-7 rounded-xl flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-[#16161C] hover:text-foreground active:scale-95 transition-all cursor-pointer shrink-0"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Periode Sebelumnya</TooltipContent>
              </Tooltip>

              {/* Label Periode Aktif */}
              {period === "Bulanan" ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex-1 h-7 px-1 text-xs font-bold text-zinc-900 dark:text-white hover:text-[#6C4EF5] dark:hover:text-violet-400 flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none truncate"
                    >
                      <Calendar className="h-3.5 w-3.5 text-[#6C4EF5] shrink-0" />
                      <span className="truncate">{currentPeriodLabel}</span>
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="center"
                    sideOffset={6}
                    className="w-[180px] min-w-[160px] p-1 rounded-2xl max-h-64 overflow-y-auto shadow-xl"
                  >
                    {MONTH_NAMES.map((monthName, idx) => {
                      const isFutureMonth =
                        selectedYear > currentRealYear ||
                        (selectedYear === currentRealYear &&
                          idx > currentRealMonth);

                      return (
                        <DropdownMenuItem
                          key={monthName}
                          disabled={isFutureMonth}
                          onClick={() => {
                            if (!isFutureMonth) {
                              setSelectedMonth(idx);
                            }
                          }}
                          className={cn(
                            "rounded-xl text-xs font-semibold justify-center text-center py-2 transition-colors",
                            selectedMonth === idx
                              ? "bg-violet-50 dark:bg-violet-950/60 text-[#6C4EF5] dark:text-violet-300 font-bold"
                              : isFutureMonth
                              ? "opacity-30 cursor-not-allowed text-zinc-400 dark:text-zinc-600 pointer-events-none"
                              : "cursor-pointer text-zinc-800 dark:text-zinc-200"
                          )}
                        >
                          {monthName} {selectedYear}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex-1 h-7 px-1 text-xs font-bold text-zinc-900 dark:text-white flex items-center justify-center gap-1.5 truncate">
                  <Calendar className="h-3.5 w-3.5 text-[#6C4EF5] shrink-0" />
                  <span className="truncate">{currentPeriodLabel}</span>
                </div>
              )}

              {/* Tombol Geser Maju (Kanan) */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    disabled={isNextDisabled}
                    onClick={handleNext}
                    className={cn(
                      "h-7 w-7 rounded-xl flex items-center justify-center transition-all shrink-0",
                      isNextDisabled
                        ? "opacity-20 cursor-not-allowed text-zinc-400 dark:text-zinc-600 pointer-events-none"
                        : "text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-[#16161C] hover:text-foreground active:scale-95 cursor-pointer"
                    )}
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {isNextDisabled
                    ? "Maksimal periode saat ini"
                    : "Periode Berikutnya"}
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Tombol Export PDF */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={handleExportPDF}
                  className="w-full sm:w-auto h-9 px-3 sm:px-3.5 rounded-2xl bg-[#F5F5F7] dark:bg-[#202028] hover:bg-[#6C4EF5] hover:text-white dark:hover:bg-[#6C4EF5] dark:hover:text-white text-zinc-700 dark:text-zinc-200 border border-black/[0.04] dark:border-white/10 flex items-center justify-center gap-1.5 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm group"
                >
                  <FileDown className="h-3.5 w-3.5 text-[#6C4EF5] group-hover:text-white transition-colors shrink-0" />
                  <span>Export PDF</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Export Laporan PDF</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Ringkasan Arus Kas Cepat */}
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5 animate-card-enter stagger-2">
          <div className="p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-[#16161C] border border-black/[0.06] dark:border-white/[0.08] text-center transition-colors shadow-sm">
            <span className="text-[9px] sm:text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
              Pemasukan
            </span>
            <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
              {formatIDR(currentIncome)}
            </span>
          </div>

          <div className="p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-[#16161C] border border-black/[0.06] dark:border-white/[0.08] text-center transition-colors shadow-sm">
            <span className="text-[9px] sm:text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
              Pengeluaran
            </span>
            <span className="text-xs sm:text-sm font-black text-red-500 dark:text-red-400 tabular-nums">
              {formatIDR(currentExpense)}
            </span>
          </div>

          <div className="p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-[#16161C] border border-black/[0.06] dark:border-white/[0.08] text-center transition-colors shadow-sm">
            <span className="text-[9px] sm:text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
              Sisa Tabungan
            </span>
            <span className="text-xs sm:text-sm font-black text-violet-600 dark:text-violet-400 tabular-nums">
              {formatIDR(netSavings)}
            </span>
          </div>
        </div>

        {/* Kartu Analisis Pemasukan */}
        <div className="animate-card-enter stagger-3">
          <IncomeAnalysisCard
            period={currentPeriodLabel}
            periodType={period}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            weekOffset={weekOffset}
          />
        </div>

        {/* Kartu Kategori Pengeluaran */}
        <div className="animate-card-enter stagger-4">
          <ExpenseCategoryDonut
            period={currentPeriodLabel}
            filteredTransactions={filteredTransactions}
          />
        </div>
      </div>

      {/* TAMPILAN CETAK PDF */}
      <div className="print-document hidden print:block text-black bg-white font-sans w-full p-0">
        {/* Kop Surat Laporan */}
        <div className="w-full flex items-start justify-between border-b-2 border-black pb-2 mb-3">
          <div>
            <h1 className="text-xl font-black tracking-tight uppercase text-black">
              FINORA
            </h1>
            <p className="text-xs font-semibold text-zinc-700">
              Laporan Keuangan
            </p>
          </div>
          <div className="text-right text-[10px] space-y-0.5">
            <p className="font-bold text-black">
              Periode: <span className="underline">{currentPeriodLabel}</span>
            </p>
            <p className="text-zinc-600">
              Tanggal Cetak: {formatDateIndo(new Date())}
            </p>
            <p className="text-zinc-600">
              Nama Akun: <strong>{user.name}</strong> ({user.email})
            </p>
          </div>
        </div>

        {/* Ringkasan Arus Kas Eksekutif */}
        <div className="w-full grid grid-cols-3 gap-2 mb-3">
          <div className="border border-zinc-300 p-2 rounded-lg bg-zinc-50 text-left">
            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 block">
              Total Pemasukan
            </span>
            <span className="text-sm font-black text-emerald-700 tabular-nums">
              {formatIDR(totalPrintIncome)}
            </span>
          </div>
          <div className="border border-zinc-300 p-2 rounded-lg bg-zinc-50 text-left">
            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 block">
              Total Pengeluaran
            </span>
            <span className="text-sm font-black text-red-700 tabular-nums">
              {formatIDR(totalPrintExpense)}
            </span>
          </div>
          <div className="border border-zinc-300 p-2 rounded-lg bg-zinc-50 text-left">
            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 block">
              Arus Kas Bersih
            </span>
            <span
              className={cn(
                "text-sm font-black tabular-nums",
                totalPrintNet >= 0 ? "text-violet-700" : "text-red-700"
              )}
            >
              {formatIDR(totalPrintNet)}
            </span>
          </div>
        </div>

        {/* Tabel Data Rincian Pemasukan & Pengeluaran */}
        <div className="w-full mb-3">
          <div className="w-full flex items-center justify-between border-b border-zinc-400 pb-1 mb-1.5">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-zinc-900">
              Rincian Transaksi Pemasukan & Pengeluaran
            </h2>
            <span className="text-[10px] text-zinc-600 font-semibold">
              {filteredTransactions.length} Transaksi Ditemukan
            </span>
          </div>

          <table className="w-full table-auto text-left border-collapse text-[9.5px] border border-zinc-300">
            <thead>
              <tr className="border-b-2 border-zinc-400 bg-zinc-100 font-bold text-zinc-800">
                <th className="py-2 px-2 text-center border-r border-zinc-200 whitespace-nowrap">
                  No.
                </th>
                <th className="py-2 px-2.5 border-r border-zinc-200 whitespace-nowrap">
                  Tanggal
                </th>
                <th className="py-2 px-2.5 border-r border-zinc-200 whitespace-nowrap">
                  Kategori
                </th>
                <th className="py-2 px-2.5 border-r border-zinc-200 whitespace-nowrap">
                  Dompet
                </th>
                <th className="py-2 px-3 border-r border-zinc-200">
                  Keterangan / Catatan
                </th>
                <th className="py-2 px-2.5 text-center border-r border-zinc-200 whitespace-nowrap">
                  Jenis
                </th>
                <th className="py-2 px-3 text-right whitespace-nowrap">
                  Nominal
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-6 text-center text-zinc-500 italic bg-zinc-50 text-[10px]"
                  >
                    Tidak ada catatan transaksi pada periode {currentPeriodLabel}.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx, idx) => {
                  const cat = categories.find((c) => c.id === tx.categoryId);
                  const wal = wallets.find((w) => w.id === tx.walletId);
                  const isIncome = tx.type === "INCOME";

                  return (
                    <tr key={tx.id} className="odd:bg-white even:bg-zinc-50/70">
                      <td className="py-2 px-2 text-center text-zinc-500 border-r border-zinc-200 align-top tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-2.5 text-zinc-800 border-r border-zinc-200 whitespace-nowrap align-top">
                        {formatDateIndo(tx.transactionAt)}
                      </td>
                      <td className="py-2 px-2.5 font-semibold text-zinc-900 border-r border-zinc-200 whitespace-nowrap align-top">
                        {cat?.name || "Lainnya"}
                      </td>
                      <td className="py-2 px-2.5 text-zinc-700 border-r border-zinc-200 whitespace-nowrap align-top">
                        {wal?.name || "Dompet"}
                      </td>
                      <td className="py-2 px-3 text-zinc-600 border-r border-zinc-200 break-words align-top leading-normal min-w-[140px]">
                        {tx.note || "-"}
                      </td>
                      <td className="py-2 px-2.5 text-center border-r border-zinc-200 align-top whitespace-nowrap">
                        <span
                          className={cn(
                            "px-1.5 py-0.5 rounded text-[8px] font-bold inline-block whitespace-nowrap",
                            isIncome
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-red-100 text-red-800 border border-red-300"
                          )}
                        >
                          {isIncome ? "Pemasukan" : "Pengeluaran"}
                        </span>
                      </td>
                      <td
                        className={cn(
                          "py-2 px-3 text-right font-bold tabular-nums whitespace-nowrap align-top",
                          isIncome ? "text-emerald-700" : "text-red-700"
                        )}
                      >
                        {isIncome ? "+" : "-"} {formatIDR(tx.amount)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {filteredTransactions.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-zinc-700 font-bold bg-zinc-100 text-[10px]">
                  <td
                    colSpan={5}
                    className="py-2 px-3 text-right uppercase text-[10px] border-r border-zinc-200"
                  >
                    Arus Kas Bersih Periode Ini:
                  </td>
                  <td className="py-2 px-2.5 text-center text-[9px] text-zinc-600 border-r border-zinc-200 whitespace-nowrap">
                    {filteredTransactions.length} item
                  </td>
                  <td
                    className={cn(
                      "py-2 px-3 text-right text-[11px] font-black tabular-nums whitespace-nowrap",
                      totalPrintNet >= 0 ? "text-emerald-700" : "text-red-700"
                    )}
                  >
                    {totalPrintNet >= 0 ? "+" : ""} {formatIDR(totalPrintNet)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
