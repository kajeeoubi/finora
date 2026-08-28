"use client";

import React, { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useFinora } from "@/context/finora-context";
import { WalletType } from "@/types";
import { AlertCircle, Check, ChevronDown, CreditCard, Smartphone, Banknote, HelpCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export function AddWalletDrawer() {
  const { isAddWalletModalOpen, setIsAddWalletModalOpen, addWallet } =
    useFinora();

  const [name, setName] = useState("");
  const [type, setType] = useState<WalletType>("BANK");
  const [balanceStr, setBalanceStr] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [color, setColor] = useState("#6C4EF5");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const walletTypeOptions: { type: WalletType; label: string; icon: React.ReactNode }[] = [
    { type: "BANK", label: "Rekening Bank (BCA, Mandiri, dll)", icon: <CreditCard className="h-4 w-4 text-[#6C4EF5]" /> },
    { type: "EWALLET", label: "E-Wallet (GoPay, OVO, DANA)", icon: <Smartphone className="h-4 w-4 text-[#0EA5E9]" /> },
    { type: "CASH", label: "Uang Tunai / Cash", icon: <Banknote className="h-4 w-4 text-[#22C55E]" /> },
    { type: "OTHER", label: "Lainnya", icon: <HelpCircle className="h-4 w-4 text-zinc-400" /> },
  ];

  const selectedTypeObj = walletTypeOptions.find((o) => o.type === type) || walletTypeOptions[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Nama dompet harus diisi");
      return;
    }

    const initialBalance = parseInt(balanceStr.replace(/\D/g, ""), 10) || 0;

    const res = addWallet({
      name: name.trim(),
      type,
      balance: initialBalance,
      currency: "IDR",
      accountNumber: accountNumber.trim() || undefined,
      color,
    });

    if (res.success) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsAddWalletModalOpen(false);
        setName("");
        setBalanceStr("");
        setAccountNumber("");
      }, 700);
    } else {
      setErrorMsg(res.error || "Gagal membuat dompet");
    }
  };

  return (
    <Drawer open={isAddWalletModalOpen} onOpenChange={setIsAddWalletModalOpen}>
      <DrawerContent>
        <DrawerHeader className="p-0">
          <DrawerTitle>
            Tambah Dompet Baru
          </DrawerTitle>
        </DrawerHeader>

        {isSuccess ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="h-16 w-16 rounded-full bg-[#DCFCE7] dark:bg-emerald-950/60 flex items-center justify-center text-[#15803D] dark:text-emerald-400 animate-bounce">
              <Check className="h-8 w-8" />
            </div>
            <h4 className="text-lg font-bold text-zinc-900 dark:text-white">
              Dompet Berhasil Ditambahkan!
            </h4>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-red-50 text-red-700 text-xs font-bold border border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-wider">
                Nama Dompet / Rekening
              </Label>
              <input
                type="text"
                placeholder="Tulis nama dompet..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-12 rounded-2xl bg-[#F5F5F7] dark:bg-[#202028] text-zinc-900 dark:text-white border border-black/[0.08] dark:border-white/10 px-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-600"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-wider">
                Tipe Dompet
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger className="w-full h-12 inline-flex items-center justify-between px-4 rounded-2xl border border-black/[0.08] bg-[#F5F5F7] dark:bg-[#202028] dark:border-white/10 text-sm font-bold text-zinc-900 dark:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-all cursor-pointer outline-none">
                  <div className="flex items-center gap-2.5">
                    {selectedTypeObj.icon}
                    <span>{selectedTypeObj.label}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] p-1.5">
                  {walletTypeOptions.map((opt) => (
                    <DropdownMenuItem
                      key={opt.type}
                      onClick={() => setType(opt.type)}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        {opt.icon}
                        <span>{opt.label}</span>
                      </div>
                      {type === opt.type && <Check className="h-4 w-4 text-[#6C4EF5]" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-wider">
                Saldo Awal (Opsional)
              </Label>
              <div className="relative flex items-center">
                <span className="absolute left-4 font-black text-zinc-900 dark:text-white text-sm">
                  Rp
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={
                    balanceStr
                      ? new Intl.NumberFormat("id-ID").format(
                          parseInt(balanceStr, 10) || 0
                        )
                      : ""
                  }
                  onChange={(e) =>
                    setBalanceStr(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="0"
                  className="w-full h-12 pl-12 pr-4 rounded-2xl border border-black/[0.08] bg-[#F5F5F7] text-base font-black text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-600 dark:bg-[#202028] dark:border-white/10 tabular-nums"
                />
              </div>
            </div>

            {(type === "BANK" || type === "EWALLET") && (
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-wider">
                  Nomor Rekening atau No. HP (Opsional)
                </Label>
                <input
                  type="text"
                  placeholder="Tulis nomor rekening atau no. HP..."
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full h-12 rounded-2xl bg-[#F5F5F7] dark:bg-[#202028] text-zinc-900 dark:text-white border border-black/[0.08] dark:border-white/10 px-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-600"
                />
              </div>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full h-12 rounded-2xl bg-[#6C4EF5] hover:bg-[#5638D6] text-white font-bold text-sm shadow-md shadow-violet-500/25 cursor-pointer"
              >
                Buat Dompet
              </Button>
            </div>
          </form>
        )}
      </DrawerContent>
    </Drawer>
  );
}
