export type WalletType = "CASH" | "BANK" | "EWALLET" | "OTHER";

export type TransactionType = "INCOME" | "EXPENSE";

export type CategoryType = "INCOME" | "EXPENSE";

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  balance: number;
  currency: string;
  accountNumber?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  icon: string; // lucide icon identifier or emoji
  color?: string;
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  walletId: string;
  categoryId: string;
  type: TransactionType;
  amount: number;
  note?: string;
  transactionAt: string; // ISO date string
  createdAt: string;
  updatedAt: string;
}

export interface Transfer {
  id: string;
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  note?: string;
  transferAt: string; // ISO date string
  createdAt: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number; // Target monthly budget
  month: number;  // 1 - 12
  year: number;   // e.g. 2026
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export type BudgetStatus = "NORMAL" | "WARNING" | "EXCEEDED";

export interface BudgetCalculation {
  budget: Budget;
  category: Category;
  spent: number;
  remaining: number;
  percentage: number;
  status: BudgetStatus;
}
