"use client";

import React, { createContext, useContext, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { FinoraContextType } from "./types";
import {
  useModals,
  useWallets,
  useCategories,
  useTransactions,
  useBudgets,
  useWishlists,
  useReminders,
  useAnalytics,
  useAuth,
  useDataSync,
} from "./hooks";

export * from "./types";
export * from "./constants";

const FinoraContext = createContext<FinoraContextType | undefined>(undefined);

export function FinoraProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);

  // 1. Modals & Action Drawer States
  const modals = useModals();

  // 2. Wallets CRUD
  const { wallets, setWallets, addWallet, updateWallet, deleteWallet } =
    useWallets(supabase);

  // 3. Transactions & Transfers (with wallet balance sync)
  const {
    transactions,
    setTransactions,
    transfers,
    setTransfers,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    createTransfer,
  } = useTransactions(supabase, { wallets, setWallets });

  // 4. Categories CRUD
  const categoriesHook = useCategories(supabase);
  const { categories, setCategories, addCategory, updateCategory } = categoriesHook;

  // 5. Budgets CRUD & Budget Calculations
  const budgetsHook = useBudgets(supabase, { categories, transactions });
  const {
    budgets,
    setBudgets,
    addBudget,
    updateBudget,
    deleteBudget,
    getBudgetCalculations,
    getTopBudgetNearLimit,
  } = budgetsHook;

  // Composite deleteCategory: cleans up associated category budgets as well
  const deleteCategory = useCallback(
    (id: string) => {
      setBudgets((prev) => prev.filter((b) => b.categoryId !== id));
      return categoriesHook.deleteCategory(id);
    },
    [categoriesHook, setBudgets]
  );

  // 6. Wishlists & Savings
  const {
    wishlists,
    setWishlists,
    addWishlistItem,
    updateWishlistItem,
    deleteWishlistItem,
    addSavingsToWishlist,
  } = useWishlists(supabase, { wallets, setWallets });

  // 7. Reminders & Bill Payments
  const {
    reminders,
    setReminders,
    addReminder,
    updateReminder,
    deleteReminder,
    payReminder,
    unpayReminder,
  } = useReminders(supabase, { wallets, setWallets, setTransactions });

  // 8. Analytics & Financial Summaries
  const {
    totalBalance,
    monthlyIncome,
    monthlyExpense,
    getExpenseByCategory,
    getMonthlyTrends,
  } = useAnalytics({ wallets, transactions, categories });

  // 9. Auth & User Profile State
  const auth = useAuth(supabase, {
    onAuthenticated: async (userId) => {
      await dataSync.fetchSupabaseData(userId);
    },
    onSignedOut: () => {
      dataSync.resetLocalStates();
    },
    onRestoreLocalFallback: () => {
      dataSync.restoreLocalStorageFallback();
    },
  });

  // 10. Data Sync (Supabase fetch/upsert, LocalStorage cache, reset, import)
  const dataSync = useDataSync(supabase, {
    isHydrated: auth.isHydrated,
    user: auth.user,
    setUser: auth.setUser,
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
  });

  const value: FinoraContextType = {
    // Auth & User
    isAuthenticated: auth.isAuthenticated,
    user: auth.user,
    isHydrated: auth.isHydrated,
    login: auth.login,
    signUp: auth.signUp,
    logout: auth.logout,
    updateUser: auth.updateUser,

    // Entities
    wallets,
    categories,
    transactions,
    transfers,
    budgets,
    wishlists,
    reminders,

    // Analytics
    totalBalance,
    monthlyIncome,
    monthlyExpense,
    getBudgetCalculations,
    getTopBudgetNearLimit,
    getExpenseByCategory,
    getMonthlyTrends,

    // CRUD Actions
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

    // Data Actions
    resetUserData: dataSync.resetUserData,
    importAllData: dataSync.importAllData,

    // Modals
    ...modals,
  };

  return (
    <FinoraContext.Provider value={value}>
      {auth.isHydrated ? (
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
