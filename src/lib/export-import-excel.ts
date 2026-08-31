import * as XLSX from "xlsx";
import {
  Wallet,
  Category,
  Transaction,
  Transfer,
  Budget,
  WishlistItem,
  BillReminder,
  UserProfile,
  WalletType,
  TransactionType,
  CategoryType,
} from "@/types";

export interface FinoraExportData {
  user?: UserProfile;
  wallets: Wallet[];
  categories: Category[];
  transactions: Transaction[];
  transfers: Transfer[];
  budgets: Budget[];
  wishlists: WishlistItem[];
  reminders: BillReminder[];
}

export interface ParsedFinoraData {
  wallets: Wallet[];
  categories: Category[];
  transactions: Transaction[];
  transfers: Transfer[];
  budgets: Budget[];
  wishlists: WishlistItem[];
  reminders: BillReminder[];
  summary: {
    totalWallets: number;
    totalCategories: number;
    totalTransactions: number;
    totalTransfers: number;
    totalBudgets: number;
    totalWishlists: number;
    totalReminders: number;
  };
}

/**
 * Standar Nama Sheet dan Nama Kolom Excel Finora (Single Source of Truth)
 */
export const EXCEL_SCHEMA = {
  SHEETS: {
    SUMMARY: "Ringkasan",
    WALLETS: "Dompet",
    CATEGORIES: "Kategori",
    TRANSACTIONS: "Transaksi",
    TRANSFERS: "Transfer",
    BUDGETS: "Anggaran",
    WISHLISTS: "Impian",
    REMINDERS: "Tagihan",
  },
  WALLETS: {
    ID: "ID Dompet",
    NAME: "Nama Dompet",
    TYPE: "Tipe",
    BALANCE: "Saldo",
    CURRENCY: "Mata Uang",
    ACCOUNT_NUMBER: "Nomor Rekening",
    COLOR: "Warna",
    CREATED_AT: "Tanggal Dibuat",
  },
  CATEGORIES: {
    ID: "ID Kategori",
    NAME: "Nama Kategori",
    TYPE: "Tipe",
    ICON: "Ikon",
    COLOR: "Warna",
    BUDGET_LIMIT: "Batas Anggaran",
    IS_DEFAULT: "Kategori Bawaan",
  },
  TRANSACTIONS: {
    ID: "ID Transaksi",
    DATE: "Tanggal Transaksi",
    TYPE: "Tipe",
    CATEGORY_NAME: "Kategori",
    CATEGORY_ID: "ID Kategori",
    WALLET_NAME: "Dompet",
    WALLET_ID: "ID Dompet",
    AMOUNT: "Jumlah",
    NOTE: "Catatan",
    CREATED_AT: "Tanggal Dicatat",
  },
  TRANSFERS: {
    ID: "ID Transfer",
    DATE: "Tanggal Transfer",
    FROM_WALLET_NAME: "Dari Dompet",
    FROM_WALLET_ID: "ID Dari Dompet",
    TO_WALLET_NAME: "Ke Dompet",
    TO_WALLET_ID: "ID Ke Dompet",
    AMOUNT: "Jumlah",
    NOTE: "Catatan",
    CREATED_AT: "Tanggal Dicatat",
  },
  BUDGETS: {
    ID: "ID Anggaran",
    CATEGORY_NAME: "Kategori",
    CATEGORY_ID: "ID Kategori",
    MONTH: "Bulan",
    YEAR: "Tahun",
    AMOUNT: "Jumlah Anggaran",
    CREATED_AT: "Tanggal Dibuat",
  },
  WISHLISTS: {
    ID: "ID Impian",
    NAME: "Nama Impian",
    TARGET_AMOUNT: "Target Nominal",
    SAVED_AMOUNT: "Terkumpul",
    TARGET_DATE: "Target Tanggal",
    ICON: "Ikon",
    COLOR: "Warna",
    NOTE: "Catatan",
    IS_COMPLETED: "Status Selesai",
    CREATED_AT: "Tanggal Dibuat",
  },
  REMINDERS: {
    ID: "ID Tagihan",
    TITLE: "Judul Tagihan",
    AMOUNT: "Jumlah Tagihan",
    DUE_DATE: "Tanggal Jatuh Tempo",
    CATEGORY_NAME: "Kategori",
    CATEGORY_ID: "ID Kategori",
    WALLET_NAME: "Dompet Pembayaran",
    WALLET_ID: "ID Dompet",
    IS_PAID: "Status Lunas",
    PAID_AT: "Tanggal Dibayar",
    NOTE: "Catatan",
    CREATED_AT: "Tanggal Dibuat",
  },
} as const;

/**
 * Format tanggal ke format standar YYYY-MM-DD HH:mm:ss
 */
function formatDate(dateStr?: string | Date): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const seconds = String(d.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch {
    return String(dateStr);
  }
}

/**
 * Format tanggal khusus YYYY-MM-DD (date only)
 */
function formatDateOnly(dateStr?: string | Date): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch {
    return String(dateStr);
  }
}

/**
 * Parse cell Excel ke date string ISO
 */
function parseExcelDate(val: any): string {
  if (!val) return new Date().toISOString();
  if (val instanceof Date) return val.toISOString();
  if (typeof val === "number") {
    // Excel serial date format
    const parsed = new Date(Math.round((val - 25569) * 86400 * 1000));
    return isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
  }
  const str = String(val).trim();
  if (!str) return new Date().toISOString();

  const formatted = str.includes(" ") && !str.includes("T") ? str.replace(" ", "T") : str;
  const d = new Date(formatted);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

/**
 * Normalisasi angka dari cell Excel
 */
function parseExcelNumber(val: any): number {
  if (val === null || val === undefined || val === "") return 0;
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  const cleaned = String(val).replace(/[^0-9.-]+/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Helper untuk mengambil nilai cell dengan prioritas nama kolom persis
 */
function getCell(row: any, primaryKey: string, aliasKeys: string[] = []): any {
  if (row[primaryKey] !== undefined && row[primaryKey] !== null && row[primaryKey] !== "") {
    return row[primaryKey];
  }

  const allTargets = [primaryKey, ...aliasKeys].map((k) =>
    k.toLowerCase().replace(/[^a-z0-9]/g, "")
  );

  for (const rowKey of Object.keys(row)) {
    const normRowKey = rowKey.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (allTargets.includes(normRowKey)) {
      if (row[rowKey] !== undefined && row[rowKey] !== null && row[rowKey] !== "") {
        return row[rowKey];
      }
    }
  }

  return undefined;
}

/**
 * Generate dan download file Excel lengkap untuk seluruh data Finora
 */
export function exportFinoraToExcel(data: FinoraExportData) {
  const wb = XLSX.utils.book_new();

  // Helper map untuk nama
  const walletMap = new Map(data.wallets.map((w) => [w.id, w.name]));
  const categoryMap = new Map(data.categories.map((c) => [c.id, c.name]));

  // 1. Sheet Ringkasan
  const totalBalance = data.wallets.reduce((s, w) => s + w.balance, 0);
  const summaryRows = [
    ["FINORA - EXPORT DATA KEUANGAN"],
    ["Tanggal Export", new Date().toLocaleString("id-ID")],
    ["Nama Pengguna", data.user?.name || "Pengguna Finora"],
    ["Email Akun", data.user?.email || "-"],
    ["Total Saldo", totalBalance],
    [],
    ["RINGKASAN DATA", "JUMLAH DATA"],
    ["Dompet", data.wallets.length],
    ["Kategori", data.categories.length],
    ["Transaksi", data.transactions.length],
    ["Transfer", data.transfers.length],
    ["Anggaran", data.budgets.length],
    ["Impian", data.wishlists.length],
    ["Tagihan", data.reminders.length],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, summarySheet, EXCEL_SCHEMA.SHEETS.SUMMARY);

  // 2. Sheet Dompet
  const walletsData = data.wallets.map((w) => ({
    [EXCEL_SCHEMA.WALLETS.ID]: w.id,
    [EXCEL_SCHEMA.WALLETS.NAME]: w.name,
    [EXCEL_SCHEMA.WALLETS.TYPE]: w.type,
    [EXCEL_SCHEMA.WALLETS.BALANCE]: w.balance,
    [EXCEL_SCHEMA.WALLETS.CURRENCY]: w.currency || "IDR",
    [EXCEL_SCHEMA.WALLETS.ACCOUNT_NUMBER]: w.accountNumber || "",
    [EXCEL_SCHEMA.WALLETS.COLOR]: w.color || "",
    [EXCEL_SCHEMA.WALLETS.CREATED_AT]: formatDate(w.createdAt),
  }));
  const walletsSheet = XLSX.utils.json_to_sheet(
    walletsData.length
      ? walletsData
      : [
          {
            [EXCEL_SCHEMA.WALLETS.ID]: "",
            [EXCEL_SCHEMA.WALLETS.NAME]: "",
            [EXCEL_SCHEMA.WALLETS.TYPE]: "CASH",
            [EXCEL_SCHEMA.WALLETS.BALANCE]: 0,
            [EXCEL_SCHEMA.WALLETS.CURRENCY]: "IDR",
            [EXCEL_SCHEMA.WALLETS.ACCOUNT_NUMBER]: "",
            [EXCEL_SCHEMA.WALLETS.COLOR]: "",
            [EXCEL_SCHEMA.WALLETS.CREATED_AT]: "",
          },
        ]
  );
  XLSX.utils.book_append_sheet(wb, walletsSheet, EXCEL_SCHEMA.SHEETS.WALLETS);

  // 3. Sheet Kategori
  const categoriesData = data.categories.map((c) => ({
    [EXCEL_SCHEMA.CATEGORIES.ID]: c.id,
    [EXCEL_SCHEMA.CATEGORIES.NAME]: c.name,
    [EXCEL_SCHEMA.CATEGORIES.TYPE]: c.type,
    [EXCEL_SCHEMA.CATEGORIES.ICON]: c.icon,
    [EXCEL_SCHEMA.CATEGORIES.COLOR]: c.color || "",
    [EXCEL_SCHEMA.CATEGORIES.BUDGET_LIMIT]: c.expenseLimit || 0,
    [EXCEL_SCHEMA.CATEGORIES.IS_DEFAULT]: c.isDefault ? "TRUE" : "FALSE",
  }));
  const categoriesSheet = XLSX.utils.json_to_sheet(
    categoriesData.length
      ? categoriesData
      : [
          {
            [EXCEL_SCHEMA.CATEGORIES.ID]: "",
            [EXCEL_SCHEMA.CATEGORIES.NAME]: "",
            [EXCEL_SCHEMA.CATEGORIES.TYPE]: "EXPENSE",
            [EXCEL_SCHEMA.CATEGORIES.ICON]: "solar:box-bold",
            [EXCEL_SCHEMA.CATEGORIES.COLOR]: "",
            [EXCEL_SCHEMA.CATEGORIES.BUDGET_LIMIT]: 0,
            [EXCEL_SCHEMA.CATEGORIES.IS_DEFAULT]: "FALSE",
          },
        ]
  );
  XLSX.utils.book_append_sheet(wb, categoriesSheet, EXCEL_SCHEMA.SHEETS.CATEGORIES);

  // 4. Sheet Transaksi
  const transactionsData = data.transactions.map((t) => ({
    [EXCEL_SCHEMA.TRANSACTIONS.ID]: t.id,
    [EXCEL_SCHEMA.TRANSACTIONS.DATE]: formatDate(t.transactionAt),
    [EXCEL_SCHEMA.TRANSACTIONS.TYPE]: t.type,
    [EXCEL_SCHEMA.TRANSACTIONS.CATEGORY_NAME]: categoryMap.get(t.categoryId) || t.categoryId,
    [EXCEL_SCHEMA.TRANSACTIONS.CATEGORY_ID]: t.categoryId,
    [EXCEL_SCHEMA.TRANSACTIONS.WALLET_NAME]: walletMap.get(t.walletId) || t.walletId,
    [EXCEL_SCHEMA.TRANSACTIONS.WALLET_ID]: t.walletId,
    [EXCEL_SCHEMA.TRANSACTIONS.AMOUNT]: t.amount,
    [EXCEL_SCHEMA.TRANSACTIONS.NOTE]: t.note || "",
    [EXCEL_SCHEMA.TRANSACTIONS.CREATED_AT]: formatDate(t.createdAt),
  }));
  const transactionsSheet = XLSX.utils.json_to_sheet(
    transactionsData.length
      ? transactionsData
      : [
          {
            [EXCEL_SCHEMA.TRANSACTIONS.ID]: "",
            [EXCEL_SCHEMA.TRANSACTIONS.DATE]: formatDate(new Date()),
            [EXCEL_SCHEMA.TRANSACTIONS.TYPE]: "EXPENSE",
            [EXCEL_SCHEMA.TRANSACTIONS.CATEGORY_NAME]: "",
            [EXCEL_SCHEMA.TRANSACTIONS.CATEGORY_ID]: "",
            [EXCEL_SCHEMA.TRANSACTIONS.WALLET_NAME]: "",
            [EXCEL_SCHEMA.TRANSACTIONS.WALLET_ID]: "",
            [EXCEL_SCHEMA.TRANSACTIONS.AMOUNT]: 0,
            [EXCEL_SCHEMA.TRANSACTIONS.NOTE]: "",
            [EXCEL_SCHEMA.TRANSACTIONS.CREATED_AT]: "",
          },
        ]
  );
  XLSX.utils.book_append_sheet(wb, transactionsSheet, EXCEL_SCHEMA.SHEETS.TRANSACTIONS);

  // 5. Sheet Transfer
  const transfersData = data.transfers.map((tr) => ({
    [EXCEL_SCHEMA.TRANSFERS.ID]: tr.id,
    [EXCEL_SCHEMA.TRANSFERS.DATE]: formatDate(tr.transferAt),
    [EXCEL_SCHEMA.TRANSFERS.FROM_WALLET_NAME]: walletMap.get(tr.fromWalletId) || tr.fromWalletId,
    [EXCEL_SCHEMA.TRANSFERS.FROM_WALLET_ID]: tr.fromWalletId,
    [EXCEL_SCHEMA.TRANSFERS.TO_WALLET_NAME]: walletMap.get(tr.toWalletId) || tr.toWalletId,
    [EXCEL_SCHEMA.TRANSFERS.TO_WALLET_ID]: tr.toWalletId,
    [EXCEL_SCHEMA.TRANSFERS.AMOUNT]: tr.amount,
    [EXCEL_SCHEMA.TRANSFERS.NOTE]: tr.note || "",
    [EXCEL_SCHEMA.TRANSFERS.CREATED_AT]: formatDate(tr.createdAt),
  }));
  const transfersSheet = XLSX.utils.json_to_sheet(
    transfersData.length
      ? transfersData
      : [
          {
            [EXCEL_SCHEMA.TRANSFERS.ID]: "",
            [EXCEL_SCHEMA.TRANSFERS.DATE]: formatDate(new Date()),
            [EXCEL_SCHEMA.TRANSFERS.FROM_WALLET_NAME]: "",
            [EXCEL_SCHEMA.TRANSFERS.FROM_WALLET_ID]: "",
            [EXCEL_SCHEMA.TRANSFERS.TO_WALLET_NAME]: "",
            [EXCEL_SCHEMA.TRANSFERS.TO_WALLET_ID]: "",
            [EXCEL_SCHEMA.TRANSFERS.AMOUNT]: 0,
            [EXCEL_SCHEMA.TRANSFERS.NOTE]: "",
            [EXCEL_SCHEMA.TRANSFERS.CREATED_AT]: "",
          },
        ]
  );
  XLSX.utils.book_append_sheet(wb, transfersSheet, EXCEL_SCHEMA.SHEETS.TRANSFERS);

  // 6. Sheet Anggaran
  const budgetsData = data.budgets.map((b) => ({
    [EXCEL_SCHEMA.BUDGETS.ID]: b.id,
    [EXCEL_SCHEMA.BUDGETS.CATEGORY_NAME]: categoryMap.get(b.categoryId) || b.categoryId,
    [EXCEL_SCHEMA.BUDGETS.CATEGORY_ID]: b.categoryId,
    [EXCEL_SCHEMA.BUDGETS.MONTH]: b.month,
    [EXCEL_SCHEMA.BUDGETS.YEAR]: b.year,
    [EXCEL_SCHEMA.BUDGETS.AMOUNT]: b.amount,
    [EXCEL_SCHEMA.BUDGETS.CREATED_AT]: formatDate(b.createdAt),
  }));
  const budgetsSheet = XLSX.utils.json_to_sheet(
    budgetsData.length
      ? budgetsData
      : [
          {
            [EXCEL_SCHEMA.BUDGETS.ID]: "",
            [EXCEL_SCHEMA.BUDGETS.CATEGORY_NAME]: "",
            [EXCEL_SCHEMA.BUDGETS.CATEGORY_ID]: "",
            [EXCEL_SCHEMA.BUDGETS.MONTH]: new Date().getMonth() + 1,
            [EXCEL_SCHEMA.BUDGETS.YEAR]: new Date().getFullYear(),
            [EXCEL_SCHEMA.BUDGETS.AMOUNT]: 0,
            [EXCEL_SCHEMA.BUDGETS.CREATED_AT]: "",
          },
        ]
  );
  XLSX.utils.book_append_sheet(wb, budgetsSheet, EXCEL_SCHEMA.SHEETS.BUDGETS);

  // 7. Sheet Impian
  const wishlistsData = data.wishlists.map((w) => ({
    [EXCEL_SCHEMA.WISHLISTS.ID]: w.id,
    [EXCEL_SCHEMA.WISHLISTS.NAME]: w.name,
    [EXCEL_SCHEMA.WISHLISTS.TARGET_AMOUNT]: w.targetAmount,
    [EXCEL_SCHEMA.WISHLISTS.SAVED_AMOUNT]: w.savedAmount,
    [EXCEL_SCHEMA.WISHLISTS.TARGET_DATE]: w.targetDate ? formatDateOnly(w.targetDate) : "",
    [EXCEL_SCHEMA.WISHLISTS.ICON]: w.icon || "",
    [EXCEL_SCHEMA.WISHLISTS.COLOR]: w.color || "",
    [EXCEL_SCHEMA.WISHLISTS.NOTE]: w.note || "",
    [EXCEL_SCHEMA.WISHLISTS.IS_COMPLETED]: w.isCompleted ? "TRUE" : "FALSE",
    [EXCEL_SCHEMA.WISHLISTS.CREATED_AT]: formatDate(w.createdAt),
  }));
  const wishlistsSheet = XLSX.utils.json_to_sheet(
    wishlistsData.length
      ? wishlistsData
      : [
          {
            [EXCEL_SCHEMA.WISHLISTS.ID]: "",
            [EXCEL_SCHEMA.WISHLISTS.NAME]: "",
            [EXCEL_SCHEMA.WISHLISTS.TARGET_AMOUNT]: 0,
            [EXCEL_SCHEMA.WISHLISTS.SAVED_AMOUNT]: 0,
            [EXCEL_SCHEMA.WISHLISTS.TARGET_DATE]: "",
            [EXCEL_SCHEMA.WISHLISTS.ICON]: "",
            [EXCEL_SCHEMA.WISHLISTS.COLOR]: "",
            [EXCEL_SCHEMA.WISHLISTS.NOTE]: "",
            [EXCEL_SCHEMA.WISHLISTS.IS_COMPLETED]: "FALSE",
            [EXCEL_SCHEMA.WISHLISTS.CREATED_AT]: "",
          },
        ]
  );
  XLSX.utils.book_append_sheet(wb, wishlistsSheet, EXCEL_SCHEMA.SHEETS.WISHLISTS);

  // 8. Sheet Tagihan
  const remindersData = data.reminders.map((r) => ({
    [EXCEL_SCHEMA.REMINDERS.ID]: r.id,
    [EXCEL_SCHEMA.REMINDERS.TITLE]: r.title,
    [EXCEL_SCHEMA.REMINDERS.AMOUNT]: r.amount,
    [EXCEL_SCHEMA.REMINDERS.DUE_DATE]: r.dueDate ? formatDateOnly(r.dueDate) : "",
    [EXCEL_SCHEMA.REMINDERS.CATEGORY_NAME]: r.categoryId ? categoryMap.get(r.categoryId) || r.categoryId : "",
    [EXCEL_SCHEMA.REMINDERS.CATEGORY_ID]: r.categoryId || "",
    [EXCEL_SCHEMA.REMINDERS.WALLET_NAME]: r.walletId ? walletMap.get(r.walletId) || r.walletId : "",
    [EXCEL_SCHEMA.REMINDERS.WALLET_ID]: r.walletId || "",
    [EXCEL_SCHEMA.REMINDERS.IS_PAID]: r.isPaid ? "TRUE" : "FALSE",
    [EXCEL_SCHEMA.REMINDERS.PAID_AT]: r.paidAt ? formatDate(r.paidAt) : "",
    [EXCEL_SCHEMA.REMINDERS.NOTE]: r.note || "",
    [EXCEL_SCHEMA.REMINDERS.CREATED_AT]: formatDate(r.createdAt),
  }));
  const remindersSheet = XLSX.utils.json_to_sheet(
    remindersData.length
      ? remindersData
      : [
          {
            [EXCEL_SCHEMA.REMINDERS.ID]: "",
            [EXCEL_SCHEMA.REMINDERS.TITLE]: "",
            [EXCEL_SCHEMA.REMINDERS.AMOUNT]: 0,
            [EXCEL_SCHEMA.REMINDERS.DUE_DATE]: "",
            [EXCEL_SCHEMA.REMINDERS.CATEGORY_NAME]: "",
            [EXCEL_SCHEMA.REMINDERS.CATEGORY_ID]: "",
            [EXCEL_SCHEMA.REMINDERS.WALLET_NAME]: "",
            [EXCEL_SCHEMA.REMINDERS.WALLET_ID]: "",
            [EXCEL_SCHEMA.REMINDERS.IS_PAID]: "FALSE",
            [EXCEL_SCHEMA.REMINDERS.PAID_AT]: "",
            [EXCEL_SCHEMA.REMINDERS.NOTE]: "",
            [EXCEL_SCHEMA.REMINDERS.CREATED_AT]: "",
          },
        ]
  );
  XLSX.utils.book_append_sheet(wb, remindersSheet, EXCEL_SCHEMA.SHEETS.REMINDERS);

  // Format filename with date
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const filename = `Finora_Backup_Data_${dateStr}.xlsx`;

  XLSX.writeFile(wb, filename);
}

/**
 * Generate Template Excel Kosong dengan nama kolom persis sama
 */
export function generateExcelTemplate() {
  const wb = XLSX.utils.book_new();

  // 1. Sheet Dompet
  const sampleWallets = [
    {
      [EXCEL_SCHEMA.WALLETS.ID]: "w-cash",
      [EXCEL_SCHEMA.WALLETS.NAME]: "Uang Tunai",
      [EXCEL_SCHEMA.WALLETS.TYPE]: "CASH",
      [EXCEL_SCHEMA.WALLETS.BALANCE]: 500000,
      [EXCEL_SCHEMA.WALLETS.CURRENCY]: "IDR",
      [EXCEL_SCHEMA.WALLETS.ACCOUNT_NUMBER]: "-",
      [EXCEL_SCHEMA.WALLETS.COLOR]: "#10B981",
      [EXCEL_SCHEMA.WALLETS.CREATED_AT]: formatDate(new Date()),
    },
    {
      [EXCEL_SCHEMA.WALLETS.ID]: "w-bca",
      [EXCEL_SCHEMA.WALLETS.NAME]: "Bank BCA",
      [EXCEL_SCHEMA.WALLETS.TYPE]: "BANK",
      [EXCEL_SCHEMA.WALLETS.BALANCE]: 3500000,
      [EXCEL_SCHEMA.WALLETS.CURRENCY]: "IDR",
      [EXCEL_SCHEMA.WALLETS.ACCOUNT_NUMBER]: "1234567890",
      [EXCEL_SCHEMA.WALLETS.COLOR]: "#3B82F6",
      [EXCEL_SCHEMA.WALLETS.CREATED_AT]: formatDate(new Date()),
    },
    {
      [EXCEL_SCHEMA.WALLETS.ID]: "w-gopay",
      [EXCEL_SCHEMA.WALLETS.NAME]: "GoPay",
      [EXCEL_SCHEMA.WALLETS.TYPE]: "EWALLET",
      [EXCEL_SCHEMA.WALLETS.BALANCE]: 250000,
      [EXCEL_SCHEMA.WALLETS.CURRENCY]: "IDR",
      [EXCEL_SCHEMA.WALLETS.ACCOUNT_NUMBER]: "08123456789",
      [EXCEL_SCHEMA.WALLETS.COLOR]: "#8B5CF6",
      [EXCEL_SCHEMA.WALLETS.CREATED_AT]: formatDate(new Date()),
    },
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sampleWallets), EXCEL_SCHEMA.SHEETS.WALLETS);

  // 2. Sheet Kategori
  const sampleCategories = [
    {
      [EXCEL_SCHEMA.CATEGORIES.ID]: "cat-food",
      [EXCEL_SCHEMA.CATEGORIES.NAME]: "Makanan & Minuman",
      [EXCEL_SCHEMA.CATEGORIES.TYPE]: "EXPENSE",
      [EXCEL_SCHEMA.CATEGORIES.ICON]: "solar:cup-hot-bold",
      [EXCEL_SCHEMA.CATEGORIES.COLOR]: "#F59E0B",
      [EXCEL_SCHEMA.CATEGORIES.BUDGET_LIMIT]: 1500000,
      [EXCEL_SCHEMA.CATEGORIES.IS_DEFAULT]: "TRUE",
    },
    {
      [EXCEL_SCHEMA.CATEGORIES.ID]: "cat-transport",
      [EXCEL_SCHEMA.CATEGORIES.NAME]: "Transportasi",
      [EXCEL_SCHEMA.CATEGORIES.TYPE]: "EXPENSE",
      [EXCEL_SCHEMA.CATEGORIES.ICON]: "solar:bus-bold",
      [EXCEL_SCHEMA.CATEGORIES.COLOR]: "#3B82F6",
      [EXCEL_SCHEMA.CATEGORIES.BUDGET_LIMIT]: 500000,
      [EXCEL_SCHEMA.CATEGORIES.IS_DEFAULT]: "TRUE",
    },
    {
      [EXCEL_SCHEMA.CATEGORIES.ID]: "cat-salary",
      [EXCEL_SCHEMA.CATEGORIES.NAME]: "Gaji Bulanan",
      [EXCEL_SCHEMA.CATEGORIES.TYPE]: "INCOME",
      [EXCEL_SCHEMA.CATEGORIES.ICON]: "solar:wallet-money-bold",
      [EXCEL_SCHEMA.CATEGORIES.COLOR]: "#10B981",
      [EXCEL_SCHEMA.CATEGORIES.BUDGET_LIMIT]: 0,
      [EXCEL_SCHEMA.CATEGORIES.IS_DEFAULT]: "TRUE",
    },
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sampleCategories), EXCEL_SCHEMA.SHEETS.CATEGORIES);

  // 3. Sheet Transaksi
  const sampleTransactions = [
    {
      [EXCEL_SCHEMA.TRANSACTIONS.ID]: "tx-1",
      [EXCEL_SCHEMA.TRANSACTIONS.DATE]: formatDate(new Date()),
      [EXCEL_SCHEMA.TRANSACTIONS.TYPE]: "INCOME",
      [EXCEL_SCHEMA.TRANSACTIONS.CATEGORY_NAME]: "Gaji Bulanan",
      [EXCEL_SCHEMA.TRANSACTIONS.CATEGORY_ID]: "cat-salary",
      [EXCEL_SCHEMA.TRANSACTIONS.WALLET_NAME]: "Bank BCA",
      [EXCEL_SCHEMA.TRANSACTIONS.WALLET_ID]: "w-bca",
      [EXCEL_SCHEMA.TRANSACTIONS.AMOUNT]: 7500000,
      [EXCEL_SCHEMA.TRANSACTIONS.NOTE]: "Gaji bulanan",
      [EXCEL_SCHEMA.TRANSACTIONS.CREATED_AT]: formatDate(new Date()),
    },
    {
      [EXCEL_SCHEMA.TRANSACTIONS.ID]: "tx-2",
      [EXCEL_SCHEMA.TRANSACTIONS.DATE]: formatDate(new Date()),
      [EXCEL_SCHEMA.TRANSACTIONS.TYPE]: "EXPENSE",
      [EXCEL_SCHEMA.TRANSACTIONS.CATEGORY_NAME]: "Makanan & Minuman",
      [EXCEL_SCHEMA.TRANSACTIONS.CATEGORY_ID]: "cat-food",
      [EXCEL_SCHEMA.TRANSACTIONS.WALLET_NAME]: "GoPay",
      [EXCEL_SCHEMA.TRANSACTIONS.WALLET_ID]: "w-gopay",
      [EXCEL_SCHEMA.TRANSACTIONS.AMOUNT]: 45000,
      [EXCEL_SCHEMA.TRANSACTIONS.NOTE]: "Makan siang",
      [EXCEL_SCHEMA.TRANSACTIONS.CREATED_AT]: formatDate(new Date()),
    },
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sampleTransactions), EXCEL_SCHEMA.SHEETS.TRANSACTIONS);

  // 4. Sheet Transfer
  const sampleTransfers = [
    {
      [EXCEL_SCHEMA.TRANSFERS.ID]: "trf-1",
      [EXCEL_SCHEMA.TRANSFERS.DATE]: formatDate(new Date()),
      [EXCEL_SCHEMA.TRANSFERS.FROM_WALLET_NAME]: "Bank BCA",
      [EXCEL_SCHEMA.TRANSFERS.FROM_WALLET_ID]: "w-bca",
      [EXCEL_SCHEMA.TRANSFERS.TO_WALLET_NAME]: "GoPay",
      [EXCEL_SCHEMA.TRANSFERS.TO_WALLET_ID]: "w-gopay",
      [EXCEL_SCHEMA.TRANSFERS.AMOUNT]: 300000,
      [EXCEL_SCHEMA.TRANSFERS.NOTE]: "Top up saldo GoPay",
      [EXCEL_SCHEMA.TRANSFERS.CREATED_AT]: formatDate(new Date()),
    },
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sampleTransfers), EXCEL_SCHEMA.SHEETS.TRANSFERS);

  // 5. Sheet Anggaran
  const sampleBudgets = [
    {
      [EXCEL_SCHEMA.BUDGETS.ID]: "bg-1",
      [EXCEL_SCHEMA.BUDGETS.CATEGORY_NAME]: "Makanan & Minuman",
      [EXCEL_SCHEMA.BUDGETS.CATEGORY_ID]: "cat-food",
      [EXCEL_SCHEMA.BUDGETS.MONTH]: new Date().getMonth() + 1,
      [EXCEL_SCHEMA.BUDGETS.YEAR]: new Date().getFullYear(),
      [EXCEL_SCHEMA.BUDGETS.AMOUNT]: 1500000,
      [EXCEL_SCHEMA.BUDGETS.CREATED_AT]: formatDate(new Date()),
    },
    {
      [EXCEL_SCHEMA.BUDGETS.ID]: "bg-2",
      [EXCEL_SCHEMA.BUDGETS.CATEGORY_NAME]: "Transportasi",
      [EXCEL_SCHEMA.BUDGETS.CATEGORY_ID]: "cat-transport",
      [EXCEL_SCHEMA.BUDGETS.MONTH]: new Date().getMonth() + 1,
      [EXCEL_SCHEMA.BUDGETS.YEAR]: new Date().getFullYear(),
      [EXCEL_SCHEMA.BUDGETS.AMOUNT]: 500000,
      [EXCEL_SCHEMA.BUDGETS.CREATED_AT]: formatDate(new Date()),
    },
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sampleBudgets), EXCEL_SCHEMA.SHEETS.BUDGETS);

  // 6. Sheet Impian
  const sampleWishlists = [
    {
      [EXCEL_SCHEMA.WISHLISTS.ID]: "wish-1",
      [EXCEL_SCHEMA.WISHLISTS.NAME]: "Liburan Akhir Tahun",
      [EXCEL_SCHEMA.WISHLISTS.TARGET_AMOUNT]: 5000000,
      [EXCEL_SCHEMA.WISHLISTS.SAVED_AMOUNT]: 1500000,
      [EXCEL_SCHEMA.WISHLISTS.TARGET_DATE]: `${new Date().getFullYear()}-12-31`,
      [EXCEL_SCHEMA.WISHLISTS.ICON]: "solar:plane-bold",
      [EXCEL_SCHEMA.WISHLISTS.COLOR]: "#06B6D4",
      [EXCEL_SCHEMA.WISHLISTS.NOTE]: "Tabungan tiket dan hotel",
      [EXCEL_SCHEMA.WISHLISTS.IS_COMPLETED]: "FALSE",
      [EXCEL_SCHEMA.WISHLISTS.CREATED_AT]: formatDate(new Date()),
    },
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sampleWishlists), EXCEL_SCHEMA.SHEETS.WISHLISTS);

  // 7. Sheet Tagihan
  const sampleReminders = [
    {
      [EXCEL_SCHEMA.REMINDERS.ID]: "bill-1",
      [EXCEL_SCHEMA.REMINDERS.TITLE]: "Tagihan WiFi Internet",
      [EXCEL_SCHEMA.REMINDERS.AMOUNT]: 350000,
      [EXCEL_SCHEMA.REMINDERS.DUE_DATE]: formatDateOnly(new Date()),
      [EXCEL_SCHEMA.REMINDERS.CATEGORY_NAME]: "Tagihan & Utilitas",
      [EXCEL_SCHEMA.REMINDERS.CATEGORY_ID]: "cat-bills",
      [EXCEL_SCHEMA.REMINDERS.WALLET_NAME]: "Bank BCA",
      [EXCEL_SCHEMA.REMINDERS.WALLET_ID]: "w-bca",
      [EXCEL_SCHEMA.REMINDERS.IS_PAID]: "FALSE",
      [EXCEL_SCHEMA.REMINDERS.PAID_AT]: "",
      [EXCEL_SCHEMA.REMINDERS.NOTE]: "Bayar via transfer",
      [EXCEL_SCHEMA.REMINDERS.CREATED_AT]: formatDate(new Date()),
    },
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sampleReminders), EXCEL_SCHEMA.SHEETS.REMINDERS);

  XLSX.writeFile(wb, "Finora_Template_Import.xlsx");
}

/**
 * Parser file Excel menjadi struktur objek data Finora
 */
export async function parseFinoraExcel(file: File): Promise<ParsedFinoraData> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });

  const getSheetData = (sheetName: string, fallbackNames: string[] = []): any[] => {
    const candidates = [sheetName, ...fallbackNames].map((s) => s.toLowerCase().trim());
    for (const key of Object.keys(wb.Sheets)) {
      if (candidates.includes(key.toLowerCase().trim())) {
        return XLSX.utils.sheet_to_json(wb.Sheets[key], { defval: "" });
      }
    }
    return [];
  };

  const nowStr = new Date().toISOString();

  // 1. Parse Wallets
  const rawWallets = getSheetData(EXCEL_SCHEMA.SHEETS.WALLETS, ["dompet & kartu", "wallets", "wallet", "kartu", "cards"]);
  const parsedWallets: Wallet[] = [];
  const walletNameToIdMap = new Map<string, string>();
  const walletIdSet = new Set<string>();

  rawWallets.forEach((row, idx) => {
    const name = String(getCell(row, EXCEL_SCHEMA.WALLETS.NAME, ["Nama Dompet", "Nama", "Name"]) || "").trim();
    if (!name) return;

    let id = String(getCell(row, EXCEL_SCHEMA.WALLETS.ID, ["ID Dompet", "ID", "Wallet ID"]) || "").trim();
    if (!id) id = `w-import-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`;

    let rawType = String(getCell(row, EXCEL_SCHEMA.WALLETS.TYPE, ["Tipe", "Type"]) || "CASH").toUpperCase();
    let type: WalletType = "CASH";
    if (rawType.includes("BANK")) type = "BANK";
    else if (rawType.includes("EWALLET") || rawType.includes("E-WALLET") || rawType.includes("WALLET")) type = "EWALLET";
    else if (rawType.includes("OTHER") || rawType.includes("LAIN")) type = "OTHER";

    const balance = parseExcelNumber(getCell(row, EXCEL_SCHEMA.WALLETS.BALANCE, ["Saldo", "Balance", "Nominal", "Jumlah"]));
    const currency = String(getCell(row, EXCEL_SCHEMA.WALLETS.CURRENCY, ["Mata Uang", "Currency"]) || "IDR").toUpperCase();
    const accountNumber = String(getCell(row, EXCEL_SCHEMA.WALLETS.ACCOUNT_NUMBER, ["Nomor Rekening", "Rekening", "Account"]) || "");
    const color = String(getCell(row, EXCEL_SCHEMA.WALLETS.COLOR, ["Warna", "Color", "Hex"]) || "");
    const createdAt = parseExcelDate(getCell(row, EXCEL_SCHEMA.WALLETS.CREATED_AT, ["Tanggal Dibuat", "CreatedAt", "Tanggal"]));

    const wallet: Wallet = {
      id,
      name,
      type,
      balance,
      currency,
      accountNumber: accountNumber || undefined,
      color: color || undefined,
      createdAt,
      updatedAt: nowStr,
    };

    parsedWallets.push(wallet);
    walletIdSet.add(id);
    walletNameToIdMap.set(name.toLowerCase(), id);
    walletNameToIdMap.set(id.toLowerCase(), id);
  });

  // 2. Parse Categories
  const rawCategories = getSheetData(EXCEL_SCHEMA.SHEETS.CATEGORIES, ["kategori", "categories", "category"]);
  const parsedCategories: Category[] = [];
  const categoryNameToIdMap = new Map<string, string>();
  const categoryIdSet = new Set<string>();

  rawCategories.forEach((row, idx) => {
    const name = String(getCell(row, EXCEL_SCHEMA.CATEGORIES.NAME, ["Nama Kategori", "Nama", "Name"]) || "").trim();
    if (!name) return;

    let id = String(getCell(row, EXCEL_SCHEMA.CATEGORIES.ID, ["ID Kategori", "ID", "Category ID"]) || "").trim();
    if (!id) id = `cat-import-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`;

    let rawType = String(getCell(row, EXCEL_SCHEMA.CATEGORIES.TYPE, ["Tipe", "Type"]) || "EXPENSE").toUpperCase();
    let type: CategoryType = rawType.includes("INCOME") || rawType.includes("MASUK") ? "INCOME" : "EXPENSE";

    const icon = String(getCell(row, EXCEL_SCHEMA.CATEGORIES.ICON, ["Ikon", "Icon", "Iconify ID"]) || "solar:box-bold");
    const color = String(getCell(row, EXCEL_SCHEMA.CATEGORIES.COLOR, ["Warna", "Color", "Hex"]) || "");
    const expenseLimit = parseExcelNumber(getCell(row, EXCEL_SCHEMA.CATEGORIES.BUDGET_LIMIT, ["Batas Anggaran", "Limit", "Expense Limit"]));
    const isDefaultRaw = String(getCell(row, EXCEL_SCHEMA.CATEGORIES.IS_DEFAULT, ["Kategori Bawaan", "Is Default", "Default"]) || "false").toLowerCase();
    const isDefault = isDefaultRaw === "true" || isDefaultRaw === "1" || isDefaultRaw === "ya";

    const category: Category = {
      id,
      name,
      type,
      icon,
      color: color || undefined,
      expenseLimit: expenseLimit > 0 ? expenseLimit : undefined,
      isDefault,
    };

    parsedCategories.push(category);
    categoryIdSet.add(id);
    categoryNameToIdMap.set(name.toLowerCase(), id);
    categoryNameToIdMap.set(id.toLowerCase(), id);
  });

  // Helper find/resolve wallet ID
  const resolveWalletId = (idCandidate?: any, nameCandidate?: any): string => {
    if (idCandidate) {
      const cleanId = String(idCandidate).trim();
      if (cleanId && (walletIdSet.has(cleanId) || walletNameToIdMap.has(cleanId.toLowerCase()))) {
        return walletNameToIdMap.get(cleanId.toLowerCase()) || cleanId;
      }
    }
    if (nameCandidate) {
      const cleanName = String(nameCandidate).trim().toLowerCase();
      if (cleanName && walletNameToIdMap.has(cleanName)) {
        return walletNameToIdMap.get(cleanName)!;
      }
    }
    return String(idCandidate || nameCandidate || parsedWallets[0]?.id || "w-default");
  };

  // Helper find/resolve category ID
  const resolveCategoryId = (idCandidate?: any, nameCandidate?: any): string => {
    if (idCandidate) {
      const cleanId = String(idCandidate).trim();
      if (cleanId && (categoryIdSet.has(cleanId) || categoryNameToIdMap.has(cleanId.toLowerCase()))) {
        return categoryNameToIdMap.get(cleanId.toLowerCase()) || cleanId;
      }
    }
    if (nameCandidate) {
      const cleanName = String(nameCandidate).trim().toLowerCase();
      if (cleanName && categoryNameToIdMap.has(cleanName)) {
        return categoryNameToIdMap.get(cleanName)!;
      }
    }
    return String(idCandidate || nameCandidate || parsedCategories[0]?.id || "cat-default");
  };

  // 3. Parse Transactions
  const rawTransactions = getSheetData(EXCEL_SCHEMA.SHEETS.TRANSACTIONS, ["transaksi", "transactions", "transaksi masuk & keluar"]);
  const parsedTransactions: Transaction[] = [];

  rawTransactions.forEach((row, idx) => {
    const amount = parseExcelNumber(getCell(row, EXCEL_SCHEMA.TRANSACTIONS.AMOUNT, ["Jumlah", "Amount", "Nominal", "Total"]));
    if (amount <= 0) return;

    let id = String(getCell(row, EXCEL_SCHEMA.TRANSACTIONS.ID, ["ID Transaksi", "ID", "Transaction ID"]) || "").trim();
    if (!id) id = `tx-import-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`;

    let rawType = String(getCell(row, EXCEL_SCHEMA.TRANSACTIONS.TYPE, ["Tipe", "Type"]) || "EXPENSE").toUpperCase();
    let type: TransactionType = rawType.includes("INCOME") || rawType.includes("MASUK") ? "INCOME" : "EXPENSE";

    const catIdVal = getCell(row, EXCEL_SCHEMA.TRANSACTIONS.CATEGORY_ID, ["ID Kategori", "CategoryID"]);
    const catNameVal = getCell(row, EXCEL_SCHEMA.TRANSACTIONS.CATEGORY_NAME, ["Kategori", "Category"]);
    const categoryId = resolveCategoryId(catIdVal, catNameVal);

    const walIdVal = getCell(row, EXCEL_SCHEMA.TRANSACTIONS.WALLET_ID, ["ID Dompet", "WalletID"]);
    const walNameVal = getCell(row, EXCEL_SCHEMA.TRANSACTIONS.WALLET_NAME, ["Dompet", "Wallet"]);
    const walletId = resolveWalletId(walIdVal, walNameVal);

    const note = String(getCell(row, EXCEL_SCHEMA.TRANSACTIONS.NOTE, ["Catatan", "Note", "Keterangan", "Deskripsi"]) || "");
    const transactionAt = parseExcelDate(getCell(row, EXCEL_SCHEMA.TRANSACTIONS.DATE, ["Tanggal Transaksi", "Tanggal", "TransactionAt", "Date"]));
    const createdAt = parseExcelDate(getCell(row, EXCEL_SCHEMA.TRANSACTIONS.CREATED_AT, ["Tanggal Dicatat", "Tanggal Dibuat", "CreatedAt"])) || nowStr;

    parsedTransactions.push({
      id,
      walletId,
      categoryId,
      type,
      amount,
      note: note || undefined,
      transactionAt,
      createdAt,
      updatedAt: nowStr,
    });
  });

  // 4. Parse Transfers
  const rawTransfers = getSheetData(EXCEL_SCHEMA.SHEETS.TRANSFERS, ["transfer", "transfers", "transfer dompet"]);
  const parsedTransfers: Transfer[] = [];

  rawTransfers.forEach((row, idx) => {
    const amount = parseExcelNumber(getCell(row, EXCEL_SCHEMA.TRANSFERS.AMOUNT, ["Jumlah", "Amount", "Nominal"]));
    if (amount <= 0) return;

    let id = String(getCell(row, EXCEL_SCHEMA.TRANSFERS.ID, ["ID Transfer", "ID", "Transfer ID"]) || "").trim();
    if (!id) id = `trf-import-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`;

    const fromIdVal = getCell(row, EXCEL_SCHEMA.TRANSFERS.FROM_WALLET_ID, ["ID Dari Dompet", "FromWalletID"]);
    const fromNameVal = getCell(row, EXCEL_SCHEMA.TRANSFERS.FROM_WALLET_NAME, ["Dari Dompet", "FromWallet", "Asal"]);
    const fromWalletId = resolveWalletId(fromIdVal, fromNameVal);

    const toIdVal = getCell(row, EXCEL_SCHEMA.TRANSFERS.TO_WALLET_ID, ["ID Ke Dompet", "ToWalletID"]);
    const toNameVal = getCell(row, EXCEL_SCHEMA.TRANSFERS.TO_WALLET_NAME, ["Ke Dompet", "ToWallet", "Tujuan"]);
    const toWalletId = resolveWalletId(toIdVal, toNameVal);

    const note = String(getCell(row, EXCEL_SCHEMA.TRANSFERS.NOTE, ["Catatan", "Note", "Keterangan"]) || "");
    const transferAt = parseExcelDate(getCell(row, EXCEL_SCHEMA.TRANSFERS.DATE, ["Tanggal Transfer", "Tanggal", "TransferAt", "Date"]));

    parsedTransfers.push({
      id,
      fromWalletId,
      toWalletId,
      amount,
      note: note || undefined,
      transferAt,
      createdAt: nowStr,
    });
  });

  // 5. Parse Budgets
  const rawBudgets = getSheetData(EXCEL_SCHEMA.SHEETS.BUDGETS, ["anggaran", "budgets", "budget"]);
  const parsedBudgets: Budget[] = [];

  rawBudgets.forEach((row, idx) => {
    const amount = parseExcelNumber(getCell(row, EXCEL_SCHEMA.BUDGETS.AMOUNT, ["Jumlah Anggaran", "Jumlah", "Amount", "Budget"]));
    if (amount <= 0) return;

    let id = String(getCell(row, EXCEL_SCHEMA.BUDGETS.ID, ["ID Anggaran", "ID", "Budget ID"]) || "").trim();
    if (!id) id = `bg-import-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`;

    const catIdVal = getCell(row, EXCEL_SCHEMA.BUDGETS.CATEGORY_ID, ["ID Kategori", "CategoryID"]);
    const catNameVal = getCell(row, EXCEL_SCHEMA.BUDGETS.CATEGORY_NAME, ["Kategori", "Category"]);
    const categoryId = resolveCategoryId(catIdVal, catNameVal);

    const month = parseInt(String(getCell(row, EXCEL_SCHEMA.BUDGETS.MONTH, ["Bulan", "Month"]) || new Date().getMonth() + 1), 10) || new Date().getMonth() + 1;
    const year = parseInt(String(getCell(row, EXCEL_SCHEMA.BUDGETS.YEAR, ["Tahun", "Year"]) || new Date().getFullYear()), 10) || new Date().getFullYear();

    parsedBudgets.push({
      id,
      categoryId,
      amount,
      month,
      year,
      createdAt: nowStr,
      updatedAt: nowStr,
    });
  });

  // 6. Parse Wishlists
  const rawWishlists = getSheetData(EXCEL_SCHEMA.SHEETS.WISHLISTS, ["impian", "impian & tabungan", "wishlists", "wishlist", "tabungan"]);
  const parsedWishlists: WishlistItem[] = [];

  rawWishlists.forEach((row, idx) => {
    const name = String(getCell(row, EXCEL_SCHEMA.WISHLISTS.NAME, ["Nama Impian", "Nama Target Impian", "Nama", "Name", "Target"]) || "").trim();
    if (!name) return;

    let id = String(getCell(row, EXCEL_SCHEMA.WISHLISTS.ID, ["ID Impian", "ID", "Wishlist ID"]) || "").trim();
    if (!id) id = `wish-import-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`;

    const targetAmount = parseExcelNumber(getCell(row, EXCEL_SCHEMA.WISHLISTS.TARGET_AMOUNT, ["Target Nominal", "Target Amount", "Target", "Nominal"]));
    const savedAmount = parseExcelNumber(getCell(row, EXCEL_SCHEMA.WISHLISTS.SAVED_AMOUNT, ["Terkumpul", "Saved Amount", "Saldo"]));
    const rawTargetDate = getCell(row, EXCEL_SCHEMA.WISHLISTS.TARGET_DATE, ["Target Tanggal", "Target Date", "Deadline"]);
    const targetDate = rawTargetDate ? parseExcelDate(rawTargetDate).split("T")[0] : undefined;

    const icon = String(getCell(row, EXCEL_SCHEMA.WISHLISTS.ICON, ["Ikon", "Icon"]) || "");
    const color = String(getCell(row, EXCEL_SCHEMA.WISHLISTS.COLOR, ["Warna", "Color"]) || "");
    const note = String(getCell(row, EXCEL_SCHEMA.WISHLISTS.NOTE, ["Catatan", "Note", "Keterangan"]) || "");
    const isCompletedRaw = String(getCell(row, EXCEL_SCHEMA.WISHLISTS.IS_COMPLETED, ["Status Selesai", "Is Completed", "Selesai"]) || "false").toLowerCase();
    const isCompleted = isCompletedRaw === "true" || isCompletedRaw === "1" || isCompletedRaw === "ya";

    parsedWishlists.push({
      id,
      name,
      targetAmount: targetAmount || 100000,
      savedAmount: savedAmount || 0,
      targetDate,
      icon: icon || undefined,
      color: color || undefined,
      note: note || undefined,
      isCompleted,
      createdAt: nowStr,
      updatedAt: nowStr,
    });
  });

  // 7. Parse Reminders
  const rawReminders = getSheetData(EXCEL_SCHEMA.SHEETS.REMINDERS, ["tagihan", "pengingat tagihan", "reminders", "bill reminders", "pengingat"]);
  const parsedReminders: BillReminder[] = [];

  rawReminders.forEach((row, idx) => {
    const title = String(getCell(row, EXCEL_SCHEMA.REMINDERS.TITLE, ["Judul Tagihan", "Judul", "Title", "Nama"]) || "").trim();
    if (!title) return;

    let id = String(getCell(row, EXCEL_SCHEMA.REMINDERS.ID, ["ID Tagihan", "ID", "Reminder ID"]) || "").trim();
    if (!id) id = `bill-import-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`;

    const amount = parseExcelNumber(getCell(row, EXCEL_SCHEMA.REMINDERS.AMOUNT, ["Jumlah Tagihan", "Jumlah", "Amount", "Nominal"]));
    const rawDueDate = getCell(row, EXCEL_SCHEMA.REMINDERS.DUE_DATE, ["Tanggal Jatuh Tempo", "Jatuh Tempo", "DueDate", "Deadline"]);
    const dueDate = parseExcelDate(rawDueDate).split("T")[0];

    const catIdVal = getCell(row, EXCEL_SCHEMA.REMINDERS.CATEGORY_ID, ["ID Kategori", "CategoryID"]);
    const catNameVal = getCell(row, EXCEL_SCHEMA.REMINDERS.CATEGORY_NAME, ["Kategori", "Category"]);
    const categoryId = catIdVal || catNameVal ? resolveCategoryId(catIdVal, catNameVal) : undefined;

    const walIdVal = getCell(row, EXCEL_SCHEMA.REMINDERS.WALLET_ID, ["ID Dompet", "WalletID"]);
    const walNameVal = getCell(row, EXCEL_SCHEMA.REMINDERS.WALLET_NAME, ["Dompet Pembayaran", "Dompet", "Wallet"]);
    const walletId = walIdVal || walNameVal ? resolveWalletId(walIdVal, walNameVal) : undefined;

    const isPaidRaw = String(getCell(row, EXCEL_SCHEMA.REMINDERS.IS_PAID, ["Status Lunas", "Is Paid", "Lunas", "Sudah Bayar"]) || "false").toLowerCase();
    const isPaid = isPaidRaw === "true" || isPaidRaw === "1" || isPaidRaw === "ya" || isPaidRaw === "lunas";
    const rawPaidAt = getCell(row, EXCEL_SCHEMA.REMINDERS.PAID_AT, ["Tanggal Dibayar", "PaidAt"]);
    const paidAt = isPaid && rawPaidAt ? parseExcelDate(rawPaidAt) : undefined;
    const note = String(getCell(row, EXCEL_SCHEMA.REMINDERS.NOTE, ["Catatan", "Note", "Keterangan"]) || "");

    parsedReminders.push({
      id,
      title,
      amount: amount || 0,
      dueDate,
      categoryId,
      walletId,
      isPaid,
      paidAt,
      note: note || undefined,
      createdAt: nowStr,
      updatedAt: nowStr,
    });
  });

  return {
    wallets: parsedWallets,
    categories: parsedCategories,
    transactions: parsedTransactions,
    transfers: parsedTransfers,
    budgets: parsedBudgets,
    wishlists: parsedWishlists,
    reminders: parsedReminders,
    summary: {
      totalWallets: parsedWallets.length,
      totalCategories: parsedCategories.length,
      totalTransactions: parsedTransactions.length,
      totalTransfers: parsedTransfers.length,
      totalBudgets: parsedBudgets.length,
      totalWishlists: parsedWishlists.length,
      totalReminders: parsedReminders.length,
    },
  };
}
