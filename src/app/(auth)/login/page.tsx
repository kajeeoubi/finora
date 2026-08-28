"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Lock, Mail, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("aditya@finora.id");
  const [password, setPassword] = useState("password123");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 600);
  };

  const handleDemoLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#F4F4F6] dark:bg-[#0D0D11] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-2xl bg-[#6C4EF5] flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-violet-500/30 mx-auto">
            F
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Masuk ke Finora
          </h2>
          <p className="text-xs text-muted-foreground">
            Kelola keuangan & arus kas pribadi Anda dengan aman
          </p>
        </div>

        {/* Card Form */}
        <div className="rounded-3xl border border-black/[0.04] bg-white p-6 sm:p-8 shadow-xl dark:bg-[#17171B] dark:border-white/[0.06] space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-semibold">
                Alamat Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="pl-11 h-12 rounded-2xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground font-semibold">
                  Kata Sandi
                </Label>
                <a
                  href="#"
                  className="text-[11px] font-semibold text-violet-600 hover:underline"
                >
                  Lupa kata sandi?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-11 h-12 rounded-2xl"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-2xl bg-[#6C4EF5] hover:bg-[#5638D6] text-white font-semibold text-sm shadow-md shadow-violet-500/20"
            >
              {isLoading ? "Memproses..." : "Masuk"}
            </Button>
          </form>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-border w-full" />
            <span className="bg-white dark:bg-[#17171B] px-3 text-[11px] text-muted-foreground uppercase font-semibold">
              atau
            </span>
          </div>

          {/* Quick 1-Click Demo Login */}
          <Button
            type="button"
            onClick={handleDemoLogin}
            disabled={isLoading}
            variant="outline"
            className="w-full h-12 rounded-2xl border-violet-200 bg-violet-50/50 hover:bg-violet-100 text-violet-700 font-semibold text-xs gap-2 dark:bg-violet-950/30 dark:border-violet-900 dark:text-violet-300"
          >
            <Sparkles className="h-4 w-4 text-violet-600" />
            <span>Masuk Cepat Demo (Akun Aditya)</span>
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="font-semibold text-violet-600 hover:underline"
            >
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
