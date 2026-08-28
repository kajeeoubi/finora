"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Wallet,
  PieChart,
  BarChart3,
  Sparkles,
  ArrowRightLeft,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0D0D11] text-white selection:bg-[#6C4EF5] selection:text-white overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#6C4EF5]/20 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-[500px] h-[300px] bg-[#B6F23D]/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Navigation Header */}
      <header className="relative z-10 max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-[#6C4EF5] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-violet-500/40">
            F
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              Finora
            </span>
            <span className="text-[10px] block font-semibold text-[#B6F23D] tracking-widest uppercase">
              Personal Finance
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs font-semibold text-zinc-300 hover:text-white px-3 py-2 transition-colors"
          >
            Masuk
          </Link>
          <Link
            href="/dashboard"
            className="h-10 px-5 rounded-full bg-[#6C4EF5] hover:bg-[#5638D6] text-white text-xs font-bold inline-flex items-center gap-2 shadow-lg shadow-violet-600/30 transition-all active:scale-95"
          >
            <span>Buka Aplikasi</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pt-16 pb-20 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-md text-xs font-medium text-zinc-200">
          <Sparkles className="h-3.5 w-3.5 text-[#B6F23D]" />
          <span>Finora v2.0 MVP — Arus Kas Terkendali</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
          Pahami ke mana uang Anda pergi,{" "}
          <span className="bg-gradient-to-r from-[#6C4EF5] via-[#9076fc] to-[#B6F23D] bg-clip-text text-transparent">
            setiap rupiahnya.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Finora membantu Anda mencatat pemasukan, pengeluaran, memantau saldo di semua dompet (Cash, Bank, E-Wallet), melakukan transfer instan, dan mengontrol batas anggaran bulanan.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto h-14 px-8 rounded-full bg-[#6C4EF5] hover:bg-[#5638D6] text-white text-base font-bold inline-flex items-center justify-center gap-2.5 shadow-xl shadow-violet-600/40 transition-all hover:scale-105 active:scale-95"
          >
            <span>Mulai Sekarang (Gratis)</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/login"
            className="w-full sm:w-auto h-14 px-8 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-white text-base font-semibold inline-flex items-center justify-center transition-all"
          >
            Demo Cepat 1-Klik
          </Link>
        </div>

        {/* Feature Pill Tags */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-6 text-xs text-zinc-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />
            <span>Mata Uang Rupiah (IDR)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />
            <span>Transfer Antar Dompet Bebas Biaya</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />
            <span>Grafik Analitik & Texture Hatch</span>
          </div>
        </div>
      </section>

      {/* Interactive App Preview Showcase */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <div className="rounded-[40px] border border-white/10 bg-[#17171B] p-4 sm:p-8 shadow-2xl shadow-black/80 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 blur-[120px] pointer-events-none" />

          {/* Mini Mockup Window Header */}
          <div className="flex items-center justify-between pb-6 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500/80" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <div className="h-3 w-3 rounded-full bg-green-500/80" />
              <span className="text-xs font-mono text-zinc-500 ml-2">
                finora.app/dashboard
              </span>
            </div>
            <Link
              href="/dashboard"
              className="text-xs font-bold text-[#6C4EF5] hover:text-[#B6F23D] transition-colors"
            >
              Buka Demo Interaktif →
            </Link>
          </div>

          {/* 3 Pillars Grid Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            {/* Card 1: Overview */}
            <div className="p-5 rounded-3xl bg-[#222228] border border-white/5 space-y-3">
              <div className="h-10 w-10 rounded-2xl bg-violet-600/20 text-violet-400 flex items-center justify-center">
                <Wallet className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-white">
                Multi-Dompet & Total Saldo
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Kelola saldo BCA, Mandiri, Cash, dan GoPay dalam satu tampilan terpusat sebesar <strong>Rp7.250.000</strong>.
              </p>
            </div>

            {/* Card 2: Analytic */}
            <div className="p-5 rounded-3xl bg-[#222228] border border-white/5 space-y-3">
              <div className="h-10 w-10 rounded-2xl bg-[#B6F23D]/20 text-[#B6F23D] flex items-center justify-center">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-white">
                Analitik & Pola Belanja
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Grafik pemasukan bulanan Rp6.000.000 dengan signature hatch texture dan donut gauge chart pengeluaran per kategori.
              </p>
            </div>

            {/* Card 3: Transfer & Budget */}
            <div className="p-5 rounded-3xl bg-[#222228] border border-white/5 space-y-3">
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ArrowRightLeft className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-white">
                Transfer & Limit Anggaran
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Pindahkan saldo antar dompet tanpa dianggap pengeluaran, serta batasi budget bulanan dengan indikator warna pintar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 px-6 text-center text-xs text-zinc-500">
        <p>© 2026 Finora. Dirancang sesuai PRD & Design System v2.</p>
      </footer>
    </div>
  );
}
