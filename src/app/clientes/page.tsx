import { getSupabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { Users, Building2 } from 'lucide-react';
import { ClientesList } from './ClientesList';

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

      <ClientesList clientes={clientes || []} />
    </div>
  );
}
