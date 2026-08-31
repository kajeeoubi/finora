"use client";

import { useState, useCallback, Dispatch, SetStateAction } from "react";
import { BillReminder, Wallet, Transaction } from "@/types";
import { SupabaseClient } from "@supabase/supabase-js";

interface UseRemindersOptions {
  wallets: Wallet[];
  setWallets: Dispatch<SetStateAction<Wallet[]>>;
  setTransactions: Dispatch<SetStateAction<Transaction[]>>;
}

export function useReminders(
  supabase: SupabaseClient,
  { wallets, setWallets, setTransactions }: UseRemindersOptions
) {
  const [reminders, setReminders] = useState<BillReminder[]>([]);

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
          const {
            data: { user: authUser },
          } = await supabase.auth.getUser();
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
          const {
            data: { user: authUser },
          } = await supabase.auth.getUser();
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

  const deleteReminder = useCallback(
    (id: string) => {
      setReminders((prev) => prev.filter((r) => r.id !== id));
      (async () => {
        try {
          const {
            data: { user: authUser },
          } = await supabase.auth.getUser();
          if (authUser) {
            await supabase.from("bill_reminders").delete().eq("id", id);
          }
        } catch (e) {
          console.warn("Supabase deleteReminder error:", e);
        }
      })();
      return { success: true };
    },
    [supabase]
  );

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
            const {
              data: { user: authUser },
            } = await supabase.auth.getUser();
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
          const {
            data: { user: authUser },
          } = await supabase.auth.getUser();
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
    [reminders, wallets, setWallets, setTransactions, supabase]
  );

  const unpayReminder = useCallback(
    (id: string) => {
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
          const {
            data: { user: authUser },
          } = await supabase.auth.getUser();
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
    },
    [supabase]
  );

  return {
    reminders,
    setReminders,
    addReminder,
    updateReminder,
    deleteReminder,
    payReminder,
    unpayReminder,
  };
}
