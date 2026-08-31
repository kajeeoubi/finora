import {
  Wallet,
  Category,
  Transaction,
  Transfer,
  Budget,
  UserProfile,
  BudgetCalculation,
  WishlistItem,
  BillReminder,
} from "@/types";

export interface FinoraContextType {
  user: UserProfile;
  wallets: Wallet[];
  categories: Category[];
  transactions: Transaction[];
  transfers: Transfer[];
  budgets: Budget[];
  wishlists: WishlistItem[];
  reminders: BillReminder[];

  // Computed summary
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;

  // Auth state
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;

  // User Action
  updateUser: (data: Partial<UserProfile>) => { success: boolean; error?: string };

  // Actions
  addTransaction: (data: Omit<Transaction, "id" | "createdAt" | "updatedAt">) => { success: boolean; error?: string };
  updateTransaction: (id: string, data: Partial<Omit<Transaction, "id" | "createdAt" | "updatedAt">>) => { success: boolean; error?: string };
  deleteTransaction: (id: string) => { success: boolean; error?: string };

  createTransfer: (fromWalletId: string, toWalletId: string, amount: number, note?: string) => { success: boolean; error?: string };

  addWallet: (data: Omit<Wallet, "id" | "createdAt" | "updatedAt">) => { success: boolean; error?: string };
  updateWallet: (id: string, data: Partial<Omit<Wallet, "id" | "createdAt" | "updatedAt">>) => { success: boolean; error?: string };
  deleteWallet: (id: string) => { success: boolean; error?: string };

  addCategory: (data: Omit<Category, "id">) => { success: boolean; error?: string };
  updateCategory: (id: string, data: Partial<Omit<Category, "id">>) => { success: boolean; error?: string };
  deleteCategory: (id: string) => { success: boolean; error?: string };

  addBudget: (data: Omit<Budget, "id" | "createdAt" | "updatedAt">) => { success: boolean; error?: string };
  updateBudget: (id: string, data: Partial<Omit<Budget, "id" | "createdAt" | "updatedAt">>) => { success: boolean; error?: string };
  deleteBudget: (id: string) => { success: boolean; error?: string };

  addWishlistItem: (data: Omit<WishlistItem, "id" | "createdAt" | "updatedAt">) => { success: boolean; error?: string };
  updateWishlistItem: (id: string, data: Partial<Omit<WishlistItem, "id" | "createdAt" | "updatedAt">>) => { success: boolean; error?: string };
  deleteWishlistItem: (id: string) => { success: boolean; error?: string };
  addSavingsToWishlist: (id: string, amount: number, fromWalletId?: string) => { success: boolean; error?: string };

  addReminder: (data: Omit<BillReminder, "id" | "createdAt" | "updatedAt">) => { success: boolean; error?: string };
  updateReminder: (id: string, data: Partial<Omit<BillReminder, "id" | "createdAt" | "updatedAt">>) => { success: boolean; error?: string };
  deleteReminder: (id: string) => { success: boolean; error?: string };
  payReminder: (id: string, walletId?: string) => { success: boolean; error?: string };
  unpayReminder: (id: string) => { success: boolean; error?: string };

  getBudgetCalculations: (month?: number, year?: number) => BudgetCalculation[];
  getTopBudgetNearLimit: (month?: number, year?: number) => BudgetCalculation | null;
  getExpenseByCategory: (month?: number, year?: number) => { category: Category; amount: number; percentage: number }[];
  getMonthlyTrends: () => { monthName: string; income: number; expense: number; month: number; isCurrentMonth: boolean }[];
  resetUserData: () => Promise<{ success: boolean; error?: string }>;
  importAllData: (
    parsedData: {
      wallets: Wallet[];
      categories: Category[];
      transactions: Transaction[];
      transfers: Transfer[];
      budgets: Budget[];
      wishlists: WishlistItem[];
      reminders: BillReminder[];
    },
    mode: "merge" | "overwrite"
  ) => Promise<{ success: boolean; error?: string }>;

  // Hydration state
  isHydrated: boolean;

  // Modal controls
  isTransferModalOpen: boolean;
  setIsTransferModalOpen: (open: boolean) => void;
  isAddTransactionModalOpen: boolean;
  setIsAddTransactionModalOpen: (open: boolean) => void;
  isAddWalletModalOpen: boolean;
  setIsAddWalletModalOpen: (open: boolean) => void;
  isAddBudgetModalOpen: boolean;
  setIsAddBudgetModalOpen: (open: boolean) => void;
  isAddCategoryModalOpen: boolean;
  setIsAddCategoryModalOpen: (open: boolean) => void;
  isAddWishlistModalOpen: boolean;
  setIsAddWishlistModalOpen: (open: boolean) => void;
  isAddReminderModalOpen: boolean;
  setIsAddReminderModalOpen: (open: boolean) => void;

  // Dedicated action drawer states
  payReminderItem: BillReminder | null;
  setPayReminderItem: (item: BillReminder | null) => void;
  savingTargetWishlistId: string | null;
  setSavingTargetWishlistId: (id: string | null) => void;
  limitCategoryData: { categoryId?: string; initialLimit?: number } | null;
  setLimitCategoryData: (data: { categoryId?: string; initialLimit?: number } | null) => void;
}
