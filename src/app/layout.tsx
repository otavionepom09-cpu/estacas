import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Calculator } from 'lucide-react';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cofer - Planejamento",
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
          <header className="bg-white shadow-md z-10 border-b border-slate-200">
            <div className="max-w-6xl mx-auto px-4 py-3 md:px-6 flex items-center gap-4">
              <img src="https://www.cofer.com.br/images/logo.webp" alt="Cofer" className="h-10 object-contain" />
              <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
              <div className="font-semibold text-lg text-slate-600 flex items-center gap-2">
                <Calculator size={22} className="text-cofer-600" />
                <span className="hidden md:inline">Planejamento de Entregas</span>
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
