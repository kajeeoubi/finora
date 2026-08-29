"use client";

import { useFinora } from "@/context/finora-context";
import { formatIDR, formatDateIndo } from "@/lib/formatters";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  Plus,
  ArrowRightLeft,
  Trash2,
  CreditCard,
  Banknote,
  Smartphone,
  Wallet as WalletIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function WalletsPage() {
  const {
    wallets,
    totalBalance,
    transfers,
    deleteWallet,
    setIsAddWalletModalOpen,
    setIsTransferModalOpen,
  } = useFinora();

  const getWalletIcon = (type: string) => {
    switch (type) {
      case "BANK":
        return <CreditCard className="h-5 w-5" />;
      case "EWALLET":
        return <Smartphone className="h-5 w-5" />;
      case "CASH":
        return <Banknote className="h-5 w-5" />;
      default:
        return <WalletIcon className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-5">
      {/* Clean Full-Width Heading */}
      <div className="space-y-1 animate-card-enter">
        <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          Dompet & Rekening
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Kelola saldo dan seluruh dompet
        </p>
      </div>

      {/* Action Buttons Row */}
      <div className="flex items-center gap-2.5 animate-card-enter stagger-1">
        <Button
          onClick={() => setIsTransferModalOpen(true)}
          variant="outline"
          className="flex-1 h-11 rounded-2xl text-xs font-bold gap-1.5 border-black/[0.08] dark:border-white/10 dark:bg-[#16161C] dark:text-white cursor-pointer shadow-sm"
        >
          <ArrowRightLeft className="h-4 w-4 text-[#6C4EF5]" />
          <span>Transfer</span>
        </Button>
        <Button
          onClick={() => setIsAddWalletModalOpen(true)}
          className="flex-1 h-11 rounded-2xl bg-[#6C4EF5] hover:bg-[#5638D6] text-white text-xs font-bold gap-1.5 shadow-md shadow-violet-500/25 cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Tambah Dompet</span>
        </Button>
      </div>

      {/* Total Balance Card (Akumulasi Seluruh Saldo - Black with subtle radial gradient) */}
      <div
        className="p-6 rounded-[32px] text-white border border-white/[0.08] shadow-xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-card-enter stagger-2"
        style={{
          backgroundColor: "#121215",
          backgroundImage: `
            radial-gradient(circle at 100% 0%, rgba(108, 78, 245, 0.22) 0%, rgba(108, 78, 245, 0.05) 35%, transparent 60%),
            radial-gradient(circle at 0% 100%, rgba(182, 242, 61, 0.10) 0%, rgba(182, 242, 61, 0.02) 30%, transparent 55%)
          `,
        }}
      >
        <div className="space-y-1">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Akumulasi Seluruh Saldo
          </span>
          <h3 className="text-3xl sm:text-4xl font-black text-white tabular-nums tracking-tight">
            {formatIDR(totalBalance)}
          </h3>
          <p className="text-xs text-zinc-400">
            Tersebar di {wallets.length} dompet
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsTransferModalOpen(true)}
            className="rounded-full bg-[#6C4EF5] hover:bg-[#5638D6] text-white text-xs font-bold px-5 py-2.5 shadow-lg shadow-violet-600/30 cursor-pointer"
          >
            Pindah Dana
          </Button>
        </div>
      </div>

      {/* Wallets List / Grid */}
      <div className="space-y-3 animate-card-enter stagger-3">
        <h3 className="text-base font-bold text-zinc-900 dark:text-white">
          Daftar Dompet
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {wallets.map((wallet) => {
            const isBank = wallet.type === "BANK";
            const isEwallet = wallet.type === "EWALLET";

            return (
              <div
                key={wallet.id}
                tabIndex={0}
                className="p-5 rounded-3xl border transition-all relative group flex flex-col justify-between min-h-[150px] bg-[#121216] text-white focus:outline-none focus:ring-1 focus:ring-violet-500/30 shadow-lg border-white/[0.08]"
              >
                {/* Top Row: Icon & Delete */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl flex items-center justify-center shadow-sm bg-white/15 text-white">
                      {getWalletIcon(wallet.type)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base leading-tight text-white">
                        {wallet.name}
                      </h4>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        {wallet.type}
                      </span>
                    </div>
                  </div>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => deleteWallet(wallet.id)}
                        className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 group-focus:opacity-100 p-2 text-zinc-400 hover:text-red-400 rounded-xl transition-opacity cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      Hapus Dompet
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* Account number if any */}
                {wallet.accountNumber && (
                  <div className="text-xs text-zinc-400 font-mono tracking-wider pt-2">
                    •••• •••• {wallet.accountNumber.slice(-4)}
                  </div>
                )}

                {/* Bottom Row: Balance */}
                <div className="pt-3 flex items-baseline justify-between border-t border-white/10">
                  <span className="text-xs text-zinc-400 font-semibold">Saldo</span>
                  <span className="text-xl font-black tabular-nums tracking-tight text-white">
                    {formatIDR(wallet.balance)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transfers History Section */}
      <div className="rounded-[28px] border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#16161C] p-5 shadow-sm space-y-3 transition-colors animate-card-enter stagger-4">
        <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <ArrowRightLeft className="h-4 w-4 text-[#6C4EF5]" />
          <span>Riwayat Transfer Antar Dompet</span>
        </h4>

        {transfers.length === 0 ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 py-4 text-center">
            Belum ada riwayat transfer.
          </p>
        ) : (
          <div className="divide-y divide-black/[0.06] dark:divide-white/[0.08]">
            {transfers.map((trf) => {
              const fromW = wallets.find((w) => w.id === trf.fromWalletId);
              const toW = wallets.find((w) => w.id === trf.toWalletId);

              return (
                <div
                  key={trf.id}
                  className="flex items-center justify-between py-3.5 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-900 dark:text-white">
                      {fromW?.name || "Dompet Asal"}
                    </span>
                    <ArrowRightLeft className="h-3 w-3 text-zinc-400" />
                    <span className="font-bold text-zinc-900 dark:text-white">
                      {toW?.name || "Dompet Tujuan"}
                    </span>
                    <span className="text-zinc-400 dark:text-zinc-500 text-[11px] ml-1.5 font-medium">
                      {formatDateIndo(trf.transferAt)}
                    </span>
                  </div>
                  <span className="font-extrabold text-violet-600 dark:text-violet-400 tabular-nums">
                    {formatIDR(trf.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
