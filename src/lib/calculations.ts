export function calculateTruckCapacity(
  largura_util_cm: number,
  comprimento_util_cm: number,
  diametro_cm: number
): number {
  if (largura_util_cm <= 0 || comprimento_util_cm <= 0 || diametro_cm <= 0) {
    return 0;
  }

  const estacasPorLargura = Math.floor(largura_util_cm / diametro_cm);
  const estacasPorComprimento = Math.floor(comprimento_util_cm / diametro_cm);

  return estacasPorLargura * estacasPorComprimento;
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
  if (quantidade_solicitada <= 0 || capacidade_caminhao <= 0) {
    return [];
  }

  const entregas: DeliveryPlan[] = [];
  let saldoRestante = quantidade_solicitada;
  let numeroEntrega = 1;

  while (saldoRestante > 0) {
    const quantidadeEntrega = Math.min(capacidade_caminhao, saldoRestante);
    saldoRestante -= quantidadeEntrega;

    entregas.push({
      entrega_numero: numeroEntrega,
      quantidade: quantidadeEntrega,
      capacidade: capacidade_caminhao,
      saldo: saldoRestante,
    });

    numeroEntrega++;
  }

  return entregas;
}
