"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  Wallet,
  Category,
  Transaction,
  Transfer,
  Budget,
  UserProfile,
  BudgetCalculation,
  BudgetStatus,
  TransactionType,
  WishlistItem,
  BillReminder,
} from "@/types";
import {
  INITIAL_USER,
  INITIAL_CATEGORIES,
  INITIAL_WALLETS,
  INITIAL_BUDGETS,
  INITIAL_TRANSACTIONS,
  INITIAL_TRANSFERS,
  INITIAL_WISHLISTS,
  INITIAL_REMINDERS,
} from "@/lib/initial-data";

interface FinoraContextType {
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
  login: (email: string, password?: string) => boolean;
  logout: () => void;

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

  resetToDefaultData: () => void;

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

const FinoraContext = createContext<FinoraContextType | undefined>(undefined);

const STORAGE_KEYS = {
  AUTH: "finora_auth_v2",
  USER: "finora_user_v2",
  WALLETS: "finora_wallets_v2",
  CATEGORIES: "finora_categories_v2",
  TRANSACTIONS: "finora_transactions_v2",
  TRANSFERS: "finora_transfers_v2",
  BUDGETS: "finora_budgets_v2",
  WISHLISTS: "finora_wishlists_v2",
  REMINDERS: "finora_reminders_v2",
};

export function FinoraProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [wallets, setWallets] = useState<Wallet[]>(INITIAL_WALLETS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [transfers, setTransfers] = useState<Transfer[]>(INITIAL_TRANSFERS);
  const [budgets, setBudgets] = useState<Budget[]>(INITIAL_BUDGETS);
  const [wishlists, setWishlists] = useState<WishlistItem[]>(INITIAL_WISHLISTS);
  const [reminders, setReminders] = useState<BillReminder[]>(INITIAL_REMINDERS);
  const [isHydrated, setIsHydrated] = useState(false);

  // Modals state
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
  const [isAddWalletModalOpen, setIsAddWalletModalOpen] = useState(false);
  const [isAddBudgetModalOpen, setIsAddBudgetModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddWishlistModalOpen, setIsAddWishlistModalOpen] = useState(false);
  const [isAddReminderModalOpen, setIsAddReminderModalOpen] = useState(false);
  const [payReminderItem, setPayReminderItem] = useState<BillReminder | null>(null);
  const [savingTargetWishlistId, setSavingTargetWishlistId] = useState<string | null>(null);
  const [limitCategoryData, setLimitCategoryData] = useState<{ categoryId?: string; initialLimit?: number } | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem(STORAGE_KEYS.AUTH);
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
      const savedWallets = localStorage.getItem(STORAGE_KEYS.WALLETS);
      const savedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      const savedTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      const savedTransfers = localStorage.getItem(STORAGE_KEYS.TRANSFERS);
      const savedBudgets = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      const savedWishlists = localStorage.getItem(STORAGE_KEYS.WISHLISTS);
      const savedReminders = localStorage.getItem(STORAGE_KEYS.REMINDERS);

      if (savedAuth === "true") setIsAuthenticated(true);
      if (savedUser) setUser(JSON.parse(savedUser));
      if (savedWallets) setWallets(JSON.parse(savedWallets));
      if (savedCategories) setCategories(JSON.parse(savedCategories));
      if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
      if (savedTransfers) setTransfers(JSON.parse(savedTransfers));
      if (savedBudgets) setBudgets(JSON.parse(savedBudgets));
      if (savedWishlists) setWishlists(JSON.parse(savedWishlists));
      if (savedReminders) setReminders(JSON.parse(savedReminders));
    } catch (e) {
      console.warn("Could not load stored Finora data:", e);
    }
    setIsHydrated(true);
  }, []);

  // Login action
  const login = useCallback((_email: string, _password?: string) => {
    setIsAuthenticated(true);
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH, "true");
    } catch (e) {
      console.warn("Could not save auth state:", e);
    }
    return true;
  }, []);

  // Logout action
  const logout = useCallback(() => {
    setIsAuthenticated(false);
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH, "false");
    } catch (e) {
      console.warn("Could not clear auth state:", e);
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.WALLETS, JSON.stringify(wallets));
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
      localStorage.setItem(STORAGE_KEYS.TRANSFERS, JSON.stringify(transfers));
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
      localStorage.setItem(STORAGE_KEYS.WISHLISTS, JSON.stringify(wishlists));
      localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
    } catch (e) {
      console.warn("Could not save Finora data:", e);
    }
  }, [isHydrated, user, wallets, categories, transactions, transfers, budgets, wishlists, reminders]);

  // Reset to default PRD seed data
  const resetToDefaultData = useCallback(() => {
    setUser(INITIAL_USER);
    setWallets(INITIAL_WALLETS);
    setCategories(INITIAL_CATEGORIES);
    setTransactions(INITIAL_TRANSACTIONS);
    setTransfers(INITIAL_TRANSFERS);
    setBudgets(INITIAL_BUDGETS);
    setWishlists(INITIAL_WISHLISTS);
    setReminders(INITIAL_REMINDERS);

    try {
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.WALLETS);
      localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
      localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
      localStorage.removeItem(STORAGE_KEYS.TRANSFERS);
      localStorage.removeItem(STORAGE_KEYS.BUDGETS);
      localStorage.removeItem(STORAGE_KEYS.WISHLISTS);
      localStorage.removeItem(STORAGE_KEYS.REMINDERS);
    } catch (e) {
      console.warn("Error resetting storage:", e);
    }
  }, []);

  const updateUser = useCallback((data: Partial<UserProfile>) => {
    setUser((prev) => {
      const updated = { ...prev, ...data };
      try {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
      } catch (e) {
        console.warn("Could not save user data:", e);
      }
      return updated;
    });
    return { success: true };
  }, []);

  // Total balance = sum of all wallet balances (PRD §10)
  const totalBalance = useMemo(() => {
    return wallets.reduce((sum, w) => sum + w.balance, 0);
  }, [wallets]);

  // Current month/year context
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Monthly income & expense
  const { monthlyIncome, monthlyExpense } = useMemo(() => {
    let income = 0;
    let expense = 0;

    transactions.forEach((tx) => {
      const txDate = new Date(tx.transactionAt);
      if (
        txDate.getMonth() + 1 === currentMonth &&
        txDate.getFullYear() === currentYear
      ) {
        if (tx.type === "INCOME") {
          income += tx.amount;
        } else if (tx.type === "EXPENSE") {
          expense += tx.amount;
        }
      }
    });

    return { monthlyIncome: income, monthlyExpense: expense };
  }, [transactions, currentMonth, currentYear]);

  // Add Transaction (Atomic wallet adjustment - PRD §11 & §21)
  const addTransaction = useCallback(
    (data: Omit<Transaction, "id" | "createdAt" | "updatedAt">) => {
      if (data.amount <= 0) {
        return { success: false, error: "Jumlah harus lebih besar dari Rp 0" };
      }

      const wallet = wallets.find((w) => w.id === data.walletId);
      if (!wallet) {
        return { success: false, error: "Dompet / Wallet tidak ditemukan" };
      }

      if (data.type === "EXPENSE" && wallet.balance < data.amount) {
        return {
          success: false,
          error: "Saldo di dompet ini tidak mencukupi untuk pengeluaran ini",
        };
      }

      const nowStr = new Date().toISOString();
      const newTx: Transaction = {
        ...data,
        id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: nowStr,
        updatedAt: nowStr,
      };

      // Atomic balance update
      setWallets((prev) =>
        prev.map((w) => {
          if (w.id === data.walletId) {
            const newBal =
              data.type === "INCOME"
                ? w.balance + data.amount
                : w.balance - data.amount;
            return { ...w, balance: newBal, updatedAt: nowStr };
          }
          return w;
        })
      );

      setTransactions((prev) => [newTx, ...prev]);
      return { success: true };
    },
    [wallets]
  );

  // Update Transaction (Atomic rollback + re-apply - PRD §11)
  const updateTransaction = useCallback(
    (
      id: string,
      data: Partial<Omit<Transaction, "id" | "createdAt" | "updatedAt">>
    ) => {
      const oldTx = transactions.find((t) => t.id === id);
      if (!oldTx) return { success: false, error: "Transaksi tidak ditemukan" };

      const targetWalletId = data.walletId || oldTx.walletId;
      const targetAmount = data.amount !== undefined ? data.amount : oldTx.amount;
      const targetType = data.type || oldTx.type;

      if (targetAmount <= 0) {
        return { success: false, error: "Jumlah harus lebih besar dari Rp 0" };
      }

      const nowStr = new Date().toISOString();

      setWallets((prev) => {
        return prev.map((w) => {
          let bal = w.balance;
          // Rollback old effect
          if (w.id === oldTx.walletId) {
            bal = oldTx.type === "INCOME" ? bal - oldTx.amount : bal + oldTx.amount;
          }
          // Apply new effect
          if (w.id === targetWalletId) {
            bal = targetType === "INCOME" ? bal + targetAmount : bal - targetAmount;
          }
          return { ...w, balance: bal, updatedAt: nowStr };
        });
      });

      setTransactions((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, ...data, updatedAt: nowStr }
            : t
        )
      );

      return { success: true };
    },
    [transactions]
  );

  // Delete Transaction (Atomic rollback - PRD §11)
  const deleteTransaction = useCallback(
    (id: string) => {
      const oldTx = transactions.find((t) => t.id === id);
      if (!oldTx) return { success: false, error: "Transaksi tidak ditemukan" };

      const nowStr = new Date().toISOString();

      setWallets((prev) =>
        prev.map((w) => {
          if (w.id === oldTx.walletId) {
            const revertedBalance =
              oldTx.type === "INCOME"
                ? w.balance - oldTx.amount
                : w.balance + oldTx.amount;
            return { ...w, balance: revertedBalance, updatedAt: nowStr };
          }
          return w;
        })
      );

      setTransactions((prev) => prev.filter((t) => t.id !== id));
      return { success: true };
    },
    [transactions]
  );

  // Create Transfer (Atomic source deduction & dest increment - PRD §14 & §22)
  const createTransfer = useCallback(
    (fromWalletId: string, toWalletId: string, amount: number, note?: string) => {
      if (amount <= 0) {
        return { success: false, error: "Nominal transfer harus lebih besar dari Rp 0" };
      }
      if (fromWalletId === toWalletId) {
        return {
          success: false,
          error: "Dompet asal dan dompet tujuan tidak boleh sama",
        };
      }

      const sourceWallet = wallets.find((w) => w.id === fromWalletId);
      const destWallet = wallets.find((w) => w.id === toWalletId);

      if (!sourceWallet || !destWallet) {
        return { success: false, error: "Dompet tidak ditemukan" };
      }

      if (sourceWallet.balance < amount) {
        return {
          success: false,
          error: "Saldo di dompet asal tidak mencukupi untuk transfer",
        };
      }

      const nowStr = new Date().toISOString();
      const newTransfer: Transfer = {
        id: `trf-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        fromWalletId,
        toWalletId,
        amount,
        note,
        transferAt: nowStr,
        createdAt: nowStr,
      };

      // Atomic balance update
      setWallets((prev) =>
        prev.map((w) => {
          if (w.id === fromWalletId) {
            return { ...w, balance: w.balance - amount, updatedAt: nowStr };
          }
          if (w.id === toWalletId) {
            return { ...w, balance: w.balance + amount, updatedAt: nowStr };
          }
          return w;
        })
      );

      setTransfers((prev) => [newTransfer, ...prev]);
      return { success: true };
    },
    [wallets]
  );

  // Wallet CRUD
  const addWallet = useCallback(
    (data: Omit<Wallet, "id" | "createdAt" | "updatedAt">) => {
      if (!data.name.trim()) {
        return { success: false, error: "Nama dompet wajib diisi" };
      }
      const nowStr = new Date().toISOString();
      const newWallet: Wallet = {
        ...data,
        id: `wallet-${Date.now()}`,
        createdAt: nowStr,
        updatedAt: nowStr,
      };
      setWallets((prev) => [...prev, newWallet]);
      return { success: true };
    },
    []
  );

  const updateWallet = useCallback(
    (id: string, data: Partial<Omit<Wallet, "id" | "createdAt" | "updatedAt">>) => {
      const nowStr = new Date().toISOString();
      setWallets((prev) =>
        prev.map((w) => (w.id === id ? { ...w, ...data, updatedAt: nowStr } : w))
      );
      return { success: true };
    },
    []
  );

  const deleteWallet = useCallback(
    (id: string) => {
      if (wallets.length <= 1) {
        return {
          success: false,
          error: "Anda harus memiliki minimal satu dompet aktif",
        };
      }
      setWallets((prev) => prev.filter((w) => w.id !== id));
      return { success: true };
    },
    [wallets]
  );

  // Category CRUD
  const addCategory = useCallback((data: Omit<Category, "id">) => {
    if (!data.name.trim()) {
      return { success: false, error: "Nama kategori wajib diisi" };
    }
    const catId = `cat-${Date.now()}`;
    const newCat: Category = {
      ...data,
      id: catId,
      isDefault: false,
    };
    setCategories((prev) => [...prev, newCat]);

    // Automatically register budget if expenseLimit is set on expense category
    if (data.type === "EXPENSE" && data.expenseLimit && data.expenseLimit > 0) {
      const now = new Date();
      const newBudget: Budget = {
        id: `budget-${Date.now()}`,
        categoryId: catId,
        amount: data.expenseLimit,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
      setBudgets((prev) => [...prev, newBudget]);
    }

    return { success: true };
  }, []);

  const updateCategory = useCallback(
    (id: string, data: Partial<Omit<Category, "id">>) => {
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...data } : c))
      );

      if (data.expenseLimit !== undefined) {
        const now = new Date();
        const currentM = now.getMonth() + 1;
        const currentY = now.getFullYear();
        setBudgets((prev) => {
          const existing = prev.find(
            (b) =>
              b.categoryId === id &&
              b.month === currentM &&
              b.year === currentY
          );
          if (existing) {
            return prev.map((b) =>
              b.id === existing.id
                ? {
                    ...b,
                    amount: data.expenseLimit || 0,
                    updatedAt: now.toISOString(),
                  }
                : b
            );
          } else if (data.expenseLimit && data.expenseLimit > 0) {
            return [
              ...prev,
              {
                id: `budget-${Date.now()}`,
                categoryId: id,
                amount: data.expenseLimit,
                month: currentM,
                year: currentY,
                createdAt: now.toISOString(),
                updatedAt: now.toISOString(),
              },
            ];
          }
          return prev;
        });
      }

      return { success: true };
    },
    []
  );

  const deleteCategory = useCallback((id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setBudgets((prev) => prev.filter((b) => b.categoryId !== id));
    return { success: true };
  }, []);

  // Budget CRUD
  const addBudget = useCallback(
    (data: Omit<Budget, "id" | "createdAt" | "updatedAt">) => {
      if (data.amount <= 0) {
        return { success: false, error: "Batas budget harus lebih dari Rp 0" };
      }
      const exists = budgets.find(
        (b) =>
          b.categoryId === data.categoryId &&
          b.month === data.month &&
          b.year === data.year
      );
      if (exists) {
        return {
          success: false,
          error: "Budget untuk kategori dan bulan ini sudah dibuat",
        };
      }

      const nowStr = new Date().toISOString();
      const newBudget: Budget = {
        ...data,
        id: `budget-${Date.now()}`,
        createdAt: nowStr,
        updatedAt: nowStr,
      };
      setBudgets((prev) => [...prev, newBudget]);
      return { success: true };
    },
    [budgets]
  );

  const updateBudget = useCallback(
    (id: string, data: Partial<Omit<Budget, "id" | "createdAt" | "updatedAt">>) => {
      const nowStr = new Date().toISOString();
      setBudgets((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...data, updatedAt: nowStr } : b))
      );
      return { success: true };
    },
    []
  );

  const deleteBudget = useCallback((id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
    return { success: true };
  }, []);

  // Wishlist CRUD
  const addWishlistItem = useCallback(
    (data: Omit<WishlistItem, "id" | "createdAt" | "updatedAt">) => {
      if (!data.name.trim()) {
        return { success: false, error: "Nama impian/wishlist wajib diisi" };
      }
      if (data.targetAmount <= 0) {
        return { success: false, error: "Target dana harus lebih dari Rp 0" };
      }
      const nowStr = new Date().toISOString();
      const newItem: WishlistItem = {
        ...data,
        id: `wish-${Date.now()}`,
        savedAmount: Math.min(data.targetAmount, Math.max(0, data.savedAmount || 0)),
        isCompleted: (data.savedAmount || 0) >= data.targetAmount,
        createdAt: nowStr,
        updatedAt: nowStr,
      };
      setWishlists((prev) => [newItem, ...prev]);
      return { success: true };
    },
    []
  );

  const updateWishlistItem = useCallback(
    (
      id: string,
      data: Partial<Omit<WishlistItem, "id" | "createdAt" | "updatedAt">>
    ) => {
      const nowStr = new Date().toISOString();
      setWishlists((prev) =>
        prev.map((w) => {
          if (w.id !== id) return w;
          const updated = { ...w, ...data, updatedAt: nowStr };
          if (updated.savedAmount !== undefined && updated.targetAmount !== undefined) {
            updated.isCompleted = updated.savedAmount >= updated.targetAmount;
          }
          return updated;
        })
      );
      return { success: true };
    },
    []
  );

  const deleteWishlistItem = useCallback((id: string) => {
    setWishlists((prev) => prev.filter((w) => w.id !== id));
    return { success: true };
  }, []);

  const addSavingsToWishlist = useCallback(
    (id: string, amount: number, fromWalletId?: string) => {
      if (amount <= 0) {
        return { success: false, error: "Nominal tabungan harus lebih dari Rp 0" };
      }

      const nowStr = new Date().toISOString();

      // If fromWalletId is provided and valid, optionally deduct from wallet
      if (fromWalletId) {
        const sourceWallet = wallets.find((w) => w.id === fromWalletId);
        if (!sourceWallet) {
          return { success: false, error: "Dompet sumber tidak ditemukan" };
        }
        if (sourceWallet.balance < amount) {
          return {
            success: false,
            error: "Saldo dompet tidak mencukupi untuk menabung wishlist ini",
          };
        }
        setWallets((prev) =>
          prev.map((w) =>
            w.id === fromWalletId
              ? { ...w, balance: w.balance - amount, updatedAt: nowStr }
              : w
          )
        );
      }

      setWishlists((prev) =>
        prev.map((w) => {
          if (w.id !== id) return w;
          const newSaved = w.savedAmount + amount;
          const isCompleted = newSaved >= w.targetAmount;
          return {
            ...w,
            savedAmount: newSaved,
            isCompleted,
            updatedAt: nowStr,
          };
        })
      );

      return { success: true };
    },
    [wallets]
  );

  // Reminder CRUD (Bill Reminders)
  const addReminder = useCallback(
    (data: Omit<BillReminder, "id" | "createdAt" | "updatedAt">) => {
      if (!data.title.trim()) {
        return { success: false, error: "Nama tagihan wajib diisi" };
      }
      if (data.amount <= 0) {
        return { success: false, error: "Nominal tagihan harus lebih dari Rp 0" };
      }
      if (!data.dueDate) {
        return { success: false, error: "Tanggal jatuh tempo wajib diisi" };
      }

      const nowStr = new Date().toISOString();
      const newReminder: BillReminder = {
        ...data,
        id: `rem-${Date.now()}`,
        isPaid: false,
        createdAt: nowStr,
        updatedAt: nowStr,
      };

      setReminders((prev) => [newReminder, ...prev]);
      return { success: true };
    },
    []
  );

  const updateReminder = useCallback(
    (
      id: string,
      data: Partial<Omit<BillReminder, "id" | "createdAt" | "updatedAt">>
    ) => {
      const nowStr = new Date().toISOString();
      setReminders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...data, updatedAt: nowStr } : r))
      );
      return { success: true };
    },
    []
  );

  const deleteReminder = useCallback((id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    return { success: true };
  }, []);

  const payReminder = useCallback(
    (id: string, walletId?: string) => {
      const reminder = reminders.find((r) => r.id === id);
      if (!reminder) {
        return { success: false, error: "Tagihan tidak ditemukan" };
      }

      const nowStr = new Date().toISOString();

      if (walletId) {
        const wallet = wallets.find((w) => w.id === walletId);
        if (!wallet) {
          return { success: false, error: "Dompet pembayaran tidak ditemukan" };
        }
        if (wallet.balance < reminder.amount) {
          return {
            success: false,
            error: "Saldo dompet tidak mencukupi untuk membayar tagihan ini",
          };
        }

        // Deduct wallet balance
        setWallets((prev) =>
          prev.map((w) =>
            w.id === walletId
              ? { ...w, balance: w.balance - reminder.amount, updatedAt: nowStr }
              : w
          )
        );

        // Record expense transaction
        const newTx: Transaction = {
          id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          walletId,
          categoryId: reminder.categoryId || "cat-bills",
          type: "EXPENSE",
          amount: reminder.amount,
          note: `Bayar Tagihan: ${reminder.title}`,
          transactionAt: nowStr,
          createdAt: nowStr,
          updatedAt: nowStr,
        };
        setTransactions((prev) => [newTx, ...prev]);
      }

      // Mark reminder as paid
      setReminders((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                isPaid: true,
                paidAt: nowStr,
                walletId: walletId || r.walletId,
                updatedAt: nowStr,
              }
            : r
        )
      );

      return { success: true };
    },
    [reminders, wallets]
  );

  const unpayReminder = useCallback((id: string) => {
    const nowStr = new Date().toISOString();
    setReminders((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const currentDue = new Date(r.dueDate);
        const targetDay = currentDue.getDate();
        const nextMonthDate = new Date(currentDue);
        nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
        if (nextMonthDate.getDate() !== targetDay) {
          nextMonthDate.setDate(0);
        }
        return {
          ...r,
          isPaid: false,
          paidAt: undefined,
          dueDate: nextMonthDate.toISOString(),
          updatedAt: nowStr,
        };
      })
    );
    return { success: true };
  }, []);

  // Budget calculation (spent computed dynamically from transactions - PRD §15)
  const getBudgetCalculations = useCallback(
    (month = currentMonth, year = currentYear): BudgetCalculation[] => {
      return budgets
        .filter((b) => b.month === month && b.year === year)
        .map((budget) => {
          const cat = categories.find((c) => c.id === budget.categoryId) || {
            id: budget.categoryId,
            name: "Kategori",
            type: "EXPENSE" as const,
            icon: "ShoppingBag",
          };

          // SUM(transaction.amount) WHERE type=EXPENSE, categoryId, month, year
          const spent = transactions.reduce((sum, tx) => {
            if (tx.type !== "EXPENSE" || tx.categoryId !== budget.categoryId) {
              return sum;
            }
            const date = new Date(tx.transactionAt);
            if (date.getMonth() + 1 === month && date.getFullYear() === year) {
              return sum + tx.amount;
            }
            return sum;
          }, 0);

          const remaining = Math.max(0, budget.amount - spent);
          const percentage =
            budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0;

          let status: BudgetStatus = "NORMAL";
          if (percentage >= 100) {
            status = "EXCEEDED";
          } else if (percentage >= 80) {
            status = "WARNING";
          }

          return {
            budget,
            category: cat,
            spent,
            remaining,
            percentage,
            status,
          };
        });
    },
    [budgets, categories, transactions, currentMonth, currentYear]
  );

  // Top budget near limit for Dashboard Mini Card (DESIGN-v2 §5.2)
  const getTopBudgetNearLimit = useCallback(
    (month = currentMonth, year = currentYear): BudgetCalculation | null => {
      const calcs = getBudgetCalculations(month, year);
      if (calcs.length === 0) return null;
      // Sort by highest percentage spent
      const sorted = [...calcs].sort((a, b) => b.percentage - a.percentage);
      return sorted[0];
    },
    [getBudgetCalculations, currentMonth, currentYear]
  );

  // Expense by category breakdown for Donut Chart (PRD §10 & §16)
  const getExpenseByCategory = useCallback(
    (month = currentMonth, year = currentYear) => {
      const categoryMap: { [catId: string]: number } = {};
      let totalExp = 0;

      transactions.forEach((tx) => {
        if (tx.type !== "EXPENSE") return;
        const d = new Date(tx.transactionAt);
        if (d.getMonth() + 1 === month && d.getFullYear() === year) {
          categoryMap[tx.categoryId] = (categoryMap[tx.categoryId] || 0) + tx.amount;
          totalExp += tx.amount;
        }
      });

      return Object.entries(categoryMap).map(([catId, amount]) => {
        const cat = categories.find((c) => c.id === catId) || {
          id: catId,
          name: "Lainnya",
          type: "EXPENSE" as const,
          icon: "Package",
          color: "#64748B",
        };
        const percentage = totalExp > 0 ? Math.round((amount / totalExp) * 100) : 0;
        return {
          category: cat,
          amount,
          percentage,
        };
      });
    },
    [transactions, categories, currentMonth, currentYear]
  );

  // Monthly trends (Last 5 months for Bar Chart with active solid vs hatch texture)
  const getMonthlyTrends = useCallback(() => {
    const months = [
      { name: "Apr", month: 4, income: 4200000, expense: 1200000 },
      { name: "Mei", month: 5, income: 4800000, expense: 1400000 },
      { name: "Jun", month: 6, income: 5100000, expense: 1600000 },
      { name: "Jul", month: 7, income: 5500000, expense: 1550000 },
      { name: "Agu", month: 8, income: monthlyIncome || 6000000, expense: monthlyExpense || 1750000 },
    ];

    return months.map((m) => ({
      monthName: m.name,
      income: m.income,
      expense: m.expense,
      month: m.month,
      isCurrentMonth: m.month === currentMonth || m.name === "Agu",
    }));
  }, [monthlyIncome, monthlyExpense, currentMonth]);

  const value = {
    isAuthenticated,
    login,
    logout,
    user,
    wallets,
    categories,
    transactions,
    transfers,
    budgets,
    wishlists,
    reminders,
    totalBalance,
    monthlyIncome,
    monthlyExpense,
    updateUser,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    createTransfer,
    addWallet,
    updateWallet,
    deleteWallet,
    addCategory,
    updateCategory,
    deleteCategory,
    addBudget,
    updateBudget,
    deleteBudget,
    addWishlistItem,
    updateWishlistItem,
    deleteWishlistItem,
    addSavingsToWishlist,
    addReminder,
    updateReminder,
    deleteReminder,
    payReminder,
    unpayReminder,
    getBudgetCalculations,
    getTopBudgetNearLimit,
    getExpenseByCategory,
    getMonthlyTrends,
    resetToDefaultData,
    isHydrated,
    isTransferModalOpen,
    setIsTransferModalOpen,
    isAddTransactionModalOpen,
    setIsAddTransactionModalOpen,
    isAddWalletModalOpen,
    setIsAddWalletModalOpen,
    isAddBudgetModalOpen,
    setIsAddBudgetModalOpen,
    isAddCategoryModalOpen,
    setIsAddCategoryModalOpen,
    isAddWishlistModalOpen,
    setIsAddWishlistModalOpen,
    isAddReminderModalOpen,
    setIsAddReminderModalOpen,
    payReminderItem,
    setPayReminderItem,
    savingTargetWishlistId,
    setSavingTargetWishlistId,
    limitCategoryData,
    setLimitCategoryData,
  };

  return (
    <FinoraContext.Provider value={value}>
      {isHydrated ? (
        children
      ) : (
        <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#0B0B0E] flex items-center justify-center">
          <div className="h-7 w-7 rounded-full border-2 border-violet-600 border-t-transparent animate-spin" />
        </div>
      )}
    </FinoraContext.Provider>
  );
}

export function useFinora() {
  const context = useContext(FinoraContext);
  if (!context) {
    throw new Error("useFinora must be used within a FinoraProvider");
  }
  return context;
}
