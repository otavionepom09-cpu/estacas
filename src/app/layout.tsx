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
            <div className="max-w-6xl mx-auto px-4 md:px-6 flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <img src="https://www.cofer.com.br/images/logo.webp" alt="Cofer" className="h-8 object-contain" />
                <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
                <nav className="hidden md:flex gap-6 text-sm font-semibold text-slate-600">
                  <a href="/" className="hover:text-cofer-600 transition-colors flex items-center gap-2">
                    <Calculator size={18} /> Planejamento
                  </a>
                  <a href="/pedidos" className="hover:text-cofer-600 transition-colors flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    Histórico de Pedidos
                  </a>
                  <a href="/dashboard" className="hover:text-cofer-600 transition-colors flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>
                    Métricas
                  </a>
                </nav>
              </div>
              {/* Mobile Menu simplified */}
              <div className="md:hidden flex gap-4 text-sm font-semibold text-slate-600">
                <a href="/" className="hover:text-cofer-600">Planejar</a>
                <a href="/pedidos" className="hover:text-cofer-600">Pedidos</a>
                <a href="/dashboard" className="hover:text-cofer-600">Métricas</a>
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
