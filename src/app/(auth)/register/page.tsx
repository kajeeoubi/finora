"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Lock, Mail, User } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 600);
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
            Daftar Akun Finora
          </h2>
          <p className="text-xs text-muted-foreground">
            Mulai atur keuangan pribadi Anda dalam hitungan detik
          </p>
        </div>

        {/* Card Form */}
        <div className="rounded-3xl border border-black/[0.04] bg-white p-6 sm:p-8 shadow-xl dark:bg-[#17171B] dark:border-white/[0.06] space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-semibold">
                Nama Lengkap
              </Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tulis nama lengkap..."
                  className="pl-11 h-12 rounded-2xl"
                  required
                />
              </div>
            </div>

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
              <Label className="text-xs text-muted-foreground font-semibold">
                Kata Sandi
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
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
              {isLoading ? "Mendaftar..." : "Daftar Akun Baru"}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            Sudah memiliki akun?{" "}
            <Link
              href="/login"
              className="font-semibold text-violet-600 hover:underline"
            >
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
