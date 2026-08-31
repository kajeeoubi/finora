"use client";

import { useEffect, useCallback, Dispatch, SetStateAction } from "react";
import {
  Wallet,
  Category,
  Transaction,
  Transfer,
  Budget,
  WishlistItem,
  BillReminder,
  UserProfile,
} from "@/types";
import { SupabaseClient } from "@supabase/supabase-js";
import { STORAGE_KEYS } from "../constants";

interface UseDataSyncOptions {
  isHydrated: boolean;
  user: UserProfile;
  setUser: Dispatch<SetStateAction<UserProfile>>;
  wallets: Wallet[];
  setWallets: Dispatch<SetStateAction<Wallet[]>>;
  categories: Category[];
  setCategories: Dispatch<SetStateAction<Category[]>>;
  transactions: Transaction[];
  setTransactions: Dispatch<SetStateAction<Transaction[]>>;
  transfers: Transfer[];
  setTransfers: Dispatch<SetStateAction<Transfer[]>>;
  budgets: Budget[];
  setBudgets: Dispatch<SetStateAction<Budget[]>>;
  wishlists: WishlistItem[];
  setWishlists: Dispatch<SetStateAction<WishlistItem[]>>;
  reminders: BillReminder[];
  setReminders: Dispatch<SetStateAction<BillReminder[]>>;
}

export function useDataSync(
  supabase: SupabaseClient,
  {
    isHydrated,
    user,
    setUser,
    wallets,
    setWallets,
    categories,
    setCategories,
    transactions,
    setTransactions,
    transfers,
    setTransfers,
    budgets,
    setBudgets,
    wishlists,
    setWishlists,
    reminders,
    setReminders,
  }: UseDataSyncOptions
) {
  // Fetch all Supabase data for authenticated user
  const fetchSupabaseData = useCallback(
    async (userId: string) => {
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
          const loadedBudgets = budgetData.map((b) => ({
            id: b.id,
            categoryId: b.category_id,
            amount: Number(b.amount),
            month: b.month,
            year: b.year,
            createdAt: b.created_at,
            updatedAt: b.updated_at,
          }));
          setBudgets(loadedBudgets);

          // Auto-sync expenseLimit pada categories dengan budget bulan berjalan
          const now = new Date();
          const currentM = now.getMonth() + 1;
          const currentY = now.getFullYear();
          setCategories((prev) =>
            prev.map((cat) => {
              const currentMonthBudget = loadedBudgets.find(
                (b) =>
                  b.categoryId === cat.id &&
                  b.month === currentM &&
                  b.year === currentY
              );
              if (
                currentMonthBudget &&
                (!cat.expenseLimit || cat.expenseLimit !== currentMonthBudget.amount)
              ) {
                return { ...cat, expenseLimit: currentMonthBudget.amount };
              }
              return cat;
            })
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
    },
    [supabase, setUser, setWallets, setCategories, setTransactions, setTransfers, setBudgets, setWishlists, setReminders]
  );

  // Restore LocalStorage Fallback
  const restoreLocalStorageFallback = useCallback(() => {
    try {
      const savedWallets = localStorage.getItem(STORAGE_KEYS.WALLETS);
      const savedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      const savedTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      const savedTransfers = localStorage.getItem(STORAGE_KEYS.TRANSFERS);
      const savedBudgets = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      const savedWishlists = localStorage.getItem(STORAGE_KEYS.WISHLISTS);
      const savedReminders = localStorage.getItem(STORAGE_KEYS.REMINDERS);

      if (savedWallets) setWallets(JSON.parse(savedWallets));
      if (savedCategories) setCategories(JSON.parse(savedCategories));
      if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
      if (savedTransfers) setTransfers(JSON.parse(savedTransfers));
      if (savedBudgets) setBudgets(JSON.parse(savedBudgets));
      if (savedWishlists) setWishlists(JSON.parse(savedWishlists));
      if (savedReminders) setReminders(JSON.parse(savedReminders));
    } catch (e) {
      console.warn("Error restoring local storage fallback:", e);
    }
  }, [setWallets, setCategories, setTransactions, setTransfers, setBudgets, setWishlists, setReminders]);

  // Clear all states on sign out
  const resetLocalStates = useCallback(() => {
    setWallets([]);
    setCategories([]);
    setTransactions([]);
    setTransfers([]);
    setBudgets([]);
    setWishlists([]);
    setReminders([]);
  }, [setWallets, setCategories, setTransactions, setTransfers, setBudgets, setWishlists, setReminders]);

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
  }, [
    isHydrated,
    user,
    wallets,
    categories,
    transactions,
    transfers,
    budgets,
    wishlists,
    reminders,
  ]);

  // Reset all user financial data
  const resetUserData = useCallback(async () => {
    try {
      // 1. Reset React state (preserve user profile)
      setWallets([]);
      setCategories((prev) => prev.filter((c) => c.isDefault));
      setTransactions([]);
      setTransfers([]);
      setBudgets([]);
      setWishlists([]);
      setReminders([]);

      // 2. Clear relevant local storage
      localStorage.removeItem(STORAGE_KEYS.WALLETS);
      localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
      localStorage.removeItem(STORAGE_KEYS.TRANSFERS);
      localStorage.removeItem(STORAGE_KEYS.BUDGETS);
      localStorage.removeItem(STORAGE_KEYS.WISHLISTS);
      localStorage.removeItem(STORAGE_KEYS.REMINDERS);

      // 3. Clear remote database records if user is logged in
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        if (authUser) {
          await Promise.allSettled([
            supabase.from("transactions").delete().eq("user_id", authUser.id),
            supabase.from("transfers").delete().eq("user_id", authUser.id),
            supabase.from("budgets").delete().eq("user_id", authUser.id),
            supabase.from("wishlists").delete().eq("user_id", authUser.id),
            supabase.from("bill_reminders").delete().eq("user_id", authUser.id),
            supabase
              .from("categories")
              .delete()
              .eq("user_id", authUser.id)
              .eq("is_default", false),
            supabase.from("wallets").delete().eq("user_id", authUser.id),
          ]);
        }
      } catch (dbErr) {
        console.warn("Supabase resetUserData error:", dbErr);
      }

      return { success: true };
    } catch (e: any) {
      console.error("Failed to reset user data:", e);
      return { success: false, error: e?.message || "Gagal mereset data" };
    }
  }, [supabase, setWallets, setCategories, setTransactions, setTransfers, setBudgets, setWishlists, setReminders]);

  // Import all financial data from parsed Excel structure
  const importAllData = useCallback(
    async (
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
    ) => {
      try {
        let finalWallets: Wallet[] = [];
        let finalCategories: Category[] = [];
        let finalTransactions: Transaction[] = [];
        let finalTransfers: Transfer[] = [];
        let finalBudgets: Budget[] = [];
        let finalWishlists: WishlistItem[] = [];
        let finalReminders: BillReminder[] = [];

        if (mode === "overwrite") {
          // Bersihkan data saat ini
          finalWallets = [...parsedData.wallets];
          // Pastikan default categories tetap ada
          const defaultCats = categories.filter((c) => c.isDefault);
          const incomingNonDefault = parsedData.categories.filter((c) => !c.isDefault);
          finalCategories = [...defaultCats, ...incomingNonDefault];
          finalTransactions = [...parsedData.transactions];
          finalTransfers = [...parsedData.transfers];
          finalBudgets = [...parsedData.budgets];
          finalWishlists = [...parsedData.wishlists];
          finalReminders = [...parsedData.reminders];
        } else {
          // Mode Merge: gabungkan tanpa duplikasi ID
          const existingWalletIds = new Set(wallets.map((w) => w.id));
          const newWallets = parsedData.wallets.filter((w) => !existingWalletIds.has(w.id));
          finalWallets = [...wallets, ...newWallets];

          const existingCatNames = new Set(categories.map((c) => c.name.toLowerCase()));
          const existingCatIds = new Set(categories.map((c) => c.id));
          const newCategories = parsedData.categories.filter(
            (c) => !existingCatIds.has(c.id) && !existingCatNames.has(c.name.toLowerCase())
          );
          finalCategories = [...categories, ...newCategories];

          const existingTxIds = new Set(transactions.map((t) => t.id));
          const newTxs = parsedData.transactions.filter((t) => !existingTxIds.has(t.id));
          finalTransactions = [...newTxs, ...transactions];

          const existingTrfIds = new Set(transfers.map((tr) => tr.id));
          const newTransfers = parsedData.transfers.filter((tr) => !existingTrfIds.has(tr.id));
          finalTransfers = [...newTransfers, ...transfers];

          const existingBudgetIds = new Set(budgets.map((b) => b.id));
          const newBudgets = parsedData.budgets.filter((b) => !existingBudgetIds.has(b.id));
          finalBudgets = [...budgets, ...newBudgets];

          const existingWishIds = new Set(wishlists.map((w) => w.id));
          const newWishlists = parsedData.wishlists.filter((w) => !existingWishIds.has(w.id));
          finalWishlists = [...wishlists, ...newWishlists];

          const existingReminderIds = new Set(reminders.map((r) => r.id));
          const newReminders = parsedData.reminders.filter((r) => !existingReminderIds.has(r.id));
          finalReminders = [...reminders, ...newReminders];
        }

        // 1. Update React States
        setWallets(finalWallets);
        setCategories(finalCategories);
        setTransactions(finalTransactions);
        setTransfers(finalTransfers);
        setBudgets(finalBudgets);
        setWishlists(finalWishlists);
        setReminders(finalReminders);

        // 2. Sync to Supabase if authenticated
        try {
          const {
            data: { user: authUser },
          } = await supabase.auth.getUser();
          if (authUser) {
            if (mode === "overwrite") {
              // Hapus data lama di DB
              await Promise.allSettled([
                supabase.from("transactions").delete().eq("user_id", authUser.id),
                supabase.from("transfers").delete().eq("user_id", authUser.id),
                supabase.from("budgets").delete().eq("user_id", authUser.id),
                supabase.from("wishlists").delete().eq("user_id", authUser.id),
                supabase.from("bill_reminders").delete().eq("user_id", authUser.id),
                supabase
                  .from("categories")
                  .delete()
                  .eq("user_id", authUser.id)
                  .eq("is_default", false),
                supabase.from("wallets").delete().eq("user_id", authUser.id),
              ]);
            }

            // Insert wallets
            if (finalWallets.length > 0) {
              const dbWallets = (mode === "overwrite" ? finalWallets : parsedData.wallets).map(
                (w) => ({
                  id: w.id,
                  user_id: authUser.id,
                  name: w.name,
                  type: w.type,
                  balance: w.balance,
                  currency: w.currency,
                  account_number: w.accountNumber,
                  color: w.color,
                  created_at: w.createdAt,
                  updated_at: w.updatedAt,
                })
              );
              await supabase.from("wallets").upsert(dbWallets);
            }

            // Insert custom categories
            const customCatsToInsert = (
              mode === "overwrite" ? finalCategories : parsedData.categories
            ).filter((c) => !c.isDefault);
            if (customCatsToInsert.length > 0) {
              const dbCats = customCatsToInsert.map((c) => ({
                id: c.id,
                user_id: authUser.id,
                name: c.name,
                type: c.type,
                icon: c.icon,
                color: c.color,
                expense_limit: c.expenseLimit,
                is_default: false,
              }));
              await supabase.from("categories").upsert(dbCats);
            }

            // Insert transactions
            const txsToInsert =
              mode === "overwrite" ? finalTransactions : parsedData.transactions;
            if (txsToInsert.length > 0) {
              const dbTxs = txsToInsert.map((t) => ({
                id: t.id,
                user_id: authUser.id,
                wallet_id: t.walletId,
                category_id: t.categoryId,
                type: t.type,
                amount: t.amount,
                note: t.note,
                transaction_at: t.transactionAt,
                created_at: t.createdAt,
                updated_at: t.updatedAt,
              }));
              await supabase.from("transactions").upsert(dbTxs);
            }

            // Insert transfers
            const trfsToInsert =
              mode === "overwrite" ? finalTransfers : parsedData.transfers;
            if (trfsToInsert.length > 0) {
              const dbTrfs = trfsToInsert.map((tr) => ({
                id: tr.id,
                user_id: authUser.id,
                from_wallet_id: tr.fromWalletId,
                to_wallet_id: tr.toWalletId,
                amount: tr.amount,
                note: tr.note,
                transfer_at: tr.transferAt,
                created_at: tr.createdAt,
              }));
              await supabase.from("transfers").upsert(dbTrfs);
            }

            // Insert budgets
            const budgetsToInsert =
              mode === "overwrite" ? finalBudgets : parsedData.budgets;
            if (budgetsToInsert.length > 0) {
              const dbBudgets = budgetsToInsert.map((b) => ({
                id: b.id,
                user_id: authUser.id,
                category_id: b.categoryId,
                amount: b.amount,
                month: b.month,
                year: b.year,
                created_at: b.createdAt,
                updated_at: b.updatedAt,
              }));
              await supabase.from("budgets").upsert(dbBudgets);
            }

            // Insert wishlists
            const wishlistsToInsert =
              mode === "overwrite" ? finalWishlists : parsedData.wishlists;
            if (wishlistsToInsert.length > 0) {
              const dbWishlists = wishlistsToInsert.map((w) => ({
                id: w.id,
                user_id: authUser.id,
                name: w.name,
                target_amount: w.targetAmount,
                saved_amount: w.savedAmount,
                target_date: w.targetDate,
                icon: w.icon,
                color: w.color,
                note: w.note,
                is_completed: w.isCompleted,
                created_at: w.createdAt,
                updated_at: w.updatedAt,
              }));
              await supabase.from("wishlists").upsert(dbWishlists);
            }

            // Insert bill reminders
            const remindersToInsert =
              mode === "overwrite" ? finalReminders : parsedData.reminders;
            if (remindersToInsert.length > 0) {
              const dbReminders = remindersToInsert.map((r) => ({
                id: r.id,
                user_id: authUser.id,
                title: r.title,
                amount: r.amount,
                due_date: r.dueDate,
                category_id: r.categoryId,
                wallet_id: r.walletId,
                is_paid: r.isPaid,
                paid_at: r.paidAt,
                note: r.note,
                created_at: r.createdAt,
                updated_at: r.updatedAt,
              }));
              await supabase.from("bill_reminders").upsert(dbReminders);
            }
          }
        } catch (dbErr) {
          console.warn("Supabase importAllData error:", dbErr);
        }

        return { success: true };
      } catch (err: any) {
        console.error("Failed to import data:", err);
        return { success: false, error: err?.message || "Gagal mengimpor data" };
      }
    },
    [
      supabase,
      categories,
      wallets,
      transactions,
      transfers,
      budgets,
      wishlists,
      reminders,
      setWallets,
      setCategories,
      setTransactions,
      setTransfers,
      setBudgets,
      setWishlists,
      setReminders,
    ]
  );

  return {
    fetchSupabaseData,
    restoreLocalStorageFallback,
    resetLocalStates,
    resetUserData,
    importAllData,
  };
}
