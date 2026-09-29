'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteOrder } from '@/lib/database-actions';
import { useRouter } from 'next/navigation';

export function DeleteButton({ pedidoId, cliente, obra }: { pedidoId: string; cliente: string; obra: string }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    const result = await deleteOrder(pedidoId);
    setLoading(false);
    setConfirming(false);
    if (result.success) {
      router.refresh();
    } else {
      alert(`Erro ao excluir: ${result.error}`);
    }
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-2 justify-end">
        <span className="text-xs text-slate-500 hidden sm:inline">
          Excluir <strong>{cliente}/{obra}</strong>?
        </span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded transition-colors disabled:opacity-50"
        >
          {loading ? 'Excluindo...' : 'Sim, excluir'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-slate-500 hover:text-slate-700 text-xs font-medium px-2 py-1.5"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-slate-300 hover:text-red-500 transition-colors p-2 rounded"
      title="Excluir pedido"
    >
      <Trash2 size={16} />
    </button>
  );
}
