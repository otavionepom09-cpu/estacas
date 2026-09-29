import Link from 'next/link';
import { Calculator, ClipboardList, Truck, AlertCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cards de métricas mockados */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Pedidos Planejados</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-2">12</h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
              <ClipboardList size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Entregas Programadas</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-2">34</h3>
            </div>
            <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
              <Truck size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Estacas a Entregar</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-2">890</h3>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg text-orange-600">
              <AlertCircle size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Estacas Entregues</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-2">4.520</h3>
            </div>
            <div className="p-3 bg-green-50 rounded-lg text-green-600">
              <Calculator size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800">Pedidos Recentes</h2>
          <Link href="/plan" className="text-sm font-medium text-blue-600 hover:text-blue-700">
            + Novo Planejamento
          </Link>
        </div>
        <div className="p-6 text-center text-slate-500 py-12">
          <p>Os pedidos aparecerão aqui após o planejamento.</p>
        </div>
      </div>
    </div>
  );
}
