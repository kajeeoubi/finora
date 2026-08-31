"use client";

import { useState } from "react";
import { BillReminder } from "@/types";

export function useModals() {
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
  const [isAddWalletModalOpen, setIsAddWalletModalOpen] = useState(false);
  const [isAddBudgetModalOpen, setIsAddBudgetModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddWishlistModalOpen, setIsAddWishlistModalOpen] = useState(false);
  const [isAddReminderModalOpen, setIsAddReminderModalOpen] = useState(false);
  const [payReminderItem, setPayReminderItem] = useState<BillReminder | null>(null);
  const [savingTargetWishlistId, setSavingTargetWishlistId] = useState<string | null>(null);
  const [limitCategoryData, setLimitCategoryData] = useState<{
    categoryId?: string;
    initialLimit?: number;
  } | null>(null);

  return {
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
}
