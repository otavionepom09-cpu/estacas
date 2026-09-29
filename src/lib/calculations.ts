// ─── Tipos originais (mantidos para compatibilidade) ────────────────────────

export function calculateTruckCapacity(
  largura_util_cm: number,
  comprimento_util_cm: number,
  diametro_cm: number
): number {
  if (largura_util_cm <= 0 || comprimento_util_cm <= 0 || diametro_cm <= 0) return 0;
  return Math.floor(largura_util_cm / diametro_cm) * Math.floor(comprimento_util_cm / diametro_cm);
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
  quantidade: number;
}

export interface MixedDeliveryItem {
  diametro: number;
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
 *
 * Lógica: percorre os tipos de estaca na ordem fornecida.
 * Dentro de cada entrega (caminhão), preenche com o tipo atual
 * até encher ou esgotar. O espaço restante é ocupado pelo próximo tipo.
 * Uma nova entrega só começa quando o caminhão está cheio ou todos
 * os stakes atuais foram entregues e não há mais espaço para o próximo.
 */
export function calculateMixedDeliveries(
  items: StakeItem[],
  largura: number,
  comprimento: number,
  dataPrimeira: string
): MixedDelivery[] {
  if (!items.length) return [];

  // Calcula capacidade por tipo
  const capMap: Record<number, number> = {};
  items.forEach(item => {
    if (!capMap[item.diametro]) {
      capMap[item.diametro] = calculateTruckCapacity(largura, comprimento, item.diametro);
    }
  });

  // Cópia mutável dos quantitativos restantes
  const remaining = items
    .filter(i => i.diametro > 0 && i.quantidade > 0)
    .map(i => ({ diametro: i.diametro, restante: i.quantidade }));

  const deliveries: MixedDelivery[] = [];

  const totalInicial = remaining.reduce((s, i) => s + i.restante, 0);
  let totalEntregue = 0;

  while (remaining.some(i => i.restante > 0)) {
    // Inicia um novo caminhão — representado como fração usada (0..1)
    let fracaoUsada = 0;
    const entregaItems: MixedDeliveryItem[] = [];

    for (const r of remaining) {
      if (r.restante <= 0) continue;
      const cap = capMap[r.diametro] ?? 0;
      if (cap <= 0) continue;

      const fracaoPorEstaca = 1 / cap;
      const espacoDisponivel = 1 - fracaoUsada;
      const quantasEntram = Math.floor(espacoDisponivel / fracaoPorEstaca);
      if (quantasEntram <= 0) continue;

      const pegar = Math.min(quantasEntram, r.restante);
      r.restante -= pegar;
      fracaoUsada += pegar * fracaoPorEstaca;
      totalEntregue += pegar;

      entregaItems.push({ diametro: r.diametro, quantidade: pegar, capacidade_caminhao: cap });

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
