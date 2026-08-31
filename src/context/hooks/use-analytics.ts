"use client";

import { useMemo, useCallback } from "react";
import { Wallet, Transaction, Category } from "@/types";

interface UseAnalyticsOptions {
  wallets: Wallet[];
  transactions: Transaction[];
  categories: Category[];
}

export function useAnalytics({
  wallets,
  transactions,
  categories,
}: UseAnalyticsOptions) {
  // Current month & year context
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Total balance = sum of all wallet balances
  const totalBalance = useMemo(() => {
    return wallets.reduce((sum, w) => sum + w.balance, 0);
  }, [wallets]);

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

  // Expense by category breakdown for Donut Chart
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
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ];
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

  return {
    totalBalance,
    monthlyIncome,
    monthlyExpense,
    getExpenseByCategory,
    getMonthlyTrends,
  };
}
