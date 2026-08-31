"use client";

import { useState, useCallback, Dispatch, SetStateAction } from "react";
import { Transaction, Transfer, Wallet } from "@/types";
import { SupabaseClient } from "@supabase/supabase-js";

interface UseTransactionsOptions {
  wallets: Wallet[];
  setWallets: Dispatch<SetStateAction<Wallet[]>>;
}

export function useTransactions(
  supabase: SupabaseClient,
  { wallets, setWallets }: UseTransactionsOptions
) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);

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
          const {
            data: { user: authUser },
          } = await supabase.auth.getUser();
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
    [wallets, setWallets, supabase]
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
          const {
            data: { user: authUser },
          } = await supabase.auth.getUser();
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
    [transactions, setWallets, supabase]
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
          const {
            data: { user: authUser },
          } = await supabase.auth.getUser();
          if (authUser) {
            await supabase.from("transactions").delete().eq("id", id);
          }
        } catch (e) {
          console.warn("Supabase deleteTransaction error:", e);
        }
      })();

      return { success: true };
    },
    [transactions, setWallets, supabase]
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
          const {
            data: { user: authUser },
          } = await supabase.auth.getUser();
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
    [wallets, setWallets, supabase]
  );

  return {
    transactions,
    setTransactions,
    transfers,
    setTransfers,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    createTransfer,
  };
}
