import { UserProfile } from "@/types";

export const EMPTY_USER: UserProfile = {
  id: "",
  name: "",
  email: "",
};

export const STORAGE_KEYS = {
  AUTH: "finora_auth_v2",
  USER: "finora_user_v2",
  WALLETS: "finora_wallets_v2",
  CATEGORIES: "finora_categories_v2",
  TRANSACTIONS: "finora_transactions_v2",
  TRANSFERS: "finora_transfers_v2",
  BUDGETS: "finora_budgets_v2",
  WISHLISTS: "finora_wishlists_v2",
  REMINDERS: "finora_reminders_v2",
} as const;
