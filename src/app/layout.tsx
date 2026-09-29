import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Home, Calculator, ClipboardList, Truck, Users } from 'lucide-react';
import Link from 'next/link';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Estacas Pro - Planejamento e Controle",
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
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800">
          {/* Sidebar / Topbar */}
          <nav className="bg-blue-900 text-white w-full md:w-64 flex-shrink-0 flex flex-col shadow-lg z-10 relative">
            <div className="p-4 md:p-6 font-bold text-xl tracking-wider border-b border-blue-800 flex justify-between items-center">
              ESTACAS PRO
            </div>
            <ul className="flex md:flex-col overflow-x-auto p-2 md:p-4 gap-1 md:gap-2 no-scrollbar">
              <li>
                <Link href="/" className="flex items-center gap-3 p-3 hover:bg-blue-800 rounded-lg whitespace-nowrap transition-colors">
                  <Home size={20} />
                  <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link href="/plan" className="flex items-center gap-3 p-3 hover:bg-blue-800 rounded-lg whitespace-nowrap transition-colors">
                  <Calculator size={20} />
                  <span>Planejamento</span>
                </Link>
              </li>
              <li>
                <Link href="/orders" className="flex items-center gap-3 p-3 hover:bg-blue-800 rounded-lg whitespace-nowrap transition-colors">
                  <ClipboardList size={20} />
                  <span>Pedidos</span>
                </Link>
              </li>
              <li>
                <Link href="/deliveries" className="flex items-center gap-3 p-3 hover:bg-blue-800 rounded-lg whitespace-nowrap transition-colors">
                  <Truck size={20} />
                  <span>Entregas</span>
                </Link>
              </li>
              <li>
                <Link href="/customers" className="flex items-center gap-3 p-3 hover:bg-blue-800 rounded-lg whitespace-nowrap transition-colors">
                  <Users size={20} />
                  <span>Clientes & Obras</span>
                </Link>
              </li>
            </ul>
          </nav>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
