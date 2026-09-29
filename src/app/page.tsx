"use client";

import { useState } from 'react';
import { calculateTruckCapacity, calculateMixedDeliveries, StakeItem, MixedDelivery } from '@/lib/calculations';
import { Calculator, Truck, CheckCircle2, RefreshCw, Save, ClipboardList, Plus, Trash2 } from 'lucide-react';

let _nextId = 1;
const nextId = () => String(_nextId++);

export default function PlanningPage() {
  // Bloco 1 — Caminhão
  const [largura, setLargura] = useState<number>(245);
  const [comprimento, setComprimento] = useState<number>(240);

  // Bloco 2 — Solicitação
  const [cliente, setCliente] = useState('');
  const [obra, setObra] = useState('');
  const [dataPrimeiraEntrega, setDataPrimeiraEntrega] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Itens de estaca (múltiplos tipos)
  const [stakeItems, setStakeItems] = useState<StakeItem[]>([
    { id: nextId(), diametro: 30, quantidade: 100 },
  ]);

  // Resultado
  const [entregas, setEntregas] = useState<MixedDelivery[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const addStakeItem = () =>
    setStakeItems(prev => [...prev, { id: nextId(), diametro: 30, quantidade: 0 }]);

  const removeStakeItem = (id: string) =>
    setStakeItems(prev => prev.filter(i => i.id !== id));

  const updateStakeItem = (id: string, field: 'diametro' | 'quantidade', value: number) =>
    setStakeItems(prev => prev.map(i => (i.id === id ? { ...i, [field]: value } : i)));

  const updateEntrega = (index: number, field: keyof MixedDelivery, value: string) =>
    setEntregas(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });

  const totalSolicitado = stakeItems.reduce((s, i) => s + (Number(i.quantidade) || 0), 0);

  // ── Calcular ──────────────────────────────────────────────────────────────
  const handleCalculate = () => {
    const validos = stakeItems.filter(i => i.diametro > 0 && i.quantidade > 0);
    if (!validos.length) return;
    const result = calculateMixedDeliveries(validos, largura, comprimento, dataPrimeiraEntrega);
    setEntregas(result);
    setSaveStatus(null);
  };

  // ── Salvar ────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!cliente || !obra) {
      setSaveStatus({ type: 'error', message: 'Informe o Cliente e a Obra antes de salvar.' });
      return;
    }
    setIsSaving(true);
    setSaveStatus(null);

    try {
      const { saveOrderToDatabase } = await import('@/lib/database-actions');
      // Build a synthetic single-type summary for DB (multi-type save to be expanded)
      const dominante = stakeItems.reduce((a, b) => (a.quantidade >= b.quantidade ? a : b));
      const result = await saveOrderToDatabase({
        clienteNome: cliente,
        obraNome: obra,
        diametro: dominante.diametro,
        largura,
        comprimento,
        quantidadeSolicitada: totalSolicitado,
        capacidade: calculateTruckCapacity(largura, comprimento, dominante.diametro),
        entregas: entregas.map((e, i) => ({
          entrega_numero: e.entrega_numero,
          quantidade: e.items.reduce((s, it) => s + it.quantidade, 0),
          capacidade: calculateTruckCapacity(largura, comprimento, dominante.diametro),
          saldo: e.saldo_total_apos_entrega,
          data: e.data,
          status: e.status,
        })),
      });

      setIsSaving(false);
      if (result.success) {
        setSaveStatus({ type: 'success', message: 'Pedido salvo com sucesso!' });
        setTimeout(() => {
          setCliente(''); setObra(''); setEntregas([]); setSaveStatus(null);
          setStakeItems([{ id: nextId(), diametro: 30, quantidade: 100 }]);
        }, 3000);
      } else {
        setSaveStatus({ type: 'error', message: result.error || 'Erro ao salvar.' });
      }
    } catch (e: any) {
      setIsSaving(false);
      setSaveStatus({ type: 'error', message: e.message });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Calculator className="text-cofer-600" size={32} />
        <h1 className="text-3xl font-bold text-slate-800">Planejamento de Entregas</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── BLOCO 1 — CAMINHÃO ─────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4 lg:col-span-1">
          <h2 className="text-xl font-semibold flex items-center gap-2 border-b pb-3">
            <Truck className="text-slate-500" /> Configuração do Caminhão
          </h2>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Largura útil (cm)</label>
            <input type="number" value={largura} onChange={e => setLargura(Number(e.target.value))}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-cofer-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Comprimento útil (cm)</label>
            <input type="number" value={comprimento} onChange={e => setComprimento(Number(e.target.value))}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-cofer-500 outline-none" />
          </div>

          {/* Capacidade por tipo */}
          <div className="bg-slate-50 rounded-lg border border-slate-100 p-4 space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Capacidade por tipo
            </span>
            {stakeItems.filter(i => i.diametro > 0).map(item => {
              const cap = calculateTruckCapacity(largura, comprimento, item.diametro);
              return (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-slate-600">Ø{item.diametro} cm</span>
                  <span className="font-bold text-cofer-700">{cap} estacas/caminhão</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── BLOCO 2 — SOLICITAÇÃO ──────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-5 lg:col-span-2">
          <h2 className="text-xl font-semibold flex items-center gap-2 border-b pb-3">
            <ClipboardList className="text-slate-500" /> Dados da Solicitação
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Cliente</label>
              <input type="text" value={cliente} onChange={e => setCliente(e.target.value)}
                placeholder="Nome do cliente..." className="w-full p-2 border rounded focus:ring-2 focus:ring-cofer-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Obra</label>
              <input type="text" value={obra} onChange={e => setObra(e.target.value)}
                placeholder="Identificação da obra..." className="w-full p-2 border rounded focus:ring-2 focus:ring-cofer-500 outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-600 mb-1">Data da 1ª Entrega</label>
              <input type="date" value={dataPrimeiraEntrega} onChange={e => setDataPrimeiraEntrega(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-cofer-500 outline-none" />
            </div>
          </div>

          {/* Tabela de tipos de estaca */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                Tipos de Estaca
              </label>
              <button onClick={addStakeItem}
                className="flex items-center gap-1 text-cofer-600 hover:text-cofer-700 text-sm font-semibold transition-colors">
                <Plus size={16} /> Adicionar tipo
              </button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b text-slate-600">
                    <th className="p-3 text-left font-semibold">Diâmetro (cm)</th>
                    <th className="p-3 text-left font-semibold">Quantidade</th>
                    <th className="p-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stakeItems.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="p-2">
                        <input type="number" value={item.diametro}
                          onChange={e => updateStakeItem(item.id, 'diametro', Number(e.target.value))}
                          className="w-full p-2 border rounded focus:ring-1 focus:ring-cofer-500 outline-none" />
                      </td>
                      <td className="p-2">
                        <input type="number" value={item.quantidade}
                          onChange={e => updateStakeItem(item.id, 'quantidade', Number(e.target.value))}
                          className="w-full p-2 border rounded focus:ring-1 focus:ring-cofer-500 outline-none font-semibold" />
                      </td>
                      <td className="p-2 text-center">
                        <button onClick={() => removeStakeItem(item.id)}
                          disabled={stakeItems.length === 1}
                          className="text-slate-300 hover:text-red-500 transition-colors disabled:opacity-20 p-1">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 border-t">
                    <td className="p-3 text-slate-500 text-xs font-medium">TOTAL</td>
                    <td className="p-3 font-bold text-slate-800">{totalSolicitado} estacas</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <button onClick={handleCalculate}
            className="w-full bg-cofer-600 hover:bg-cofer-700 text-white font-bold py-4 px-6 rounded-lg transition-colors flex justify-center items-center gap-2 shadow-md">
            <RefreshCw size={20} /> CALCULAR ENTREGAS
          </button>
        </div>
      </div>

      {/* ── BLOCO 3 — RESULTADO ─────────────────────────────────────────── */}
      {entregas.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 gap-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <CheckCircle2 className="text-green-500" /> Plano de Entregas
            </h2>
            <div className="flex gap-4 text-sm font-medium">
              <div className="bg-slate-100 px-4 py-2 rounded-lg flex flex-col items-center">
                <span className="text-slate-500 text-xs uppercase">Total Solicitado</span>
                <span className="text-lg font-bold">{totalSolicitado}</span>
              </div>
              <div className="bg-slate-100 px-4 py-2 rounded-lg flex flex-col items-center">
                <span className="text-slate-500 text-xs uppercase">Entregas</span>
                <span className="text-lg font-bold">{entregas.length}</span>
              </div>
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg flex flex-col items-center">
                <span className="text-xs uppercase opacity-80">Saldo Final</span>
                <span className="text-lg font-bold">{entregas[entregas.length - 1]?.saldo_total_apos_entrega ?? 0}</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-sm border-y border-slate-200">
                  <th className="p-3 font-semibold w-12">#</th>
                  <th className="p-3 font-semibold">Data Prevista</th>
                  <th className="p-3 font-semibold">Composição da Carga</th>
                  <th className="p-3 font-semibold text-center">% Caminhão</th>
                  <th className="p-3 font-semibold">Saldo Total</th>
                  <th className="p-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entregas.map((entrega, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="p-3 font-medium text-slate-500">{entrega.entrega_numero}</td>
                    <td className="p-3">
                      <input type="date" value={entrega.data}
                        onChange={e => updateEntrega(i, 'data', e.target.value)}
                        className="border rounded px-2 py-1 text-sm focus:ring-1 outline-none w-full max-w-[150px]" />
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {entrega.items.map(item => (
                          <span key={item.diametro}
                            className="inline-flex items-center bg-cofer-50 text-cofer-700 border border-cofer-200 px-2 py-0.5 rounded text-xs font-semibold">
                            {item.quantidade}× Ø{item.diametro}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-cofer-500 rounded-full"
                            style={{ width: `${entrega.percentual_carregamento}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-slate-600">
                          {entrega.percentual_carregamento}%
                        </span>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-slate-700">{entrega.saldo_total_apos_entrega}</td>
                    <td className="p-3">
                      <select value={entrega.status}
                        onChange={e => updateEntrega(i, 'status', e.target.value)}
                        className="border rounded px-2 py-1 text-sm focus:ring-1 outline-none bg-white w-full max-w-[140px]">
                        <option>Programada</option>
                        <option>Carregada</option>
                        <option>Em trânsito</option>
                        <option>Entregue</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-2">
            {saveStatus && (
              <div className={`px-4 py-2 rounded-lg text-sm font-semibold flex-1 ${saveStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {saveStatus.message}
              </div>
            )}
            <button onClick={handleSave} disabled={isSaving}
              className="bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap">
              {isSaving ? <RefreshCw size={20} className="animate-spin" /> : <Save size={20} />}
              {isSaving ? 'SALVANDO...' : 'SALVAR PEDIDO'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
