"use client";

import React, { useState, useRef } from "react";
import { useFinora } from "@/context/finora-context";
import {
  exportFinoraToExcel,
  generateExcelTemplate,
  parseFinoraExcel,
  ParsedFinoraData,
} from "@/lib/export-import-excel";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Check,
  AlertCircle,
  Loader2,
  FileSpreadsheet,
  Download,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ExportImportDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportImportDrawer({ open, onOpenChange }: ExportImportDrawerProps) {
  const {
    user,
    wallets,
    categories,
    transactions,
    transfers,
    budgets,
    wishlists,
    reminders,
    importAllData,
  } = useFinora();

  const [activeTab, setActiveTab] = useState<"export" | "import">("export");

  // Export States
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Import States
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedFinoraData | null>(null);
  const [importMode, setImportMode] = useState<"merge" | "overwrite">("merge");
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedFile(null);
      setParsedData(null);
      setImportError(null);
      setImportSuccess(false);
      setExportSuccess(false);
    }
    onOpenChange(newOpen);
  };

  const handleExport = () => {
    try {
      setIsExporting(true);
      exportFinoraToExcel({
        user,
        wallets,
        categories,
        transactions,
        transfers,
        budgets,
        wishlists,
        reminders,
      });
      setIsExporting(false);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3500);
    } catch (err: any) {
      setIsExporting(false);
      console.error("Export error:", err);
    }
  };

  const handleDownloadTemplate = () => {
    generateExcelTemplate();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsParsing(true);
    setImportError(null);
    setParsedData(null);
    setImportSuccess(false);

    try {
      const data = await parseFinoraExcel(file);
      setParsedData(data);
    } catch (err: any) {
      console.error("Parse Excel error:", err);
      setImportError("Format file tidak valid");
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsParsing(true);
    setImportError(null);
    setParsedData(null);
    setImportSuccess(false);

    try {
      const data = await parseFinoraExcel(file);
      setParsedData(data);
    } catch (err: any) {
      console.error("Parse Excel error:", err);
      setImportError("Format file tidak valid");
    } finally {
      setIsParsing(false);
    }
  };

  const handleImportSubmit = async () => {
    if (!parsedData) return;

    setIsImporting(true);
    setImportError(null);

    const res = await importAllData(
      {
        wallets: parsedData.wallets,
        categories: parsedData.categories,
        transactions: parsedData.transactions,
        transfers: parsedData.transfers.filter(
          (tr) => tr.fromWalletId && tr.toWalletId && tr.amount > 0
        ),
        budgets: parsedData.budgets,
        wishlists: parsedData.wishlists,
        reminders: parsedData.reminders,
      },
      importMode
    );

    setIsImporting(false);

    if (res.success) {
      setImportSuccess(true);
      setSelectedFile(null);
      setParsedData(null);
    } else {
      setImportError(res.error || "Gagal mengimpor data");
    }
  };

  const totalCurrentItems =
    wallets.length +
    categories.length +
    transactions.length +
    transfers.length +
    budgets.length +
    wishlists.length +
    reminders.length;

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent className="max-w-md mx-auto">
        <DrawerHeader className="p-0 mb-4">
          <DrawerTitle>Export & Import Data</DrawerTitle>
        </DrawerHeader>

        {/* Tab Toggle Segmented */}
        <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-[#F5F5F7] dark:bg-[#202028] mb-4">
          <button
            type="button"
            onClick={() => setActiveTab("export")}
            className={cn(
              "py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2",
              activeTab === "export"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-[#16161C] dark:text-white"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            )}
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("import")}
            className={cn(
              "py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2",
              activeTab === "import"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-[#16161C] dark:text-white"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            )}
          >
            <Upload className="h-4 w-4" />
            <span>Import</span>
          </button>
        </div>

        {/* TAB 1: EXPORT DATA */}
        {activeTab === "export" && (
          <div className="space-y-4">
            {/* Grid Statistik Data */}
            <div className="p-3.5 rounded-2xl bg-[#F5F5F7] dark:bg-[#202028] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-600 dark:text-zinc-400">
                  Total Data
                </span>
                <span className="font-extrabold text-[#6C4EF5] dark:text-violet-400">
                  {totalCurrentItems} Item
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 rounded-xl bg-white dark:bg-[#16161C] text-center">
                  <span className="text-[10px] text-zinc-500 block">Dompet</span>
                  <span className="text-xs font-extrabold text-zinc-900 dark:text-white">
                    {wallets.length}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-[#16161C] text-center">
                  <span className="text-[10px] text-zinc-500 block">Kategori</span>
                  <span className="text-xs font-extrabold text-zinc-900 dark:text-white">
                    {categories.length}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-[#16161C] text-center">
                  <span className="text-[10px] text-zinc-500 block">Transaksi</span>
                  <span className="text-xs font-extrabold text-zinc-900 dark:text-white">
                    {transactions.length}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-[#16161C] text-center">
                  <span className="text-[10px] text-zinc-500 block">Anggaran</span>
                  <span className="text-xs font-extrabold text-zinc-900 dark:text-white">
                    {budgets.length}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-[#16161C] text-center">
                  <span className="text-[10px] text-zinc-500 block">Wishlist</span>
                  <span className="text-xs font-extrabold text-zinc-900 dark:text-white">
                    {wishlists.length}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-[#16161C] text-center">
                  <span className="text-[10px] text-zinc-500 block">Tagihan</span>
                  <span className="text-xs font-extrabold text-zinc-900 dark:text-white">
                    {reminders.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Tombol Export */}
            <div className="space-y-2">
              <Button
                type="button"
                onClick={handleExport}
                disabled={isExporting}
                className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 cursor-pointer flex items-center justify-center gap-2"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Mempersiapkan File...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>Download File Excel</span>
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleDownloadTemplate}
                className="w-full h-11 rounded-2xl bg-transparent border-black/[0.08] dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Download Template Kosong</span>
              </Button>
            </div>

            {exportSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900 flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0" />
                <span>File Excel berhasil diunduh</span>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: IMPORT DATA */}
        {activeTab === "import" && (
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="hidden"
            />

            {!selectedFile ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border border-dashed border-black/[0.15] dark:border-white/15 rounded-2xl p-6 text-center bg-[#F5F5F7] dark:bg-[#202028] transition-all cursor-pointer space-y-1.5"
              >
                <FileSpreadsheet className="h-6 w-6 text-zinc-400 mx-auto" />
                <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                  Pilih atau letakkan file Excel
                </h4>
                <p className="text-[11px] text-zinc-400">
                  Format file xlsx atau xls
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* File terpilih */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F5F5F7] dark:bg-[#202028]">
                  <div className="min-w-0 pr-2">
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                      {selectedFile.name}
                    </h4>
                    <p className="text-[10px] text-zinc-400">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setParsedData(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="text-xs text-red-500 font-bold px-2 py-1 cursor-pointer shrink-0"
                  >
                    Ganti
                  </button>
                </div>

                {isParsing && (
                  <div className="p-3 text-center space-y-1">
                    <Loader2 className="h-4 w-4 animate-spin text-violet-600 mx-auto" />
                    <p className="text-xs text-zinc-500 font-medium">Membaca file...</p>
                  </div>
                )}

                {parsedData && (
                  <div className="space-y-3">
                    {/* Ringkasan parsed data */}
                    <div className="p-3 rounded-2xl bg-[#F5F5F7] dark:bg-[#202028] space-y-2">
                      <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 block">
                        Data Ditemukan
                      </span>

                      <div className="grid grid-cols-3 gap-1.5 text-center">
                        <div className="p-1.5 rounded-xl bg-white dark:bg-[#16161C]">
                          <span className="text-[10px] text-zinc-500 block">Dompet</span>
                          <span className="font-extrabold text-zinc-900 dark:text-white text-xs">
                            {parsedData.summary.totalWallets}
                          </span>
                        </div>
                        <div className="p-1.5 rounded-xl bg-white dark:bg-[#16161C]">
                          <span className="text-[10px] text-zinc-500 block">Kategori</span>
                          <span className="font-extrabold text-zinc-900 dark:text-white text-xs">
                            {parsedData.summary.totalCategories}
                          </span>
                        </div>
                        <div className="p-1.5 rounded-xl bg-white dark:bg-[#16161C]">
                          <span className="text-[10px] text-zinc-500 block">Transaksi</span>
                          <span className="font-extrabold text-zinc-900 dark:text-white text-xs">
                            {parsedData.summary.totalTransactions}
                          </span>
                        </div>
                        <div className="p-1.5 rounded-xl bg-white dark:bg-[#16161C]">
                          <span className="text-[10px] text-zinc-500 block">Anggaran</span>
                          <span className="font-extrabold text-zinc-900 dark:text-white text-xs">
                            {parsedData.summary.totalBudgets}
                          </span>
                        </div>
                        <div className="p-1.5 rounded-xl bg-white dark:bg-[#16161C]">
                          <span className="text-[10px] text-zinc-500 block">Wishlist</span>
                          <span className="font-extrabold text-zinc-900 dark:text-white text-xs">
                            {parsedData.summary.totalWishlists}
                          </span>
                        </div>
                        <div className="p-1.5 rounded-xl bg-white dark:bg-[#16161C]">
                          <span className="text-[10px] text-zinc-500 block">Tagihan</span>
                          <span className="font-extrabold text-zinc-900 dark:text-white text-xs">
                            {parsedData.summary.totalReminders}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Mode Import */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setImportMode("merge")}
                        className={cn(
                          "p-3 rounded-2xl border text-left transition-all cursor-pointer",
                          importMode === "merge"
                            ? "border-violet-600 bg-violet-50/50 dark:bg-violet-950/40"
                            : "border-black/[0.06] dark:border-white/10"
                        )}
                      >
                        <span className="text-xs font-extrabold text-zinc-900 dark:text-white block">
                          Gabungkan
                        </span>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block mt-0.5">
                          Tambah data baru
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setImportMode("overwrite")}
                        className={cn(
                          "p-3 rounded-2xl border text-left transition-all cursor-pointer",
                          importMode === "overwrite"
                            ? "border-red-500 bg-red-50/50 dark:bg-red-950/40"
                            : "border-black/[0.06] dark:border-white/10"
                        )}
                      >
                        <span className="text-xs font-extrabold text-zinc-900 dark:text-white block">
                          Timpa
                        </span>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block mt-0.5">
                          Ganti seluruh data
                        </span>
                      </button>
                    </div>

                    {/* Tombol Eksekusi */}
                    <Button
                      type="button"
                      onClick={handleImportSubmit}
                      disabled={isImporting}
                      className={cn(
                        "w-full h-12 rounded-2xl text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-2",
                        importMode === "overwrite"
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-[#6C4EF5] hover:bg-[#5638D6]"
                      )}
                    >
                      {isImporting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Menyimpan...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          <span>Proses Import</span>
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {importError && (
              <div className="p-3 rounded-2xl bg-red-50 text-red-700 text-xs font-bold border border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            {importSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900 flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0" />
                <span>Data berhasil diimpor</span>
              </div>
            )}
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
