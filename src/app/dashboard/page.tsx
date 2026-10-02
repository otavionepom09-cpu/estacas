import { getSupabase } from '@/lib/supabase';
import { BarChart3, Truck, ClipboardList, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = getSupabase();

  // Basic aggregations for the dashboard
  const { data: pedidos } = await supabase.from('pedidos').select('id, quantidade_solicitada, quantidade_entregas, created_at, clientes(nome)');
  
  const totalPedidos = pedidos?.length || 0;
  const totalEstacas = pedidos?.reduce((sum, p) => sum + (p.quantidade_solicitada || 0), 0) || 0;
  const totalViagens = pedidos?.reduce((sum, p) => sum + (p.quantidade_entregas || 0), 0) || 0;

  // Top clients
  const clienteCounts = (pedidos || []).reduce((acc: any, p: any) => {
    const nome = p.clientes?.nome || 'Desconhecido';
    acc[nome] = (acc[nome] || 0) + 1;
    return acc;
  }, {});
  const topClientes = Object.entries(clienteCounts).sort((a: any, b: any) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="text-cofer-600" size={32} />
        <h1 className="text-3xl font-bold text-slate-800">Dashboard de Métricas</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <ClipboardList size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase">Total de Pedidos</p>
            <p className="text-3xl font-bold text-slate-800">{totalPedidos}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase">Estacas Produzidas</p>
            <p className="text-3xl font-bold text-slate-800">{totalEstacas}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
            <Truck size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase">Viagens Programadas</p>
            <p className="text-3xl font-bold text-slate-800">{totalViagens}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Top Clientes</h2>
          {topClientes.length === 0 ? (
             <p className="text-slate-500 text-sm">Sem dados suficientes.</p>
          ) : (
            <div className="space-y-3">
              {topClientes.map(([nome, count]: any, i) => (
                <div key={i} className="flex justify-between items-center p-2 hover:bg-slate-50 rounded">
                  <span className="font-medium text-slate-700">{nome}</span>
                  <span className="bg-cofer-100 text-cofer-700 px-2 py-1 rounded-full text-xs font-bold">
                    {count} pedido{count > 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
