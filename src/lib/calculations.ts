// ─── Tipos originais (mantidos para compatibilidade) ────────────────────────

export function calculateTruckCapacity(
  largura_util_cm: number,
  altura_util_cm: number, // Antes chamado de comprimento_util_cm
  diametro_cm: number,
  comprimento_caminhao_m: number = 10,
  comprimento_estaca_m: number = 10
): number {
  if (largura_util_cm <= 0 || altura_util_cm <= 0 || diametro_cm <= 0 || comprimento_caminhao_m <= 0 || comprimento_estaca_m <= 0) return 0;
  
  const capacidadeSecao = Math.floor(largura_util_cm / diametro_cm) * Math.floor(altura_util_cm / diametro_cm);
  const fileiras = Math.floor(comprimento_caminhao_m / comprimento_estaca_m);
  
  return capacidadeSecao * fileiras;
}

export interface DeliveryPlan {
  entrega_numero: number;
  quantidade: number;
  capacidade: number;
  saldo: number;
}

export function calculateDeliveries(
  quantidade_solicitada: number,
  capacidade_caminhao: number
): DeliveryPlan[] {
  if (quantidade_solicitada <= 0 || capacidade_caminhao <= 0) return [];
  const entregas: DeliveryPlan[] = [];
  let saldoRestante = quantidade_solicitada;
  let numeroEntrega = 1;
  while (saldoRestante > 0) {
    const quantidadeEntrega = Math.min(capacidade_caminhao, saldoRestante);
    saldoRestante -= quantidadeEntrega;
    entregas.push({ entrega_numero: numeroEntrega, quantidade: quantidadeEntrega, capacidade: capacidade_caminhao, saldo: saldoRestante });
    numeroEntrega++;
  }
  return entregas;
}

// ─── Tipos para pedido com múltiplos tipos de estaca ────────────────────────

export interface StakeItem {
  id: string;
  diametro: number;
  comprimento_m: number;
  quantidade: number;
}

export interface MixedDeliveryItem {
  diametro: number;
  comprimento_m: number;
  quantidade: number;
  capacidade_caminhao: number; // quantas desta estaca cabem em um caminhão cheio
}

export interface MixedDelivery {
  entrega_numero: number;
  items: MixedDeliveryItem[];
  percentual_carregamento: number; // 0–100
  saldo_total_apos_entrega: number; // total de estacas restantes (todos os tipos)
  data: string;
  status: string;
}

/**
 * Calcula entregas mistas com múltiplos tipos de estaca.
 */
export function calculateMixedDeliveries(
  items: StakeItem[],
  largura: number,
  altura: number,
  comprimento_caminhao_m: number,
  dataPrimeira: string
): MixedDelivery[] {
  if (!items.length) return [];

  // Calcula capacidade por tipo (considerando diametro e comprimento da estaca)
  const capMap: Record<string, number> = {};
  items.forEach(item => {
    const key = `${item.diametro}-${item.comprimento_m}`;
    if (!capMap[key]) {
      capMap[key] = calculateTruckCapacity(largura, altura, item.diametro, comprimento_caminhao_m, item.comprimento_m);
    }
  });

  // Cópia mutável dos quantitativos restantes
  const remaining = items
    .filter(i => i.diametro > 0 && i.comprimento_m > 0 && i.quantidade > 0)
    .map(i => ({ diametro: i.diametro, comprimento_m: i.comprimento_m, restante: i.quantidade }));

  const deliveries: MixedDelivery[] = [];

  const totalInicial = remaining.reduce((s, i) => s + i.restante, 0);
  let totalEntregue = 0;

  while (remaining.some(i => i.restante > 0)) {
    // Inicia um novo caminhão — representado como fração usada (0..1)
    let fracaoUsada = 0;
    const entregaItems: MixedDeliveryItem[] = [];

    for (const r of remaining) {
      if (r.restante <= 0) continue;
      const key = `${r.diametro}-${r.comprimento_m}`;
      const cap = capMap[key] ?? 0;
      if (cap <= 0) continue;

      const fracaoPorEstaca = 1 / cap;
      const espacoDisponivel = 1 - fracaoUsada;
      const quantasEntram = Math.floor(espacoDisponivel / fracaoPorEstaca);
      if (quantasEntram <= 0) continue;

      const pegar = Math.min(quantasEntram, r.restante);
      r.restante -= pegar;
      fracaoUsada += pegar * fracaoPorEstaca;
      totalEntregue += pegar;

      entregaItems.push({ diametro: r.diametro, comprimento_m: r.comprimento_m, quantidade: pegar, capacidade_caminhao: cap });

      // Caminhão cheio (≥99.9% para evitar problemas de float)
      if (fracaoUsada >= 0.999) break;
    }

    if (entregaItems.length === 0) break; // segurança contra loop infinito

    const saldoTotal = totalInicial - totalEntregue;

    const dataEntrega = new Date(dataPrimeira + 'T12:00:00');
    dataEntrega.setDate(dataEntrega.getDate() + deliveries.length);
    const dataStr = dataEntrega.toISOString().split('T')[0];

    deliveries.push({
      entrega_numero: deliveries.length + 1,
      items: entregaItems,
      percentual_carregamento: Math.round(fracaoUsada * 100),
      saldo_total_apos_entrega: saldoTotal,
      data: dataStr,
      status: 'Programada',
    });
  }

  return deliveries;
}
