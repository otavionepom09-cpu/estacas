import { calculateTruckCapacity, calculateDeliveries } from './calculations';

describe('Cálculos de Estacas', () => {
  describe('calculateTruckCapacity', () => {
    it('deve calcular a capacidade corretamente conforme o exemplo', () => {
      const capacidade = calculateTruckCapacity(245, 240, 30);
      expect(capacidade).toBe(64);
    });

    it('não deve permitir resultados fracionados, deve arredondar para baixo (floor)', () => {
      // 245 / 30 = 8.16 (floor = 8)
      // 240 / 30 = 8
      // 8 * 8 = 64
      const capacidade = calculateTruckCapacity(245, 240, 30);
      expect(capacidade).toBe(64);
      expect(Number.isInteger(capacidade)).toBe(true);
    });

    it('deve retornar 0 para valores inválidos', () => {
      expect(calculateTruckCapacity(0, 240, 30)).toBe(0);
      expect(calculateTruckCapacity(245, 0, 30)).toBe(0);
      expect(calculateTruckCapacity(245, 240, 0)).toBe(0);
      expect(calculateTruckCapacity(-245, 240, 30)).toBe(0);
    });
  });

  describe('calculateDeliveries', () => {
    it('Teste 1: Capacidade 64, Solicitado 32 -> 1 entrega', () => {
      const entregas = calculateDeliveries(32, 64);
      expect(entregas).toHaveLength(1);
      expect(entregas[0]).toEqual({ entrega_numero: 1, quantidade: 32, capacidade: 64, saldo: 0 });
    });

    it('Teste 2: Capacidade 64, Solicitado 64 -> 1 entrega', () => {
      const entregas = calculateDeliveries(64, 64);
      expect(entregas).toHaveLength(1);
      expect(entregas[0]).toEqual({ entrega_numero: 1, quantidade: 64, capacidade: 64, saldo: 0 });
    });

    it('Teste 3: Capacidade 64, Solicitado 65 -> 2 entregas (64, 1)', () => {
      const entregas = calculateDeliveries(65, 64);
      expect(entregas).toHaveLength(2);
      expect(entregas[0]).toEqual({ entrega_numero: 1, quantidade: 64, capacidade: 64, saldo: 1 });
      expect(entregas[1]).toEqual({ entrega_numero: 2, quantidade: 1, capacidade: 64, saldo: 0 });
    });

    it('Teste 4: Capacidade 64, Solicitado 105 -> 2 entregas (64, 41)', () => {
      const entregas = calculateDeliveries(105, 64);
      expect(entregas).toHaveLength(2);
      expect(entregas[0]).toEqual({ entrega_numero: 1, quantidade: 64, capacidade: 64, saldo: 41 });
      expect(entregas[1]).toEqual({ entrega_numero: 2, quantidade: 41, capacidade: 64, saldo: 0 });
    });

    it('Teste 5: Capacidade 64, Solicitado 150 -> 3 entregas (64, 64, 22)', () => {
      const entregas = calculateDeliveries(150, 64);
      expect(entregas).toHaveLength(3);
      expect(entregas[0]).toEqual({ entrega_numero: 1, quantidade: 64, capacidade: 64, saldo: 86 });
      expect(entregas[1]).toEqual({ entrega_numero: 2, quantidade: 64, capacidade: 64, saldo: 22 });
      expect(entregas[2]).toEqual({ entrega_numero: 3, quantidade: 22, capacidade: 64, saldo: 0 });
    });

    it('Teste 6: Capacidade 64, Solicitado 200 -> 4 entregas (64, 64, 64, 8)', () => {
      const entregas = calculateDeliveries(200, 64);
      expect(entregas).toHaveLength(4);
      expect(entregas[0]).toEqual({ entrega_numero: 1, quantidade: 64, capacidade: 64, saldo: 136 });
      expect(entregas[1]).toEqual({ entrega_numero: 2, quantidade: 64, capacidade: 64, saldo: 72 });
      expect(entregas[2]).toEqual({ entrega_numero: 3, quantidade: 64, capacidade: 64, saldo: 8 });
      expect(entregas[3]).toEqual({ entrega_numero: 4, quantidade: 8, capacidade: 64, saldo: 0 });
    });
  });
});
