import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { FinoraProvider } from "@/context/finora-context";
import { TooltipProvider } from "@/components/ui/tooltip";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Finora — Manajemen Keuangan",
  description: "Kelola saldo dompet, catat transaksi, dan pantau anggaran dengan mudah.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  interactiveWidget: "resizes-visual",
};

const themeScript = `
  (function() {
    try {
      var saved = localStorage.getItem('finora_theme');
      var isDark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning className={`${plusJakartaSans.variable} h-full antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${plusJakartaSans.className} min-h-full flex flex-col font-sans bg-[#F5F5F7] text-[#111115] dark:bg-[#0B0B0E] dark:text-white transition-colors`}>
        <TooltipProvider delayDuration={150}>
          <FinoraProvider>{children}</FinoraProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
