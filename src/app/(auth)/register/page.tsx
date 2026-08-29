"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFinora } from "@/context/finora-context";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Lock, Mail, User, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated, signUp } = useFinora();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isHydrated, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (password.length < 6) {
      setIsLoading(false);
      setErrorMsg("Kata sandi minimal 6 karakter");
      return;
    }

    const res = await signUp(email, password, name);
    setIsLoading(false);

    if (res.success) {
      setSuccessMsg("Akun berhasil dibuat! Mengalihkan ke dashboard...");
      setTimeout(() => {
        router.replace("/dashboard");
      }, 1000);
    } else {
      setErrorMsg(res.error || "Gagal mendaftar. Silakan coba lagi.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F4F6] dark:bg-[#0D0D11] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden selection:bg-violet-500 selection:text-white">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-96 h-80 sm:h-96 bg-[#6C4EF5]/15 dark:bg-[#6C4EF5]/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10 animate-card-enter">
        {/* Brand Header */}
        <div className="text-center space-y-2.5">
          <div className="h-14 w-14 rounded-3xl bg-[#6C4EF5] flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-violet-500/35 mx-auto transition-transform hover:scale-105">
            F
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Buat Akun Finora
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
              Mulai atur keuangan pribadi Anda dengan rapi dan aman
            </p>
          </div>
        </div>

        {/* Card Form */}
        <div className="rounded-[32px] border border-black/[0.06] bg-white p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.45)] dark:bg-[#16161C] dark:border-white/[0.08] space-y-5 backdrop-blur-xl">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2.5 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2.5 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Field: Name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Nama Lengkap
              </Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Anda"
                  className="w-full pl-11 pr-4 h-12 rounded-2xl bg-[#F5F5F7] dark:bg-[#202028] text-zinc-900 dark:text-white border border-black/[0.04] dark:border-white/5 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#6C4EF5] transition-all placeholder:text-zinc-400"
                  required
                />
              </div>
            </div>

            {/* Field: Email */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Alamat Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full pl-11 pr-4 h-12 rounded-2xl bg-[#F5F5F7] dark:bg-[#202028] text-zinc-900 dark:text-white border border-black/[0.04] dark:border-white/5 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#6C4EF5] transition-all placeholder:text-zinc-400"
                  required
                />
              </div>
            </div>

            {/* Field: Password */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Kata Sandi
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full pl-11 pr-11 h-12 rounded-2xl bg-[#F5F5F7] dark:bg-[#202028] text-zinc-900 dark:text-white border border-black/[0.04] dark:border-white/5 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#6C4EF5] transition-all placeholder:text-zinc-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-2xl bg-[#6C4EF5] hover:bg-[#5638D6] text-white font-bold text-sm shadow-lg shadow-violet-500/25 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <span>{isLoading ? "Mendaftar..." : "Daftar Akun Baru"}</span>
            </Button>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Sudah memiliki akun?{" "}
              <Link
                href="/login"
                className="font-bold text-[#6C4EF5] hover:underline"
              >
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
