"use client";

import { useState } from 'react';
import { format } from 'date-fns';
import { Building2, CheckSquare, Square, Trash2 } from 'lucide-react';
import { deleteClientsBulk } from '@/lib/database-actions';
import { useRouter } from 'next/navigation';
import { DeleteClientButton } from './DeleteClientButton';

export function ClientesList({ clientes }: { clientes: any[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const router = useRouter();

  const toggleAll = () => {
    if (selected.length === clientes.length) setSelected([]);
    else setSelected(clientes.map(c => c.id));
  };

  const toggleOne = (id: string) => {
    if (selected.includes(id)) setSelected(selected.filter(x => x !== id));
    else setSelected([...selected, id]);
  };

  const confirmDelete = () => {
    if (!selected.length) return;
    setShowConfirmModal(true);
  };

  const executeDelete = async () => {
    setShowConfirmModal(false);
    setIsDeleting(true);
    setErrorMsg(null);
    const res = await deleteClientsBulk(selected);
    setIsDeleting(false);

    if (res.success) {
      setSelected([]);
      router.refresh();
    } else {
      setErrorMsg(res.error || 'Erro ao excluir.');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Barra de ações em massa */}
      {clientes.length > 0 && (
        <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between">
          <button onClick={toggleAll} className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-cofer-600 transition-colors">
            {selected.length === clientes.length ? <CheckSquare className="text-cofer-600" size={18} /> : <Square className="text-slate-400" size={18} />}
            Selecionar todos
          </button>
          
          <div className="flex items-center gap-3">
            {selected.length > 0 && (
              <span className="text-sm font-semibold text-slate-500">{selected.length} selecionados</span>
            )}
            <button 
              onClick={confirmDelete} 
              disabled={selected.length === 0 || isDeleting}
              className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded transition-colors ${
                selected.length > 0 
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-sm' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Trash2 size={16} /> {isDeleting ? 'Excluindo...' : 'Excluir selecionados'}
            </button>
          </div>
        </div>
      )}
      
      {/* Modal de Confirmação Customizado */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Confirmar Exclusão</h3>
            <p className="text-slate-600 text-sm mb-6">
              Tem certeza que deseja excluir <strong>{selected.length} cliente(s)</strong> e TODAS as suas obras e pedidos? Essa ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={executeDelete}
                className="px-4 py-2 text-sm font-bold bg-red-600 hover:bg-red-700 text-white rounded shadow-sm transition-colors"
              >
                Sim, excluir tudo
              </button>
            </div>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border-b border-red-100 text-red-600 text-sm px-4 py-3 font-medium text-center">
          {errorMsg}
        </div>
      )}

      {!clientes || clientes.length === 0 ? (
        <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
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

            const isSelected = selected.includes(cliente.id);

            return (
              <div key={cliente.id} className={`p-4 hover:bg-slate-50 transition-colors flex items-start gap-4 ${isSelected ? 'bg-blue-50/30' : ''}`}>
                <button onClick={() => toggleOne(cliente.id)} className="mt-2 shrink-0 text-slate-400 hover:text-cofer-600 transition-colors">
                  {isSelected ? <CheckSquare className="text-cofer-600" size={20} /> : <Square size={20} />}
                </button>
                
                <div className="flex-1 min-w-0 flex items-start justify-between gap-4">
                  <div>
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
  );
}
