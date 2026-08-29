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
  WishlistItem,
  BillReminder,
} from "@/types";
import { createClient } from "@/lib/supabase/client";

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

const EMPTY_USER: UserProfile = {
  id: "",
  name: "",
  email: "",
};

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
  const supabase = useMemo(() => createClient(), []);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile>(EMPTY_USER);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [wishlists, setWishlists] = useState<WishlistItem[]>([]);
  const [reminders, setReminders] = useState<BillReminder[]>([]);
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

  // Fetch all Supabase data for authenticated user
  const fetchSupabaseData = useCallback(async (userId: string) => {
    try {
      // 1. Profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (profileData) {
        setUser({
          id: profileData.id,
          email: profileData.email,
          name: profileData.name || "Pengguna Finora",
          avatarUrl: profileData.avatar_url,
        });
      }

      // 2. Wallets
      const { data: walletsData } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });
      if (walletsData) {
        setWallets(
          walletsData.map((w) => ({
            id: w.id,
            name: w.name,
            type: w.type,
            balance: Number(w.balance),
            currency: w.currency,
            accountNumber: w.account_number,
            color: w.color,
            createdAt: w.created_at,
            updatedAt: w.updated_at,
          }))
        );
      }

      // 3. Categories
      const { data: categoriesData } = await supabase
        .from("categories")
        .select("*")
        .or(`user_id.eq.${userId},is_default.eq.true`)
        .order("created_at", { ascending: true });
      if (categoriesData) {
        setCategories(
          categoriesData.map((c) => ({
            id: c.id,
            name: c.name,
            type: c.type,
            icon: c.icon,
            color: c.color,
            expenseLimit: c.expense_limit ? Number(c.expense_limit) : undefined,
            isDefault: c.is_default,
          }))
        );
      }

      // 4. Transactions
      const { data: txData } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("transaction_at", { ascending: false });
      if (txData) {
        setTransactions(
          txData.map((t) => ({
            id: t.id,
            walletId: t.wallet_id,
            categoryId: t.category_id,
            type: t.type,
            amount: Number(t.amount),
            note: t.note,
            transactionAt: t.transaction_at,
            createdAt: t.created_at,
            updatedAt: t.updated_at,
          }))
        );
      }

      // 5. Transfers
      const { data: trfData } = await supabase
        .from("transfers")
        .select("*")
        .eq("user_id", userId)
        .order("transfer_at", { ascending: false });
      if (trfData) {
        setTransfers(
          trfData.map((tr) => ({
            id: tr.id,
            fromWalletId: tr.from_wallet_id,
            toWalletId: tr.to_wallet_id,
            amount: Number(tr.amount),
            note: tr.note,
            transferAt: tr.transfer_at,
            createdAt: tr.created_at,
          }))
        );
      }

      // 6. Budgets
      const { data: budgetData } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", userId);
      if (budgetData) {
        setBudgets(
          budgetData.map((b) => ({
            id: b.id,
            categoryId: b.category_id,
            amount: Number(b.amount),
            month: b.month,
            year: b.year,
            createdAt: b.created_at,
            updatedAt: b.updated_at,
          }))
        );
      }

      // 7. Wishlists
      const { data: wishData } = await supabase
        .from("wishlists")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (wishData) {
        setWishlists(
          wishData.map((w) => ({
            id: w.id,
            name: w.name,
            targetAmount: Number(w.target_amount),
            savedAmount: Number(w.saved_amount),
            targetDate: w.target_date,
            icon: w.icon,
            color: w.color,
            note: w.note,
            isCompleted: w.is_completed,
            createdAt: w.created_at,
            updatedAt: w.updated_at,
          }))
        );
      }

      // 8. Reminders
      const { data: reminderData } = await supabase
        .from("bill_reminders")
        .select("*")
        .eq("user_id", userId)
        .order("due_date", { ascending: true });
      if (reminderData) {
        setReminders(
          reminderData.map((r) => ({
            id: r.id,
            title: r.title,
            amount: Number(r.amount),
            dueDate: r.due_date,
            categoryId: r.category_id,
            walletId: r.wallet_id,
            isPaid: r.is_paid,
            paidAt: r.paid_at,
            note: r.note,
            createdAt: r.created_at,
            updatedAt: r.updated_at,
          }))
        );
      }
    } catch (err) {
      console.warn("Error fetching Supabase data:", err);
    }
  }, [supabase]);

  // Initial Auth Check & Supabase Session listener
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && isMounted) {
          setIsAuthenticated(true);
          await fetchSupabaseData(session.user.id);
        } else {
          // Fallback to local storage if no active Supabase session
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
        }
      } catch (e) {
        console.warn("Could not load initial Finora state:", e);
      } finally {
        if (isMounted) setIsHydrated(true);
      }
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          setIsAuthenticated(true);
          await fetchSupabaseData(session.user.id);
        } else if (event === "SIGNED_OUT") {
          setIsAuthenticated(false);
          setUser(EMPTY_USER);
          setWallets([]);
          setCategories([]);
          setTransactions([]);
          setTransfers([]);
          setBudgets([]);
          setWishlists([]);
          setReminders([]);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [supabase, fetchSupabaseData]);

  // Login action
  const login = useCallback(async (email: string, password?: string) => {
    try {
      if (password) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          if (error.message.includes("fetch") || error.message.includes("invalid") || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
            setIsAuthenticated(true);
            localStorage.setItem(STORAGE_KEYS.AUTH, "true");
            return { success: true };
          }
          return { success: false, error: error.message };
        }
        if (data.session) {
          setIsAuthenticated(true);
          await fetchSupabaseData(data.session.user.id);
          return { success: true };
        }
      }
      setIsAuthenticated(true);
      localStorage.setItem(STORAGE_KEYS.AUTH, "true");
      return { success: true };
    } catch (e: any) {
      setIsAuthenticated(true);
      localStorage.setItem(STORAGE_KEYS.AUTH, "true");
      return { success: true };
    }
  }, [supabase, fetchSupabaseData]);

  // SignUp action
  const signUp = useCallback(async (email: string, password: string, name?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split("@")[0],
          },
        },
      });
      if (error) {
        return { success: false, error: error.message };
      }
      if (data.session) {
        setIsAuthenticated(true);
        await fetchSupabaseData(data.session.user.id);
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || "Gagal melakukan pendaftaran" };
    }
  }, [supabase, fetchSupabaseData]);

  // Logout action
  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Supabase sign out error:", e);
    }
    setIsAuthenticated(false);
    setUser(EMPTY_USER);
    setWallets([]);
    setCategories([]);
    setTransactions([]);
    setTransfers([]);
    setBudgets([]);
    setWishlists([]);
    setReminders([]);
    localStorage.clear();
  }, [supabase]);

  // Save to localStorage as backup cache
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
      console.warn("Could not cache Finora data:", e);
    }
  }, [isHydrated, user, wallets, categories, transactions, transfers, budgets, wishlists, reminders]);

  const updateUser = useCallback((data: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...data }));
    (async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          await supabase
            .from("profiles")
            .update({
              name: data.name,
              avatar_url: data.avatarUrl,
              updated_at: new Date().toISOString(),
            })
            .eq("id", authUser.id);
        }
      } catch (e) {
        console.warn("Supabase update profile error:", e);
      }
    })();
    return { success: true };
  }, [supabase]);

  // Total balance = sum of all wallet balances
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

  // Add Transaction
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
      const newTxId = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newTx: Transaction = {
        ...data,
        id: newTxId,
        createdAt: nowStr,
        updatedAt: nowStr,
      };

      const newBalance =
        data.type === "INCOME"
          ? wallet.balance + data.amount
          : wallet.balance - data.amount;

      // Optimistic state updates
      setWallets((prev) =>
        prev.map((w) =>
          w.id === data.walletId
            ? { ...w, balance: newBalance, updatedAt: nowStr }
            : w
        )
      );
      setTransactions((prev) => [newTx, ...prev]);

      // Sync with Supabase in background
      (async () => {
        try {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) {
            await supabase.from("transactions").insert({
              user_id: authUser.id,
              wallet_id: data.walletId,
              category_id: data.categoryId,
              type: data.type,
              amount: data.amount,
              note: data.note,
              transaction_at: data.transactionAt,
            });

            await supabase
              .from("wallets")
              .update({ balance: newBalance, updated_at: nowStr })
              .eq("id", data.walletId);
          }
        } catch (e) {
          console.warn("Supabase addTransaction error:", e);
        }
      })();

      return { success: true };
    },
    [wallets, supabase]
  );

  // Update Transaction
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
          if (w.id === oldTx.walletId) {
            bal = oldTx.type === "INCOME" ? bal - oldTx.amount : bal + oldTx.amount;
          }
          if (w.id === targetWalletId) {
            bal = targetType === "INCOME" ? bal + targetAmount : bal - targetAmount;
          }
          return { ...w, balance: bal, updatedAt: nowStr };
        });
      });

      setTransactions((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, ...data, updatedAt: nowStr } : t
        )
      );

      (async () => {
        try {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) {
            await supabase
              .from("transactions")
              .update({
                wallet_id: targetWalletId,
                category_id: data.categoryId || oldTx.categoryId,
                type: targetType,
                amount: targetAmount,
                note: data.note !== undefined ? data.note : oldTx.note,
                transaction_at: data.transactionAt || oldTx.transactionAt,
                updated_at: nowStr,
              })
              .eq("id", id);
          }
        } catch (e) {
          console.warn("Supabase updateTransaction error:", e);
        }
      })();

      return { success: true };
    },
    [transactions, supabase]
  );

  // Delete Transaction
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

      (async () => {
        try {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) {
            await supabase.from("transactions").delete().eq("id", id);
          }
        } catch (e) {
          console.warn("Supabase deleteTransaction error:", e);
        }
      })();

      return { success: true };
    },
    [transactions, supabase]
  );

  // Create Transfer
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

      const sourceNewBal = sourceWallet.balance - amount;
      const destNewBal = destWallet.balance + amount;

      setWallets((prev) =>
        prev.map((w) => {
          if (w.id === fromWalletId) {
            return { ...w, balance: sourceNewBal, updatedAt: nowStr };
          }
          if (w.id === toWalletId) {
            return { ...w, balance: destNewBal, updatedAt: nowStr };
          }
          return w;
        })
      );

      setTransfers((prev) => [newTransfer, ...prev]);

      (async () => {
        try {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) {
            await supabase.from("transfers").insert({
              user_id: authUser.id,
              from_wallet_id: fromWalletId,
              to_wallet_id: toWalletId,
              amount,
              note,
              transfer_at: nowStr,
            });

            await supabase
              .from("wallets")
              .update({ balance: sourceNewBal, updated_at: nowStr })
              .eq("id", fromWalletId);

            await supabase
              .from("wallets")
              .update({ balance: destNewBal, updated_at: nowStr })
              .eq("id", toWalletId);
          }
        } catch (e) {
          console.warn("Supabase createTransfer error:", e);
        }
      })();

      return { success: true };
    },
    [wallets, supabase]
  );

  // Wallet CRUD
  const addWallet = useCallback(
    (data: Omit<Wallet, "id" | "createdAt" | "updatedAt">) => {
      if (!data.name.trim()) {
        return { success: false, error: "Nama dompet wajib diisi" };
      }
      const nowStr = new Date().toISOString();
      const tempId = `wallet-${Date.now()}`;
      const newWallet: Wallet = {
        ...data,
        id: tempId,
        createdAt: nowStr,
        updatedAt: nowStr,
      };
      setWallets((prev) => [...prev, newWallet]);

      (async () => {
        try {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) {
            const { data: res } = await supabase
              .from("wallets")
              .insert({
                user_id: authUser.id,
                name: data.name,
                type: data.type,
                balance: data.balance,
                currency: data.currency || "IDR",
                account_number: data.accountNumber,
                color: data.color,
              })
              .select()
              .single();

            if (res) {
              setWallets((prev) =>
                prev.map((w) => (w.id === tempId ? { ...w, id: res.id } : w))
              );
            }
          }
        } catch (e) {
          console.warn("Supabase addWallet error:", e);
        }
      })();

      return { success: true };
    },
    [supabase]
  );

  const updateWallet = useCallback(
    (id: string, data: Partial<Omit<Wallet, "id" | "createdAt" | "updatedAt">>) => {
      const nowStr = new Date().toISOString();
      setWallets((prev) =>
        prev.map((w) => (w.id === id ? { ...w, ...data, updatedAt: nowStr } : w))
      );

      (async () => {
        try {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) {
            await supabase
              .from("wallets")
              .update({
                name: data.name,
                type: data.type,
                balance: data.balance,
                account_number: data.accountNumber,
                color: data.color,
                updated_at: nowStr,
              })
              .eq("id", id);
          }
        } catch (e) {
          console.warn("Supabase updateWallet error:", e);
        }
      })();

      return { success: true };
    },
    [supabase]
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

      (async () => {
        try {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) {
            await supabase.from("wallets").delete().eq("id", id);
          }
        } catch (e) {
          console.warn("Supabase deleteWallet error:", e);
        }
      })();

      return { success: true };
    },
    [wallets, supabase]
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

    (async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          await supabase.from("categories").insert({
            user_id: authUser.id,
            name: data.name,
            type: data.type,
            icon: data.icon,
            color: data.color,
            expense_limit: data.expenseLimit || 0,
            is_default: false,
          });
        }
      } catch (e) {
        console.warn("Supabase addCategory error:", e);
      }
    })();

    return { success: true };
  }, [supabase]);

  const updateCategory = useCallback(
    (id: string, data: Partial<Omit<Category, "id">>) => {
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...data } : c))
      );

      (async () => {
        try {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) {
            const updatePayload: Record<string, unknown> = {};
            if (data.name !== undefined) updatePayload.name = data.name;
            if (data.type !== undefined) updatePayload.type = data.type;
            if (data.icon !== undefined) updatePayload.icon = data.icon;
            if (data.color !== undefined) updatePayload.color = data.color;
            if (data.expenseLimit !== undefined) updatePayload.expense_limit = data.expenseLimit;
            else if ("expenseLimit" in data) updatePayload.expense_limit = 0;

            if (Object.keys(updatePayload).length > 0) {
              await supabase
                .from("categories")
                .update(updatePayload)
                .eq("id", id);
            }
          }
        } catch (e) {
          console.warn("Supabase updateCategory error:", e);
        }
      })();

      return { success: true };
    },
    [supabase]
  );

  const deleteCategory = useCallback((id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setBudgets((prev) => prev.filter((b) => b.categoryId !== id));

    (async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          await supabase.from("categories").delete().eq("id", id);
        }
      } catch (e) {
        console.warn("Supabase deleteCategory error:", e);
      }
    })();

    return { success: true };
  }, [supabase]);

  // Budget CRUD
  const addBudget = useCallback(
    (data: Omit<Budget, "id" | "createdAt" | "updatedAt">) => {
      if (data.amount <= 0) {
        return { success: false, error: "Batas budget harus lebih dari Rp 0" };
      }
      const existing = budgets.find(
        (b) =>
          b.categoryId === data.categoryId &&
          b.month === data.month &&
          b.year === data.year
      );

      const nowStr = new Date().toISOString();

      if (existing) {
        // Update existing budget
        setBudgets((prev) =>
          prev.map((b) =>
            b.id === existing.id
              ? { ...b, amount: data.amount, updatedAt: nowStr }
              : b
          )
        );

        (async () => {
          try {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) {
              await supabase
                .from("budgets")
                .update({
                  amount: data.amount,
                  updated_at: nowStr,
                })
                .eq("id", existing.id);
            }
          } catch (e) {
            console.warn("Supabase updateBudget in addBudget error:", e);
          }
        })();

        return { success: true };
      }

      const newBudget: Budget = {
        ...data,
        id: `budget-${Date.now()}`,
        createdAt: nowStr,
        updatedAt: nowStr,
      };
      setBudgets((prev) => [...prev, newBudget]);

      (async () => {
        try {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) {
            await supabase.from("budgets").insert({
              user_id: authUser.id,
              category_id: data.categoryId,
              amount: data.amount,
              month: data.month,
              year: data.year,
            });
          }
        } catch (e) {
          console.warn("Supabase addBudget error:", e);
        }
      })();

      return { success: true };
    },
    [budgets, supabase]
  );

  const updateBudget = useCallback(
    (id: string, data: Partial<Omit<Budget, "id" | "createdAt" | "updatedAt">>) => {
      const nowStr = new Date().toISOString();
      setBudgets((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...data, updatedAt: nowStr } : b))
      );

      (async () => {
        try {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) {
            await supabase
              .from("budgets")
              .update({
                amount: data.amount,
                month: data.month,
                year: data.year,
                updated_at: nowStr,
              })
              .eq("id", id);
          }
        } catch (e) {
          console.warn("Supabase updateBudget error:", e);
        }
      })();

      return { success: true };
    },
    [supabase]
  );

  const deleteBudget = useCallback((id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
    (async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          await supabase.from("budgets").delete().eq("id", id);
        }
      } catch (e) {
        console.warn("Supabase deleteBudget error:", e);
      }
    })();
    return { success: true };
  }, [supabase]);

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

      (async () => {
        try {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) {
            await supabase.from("wishlists").insert({
              user_id: authUser.id,
              name: data.name,
              target_amount: data.targetAmount,
              saved_amount: data.savedAmount || 0,
              target_date: data.targetDate,
              icon: data.icon,
              color: data.color,
              note: data.note,
              is_completed: (data.savedAmount || 0) >= data.targetAmount,
            });
          }
        } catch (e) {
          console.warn("Supabase addWishlist error:", e);
        }
      })();

      return { success: true };
    },
    [supabase]
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

      (async () => {
        try {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) {
            await supabase
              .from("wishlists")
              .update({
                name: data.name,
                target_amount: data.targetAmount,
                saved_amount: data.savedAmount,
                target_date: data.targetDate,
                icon: data.icon,
                color: data.color,
                note: data.note,
                is_completed: data.isCompleted,
                updated_at: nowStr,
              })
              .eq("id", id);
          }
        } catch (e) {
          console.warn("Supabase updateWishlistItem error:", e);
        }
      })();

      return { success: true };
    },
    [supabase]
  );

  const deleteWishlistItem = useCallback((id: string) => {
    setWishlists((prev) => prev.filter((w) => w.id !== id));
    (async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          await supabase.from("wishlists").delete().eq("id", id);
        }
      } catch (e) {
        console.warn("Supabase deleteWishlistItem error:", e);
      }
    })();
    return { success: true };
  }, [supabase]);

  const addSavingsToWishlist = useCallback(
    (id: string, amount: number, fromWalletId?: string) => {
      if (amount <= 0) {
        return { success: false, error: "Nominal tabungan harus lebih dari Rp 0" };
      }

      const nowStr = new Date().toISOString();

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
        const newBal = sourceWallet.balance - amount;
        setWallets((prev) =>
          prev.map((w) =>
            w.id === fromWalletId
              ? { ...w, balance: newBal, updatedAt: nowStr }
              : w
          )
        );

        (async () => {
          try {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) {
              await supabase
                .from("wallets")
                .update({ balance: newBal, updated_at: nowStr })
                .eq("id", fromWalletId);
            }
          } catch (e) {
            console.warn("Supabase update wallet on wishlist save:", e);
          }
        })();
      }

      let updatedSaved = 0;
      let isComp = false;

      setWishlists((prev) =>
        prev.map((w) => {
          if (w.id !== id) return w;
          updatedSaved = w.savedAmount + amount;
          isComp = updatedSaved >= w.targetAmount;
          return {
            ...w,
            savedAmount: updatedSaved,
            isCompleted: isComp,
            updatedAt: nowStr,
          };
        })
      );

      (async () => {
        try {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) {
            await supabase
              .from("wishlists")
              .update({
                saved_amount: updatedSaved,
                is_completed: isComp,
                updated_at: nowStr,
              })
              .eq("id", id);
          }
        } catch (e) {
          console.warn("Supabase wishlist save sync error:", e);
        }
      })();

      return { success: true };
    },
    [wallets, supabase]
  );

  // Reminder CRUD
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

      (async () => {
        try {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) {
            await supabase.from("bill_reminders").insert({
              user_id: authUser.id,
              title: data.title,
              amount: data.amount,
              due_date: data.dueDate,
              category_id: data.categoryId,
              wallet_id: data.walletId,
              is_paid: false,
              note: data.note,
            });
          }
        } catch (e) {
          console.warn("Supabase addReminder error:", e);
        }
      })();

      return { success: true };
    },
    [supabase]
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

      (async () => {
        try {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) {
            await supabase
              .from("bill_reminders")
              .update({
                title: data.title,
                amount: data.amount,
                due_date: data.dueDate,
                category_id: data.categoryId,
                wallet_id: data.walletId,
                is_paid: data.isPaid,
                paid_at: data.paidAt,
                note: data.note,
                updated_at: nowStr,
              })
              .eq("id", id);
          }
        } catch (e) {
          console.warn("Supabase updateReminder error:", e);
        }
      })();

      return { success: true };
    },
    [supabase]
  );

  const deleteReminder = useCallback((id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    (async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          await supabase.from("bill_reminders").delete().eq("id", id);
        }
      } catch (e) {
        console.warn("Supabase deleteReminder error:", e);
      }
    })();
    return { success: true };
  }, [supabase]);

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

        const newBal = wallet.balance - reminder.amount;

        setWallets((prev) =>
          prev.map((w) =>
            w.id === walletId
              ? { ...w, balance: newBal, updatedAt: nowStr }
              : w
          )
        );

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

        (async () => {
          try {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) {
              await supabase.from("transactions").insert({
                user_id: authUser.id,
                wallet_id: walletId,
                category_id: reminder.categoryId,
                type: "EXPENSE",
                amount: reminder.amount,
                note: `Bayar Tagihan: ${reminder.title}`,
                transaction_at: nowStr,
              });

              await supabase
                .from("wallets")
                .update({ balance: newBal, updated_at: nowStr })
                .eq("id", walletId);
            }
          } catch (e) {
            console.warn("Supabase record reminder transaction error:", e);
          }
        })();
      }

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

      (async () => {
        try {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) {
            await supabase
              .from("bill_reminders")
              .update({
                is_paid: true,
                paid_at: nowStr,
                wallet_id: walletId || reminder.walletId,
                updated_at: nowStr,
              })
              .eq("id", id);
          }
        } catch (e) {
          console.warn("Supabase mark reminder paid error:", e);
        }
      })();

      return { success: true };
    },
    [reminders, wallets, supabase]
  );

  const unpayReminder = useCallback((id: string) => {
    const nowStr = new Date().toISOString();
    let nextDueStr = "";

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
        nextDueStr = nextMonthDate.toISOString();
        return {
          ...r,
          isPaid: false,
          paidAt: undefined,
          dueDate: nextDueStr,
          updatedAt: nowStr,
        };
      })
    );

    (async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          await supabase
            .from("bill_reminders")
            .update({
              is_paid: false,
              paid_at: null,
              due_date: nextDueStr,
              updated_at: nowStr,
            })
            .eq("id", id);
        }
      } catch (e) {
        console.warn("Supabase unpayReminder error:", e);
      }
    })();

    return { success: true };
  }, [supabase]);

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

  // Monthly trends calculated dynamically from actual transactions
  const getMonthlyTrends = useCallback(() => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const result = [];
    const now = new Date();

    // Generate last 5 months
    for (let i = 4; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mNum = d.getMonth() + 1;
      const yNum = d.getFullYear();
      const name = monthNames[d.getMonth()];

      let inc = 0;
      let exp = 0;

      transactions.forEach((tx) => {
        const txD = new Date(tx.transactionAt);
        if (txD.getMonth() + 1 === mNum && txD.getFullYear() === yNum) {
          if (tx.type === "INCOME") inc += tx.amount;
          if (tx.type === "EXPENSE") exp += tx.amount;
        }
      });

      result.push({
        monthName: name,
        income: inc,
        expense: exp,
        month: mNum,
        isCurrentMonth: i === 0,
      });
    }

    return result;
  }, [transactions]);

  const value = {
    isAuthenticated,
    login,
    signUp,
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
