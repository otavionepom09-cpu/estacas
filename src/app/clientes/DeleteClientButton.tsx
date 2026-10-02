"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteClient } from '@/lib/database-actions';
import { Trash2 } from 'lucide-react';

export function DeleteClientButton({ clienteId, clienteNome }: { clienteId: string; clienteNome: string }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    const res = await deleteClient(clienteId);
    setLoading(false);
    if (res.success) {
      router.refresh();
    } else {
      alert('Erro ao excluir: ' + res.error);
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500">Excluir <strong>{clienteNome}</strong>?</span>
        <button onClick={handleDelete} disabled={loading}
          className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded transition-colors disabled:opacity-50">
          {loading ? '...' : 'Sim'}
        </button>
        <button onClick={() => setConfirming(false)}
          className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold px-3 py-1.5 rounded transition-colors">
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <button onClick={() => setConfirming(true)}
      className="flex items-center gap-1 text-slate-400 hover:text-red-500 transition-colors text-sm px-2 py-1 rounded hover:bg-red-50">
      <Trash2 size={15} /> Excluir
    </button>
  );
}
