import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { FinoraProvider } from "@/context/finora-context";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Finora — Aplikasi Manajemen Keuangan & Arus Kas Pribadi",
  description:
    "Pantau saldo dompet, catat pengeluaran & pemasukan, transfer antar dompet, dan kendalikan anggaran bulanan Anda dengan mudah.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${plusJakartaSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-[#F5F5F7] text-[#111115] dark:bg-[#0B0B0E] dark:text-white transition-colors">
        <FinoraProvider>{children}</FinoraProvider>
      </body>
    </html>
  );
}
