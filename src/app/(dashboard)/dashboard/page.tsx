"use client";

import React from "react";
import { TotalBalanceCard } from "@/components/dashboard/TotalBalanceCard";
import { BudgetOverviewCard } from "@/components/dashboard/BudgetOverviewCard";
import { RecentTransactionsCard } from "@/components/dashboard/RecentTransactionsCard";
import { useFinora } from "@/context/finora-context";

export default function DashboardPage() {
  const { user } = useFinora();

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Top Greeting Headline */}
      <div className="pt-1 pb-1 animate-card-enter">
        <h1 className="text-[28px] sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
          Selamat Datang, {user.name.split(" ")[0]} <span>👋</span>
        </h1>
      </div>

      {/* 1. Hero Total Balance Card */}
      <div className="animate-card-enter stagger-1">
        <TotalBalanceCard />
      </div>

      {/* 2. Budget Overview Card (Single column stacked) */}
      <div className="animate-card-enter stagger-2">
        <BudgetOverviewCard />
      </div>

      {/* 3. Recent Activity (Single column stacked) */}
      <div className="animate-card-enter stagger-3">
        <RecentTransactionsCard />
      </div>
    </div>
  );
}
