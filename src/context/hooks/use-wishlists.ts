"use client";

import { useState, useCallback, Dispatch, SetStateAction } from "react";
import { WishlistItem, Wallet } from "@/types";
import { SupabaseClient } from "@supabase/supabase-js";

interface UseWishlistsOptions {
  wallets: Wallet[];
  setWallets: Dispatch<SetStateAction<Wallet[]>>;
}

export function useWishlists(
  supabase: SupabaseClient,
  { wallets, setWallets }: UseWishlistsOptions
) {
  const [wishlists, setWishlists] = useState<WishlistItem[]>([]);

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
          const {
            data: { user: authUser },
          } = await supabase.auth.getUser();
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
          const {
            data: { user: authUser },
          } = await supabase.auth.getUser();
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

  const deleteWishlistItem = useCallback(
    (id: string) => {
      setWishlists((prev) => prev.filter((w) => w.id !== id));
      (async () => {
        try {
          const {
            data: { user: authUser },
          } = await supabase.auth.getUser();
          if (authUser) {
            await supabase.from("wishlists").delete().eq("id", id);
          }
        } catch (e) {
          console.warn("Supabase deleteWishlistItem error:", e);
        }
      })();
      return { success: true };
    },
    [supabase]
  );

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
            const {
              data: { user: authUser },
            } = await supabase.auth.getUser();
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
          const {
            data: { user: authUser },
          } = await supabase.auth.getUser();
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
    [wallets, setWallets, supabase]
  );

  return {
    wishlists,
    setWishlists,
    addWishlistItem,
    updateWishlistItem,
    deleteWishlistItem,
    addSavingsToWishlist,
  };
}
