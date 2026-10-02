import { getSupabase } from '@/lib/supabase';
import { format } from 'date-fns';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Truck, ClipboardList } from 'lucide-react';
import { notFound } from 'next/navigation';
import { StakeItem, MixedDelivery } from '@/lib/calculations';

export const revalidate = 0;

export default async function OrderDetailsPage({ params }: { params: { id: string } }) {
  const supabase = getSupabase();

  const { data: pedido, error } = await supabase
    .from('pedidos')
    .select(`
      id, created_at, status, json_planejamento,
      clientes (nome),
      obras (nome)
    `)
    .eq('id', params.id)
    .single();

  if (error || !pedido) {
    return notFound();
  }

  // Se for um pedido novo salvo com json_planejamento
  const hasJson = !!pedido.json_planejamento;
  const plan = pedido.json_planejamento as {
    configCaminhao: { largura: number; altura: number; comprimentoCaminhao: number };
    stakeItems: StakeItem[];
    entregas: MixedDelivery[];
  } | null;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-4 border-b pb-4">
        <Link href="/pedidos" className="text-slate-500 hover:text-cofer-600 transition-colors bg-slate-100 hover:bg-slate-200 p-2 rounded-full">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Detalhes do Pedido</h1>
          <p className="text-slate-500 text-sm">
            Criado em {format(new Date(pedido.created_at), 'dd/MM/yyyy HH:mm')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 border-b pb-2">
            <ClipboardList className="text-slate-500" size={20} /> Dados do Pedido
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Cliente</p>
              <p className="font-medium text-slate-800 text-lg">
                {Array.isArray(pedido.clientes) ? pedido.clientes[0]?.nome : (pedido.clientes as any)?.nome || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Obra</p>
              <p className="font-medium text-slate-800 text-lg">
                {Array.isArray(pedido.obras) ? pedido.obras[0]?.nome : (pedido.obras as any)?.nome || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Status Geral</p>
              <span className="inline-flex px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold mt-1">
                {pedido.status}
              </span>
            </div>
          </div>
        </div>

        {hasJson && plan && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 border-b pb-2">
              <Truck className="text-slate-500" size={20} /> Solicitação Original
            </h2>
            <div className="space-y-3">
              <div className="flex gap-4">
                <div className="bg-slate-50 px-3 py-2 rounded border border-slate-100 flex-1">
                  <p className="text-xs text-slate-500">Caminhão</p>
                  <p className="font-bold text-sm">
                    {plan.configCaminhao?.largura}×{plan.configCaminhao?.altura}cm, {plan.configCaminhao?.comprimentoCaminhao}m
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold mb-2">ITENS SOLICITADOS</p>
                <div className="space-y-1">
                  {plan.stakeItems?.filter(i => i.quantidade > 0).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded text-sm border border-slate-100">
                      <span className="font-medium text-slate-600">Ø{item.diametro}cm × {item.comprimento_m}m</span>
                      <span className="font-bold text-cofer-700">{item.quantidade} un.</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {!hasJson && (
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg border border-yellow-200 text-sm">
          Este pedido foi salvo antes da atualização do sistema e não possui o histórico detalhado de entregas.
        </div>
      )}

      {hasJson && plan && plan.entregas && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 border-b pb-3">
            <CheckCircle2 className="text-green-500" /> Plano de Entregas Registrado
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs uppercase border-y border-slate-200">
                  <th className="p-3 font-bold w-12">#</th>
                  <th className="p-3 font-bold">Data Prevista</th>
                  <th className="p-3 font-bold">Composição da Carga</th>
                  <th className="p-3 font-bold text-center">% Caminhão</th>
                  <th className="p-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {plan.entregas.map((entrega, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="p-3 font-medium text-slate-500">{entrega.entrega_numero}</td>
                    <td className="p-3 font-medium text-slate-700">
                      {entrega.data ? format(new Date(entrega.data + 'T12:00:00'), 'dd/MM/yyyy') : '-'}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {entrega.items?.map((item, idx) => (
                          <span key={idx} className="inline-flex items-center bg-cofer-50 text-cofer-700 border border-cofer-200 px-2 py-0.5 rounded text-xs font-semibold">
                            {item.quantidade}× Ø{item.diametro} ({item.comprimento_m}m)
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-cofer-500 rounded-full" style={{ width: `${entrega.percentual_carregamento}%` }} />
                        </div>
                        <span className="text-xs font-bold text-slate-500">{entrega.percentual_carregamento}%</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-semibold">
                        {entrega.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
