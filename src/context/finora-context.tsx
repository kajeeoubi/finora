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
} from "@/types";
import {
  INITIAL_USER,
  INITIAL_CATEGORIES,
  INITIAL_WALLETS,
  INITIAL_BUDGETS,
  INITIAL_TRANSACTIONS,
  INITIAL_TRANSFERS,
} from "@/lib/initial-data";

interface FinoraContextType {
  user: UserProfile;
  wallets: Wallet[];
  categories: Category[];
  transactions: Transaction[];
  transfers: Transfer[];
  budgets: Budget[];

  // Computed summary
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;

  // Actions
  addTransaction: (data: Omit<Transaction, "id" | "createdAt" | "updatedAt">) => { success: boolean; error?: string };
  updateTransaction: (id: string, data: Partial<Omit<Transaction, "id" | "createdAt" | "updatedAt">>) => { success: boolean; error?: string };
  deleteTransaction: (id: string) => { success: boolean; error?: string };

  createTransfer: (fromWalletId: string, toWalletId: string, amount: number, note?: string) => { success: boolean; error?: string };

  addWallet: (data: Omit<Wallet, "id" | "createdAt" | "updatedAt">) => { success: boolean; error?: string };
  updateWallet: (id: string, data: Partial<Omit<Wallet, "id" | "createdAt" | "updatedAt">>) => { success: boolean; error?: string };
  deleteWallet: (id: string) => { success: boolean; error?: string };

  addCategory: (data: Omit<Category, "id">) => { success: boolean; error?: string };
  deleteCategory: (id: string) => { success: boolean; error?: string };

  addBudget: (data: Omit<Budget, "id" | "createdAt" | "updatedAt">) => { success: boolean; error?: string };
  updateBudget: (id: string, data: Partial<Omit<Budget, "id" | "createdAt" | "updatedAt">>) => { success: boolean; error?: string };
  deleteBudget: (id: string) => { success: boolean; error?: string };

  getBudgetCalculations: (month?: number, year?: number) => BudgetCalculation[];
  getTopBudgetNearLimit: (month?: number, year?: number) => BudgetCalculation | null;
  getExpenseByCategory: (month?: number, year?: number) => { category: Category; amount: number; percentage: number }[];
  getMonthlyTrends: () => { monthName: string; income: number; expense: number; month: number; isCurrentMonth: boolean }[];

  resetToDefaultData: () => void;

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
}

const FinoraContext = createContext<FinoraContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: "finora_user_v2",
  WALLETS: "finora_wallets_v2",
  CATEGORIES: "finora_categories_v2",
  TRANSACTIONS: "finora_transactions_v2",
  TRANSFERS: "finora_transfers_v2",
  BUDGETS: "finora_budgets_v2",
};

export function FinoraProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [wallets, setWallets] = useState<Wallet[]>(INITIAL_WALLETS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [transfers, setTransfers] = useState<Transfer[]>(INITIAL_TRANSFERS);
  const [budgets, setBudgets] = useState<Budget[]>(INITIAL_BUDGETS);
  const [isHydrated, setIsHydrated] = useState(false);

  // Modals state
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
  const [isAddWalletModalOpen, setIsAddWalletModalOpen] = useState(false);
  const [isAddBudgetModalOpen, setIsAddBudgetModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedWallets = localStorage.getItem(STORAGE_KEYS.WALLETS);
      const savedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      const savedTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      const savedTransfers = localStorage.getItem(STORAGE_KEYS.TRANSFERS);
      const savedBudgets = localStorage.getItem(STORAGE_KEYS.BUDGETS);

      if (savedWallets) setWallets(JSON.parse(savedWallets));
      if (savedCategories) setCategories(JSON.parse(savedCategories));
      if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
      if (savedTransfers) setTransfers(JSON.parse(savedTransfers));
      if (savedBudgets) setBudgets(JSON.parse(savedBudgets));
    } catch (e) {
      console.warn("Could not load stored Finora data:", e);
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.WALLETS, JSON.stringify(wallets));
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
      localStorage.setItem(STORAGE_KEYS.TRANSFERS, JSON.stringify(transfers));
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    } catch (e) {
      console.warn("Could not save Finora data:", e);
    }
  }, [isHydrated, wallets, categories, transactions, transfers, budgets]);

  // Reset to default PRD seed data
  const resetToDefaultData = useCallback(() => {
    setUser(INITIAL_USER);
    setWallets(INITIAL_WALLETS);
    setCategories(INITIAL_CATEGORIES);
    setTransactions(INITIAL_TRANSACTIONS);
    setTransfers(INITIAL_TRANSFERS);
    setBudgets(INITIAL_BUDGETS);

    try {
      localStorage.removeItem(STORAGE_KEYS.WALLETS);
      localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
      localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
      localStorage.removeItem(STORAGE_KEYS.TRANSFERS);
      localStorage.removeItem(STORAGE_KEYS.BUDGETS);
    } catch (e) {
      console.warn("Error resetting storage:", e);
    }
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
    const newCat: Category = {
      ...data,
      id: `cat-${Date.now()}`,
      isDefault: false,
    };
    setCategories((prev) => [...prev, newCat]);
    return { success: true };
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
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
    user,
    wallets,
    categories,
    transactions,
    transfers,
    budgets,
    totalBalance,
    monthlyIncome,
    monthlyExpense,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    createTransfer,
    addWallet,
    updateWallet,
    deleteWallet,
    addCategory,
    deleteCategory,
    addBudget,
    updateBudget,
    deleteBudget,
    getBudgetCalculations,
    getTopBudgetNearLimit,
    getExpenseByCategory,
    getMonthlyTrends,
    resetToDefaultData,
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
  };

  return (
    <FinoraContext.Provider value={value}>{children}</FinoraContext.Provider>
  );
}

export function useFinora() {
  const context = useContext(FinoraContext);
  if (!context) {
    throw new Error("useFinora must be used within a FinoraProvider");
  }
  return context;
}
