"use client";

import { useState, useCallback } from "react";
import { Budget, Category, Transaction, BudgetCalculation, BudgetStatus } from "@/types";
import { SupabaseClient } from "@supabase/supabase-js";

interface UseBudgetsOptions {
  categories: Category[];
  transactions: Transaction[];
}

export function useBudgets(
  supabase: SupabaseClient,
  { categories, transactions }: UseBudgetsOptions
) {
  const [budgets, setBudgets] = useState<Budget[]>([]);

  // Current month & year fallback
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

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
            const {
              data: { user: authUser },
            } = await supabase.auth.getUser();
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
          const {
            data: { user: authUser },
          } = await supabase.auth.getUser();
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
          const {
            data: { user: authUser },
          } = await supabase.auth.getUser();
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

  const deleteBudget = useCallback(
    (id: string) => {
      setBudgets((prev) => prev.filter((b) => b.id !== id));
      (async () => {
        try {
          const {
            data: { user: authUser },
          } = await supabase.auth.getUser();
          if (authUser) {
            await supabase.from("budgets").delete().eq("id", id);
          }
        } catch (e) {
          console.warn("Supabase deleteBudget error:", e);
        }
      })();
      return { success: true };
    },
    [supabase]
  );

  // Budget calculation (spent computed dynamically from transactions)
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

  // Top budget near limit for Dashboard Mini Card
  const getTopBudgetNearLimit = useCallback(
    (month = currentMonth, year = currentYear): BudgetCalculation | null => {
      const calcs = getBudgetCalculations(month, year);
      if (calcs.length === 0) return null;
      const sorted = [...calcs].sort((a, b) => b.percentage - a.percentage);
      return sorted[0];
    },
    [getBudgetCalculations, currentMonth, currentYear]
  );

  return {
    budgets,
    setBudgets,
    addBudget,
    updateBudget,
    deleteBudget,
    getBudgetCalculations,
    getTopBudgetNearLimit,
  };
}
