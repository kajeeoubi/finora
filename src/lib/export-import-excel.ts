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
 * Format tanggal ke string YYYY-MM-DD HH:mm:ss atau YYYY-MM-DD
 */
function formatDate(dateStr?: string | Date): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toISOString().split("T")[0] + " " + d.toTimeString().split(" ")[0];
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
  const d = new Date(str);
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
 * Generate dan trigger download file Excel lengkap untuk seluruh data Finora
 */
export function exportFinoraToExcel(data: FinoraExportData) {
  const wb = XLSX.utils.book_new();

  // Helper map untuk nama
  const walletMap = new Map(data.wallets.map((w) => [w.id, w.name]));
  const categoryMap = new Map(data.categories.map((c) => [c.id, c.name]));

  // 1. Sheet Ringkasan (Summary)
  const totalBalance = data.wallets.reduce((s, w) => s + w.balance, 0);
  const summaryRows = [
    ["FINORA - EXPORT DATA KEUANGAN LENGKAP"],
    ["Tanggal Export", new Date().toLocaleString("id-ID")],
    ["Nama Pengguna", data.user?.name || "Pengguna Finora"],
    ["Email Akun", data.user?.email || "-"],
    ["Total Saldo Keseluruhan (Rp)", totalBalance],
    [],
    ["RINGKASAN DATA", "JUMLAH DATA"],
    ["Dompet & Kartu (Wallets)", data.wallets.length],
    ["Kategori (Categories)", data.categories.length],
    ["Transaksi (Transactions)", data.transactions.length],
    ["Transfer Antar Dompet (Transfers)", data.transfers.length],
    ["Anggaran Bulanan (Budgets)", data.budgets.length],
    ["Impian & Tabungan (Wishlists)", data.wishlists.length],
    ["Pengingat Tagihan (Bill Reminders)", data.reminders.length],
    [],
    ["PETUNJUK PENGGUNAAN & IMPORT:"],
    ["1. File Excel ini dapat diedit dan diimport kembali ke Finora pada menu Pengaturan > Import Data."],
    ["2. Pastikan format kolom pada setiap sheet tidak diubah nama header-nya."],
    ["3. Kolom ID digunakan untuk menjaga relasi antar data. Jika menambah data baru, kosongkan ID atau buat ID unik."],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, summarySheet, "Ringkasan");

  // 2. Sheet Dompet & Kartu (Wallets)
  const walletsData = data.wallets.map((w) => ({
    "ID Dompet": w.id,
    "Nama Dompet/Kartu": w.name,
    "Tipe (CASH/BANK/EWALLET/OTHER)": w.type,
    "Saldo (Rp)": w.balance,
    "Mata Uang": w.currency || "IDR",
    "Nomor Rekening / Akun": w.accountNumber || "",
    "Warna (Hex)": w.color || "",
    "Tanggal Dibuat": formatDate(w.createdAt),
  }));
  const walletsSheet = XLSX.utils.json_to_sheet(
    walletsData.length
      ? walletsData
      : [
          {
            "ID Dompet": "",
            "Nama Dompet/Kartu": "",
            "Tipe (CASH/BANK/EWALLET/OTHER)": "CASH",
            "Saldo (Rp)": 0,
            "Mata Uang": "IDR",
            "Nomor Rekening / Akun": "",
            "Warna (Hex)": "",
            "Tanggal Dibuat": "",
          },
        ]
  );
  XLSX.utils.book_append_sheet(wb, walletsSheet, "Dompet & Kartu");

  // 3. Sheet Kategori (Categories)
  const categoriesData = data.categories.map((c) => ({
    "ID Kategori": c.id,
    "Nama Kategori": c.name,
    "Tipe (EXPENSE/INCOME)": c.type,
    "Ikon (Iconify ID)": c.icon,
    "Warna (Hex)": c.color || "",
    "Batas Anggaran (Rp)": c.expenseLimit || 0,
    "Kategori Bawaan (TRUE/FALSE)": c.isDefault ? "TRUE" : "FALSE",
  }));
  const categoriesSheet = XLSX.utils.json_to_sheet(
    categoriesData.length
      ? categoriesData
      : [
          {
            "ID Kategori": "",
            "Nama Kategori": "",
            "Tipe (EXPENSE/INCOME)": "EXPENSE",
            "Ikon (Iconify ID)": "solar:box-bold",
            "Warna (Hex)": "",
            "Batas Anggaran (Rp)": 0,
            "Kategori Bawaan (TRUE/FALSE)": "FALSE",
          },
        ]
  );
  XLSX.utils.book_append_sheet(wb, categoriesSheet, "Kategori");

  // 4. Sheet Transaksi (Transactions)
  const transactionsData = data.transactions.map((t) => ({
    "ID Transaksi": t.id,
    "Tanggal Transaksi": formatDate(t.transactionAt),
    "Tipe (EXPENSE/INCOME)": t.type,
    "Kategori": categoryMap.get(t.categoryId) || t.categoryId,
    "ID Kategori": t.categoryId,
    "Dompet": walletMap.get(t.walletId) || t.walletId,
    "ID Dompet": t.walletId,
    "Jumlah (Rp)": t.amount,
    "Catatan": t.note || "",
    "Tanggal Dicatat": formatDate(t.createdAt),
  }));
  const transactionsSheet = XLSX.utils.json_to_sheet(
    transactionsData.length
      ? transactionsData
      : [
          {
            "ID Transaksi": "",
            "Tanggal Transaksi": formatDate(new Date()),
            "Tipe (EXPENSE/INCOME)": "EXPENSE",
            "Kategori": "",
            "ID Kategori": "",
            "Dompet": "",
            "ID Dompet": "",
            "Jumlah (Rp)": 0,
            "Catatan": "",
            "Tanggal Dicatat": "",
          },
        ]
  );
  XLSX.utils.book_append_sheet(wb, transactionsSheet, "Transaksi");

  // 5. Sheet Transfer (Transfers)
  const transfersData = data.transfers.map((tr) => ({
    "ID Transfer": tr.id,
    "Tanggal Transfer": formatDate(tr.transferAt),
    "Dari Dompet": walletMap.get(tr.fromWalletId) || tr.fromWalletId,
    "ID Dari Dompet": tr.fromWalletId,
    "Ke Dompet": walletMap.get(tr.toWalletId) || tr.toWalletId,
    "ID Ke Dompet": tr.toWalletId,
    "Jumlah (Rp)": tr.amount,
    "Catatan": tr.note || "",
    "Tanggal Dicatat": formatDate(tr.createdAt),
  }));
  const transfersSheet = XLSX.utils.json_to_sheet(
    transfersData.length
      ? transfersData
      : [
          {
            "ID Transfer": "",
            "Tanggal Transfer": formatDate(new Date()),
            "Dari Dompet": "",
            "ID Dari Dompet": "",
            "Ke Dompet": "",
            "ID Ke Dompet": "",
            "Jumlah (Rp)": 0,
            "Catatan": "",
            "Tanggal Dicatat": "",
          },
        ]
  );
  XLSX.utils.book_append_sheet(wb, transfersSheet, "Transfer");

  // 6. Sheet Anggaran (Budgets)
  const budgetsData = data.budgets.map((b) => ({
    "ID Anggaran": b.id,
    "Kategori": categoryMap.get(b.categoryId) || b.categoryId,
    "ID Kategori": b.categoryId,
    "Bulan (1-12)": b.month,
    "Tahun": b.year,
    "Jumlah Anggaran (Rp)": b.amount,
    "Tanggal Dibuat": formatDate(b.createdAt),
  }));
  const budgetsSheet = XLSX.utils.json_to_sheet(
    budgetsData.length
      ? budgetsData
      : [
          {
            "ID Anggaran": "",
            "Kategori": "",
            "ID Kategori": "",
            "Bulan (1-12)": new Date().getMonth() + 1,
            "Tahun": new Date().getFullYear(),
            "Jumlah Anggaran (Rp)": 0,
            "Tanggal Dibuat": "",
          },
        ]
  );
  XLSX.utils.book_append_sheet(wb, budgetsSheet, "Anggaran");

  // 7. Sheet Impian & Tabungan (Wishlists)
  const wishlistsData = data.wishlists.map((w) => ({
    "ID Impian": w.id,
    "Nama Target Impian": w.name,
    "Target Nominal (Rp)": w.targetAmount,
    "Terkumpul (Rp)": w.savedAmount,
    "Target Tanggal": w.targetDate ? formatDate(w.targetDate).split(" ")[0] : "",
    "Ikon": w.icon || "",
    "Warna (Hex)": w.color || "",
    "Catatan": w.note || "",
    "Status Selesai (TRUE/FALSE)": w.isCompleted ? "TRUE" : "FALSE",
    "Tanggal Dibuat": formatDate(w.createdAt),
  }));
  const wishlistsSheet = XLSX.utils.json_to_sheet(
    wishlistsData.length
      ? wishlistsData
      : [
          {
            "ID Impian": "",
            "Nama Target Impian": "",
            "Target Nominal (Rp)": 0,
            "Terkumpul (Rp)": 0,
            "Target Tanggal": "",
            "Ikon": "",
            "Warna (Hex)": "",
            "Catatan": "",
            "Status Selesai (TRUE/FALSE)": "FALSE",
            "Tanggal Dibuat": "",
          },
        ]
  );
  XLSX.utils.book_append_sheet(wb, wishlistsSheet, "Impian & Tabungan");

  // 8. Sheet Pengingat Tagihan (Bill Reminders)
  const remindersData = data.reminders.map((r) => ({
    "ID Tagihan": r.id,
    "Judul Tagihan": r.title,
    "Jumlah Tagihan (Rp)": r.amount,
    "Tanggal Jatuh Tempo": r.dueDate ? formatDate(r.dueDate).split(" ")[0] : "",
    "Kategori": r.categoryId ? categoryMap.get(r.categoryId) || r.categoryId : "",
    "ID Kategori": r.categoryId || "",
    "Dompet Pembayaran": r.walletId ? walletMap.get(r.walletId) || r.walletId : "",
    "ID Dompet": r.walletId || "",
    "Status Lunas (TRUE/FALSE)": r.isPaid ? "TRUE" : "FALSE",
    "Tanggal Dibayar": r.paidAt ? formatDate(r.paidAt) : "",
    "Catatan": r.note || "",
    "Tanggal Dibuat": formatDate(r.createdAt),
  }));
  const remindersSheet = XLSX.utils.json_to_sheet(
    remindersData.length
      ? remindersData
      : [
          {
            "ID Tagihan": "",
            "Judul Tagihan": "",
            "Jumlah Tagihan (Rp)": 0,
            "Tanggal Jatuh Tempo": "",
            "Kategori": "",
            "ID Kategori": "",
            "Dompet Pembayaran": "",
            "ID Dompet": "",
            "Status Lunas (TRUE/FALSE)": "FALSE",
            "Tanggal Dibayar": "",
            "Catatan": "",
            "Tanggal Dibuat": "",
          },
        ]
  );
  XLSX.utils.book_append_sheet(wb, remindersSheet, "Pengingat Tagihan");

  // Format filename with date
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const filename = `Finora_Backup_Data_${dateStr}.xlsx`;

  XLSX.writeFile(wb, filename);
}

/**
 * Generate Template Excel Kosong dengan contoh data format
 */
export function generateExcelTemplate() {
  const wb = XLSX.utils.book_new();

  // 1. Sheet Ringkasan & Petunjuk
  const guideRows = [
    ["FINORA - TEMPLATE IMPORT DATA EXCEL"],
    ["Petunjuk Pengisian Template:"],
    ["1. Isilah setiap Sheet (Dompet & Kartu, Kategori, Transaksi, Transfer, Anggaran, Impian & Tabungan, Pengingat Tagihan) sesuai kebutuhan."],
    ["2. Nama Dompet dan Kategori di sheet Transaksi akan dicocokkan otomatis."],
    ["3. Tipe Dompet yang valid: CASH, BANK, EWALLET, OTHER."],
    ["4. Tipe Transaksi & Kategori yang valid: EXPENSE (Pengeluaran), INCOME (Pemasukan)."],
    ["5. Kolom ID dapat dikosongkan jika Anda menambahkan data baru."],
    ["6. Simpan file ini lalu upload pada menu Pengaturan > Import Data di Finora."],
  ];
  const guideSheet = XLSX.utils.aoa_to_sheet(guideRows);
  XLSX.utils.book_append_sheet(wb, guideSheet, "Petunjuk");

  // 2. Sheet Dompet Contoh
  const sampleWallets = [
    {
      "ID Dompet": "wallet-cash",
      "Nama Dompet/Kartu": "Uang Tunai / Dompet Fisik",
      "Tipe (CASH/BANK/EWALLET/OTHER)": "CASH",
      "Saldo (Rp)": 500000,
      "Mata Uang": "IDR",
      "Nomor Rekening / Akun": "-",
      "Warna (Hex)": "#10B981",
    },
    {
      "ID Dompet": "wallet-bca",
      "Nama Dompet/Kartu": "Bank BCA Utama",
      "Tipe (CASH/BANK/EWALLET/OTHER)": "BANK",
      "Saldo (Rp)": 3500000,
      "Mata Uang": "IDR",
      "Nomor Rekening / Akun": "1234567890",
      "Warna (Hex)": "#3B82F6",
    },
    {
      "ID Dompet": "wallet-gopay",
      "Nama Dompet/Kartu": "GoPay / OVO",
      "Tipe (CASH/BANK/EWALLET/OTHER)": "EWALLET",
      "Saldo (Rp)": 250000,
      "Mata Uang": "IDR",
      "Nomor Rekening / Akun": "08123456789",
      "Warna (Hex)": "#8B5CF6",
    },
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sampleWallets), "Dompet & Kartu");

  // 3. Sheet Kategori Contoh
  const sampleCategories = [
    {
      "ID Kategori": "cat-food",
      "Nama Kategori": "Makanan & Minuman",
      "Tipe (EXPENSE/INCOME)": "EXPENSE",
      "Ikon (Iconify ID)": "solar:cup-hot-bold",
      "Warna (Hex)": "#F59E0B",
      "Batas Anggaran (Rp)": 1500000,
    },
    {
      "ID Kategori": "cat-transport",
      "Nama Kategori": "Transportasi",
      "Tipe (EXPENSE/INCOME)": "EXPENSE",
      "Ikon (Iconify ID)": "solar:bus-bold",
      "Warna (Hex)": "#3B82F6",
      "Batas Anggaran (Rp)": 500000,
    },
    {
      "ID Kategori": "cat-salary",
      "Nama Kategori": "Gaji Bulanan",
      "Tipe (EXPENSE/INCOME)": "INCOME",
      "Ikon (Iconify ID)": "solar:wallet-money-bold",
      "Warna (Hex)": "#10B981",
      "Batas Anggaran (Rp)": 0,
    },
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sampleCategories), "Kategori");

  // 4. Sheet Transaksi Contoh
  const sampleTransactions = [
    {
      "Tanggal Transaksi": "2026-08-30 10:00:00",
      "Tipe (EXPENSE/INCOME)": "INCOME",
      "Kategori": "Gaji Bulanan",
      "Dompet": "Bank BCA Utama",
      "Jumlah (Rp)": 7500000,
      "Catatan": "Gaji bulan Agustus",
    },
    {
      "Tanggal Transaksi": "2026-08-30 12:30:00",
      "Tipe (EXPENSE/INCOME)": "EXPENSE",
      "Kategori": "Makanan & Minuman",
      "Dompet": "GoPay / OVO",
      "Jumlah (Rp)": 45000,
      "Catatan": "Makan siang",
    },
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sampleTransactions), "Transaksi");

  // 5. Sheet Transfer Contoh
  const sampleTransfers = [
    {
      "Tanggal Transfer": "2026-08-30 11:00:00",
      "Dari Dompet": "Bank BCA Utama",
      "Ke Dompet": "GoPay / OVO",
      "Jumlah (Rp)": 300000,
      "Catatan": "Top up GoPay untuk ongkos",
    },
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sampleTransfers), "Transfer");

  // 6. Sheet Anggaran Contoh
  const sampleBudgets = [
    {
      "Kategori": "Makanan & Minuman",
      "Bulan (1-12)": 8,
      "Tahun": 2026,
      "Jumlah Anggaran (Rp)": 1500000,
    },
    {
      "Kategori": "Transportasi",
      "Bulan (1-12)": 8,
      "Tahun": 2026,
      "Jumlah Anggaran (Rp)": 500000,
    },
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sampleBudgets), "Anggaran");

  // 7. Sheet Impian Contoh
  const sampleWishlists = [
    {
      "Nama Target Impian": "Liburan Akhir Tahun",
      "Target Nominal (Rp)": 5000000,
      "Terkumpul (Rp)": 1500000,
      "Target Tanggal": "2026-12-31",
      "Ikon": "solar:plane-bold",
      "Warna (Hex)": "#06B6D4",
      "Catatan": "Tabungan tiket & hotel",
    },
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sampleWishlists), "Impian & Tabungan");

  // 8. Sheet Pengingat Tagihan Contoh
  const sampleReminders = [
    {
      "Judul Tagihan": "Tagihan WiFi / Internet",
      "Jumlah Tagihan (Rp)": 350000,
      "Tanggal Jatuh Tempo": "2026-09-05",
      "Kategori": "Tagihan & Utilitas",
      "Dompet Pembayaran": "Bank BCA Utama",
      "Status Lunas (TRUE/FALSE)": "FALSE",
      "Catatan": "Bayar via mobile banking",
    },
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sampleReminders), "Pengingat Tagihan");

  XLSX.writeFile(wb, "Finora_Template_Import.xlsx");
}

/**
 * Parser file Excel menjadi struktur objek data Finora
 */
export async function parseFinoraExcel(file: File): Promise<ParsedFinoraData> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });

  const getSheetData = (possibleNames: string[]): any[] => {
    for (const name of possibleNames) {
      const foundKey = Object.keys(wb.Sheets).find(
        (s) => s.toLowerCase().trim() === name.toLowerCase().trim()
      );
      if (foundKey && wb.Sheets[foundKey]) {
        return XLSX.utils.sheet_to_json(wb.Sheets[foundKey], { defval: "" });
      }
    }
    return [];
  };

  const nowStr = new Date().toISOString();

  // Helper pencocokan field
  const findVal = (row: any, keys: string[]): any => {
    for (const k of Object.keys(row)) {
      const normK = k.toLowerCase().replace(/[^a-z0-9]/g, "");
      for (const target of keys) {
        const normTarget = target.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (normK.includes(normTarget) || normTarget.includes(normK)) {
          return row[k];
        }
      }
    }
    return undefined;
  };

  // 1. Parse Wallets
  const rawWallets = getSheetData(["dompet & kartu", "dompet", "wallets", "wallet", "kartu", "cards"]);
  const parsedWallets: Wallet[] = [];
  const walletNameToIdMap = new Map<string, string>();

  rawWallets.forEach((row, idx) => {
    const name = String(findVal(row, ["namadompet", "nama", "name"]) || "").trim();
    if (!name) return;

    let id = String(findVal(row, ["iddompet", "id", "walletid"]) || "").trim();
    if (!id) id = `w-import-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`;

    let rawType = String(findVal(row, ["tipe", "type"]) || "CASH").toUpperCase();
    let type: WalletType = "CASH";
    if (rawType.includes("BANK")) type = "BANK";
    else if (rawType.includes("EWALLET") || rawType.includes("E-WALLET") || rawType.includes("WALLET")) type = "EWALLET";
    else if (rawType.includes("OTHER") || rawType.includes("LAIN")) type = "OTHER";

    const balance = parseExcelNumber(findVal(row, ["saldo", "balance", "nominal", "jumlah"]));
    const currency = String(findVal(row, ["matauang", "currency"]) || "IDR").toUpperCase();
    const accountNumber = String(findVal(row, ["nomorrekening", "rekening", "account", "noakun"]) || "");
    const color = String(findVal(row, ["warna", "color", "hex"]) || "");
    const createdAt = parseExcelDate(findVal(row, ["tanggaldibuat", "createdat", "tanggal"]));

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
    walletNameToIdMap.set(name.toLowerCase(), id);
    walletNameToIdMap.set(id.toLowerCase(), id);
  });

  // 2. Parse Categories
  const rawCategories = getSheetData(["kategori", "categories", "category"]);
  const parsedCategories: Category[] = [];
  const categoryNameToIdMap = new Map<string, string>();

  rawCategories.forEach((row, idx) => {
    const name = String(findVal(row, ["namakategori", "nama", "name"]) || "").trim();
    if (!name) return;

    let id = String(findVal(row, ["idkategori", "id", "categoryid"]) || "").trim();
    if (!id) id = `cat-import-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`;

    let rawType = String(findVal(row, ["tipe", "type"]) || "EXPENSE").toUpperCase();
    let type: CategoryType = rawType.includes("INCOME") || rawType.includes("MASUK") ? "INCOME" : "EXPENSE";

    const icon = String(findVal(row, ["ikon", "icon", "iconify"]) || "solar:box-bold");
    const color = String(findVal(row, ["warna", "color", "hex"]) || "");
    const expenseLimit = parseExcelNumber(findVal(row, ["batasanggaran", "limit", "expenselimit"]));
    const isDefaultRaw = String(findVal(row, ["kategoribawaan", "isdefault", "default"]) || "false").toLowerCase();
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
    categoryNameToIdMap.set(name.toLowerCase(), id);
    categoryNameToIdMap.set(id.toLowerCase(), id);
  });

  // Helper find/resolve wallet ID
  const resolveWalletId = (inputVal?: any): string => {
    if (!inputVal) return parsedWallets[0]?.id || "w-default";
    const str = String(inputVal).trim().toLowerCase();
    return walletNameToIdMap.get(str) || String(inputVal);
  };

  // Helper find/resolve category ID
  const resolveCategoryId = (inputVal?: any): string => {
    if (!inputVal) return parsedCategories[0]?.id || "cat-default";
    const str = String(inputVal).trim().toLowerCase();
    return categoryNameToIdMap.get(str) || String(inputVal);
  };

  // 3. Parse Transactions
  const rawTransactions = getSheetData(["transaksi", "transactions", "transaksi masuk & keluar"]);
  const parsedTransactions: Transaction[] = [];

  rawTransactions.forEach((row, idx) => {
    const amount = parseExcelNumber(findVal(row, ["jumlah", "amount", "nominal", "total"]));
    if (amount <= 0) return;

    let id = String(findVal(row, ["idtransaksi", "id", "transactionid"]) || "").trim();
    if (!id) id = `tx-import-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`;

    let rawType = String(findVal(row, ["tipe", "type"]) || "EXPENSE").toUpperCase();
    let type: TransactionType = rawType.includes("INCOME") || rawType.includes("MASUK") ? "INCOME" : "EXPENSE";

    const rawCat = findVal(row, ["idkategori", "categoryid", "kategori", "category"]);
    const categoryId = resolveCategoryId(rawCat);

    const rawWal = findVal(row, ["iddompet", "walletid", "dompet", "wallet", "kartu"]);
    const walletId = resolveWalletId(rawWal);

    const note = String(findVal(row, ["catatan", "note", "keterangan", "deskripsi"]) || "");
    const transactionAt = parseExcelDate(findVal(row, ["tanggaltransaksi", "tanggal", "transactionat", "date"]));
    const createdAt = parseExcelDate(findVal(row, ["tanggaldicatat", "createdat"])) || nowStr;

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
  const rawTransfers = getSheetData(["transfer", "transfers", "transfer dompet"]);
  const parsedTransfers: Transfer[] = [];

  rawTransfers.forEach((row, idx) => {
    const amount = parseExcelNumber(findVal(row, ["jumlah", "amount", "nominal"]));
    if (amount <= 0) return;

    let id = String(findVal(row, ["idtransfer", "id", "transferid"]) || "").trim();
    if (!id) id = `trf-import-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`;

    const fromRaw = findVal(row, ["iddaridompet", "daridompet", "fromwalletid", "fromwallet", "asal"]);
    const toRaw = findVal(row, ["idkedompet", "kedompet", "towalletid", "towallet", "tujuan"]);

    const fromWalletId = resolveWalletId(fromRaw);
    const toWalletId = resolveWalletId(toRaw);
    const note = String(findVal(row, ["catatan", "note", "keterangan"]) || "");
    const transferAt = parseExcelDate(findVal(row, ["tanggaltransfer", "tanggal", "transferat", "date"]));

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
  const rawBudgets = getSheetData(["anggaran", "budgets", "budget"]);
  const parsedBudgets: Budget[] = [];

  rawBudgets.forEach((row, idx) => {
    const amount = parseExcelNumber(findVal(row, ["jumlahanggaran", "jumlah", "amount", "budget"]));
    if (amount <= 0) return;

    let id = String(findVal(row, ["idanggaran", "id", "budgetid"]) || "").trim();
    if (!id) id = `bg-import-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`;

    const rawCat = findVal(row, ["idkategori", "categoryid", "kategori", "category"]);
    const categoryId = resolveCategoryId(rawCat);

    const month = parseInt(String(findVal(row, ["bulan", "month"]) || new Date().getMonth() + 1), 10) || new Date().getMonth() + 1;
    const year = parseInt(String(findVal(row, ["tahun", "year"]) || new Date().getFullYear()), 10) || new Date().getFullYear();

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
  const rawWishlists = getSheetData(["impian & tabungan", "impian", "wishlists", "wishlist", "tabungan"]);
  const parsedWishlists: WishlistItem[] = [];

  rawWishlists.forEach((row, idx) => {
    const name = String(findVal(row, ["namatargetimpian", "nama", "name", "target"]) || "").trim();
    if (!name) return;

    let id = String(findVal(row, ["idimpian", "id", "wishlistid"]) || "").trim();
    if (!id) id = `wish-import-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`;

    const targetAmount = parseExcelNumber(findVal(row, ["targetnominal", "targetamount", "target", "nominal"]));
    const savedAmount = parseExcelNumber(findVal(row, ["terkumpul", "savedamount", "saldo"]));
    const targetDate = findVal(row, ["targettanggal", "targetdate", "deadline"]) ? parseExcelDate(findVal(row, ["targettanggal", "targetdate", "deadline"])).split("T")[0] : undefined;
    const icon = String(findVal(row, ["ikon", "icon"]) || "");
    const color = String(findVal(row, ["warna", "color"]) || "");
    const note = String(findVal(row, ["catatan", "note", "keterangan"]) || "");
    const isCompletedRaw = String(findVal(row, ["statusselesai", "iscompleted", "selesai"]) || "false").toLowerCase();
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
  const rawReminders = getSheetData(["pengingat tagihan", "tagihan", "reminders", "bill reminders", "pengingat"]);
  const parsedReminders: BillReminder[] = [];

  rawReminders.forEach((row, idx) => {
    const title = String(findVal(row, ["judultagihan", "judul", "title", "nama"]) || "").trim();
    if (!title) return;

    let id = String(findVal(row, ["idtagihan", "id", "reminderid"]) || "").trim();
    if (!id) id = `bill-import-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`;

    const amount = parseExcelNumber(findVal(row, ["jumlahtagihan", "jumlah", "amount", "nominal"]));
    const dueDate = parseExcelDate(findVal(row, ["tanggaljatuhtempo", "jatuhtempo", "duedate", "deadline"])).split("T")[0];
    const categoryId = findVal(row, ["idkategori", "categoryid", "kategori"]) ? resolveCategoryId(findVal(row, ["idkategori", "categoryid", "kategori"])) : undefined;
    const walletId = findVal(row, ["iddompet", "walletid", "dompet"]) ? resolveWalletId(findVal(row, ["iddompet", "walletid", "dompet"])) : undefined;

    const isPaidRaw = String(findVal(row, ["statuslunas", "ispaid", "lunas", "sudahbayar"]) || "false").toLowerCase();
    const isPaid = isPaidRaw === "true" || isPaidRaw === "1" || isPaidRaw === "ya" || isPaidRaw === "lunas";
    const paidAt = isPaid && findVal(row, ["tanggaldibayar", "paidat"]) ? parseExcelDate(findVal(row, ["tanggaldibayar", "paidat"])) : undefined;
    const note = String(findVal(row, ["catatan", "note", "keterangan"]) || "");

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
