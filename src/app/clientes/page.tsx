import { getSupabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { Users, Building2 } from 'lucide-react';
import { DeleteClientButton } from './DeleteClientButton';

export const revalidate = 0;

export default async function ClientesPage() {
  const supabase = getSupabase();

  const { data: clientes, error } = await supabase
    .from('clientes')
    .select(`
      id,
      nome,
      created_at,
      obras (
        id,
        nome,
        pedidos (id)
      )
    `)
    .order('nome');

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        Erro ao carregar clientes: {error.message}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Users className="text-cofer-600" size={32} />
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Clientes</h1>
          <p className="text-slate-500 text-sm">
            {clientes?.length || 0} cliente{clientes?.length !== 1 ? 's' : ''} cadastrado{clientes?.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {!clientes || clientes.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
            <Users size={48} className="text-slate-300" />
            <p className="text-lg font-medium">Nenhum cliente cadastrado</p>
            <p className="text-sm">Os clientes são adicionados automaticamente quando você salva um pedido.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {clientes.map((cliente: any) => {
              const totalObras = cliente.obras?.length || 0;
              const totalPedidos = cliente.obras?.reduce(
                (sum: number, o: any) => sum + (o.pedidos?.length || 0), 0
              ) || 0;

              return (
                <div key={cliente.id} className="p-5 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 bg-cofer-100 text-cofer-700 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                          {cliente.nome.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800 text-lg leading-tight">{cliente.nome}</h3>
                          <p className="text-xs text-slate-400">
                            Cadastrado em {format(new Date(cliente.created_at), 'dd/MM/yyyy')}
                          </p>
                        </div>
                      </div>

                      {/* Obras do cliente */}
                      {totalObras > 0 && (
                        <div className="ml-12 space-y-1">
                          {cliente.obras.map((obra: any) => (
                            <div key={obra.id} className="flex items-center gap-2 text-sm text-slate-600">
                              <Building2 size={13} className="text-slate-400 shrink-0" />
                              <span>{obra.nome}</span>
                              <span className="text-xs text-slate-400">
                                ({obra.pedidos?.length || 0} pedido{obra.pedidos?.length !== 1 ? 's' : ''})
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="ml-12 mt-2 flex gap-4 text-xs text-slate-500">
                        <span className="bg-slate-100 px-2 py-0.5 rounded font-medium">
                          {totalObras} obra{totalObras !== 1 ? 's' : ''}
                        </span>
                        <span className="bg-cofer-50 text-cofer-700 px-2 py-0.5 rounded font-medium">
                          {totalPedidos} pedido{totalPedidos !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    <DeleteClientButton clienteId={cliente.id} clienteNome={cliente.nome} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
