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
  DrawerDescription,
} from "@/components/ui/drawer";
import {
  Download,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  FileUp,
  Database,
  Sparkles,
  Info,
} from "lucide-react";

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

  // Reset state when drawer opens/closes
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

  // Handle Export Click
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
      setTimeout(() => setExportSuccess(false), 4000);
    } catch (err: any) {
      setIsExporting(false);
      console.error("Export error:", err);
    }
  };

  // Handle Download Template
  const handleDownloadTemplate = () => {
    generateExcelTemplate();
  };

  // Handle File Selection
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
      setImportError(
        "Gagal membaca format file Excel. Pastikan file berformat .xlsx atau .xls yang valid."
      );
    } finally {
      setIsParsing(false);
    }
  };

  // Handle File Drag & Drop
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
      setImportError(
        "Gagal membaca format file Excel. Pastikan file berformat .xlsx atau .xls yang valid."
      );
    } finally {
      setIsParsing(false);
    }
  };

  // Handle Import Submit
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
      setImportError(res.error || "Terjadi kesalahan saat mengimpor data");
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
      <DrawerContent className="max-w-xl mx-auto">
        <DrawerHeader className="space-y-1.5 text-left pb-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <DrawerTitle className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white tracking-tight">
                Export & Import Data Excel
              </DrawerTitle>
              <DrawerDescription className="text-xs text-zinc-500 dark:text-zinc-400">
                Cadangkan seluruh data Finora ke file Excel atau pulihkan data dari Excel
              </DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        {/* Tab Navigasi */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#F4F4F7] dark:bg-[#1E1E26] border border-black/[0.04] dark:border-white/[0.06]">
          <button
            type="button"
            onClick={() => setActiveTab("export")}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === "export"
                ? "bg-white dark:bg-[#2A2A36] text-zinc-900 dark:text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <Download className="h-4 w-4" />
            <span>Export Data (Excel)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("import")}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === "import"
                ? "bg-white dark:bg-[#2A2A36] text-zinc-900 dark:text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <Upload className="h-4 w-4" />
            <span>Import Data (Excel)</span>
          </button>
        </div>

        {/* TAB 1: EXPORT DATA */}
        {activeTab === "export" && (
          <div className="space-y-4 pt-1 animate-in fade-in duration-200">
            {/* Banner Ringkasan Data */}
            <div className="p-4 sm:p-5 rounded-[24px] bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-transparent dark:from-violet-950/40 dark:via-purple-950/20 border border-violet-500/20 dark:border-violet-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="h-3.5 w-3.5" /> Data Tersimpan di Akun
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-violet-600/10 dark:bg-violet-400/10 text-violet-700 dark:text-violet-300 text-[11px] font-extrabold">
                  {totalCurrentItems} Total Item
                </span>
              </div>

              {/* Grid statistik item */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <div className="p-2.5 rounded-2xl bg-white/80 dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] text-center">
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold block">
                    Dompet & Kartu
                  </span>
                  <span className="text-sm font-black text-zinc-900 dark:text-white">
                    {wallets.length}
                  </span>
                </div>
                <div className="p-2.5 rounded-2xl bg-white/80 dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] text-center">
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold block">
                    Kategori
                  </span>
                  <span className="text-sm font-black text-zinc-900 dark:text-white">
                    {categories.length}
                  </span>
                </div>
                <div className="p-2.5 rounded-2xl bg-white/80 dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] text-center">
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold block">
                    Transaksi
                  </span>
                  <span className="text-sm font-black text-zinc-900 dark:text-white">
                    {transactions.length}
                  </span>
                </div>
                <div className="p-2.5 rounded-2xl bg-white/80 dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] text-center">
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold block">
                    Lainnya
                  </span>
                  <span className="text-sm font-black text-zinc-900 dark:text-white">
                    {transfers.length + budgets.length + wishlists.length + reminders.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Tombol Utama Export */}
            <div className="space-y-2.5">
              <Button
                type="button"
                onClick={handleExport}
                disabled={isExporting}
                className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm gap-2 shadow-lg shadow-emerald-600/25 cursor-pointer"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Mempersiapkan File Excel...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>Download Semua Data (.xlsx)</span>
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleDownloadTemplate}
                className="w-full h-11 rounded-2xl bg-[#F5F5F7] dark:bg-[#1E1E26] border border-black/[0.06] dark:border-white/10 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold text-xs gap-2 cursor-pointer"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Download Template Excel Kosong</span>
              </Button>
            </div>

            {exportSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>File Excel berhasil diunduh ke perangkat Anda!</span>
              </div>
            )}

            {/* Info Box */}
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
              <span className="font-bold text-zinc-800 dark:text-zinc-200 block flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-violet-600" /> Informasi Export
              </span>
              <p className="text-[11px] leading-relaxed">
                File Excel yang diunduh mencakup 8 Sheet lengkap: Ringkasan, Dompet & Kartu, Kategori, Transaksi, Transfer, Anggaran, Impian & Tabungan, dan Pengingat Tagihan. Anda dapat menggunakannya sebagai cadangan (backup) maupun untuk diimpor kembali.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: IMPORT DATA */}
        {activeTab === "import" && (
          <div className="space-y-4 pt-1 animate-in fade-in duration-200">
            {/* Input file tersembunyi */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Area Drag and Drop */}
            {!selectedFile ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-violet-500 dark:hover:border-violet-400 rounded-[28px] p-6 text-center bg-zinc-50/60 dark:bg-white/[0.02] hover:bg-violet-50/50 dark:hover:bg-violet-950/20 transition-all cursor-pointer group space-y-2.5"
              >
                <div className="h-12 w-12 rounded-2xl bg-violet-600/10 dark:bg-violet-400/10 text-violet-600 dark:text-violet-400 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileUp className="h-6 w-6" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
                    Pilih atau Geser File Excel ke Sini
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Mendukung format file <span className="font-semibold">.xlsx</span> atau <span className="font-semibold">.xls</span>
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="h-8 px-3 rounded-xl text-xs font-bold border-zinc-300 dark:border-zinc-700"
                >
                  Jelajahi File
                </Button>
              </div>
            ) : (
              /* Preview File Terpilih & Parsed Info */
              <div className="space-y-3.5">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F5F5F7] dark:bg-[#1E1E26] border border-black/[0.06] dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <FileSpreadsheet className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate max-w-[180px] sm:max-w-xs">
                        {selectedFile.name}
                      </h4>
                      <p className="text-[10px] text-zinc-500">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setParsedData(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="text-xs text-red-500 hover:text-red-700 font-bold px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                  >
                    Ganti File
                  </button>
                </div>

                {isParsing && (
                  <div className="p-4 text-center space-y-2">
                    <Loader2 className="h-5 w-5 animate-spin text-violet-600 mx-auto" />
                    <p className="text-xs text-zinc-500 font-semibold">
                      Membaca dan memvalidasi lembar kerja Excel...
                    </p>
                  </div>
                )}

                {/* Preview Data Terdeteksi */}
                {parsedData && (
                  <div className="space-y-3.5">
                    <div className="p-3.5 rounded-2xl bg-violet-500/10 dark:bg-violet-950/30 border border-violet-500/20 space-y-2">
                      <span className="text-xs font-extrabold text-violet-700 dark:text-violet-300 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5" /> Data Ditemukan dalam File Excel:
                      </span>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                        <div className="p-2 rounded-xl bg-white/80 dark:bg-white/[0.04]">
                          <span className="text-[10px] text-zinc-500 block">Dompet</span>
                          <span className="font-extrabold text-zinc-900 dark:text-white text-xs">
                            {parsedData.summary.totalWallets}
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-white/80 dark:bg-white/[0.04]">
                          <span className="text-[10px] text-zinc-500 block">Kategori</span>
                          <span className="font-extrabold text-zinc-900 dark:text-white text-xs">
                            {parsedData.summary.totalCategories}
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-white/80 dark:bg-white/[0.04]">
                          <span className="text-[10px] text-zinc-500 block">Transaksi</span>
                          <span className="font-extrabold text-zinc-900 dark:text-white text-xs">
                            {parsedData.summary.totalTransactions}
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-white/80 dark:bg-white/[0.04]">
                          <span className="text-[10px] text-zinc-500 block">Lainnya</span>
                          <span className="font-extrabold text-zinc-900 dark:text-white text-xs">
                            {parsedData.summary.totalTransfers +
                              parsedData.summary.totalBudgets +
                              parsedData.summary.totalWishlists +
                              parsedData.summary.totalReminders}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Mode Import Pilihan */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                        Pilih Metode Import:
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {/* Mode Gabungkan */}
                        <div
                          onClick={() => setImportMode("merge")}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                            importMode === "merge"
                              ? "border-violet-600 bg-violet-50/50 dark:bg-violet-950/40 shadow-sm"
                              : "border-black/[0.06] dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-white/[0.02]"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="importModeDrawer"
                              checked={importMode === "merge"}
                              onChange={() => setImportMode("merge")}
                              className="text-violet-600 focus:ring-violet-500"
                            />
                            <span className="text-xs font-extrabold text-zinc-900 dark:text-white">
                              Gabungkan (Merge)
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 pl-5">
                            Menambahkan data baru tanpa menghapus data yang sudah ada.
                          </p>
                        </div>

                        {/* Mode Timpa */}
                        <div
                          onClick={() => setImportMode("overwrite")}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                            importMode === "overwrite"
                              ? "border-red-500 bg-red-50/50 dark:bg-red-950/40 shadow-sm"
                              : "border-black/[0.06] dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-white/[0.02]"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="importModeDrawer"
                              checked={importMode === "overwrite"}
                              onChange={() => setImportMode("overwrite")}
                              className="text-red-600 focus:ring-red-500"
                            />
                            <span className="text-xs font-extrabold text-zinc-900 dark:text-white">
                              Timpa Semua (Overwrite)
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 pl-5">
                            Mengganti seluruh data lama dengan isi file Excel ini.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Tombol Eksekusi Import */}
                    <Button
                      type="button"
                      onClick={handleImportSubmit}
                      disabled={isImporting}
                      className={`w-full h-11 rounded-2xl text-white font-extrabold text-xs sm:text-sm gap-2 shadow-lg cursor-pointer ${
                        importMode === "overwrite"
                          ? "bg-red-600 hover:bg-red-700 shadow-red-600/25"
                          : "bg-violet-600 hover:bg-violet-700 shadow-violet-600/25"
                      }`}
                    >
                      {isImporting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Menyimpan Data ke Finora...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          <span>
                            {importMode === "overwrite"
                              ? "Mulai Timpa & Import Data"
                              : "Mulai Gabungkan & Import Data"}
                          </span>
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Error Message */}
            {importError && (
              <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
                <span>{importError}</span>
              </div>
            )}

            {/* Success Message */}
            {importSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="font-extrabold text-xs sm:text-sm">Import Data Berhasil!</p>
                  <p className="text-[11px] font-normal text-emerald-600 dark:text-emerald-400">
                    Seluruh data dari file Excel telah sukses dimasukkan ke akun Finora Anda.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
