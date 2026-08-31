"use client";

import { useState, useCallback, useRef } from "react";
import { Category } from "@/types";
import { SupabaseClient } from "@supabase/supabase-js";

interface UseCategoriesOptions {
  onDeleteCategory?: (categoryId: string) => void;
}

export function useCategories(supabase: SupabaseClient, options?: UseCategoriesOptions) {
  const [categories, setCategories] = useState<Category[]>([]);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const addCategory = useCallback(
    (data: Omit<Category, "id">) => {
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
          const {
            data: { user: authUser },
          } = await supabase.auth.getUser();
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
    },
    [supabase]
  );

  const updateCategory = useCallback(
    (id: string, data: Partial<Omit<Category, "id">>) => {
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...data } : c))
      );

      (async () => {
        try {
          const {
            data: { user: authUser },
          } = await supabase.auth.getUser();
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

  const deleteCategory = useCallback(
    (id: string) => {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      if (optionsRef.current?.onDeleteCategory) {
        optionsRef.current.onDeleteCategory(id);
      }

      (async () => {
        try {
          const {
            data: { user: authUser },
          } = await supabase.auth.getUser();
          if (authUser) {
            await supabase.from("categories").delete().eq("id", id);
          }
        } catch (e) {
          console.warn("Supabase deleteCategory error:", e);
        }
      })();

      return { success: true };
    },
    [supabase]
  );

  return {
    categories,
    setCategories,
    addCategory,
    updateCategory,
    deleteCategory,
  };
}
