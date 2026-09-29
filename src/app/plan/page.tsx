"use client";

import { useState, useMemo } from 'react';
import { calculateTruckCapacity, calculateDeliveries, DeliveryPlan } from '@/lib/calculations';
import { Calculator, Truck, CheckCircle2, AlertTriangle, RefreshCw, Save } from 'lucide-react';
import { addDays, format, parseISO } from 'date-fns';

export default function PlanningPage() {
  // Bloco 1: Caminhão
  const [largura, setLargura] = useState<number>(245);
  const [comprimento, setComprimento] = useState<number>(240);
  const [diametro, setDiametro] = useState<number>(30);

  // Bloco 2: Solicitação
  const [cliente, setCliente] = useState('');
  const [obra, setObra] = useState('');
  const [quantidadeSolicitada, setQuantidadeSolicitada] = useState<number>(150);
  const [dataPrimeiraEntrega, setDataPrimeiraEntrega] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Deliveries State (could be manual edits)
  const [entregas, setEntregas] = useState<(DeliveryPlan & { data: string, status: string })[]>([]);
  
  // Cálculos Automáticos
  const estacasPorLargura = useMemo(() => diametro > 0 ? Math.floor(largura / diametro) : 0, [largura, diametro]);
  const estacasPorComprimento = useMemo(() => diametro > 0 ? Math.floor(comprimento / diametro) : 0, [comprimento, diametro]);
  const capacidade = useMemo(() => calculateTruckCapacity(largura, comprimento, diametro), [largura, comprimento, diametro]);

  const handleCalculate = () => {
    if (capacidade <= 0 || quantidadeSolicitada <= 0) return;
    
    const baseDeliveries = calculateDeliveries(quantidadeSolicitada, capacidade);
    const startDate = parseISO(dataPrimeiraEntrega);

    const planned = baseDeliveries.map((del, i) => {
      // Add 1 day for each subsequent delivery as default
      const date = addDays(startDate, i);
      return {
        ...del,
        data: format(date, 'yyyy-MM-dd'),
        status: 'Programada'
      };
    });

    setEntregas(planned);
  };

  const updateEntrega = (index: number, field: string, value: any) => {
    const novasEntregas = [...entregas];
    novasEntregas[index] = { ...novasEntregas[index], [field]: value };
    setEntregas(novasEntregas);
  };

  const totalEntregue = entregas.reduce((acc, curr) => acc + (Number(curr.quantidade) || 0), 0);
  const saldoAtual = quantidadeSolicitada - totalEntregue;
  const isOverCapacity = entregas.some(e => e.quantidade > capacidade);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <Calculator className="text-blue-600" size={32} />
          Planejamento de Entregas
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* BLOCO 1 - CONFIGURAÇÃO */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6 lg:col-span-1">
          <h2 className="text-xl font-semibold flex items-center gap-2 border-b pb-3">
            <Truck className="text-slate-500" />
            Configuração do Caminhão
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Largura útil (cm)</label>
              <input 
                type="number" 
                value={largura} 
                onChange={e => setLargura(Number(e.target.value))}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Comprimento útil (cm)</label>
              <input 
                type="number" 
                value={comprimento} 
                onChange={e => setComprimento(Number(e.target.value))}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Diâmetro da estaca (cm)</label>
              <input 
                type="number" 
                value={diametro} 
                onChange={e => setDiametro(Number(e.target.value))}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-2">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Estacas por largura:</span>
              <span className="font-semibold">{estacasPorLargura}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600">
              <span>Estacas por comprimento:</span>
              <span className="font-semibold">{estacasPorComprimento}</span>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Capacidade do Caminhão</span>
              <div className="text-3xl font-black text-blue-700">{capacidade} <span className="text-lg font-medium text-slate-500">estacas</span></div>
            </div>
          </div>
        </div>

        {/* BLOCO 2 - SOLICITAÇÃO */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6 lg:col-span-2">
          <h2 className="text-xl font-semibold flex items-center gap-2 border-b pb-3">
            <ClipboardList className="text-slate-500" />
            Dados da Solicitação
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Cliente</label>
              <input 
                type="text" 
                value={cliente}
                onChange={e => setCliente(e.target.value)}
                placeholder="Selecione ou digite..."
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Obra</label>
              <input 
                type="text" 
                value={obra}
                onChange={e => setObra(e.target.value)}
                placeholder="Identificação da obra..."
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Quantidade Solicitada</label>
              <input 
                type="number" 
                value={quantidadeSolicitada} 
                onChange={e => setQuantidadeSolicitada(Number(e.target.value))}
                className="w-full p-2 border rounded text-lg font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Data da 1ª Entrega</label>
              <input 
                type="date" 
                value={dataPrimeiraEntrega}
                onChange={e => setDataPrimeiraEntrega(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <button 
            onClick={handleCalculate}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-colors flex justify-center items-center gap-2 shadow-md"
          >
            <RefreshCw size={20} />
            CALCULAR ENTREGAS
          </button>
        </div>
      </div>

      {/* BLOCO 3 - RESULTADO */}
      {entregas.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 gap-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <CheckCircle2 className="text-green-500" />
              Plano de Entregas
            </h2>
            
            <div className="flex gap-4 text-sm font-medium">
              <div className="bg-slate-100 px-4 py-2 rounded-lg flex flex-col items-center">
                <span className="text-slate-500 text-xs uppercase">Solicitado</span>
                <span className="text-lg">{quantidadeSolicitada}</span>
              </div>
              <div className="bg-slate-100 px-4 py-2 rounded-lg flex flex-col items-center">
                <span className="text-slate-500 text-xs uppercase">Capacidade</span>
                <span className="text-lg">{capacidade}</span>
              </div>
              <div className={`px-4 py-2 rounded-lg flex flex-col items-center ${saldoAtual === 0 ? 'bg-green-100 text-green-800' : saldoAtual < 0 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                <span className="text-xs uppercase opacity-80">Saldo Restante</span>
                <span className="text-lg font-bold">{saldoAtual}</span>
              </div>
            </div>
          </div>

          {isOverCapacity && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex gap-3 items-start">
              <AlertTriangle className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Atenção: Capacidade excedida!</p>
                <p className="text-sm">Você configurou uma entrega com quantidade superior à capacidade calculada do caminhão ({capacidade} estacas).</p>
              </div>
            </div>
          )}
          
          {saldoAtual < 0 && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex gap-3 items-start">
              <AlertTriangle className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Atenção: Quantidade excedente!</p>
                <p className="text-sm">O total distribuído nas entregas ({totalEntregue}) é maior que a quantidade solicitada ({quantidadeSolicitada}).</p>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-sm border-y border-slate-200">
                  <th className="p-3 font-semibold w-16">#</th>
                  <th className="p-3 font-semibold">Data Prevista</th>
                  <th className="p-3 font-semibold">Quantidade</th>
                  <th className="p-3 font-semibold">Capacidade</th>
                  <th className="p-3 font-semibold">Saldo Pós-Entrega</th>
                  <th className="p-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entregas.map((entrega, i) => {
                  const isLast = i === entregas.length - 1;
                  return (
                    <tr key={i} className={`hover:bg-slate-50 ${isLast ? 'bg-blue-50/30' : ''}`}>
                      <td className="p-3 font-medium text-slate-500">{entrega.entrega_numero}</td>
                      <td className="p-3">
                        <input 
                          type="date"
                          value={entrega.data}
                          onChange={e => updateEntrega(i, 'data', e.target.value)}
                          className="border rounded px-2 py-1 text-sm focus:ring-1 outline-none w-full max-w-[150px]"
                        />
                      </td>
                      <td className="p-3">
                        <input 
                          type="number"
                          value={entrega.quantidade}
                          onChange={e => updateEntrega(i, 'quantidade', Number(e.target.value))}
                          className={`border rounded px-2 py-1 text-sm font-semibold focus:ring-1 outline-none w-20 ${entrega.quantidade > capacidade ? 'border-red-500 text-red-600 bg-red-50' : ''}`}
                        />
                      </td>
                      <td className="p-3 text-slate-500">{entrega.capacidade}</td>
                      <td className="p-3 font-mono">{entrega.saldo}</td>
                      <td className="p-3">
                        <select 
                          value={entrega.status}
                          onChange={e => updateEntrega(i, 'status', e.target.value)}
                          className="border rounded px-2 py-1 text-sm focus:ring-1 outline-none bg-white w-full max-w-[150px]"
                        >
                          <option>Programada</option>
                          <option>Carregada</option>
                          <option>Em trânsito</option>
                          <option>Entregue</option>
                        </select>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-end pt-4">
            <button 
              disabled={isOverCapacity || saldoAtual < 0 || saldoAtual > 0}
              className="bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              <Save size={20} />
              SALVAR PEDIDO
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
