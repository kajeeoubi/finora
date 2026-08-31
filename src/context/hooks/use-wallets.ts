"use client";

import { useState, useCallback } from "react";
import { Wallet } from "@/types";
import { SupabaseClient } from "@supabase/supabase-js";

export function useWallets(supabase: SupabaseClient) {
  const [wallets, setWallets] = useState<Wallet[]>([]);

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
          const {
            data: { user: authUser },
          } = await supabase.auth.getUser();
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
          const {
            data: { user: authUser },
          } = await supabase.auth.getUser();
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
          const {
            data: { user: authUser },
          } = await supabase.auth.getUser();
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

  return {
    wallets,
    setWallets,
    addWallet,
    updateWallet,
    deleteWallet,
  };
}
