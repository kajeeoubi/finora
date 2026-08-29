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
  icon: string;
  color?: string;
  expenseLimit?: number;
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  walletId: string;
  categoryId: string;
  type: TransactionType;
  amount: number;
  note?: string;
  transactionAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transfer {
  id: string;
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  note?: string;
  transferAt: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  month: number;
  year: number;
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

export interface WishlistItem {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  targetDate?: string;
  icon?: string;
  color?: string;
  note?: string;
  isCompleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BillReminder {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  categoryId?: string;
  walletId?: string;
  isPaid: boolean;
  paidAt?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}
