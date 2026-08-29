import {
  Category,
  Wallet,
  Transaction,
  Transfer,
  Budget,
  UserProfile,
  WishlistItem,
  BillReminder,
} from "@/types";

export const INITIAL_USER: UserProfile = {
  id: "user-1",
  name: "Aditya Saputra",
  email: "aditya@finora.id",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
};

export const INITIAL_CATEGORIES: Category[] = [
  // Pengeluaran (Expense)
  { id: "cat-food", name: "Food & Drink", type: "EXPENSE", icon: "Utensils", color: "#6C4EF5", expenseLimit: 1000000, isDefault: true },
  { id: "cat-transport", name: "Transport", type: "EXPENSE", icon: "Car", color: "#0EA5E9", expenseLimit: 500000, isDefault: true },
  { id: "cat-shopping", name: "Shopping", type: "EXPENSE", icon: "ShoppingBag", color: "#F59E0B", expenseLimit: 300000, isDefault: true },
  { id: "cat-bills", name: "Tagihan & Utilitas", type: "EXPENSE", icon: "Receipt", color: "#EF4444", expenseLimit: 750000, isDefault: true },
  { id: "cat-entertainment", name: "Entertainment", type: "EXPENSE", icon: "Gamepad2", color: "#A855F7", expenseLimit: 400000, isDefault: true },
  { id: "cat-health", name: "Kesehatan", type: "EXPENSE", icon: "HeartPulse", color: "#10B981", expenseLimit: 250000, isDefault: true },
  { id: "cat-education", name: "Edukasi", type: "EXPENSE", icon: "GraduationCap", color: "#3B82F6", expenseLimit: 500000, isDefault: true },
  { id: "cat-other-exp", name: "Lainnya", type: "EXPENSE", icon: "Package", color: "#64748B", isDefault: true },

  // Pemasukan (Income)
  { id: "cat-salary", name: "Gaji Bulanan", type: "INCOME", icon: "Briefcase", color: "#22C55E", isDefault: true },
  { id: "cat-freelance", name: "Freelance", type: "INCOME", icon: "Laptop", color: "#0EA5E9", isDefault: true },
  { id: "cat-bonus", name: "Bonus", type: "INCOME", icon: "Gift", color: "#F59E0B", isDefault: true },
  { id: "cat-investment", name: "Investasi", type: "INCOME", icon: "TrendingUp", color: "#6C4EF5", isDefault: true },
  { id: "cat-other-inc", name: "Pemasukan Lain", type: "INCOME", icon: "Coins", color: "#64748B", isDefault: true },
];

export const INITIAL_WALLETS: Wallet[] = [
  {
    id: "wallet-bca",
    name: "BCA Main Account",
    type: "BANK",
    balance: 4500000,
    currency: "IDR",
    accountNumber: "2133 2339 4855",
    color: "#6C4EF5",
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
  },
  {
    id: "wallet-cash",
    name: "Cash",
    type: "CASH",
    balance: 500000,
    currency: "IDR",
    color: "#22C55E",
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
  },
  {
    id: "wallet-mandiri",
    name: "Mandiri Tabungan",
    type: "BANK",
    balance: 1500000,
    currency: "IDR",
    accountNumber: "1420 0192 8841",
    color: "#0EA5E9",
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
  },
  {
    id: "wallet-gopay",
    name: "GoPay",
    type: "EWALLET",
    balance: 750000,
    currency: "IDR",
    accountNumber: "0812 3456 7890",
    color: "#F59E0B",
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
  },
];

// Reference month: August 2026 (or current month)
const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1;

export const INITIAL_BUDGETS: Budget[] = [
  {
    id: "budget-food",
    categoryId: "cat-food",
    amount: 1000000, // Rp1.000.000
    month: currentMonth,
    year: currentYear,
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
  },
  {
    id: "budget-transport",
    categoryId: "cat-transport",
    amount: 500000, // Rp500.000
    month: currentMonth,
    year: currentYear,
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
  },
  {
    id: "budget-shopping",
    categoryId: "cat-shopping",
    amount: 300000, // Rp300.000
    month: currentMonth,
    year: currentYear,
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  // Income: Salary Rp6.000.000
  {
    id: "tx-salary",
    walletId: "wallet-bca",
    categoryId: "cat-salary",
    type: "INCOME",
    amount: 6000000,
    note: "Gaji Pokok Agustus 2026",
    transactionAt: new Date(currentYear, currentMonth - 1, 1, 9, 0).toISOString(),
    createdAt: "2026-08-01T09:00:00.000Z",
    updatedAt: "2026-08-01T09:00:00.000Z",
  },
  // Expenses totaling Rp1.750.000 (PRD §10 & §16)
  // Food: Rp750.000
  {
    id: "tx-food-1",
    walletId: "wallet-cash",
    categoryId: "cat-food",
    type: "EXPENSE",
    amount: 35000,
    note: "Makan Siang Nasi Padang",
    transactionAt: new Date().toISOString(), // Hari ini
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tx-food-2",
    walletId: "wallet-gopay",
    categoryId: "cat-food",
    type: "EXPENSE",
    amount: 215000,
    note: "Groceries Mingguan",
    transactionAt: new Date(currentYear, currentMonth - 1, 15).toISOString(),
    createdAt: "2026-08-15T10:00:00.000Z",
    updatedAt: "2026-08-15T10:00:00.000Z",
  },
  {
    id: "tx-food-3",
    walletId: "wallet-bca",
    categoryId: "cat-food",
    type: "EXPENSE",
    amount: 500000,
    note: "Belanja Bulanan Supermarket",
    transactionAt: new Date(currentYear, currentMonth - 1, 5).toISOString(),
    createdAt: "2026-08-05T12:00:00.000Z",
    updatedAt: "2026-08-05T12:00:00.000Z",
  },
  // Transport: Rp350.000
  {
    id: "tx-transport-1",
    walletId: "wallet-cash",
    categoryId: "cat-transport",
    type: "EXPENSE",
    amount: 25000,
    note: "Bensin Motor & Parkir",
    transactionAt: new Date().toISOString(), // Hari ini
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tx-transport-2",
    walletId: "wallet-gopay",
    categoryId: "cat-transport",
    type: "EXPENSE",
    amount: 325000,
    note: "Saldo Kartu Kereta & Transport",
    transactionAt: new Date(currentYear, currentMonth - 1, 3).toISOString(),
    createdAt: "2026-08-03T08:00:00.000Z",
    updatedAt: "2026-08-03T08:00:00.000Z",
  },
  // Shopping: Rp250.000
  {
    id: "tx-shopping-1",
    walletId: "wallet-mandiri",
    categoryId: "cat-shopping",
    type: "EXPENSE",
    amount: 250000,
    note: "Beli Kemeja & Kaos",
    transactionAt: new Date(currentYear, currentMonth - 1, 10).toISOString(),
    createdAt: "2026-08-10T15:00:00.000Z",
    updatedAt: "2026-08-10T15:00:00.000Z",
  },
  // Entertainment: Rp150.000
  {
    id: "tx-ent-1",
    walletId: "wallet-bca",
    categoryId: "cat-entertainment",
    type: "EXPENSE",
    amount: 150000,
    note: "Langganan Streaming Musik & Film",
    transactionAt: new Date(currentYear, currentMonth - 1, 7).toISOString(),
    createdAt: "2026-08-07T18:00:00.000Z",
    updatedAt: "2026-08-07T18:00:00.000Z",
  },
  // Lainnya: Rp250.000
  {
    id: "tx-other-1",
    walletId: "wallet-mandiri",
    categoryId: "cat-other-exp",
    type: "EXPENSE",
    amount: 250000,
    note: "Keperluan Rumah & Laundry",
    transactionAt: new Date(currentYear, currentMonth - 1, 12).toISOString(),
    createdAt: "2026-08-12T11:00:00.000Z",
    updatedAt: "2026-08-12T11:00:00.000Z",
  },
];

export const INITIAL_TRANSFERS: Transfer[] = [
  {
    id: "trf-1",
    fromWalletId: "wallet-bca",
    toWalletId: "wallet-cash",
    amount: 500000,
    note: "Tarik Tunai ATM untuk Operasional",
    transferAt: new Date(currentYear, currentMonth - 1, 1, 10, 30).toISOString(),
    createdAt: "2026-08-01T10:30:00.000Z",
  },
];

export const INITIAL_WISHLISTS: WishlistItem[] = [
  {
    id: "wish-1",
    name: "MacBook Pro M3",
    targetAmount: 28000000,
    savedAmount: 18500000,
    targetDate: new Date(currentYear, 11, 31).toISOString(),
    note: "Upgrade perangkat kerja untuk coding & desain",
    isCompleted: false,
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
  },
  {
    id: "wish-2",
    name: "Liburan ke Jepang",
    targetAmount: 20000000,
    savedAmount: 12000000,
    targetDate: new Date(currentYear + 1, 3, 30).toISOString(),
    note: "Tiket pesawat, akomodasi, & kuliner Tokyo-Kyoto",
    isCompleted: false,
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
  },
  {
    id: "wish-3",
    name: "Dana Darurat 6 Bulan",
    targetAmount: 30000000,
    savedAmount: 30000000,
    targetDate: new Date(currentYear, currentMonth - 1, 1).toISOString(),
    note: "Fondasi keuangan stabil dan aman",
    isCompleted: true,
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
  },
];

export const INITIAL_REMINDERS: BillReminder[] = [
  {
    id: "rem-1",
    title: "Tagihan Listrik PLN",
    amount: 350000,
    dueDate: new Date(currentYear, currentMonth - 1, 5).toISOString(),
    categoryId: "cat-bills",
    walletId: "wallet-bca",
    isPaid: true,
    paidAt: new Date(currentYear, currentMonth - 1, 4).toISOString(),
    note: "Listrik Pascabayar Rumah",
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
  },
  {
    id: "rem-2",
    title: "Internet & WiFi IndiHome",
    amount: 280000,
    dueDate: new Date(currentYear, currentMonth - 1, 15).toISOString(),
    categoryId: "cat-bills",
    walletId: "wallet-mandiri",
    isPaid: false,
    note: "Paket 50 Mbps",
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
  },
  {
    id: "rem-3",
    title: "BPJS Kesehatan",
    amount: 150000,
    dueDate: new Date(currentYear, currentMonth - 1, 10).toISOString(),
    categoryId: "cat-health",
    walletId: "wallet-bca",
    isPaid: false,
    note: "Iuran Kelas 1 Keluarga",
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
  },
  {
    id: "rem-4",
    title: "Langganan Spotify & Netflix",
    amount: 186000,
    dueDate: new Date(currentYear, currentMonth - 1, 25).toISOString(),
    categoryId: "cat-entertainment",
    walletId: "wallet-gopay",
    isPaid: false,
    note: "Autodebit langganan",
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
  },
];
