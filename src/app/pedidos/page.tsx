import { getSupabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { ClipboardList, Truck, ChevronRight } from 'lucide-react';

export const revalidate = 0; // Disable static rendering for this page

export default async function PedidosPage() {
  const supabase = getSupabase();
  
  // Fetch orders with related data
  const { data: pedidos, error } = await supabase
    .from('pedidos')
    .select(`
      id,
      quantidade_solicitada,
      capacidade_por_caminhao,
      quantidade_entregas,
      status,
      created_at,
      clientes (nome),
      obras (nome),
      tipos_estaca (nome)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        Erro ao carregar pedidos: {error.message}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <ClipboardList className="text-cofer-600" size={32} />
          Histórico de Pedidos
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {(!pedidos || pedidos.length === 0) ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <ClipboardList size={48} className="text-slate-300 mb-4" />
            <p className="text-lg font-medium">Nenhum pedido encontrado</p>
            <p className="text-sm">Os pedidos salvos no planejamento aparecerão aqui.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
                  <th className="p-4 font-semibold">Data</th>
                  <th className="p-4 font-semibold">Cliente</th>
                  <th className="p-4 font-semibold">Obra</th>
                  <th className="p-4 font-semibold">Estaca</th>
                  <th className="p-4 font-semibold text-center">Qtd. Solicitada</th>
                  <th className="p-4 font-semibold text-center">Entregas</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pedidos.map((pedido: any) => (
                  <tr key={pedido.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4 text-sm text-slate-600 font-medium whitespace-nowrap">
                      {format(new Date(pedido.created_at), 'dd/MM/yyyy HH:mm')}
                    </td>
                    <td className="p-4 font-medium text-slate-800">
                      {pedido.clientes?.nome || '-'}
                    </td>
                    <td className="p-4 text-slate-600">
                      {pedido.obras?.nome || '-'}
                    </td>
                    <td className="p-4 text-slate-600 text-sm">
                      {pedido.tipos_estaca?.nome || '-'}
                    </td>
                    <td className="p-4 text-center font-bold text-slate-700">
                      {pedido.quantidade_solicitada}
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-semibold">
                        <Truck size={12} /> {pedido.quantidade_entregas}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                        pedido.status === 'Planejado' ? 'bg-blue-100 text-blue-700' : 
                        pedido.status === 'Concluído' ? 'bg-cofer-100 text-cofer-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {pedido.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-slate-400 hover:text-cofer-600 transition-colors p-2" title="Ver detalhes (em breve)">
                        <ChevronRight size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
