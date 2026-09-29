import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Calculator } from 'lucide-react';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Estacas Pro - Planejamento",
  description: "Sistema para planejamento e controle de entregas de estacas de concreto armado.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
          {/* Topbar */}
          <header className="bg-blue-900 text-white shadow-md z-10">
            <div className="max-w-6xl mx-auto px-4 py-4 md:px-6 flex items-center gap-3">
              <Calculator size={28} className="text-blue-300" />
              <div className="font-bold text-xl tracking-wider">
                ESTACAS PRO
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
