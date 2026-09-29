import { supabase } from './supabase';
import { DeliveryPlan } from './calculations';

export async function saveOrderToDatabase(data: {
  clienteNome: string;
  obraNome: string;
  diametro: number;
  largura: number;
  comprimento: number;
  quantidadeSolicitada: number;
  capacidade: number;
  entregas: (DeliveryPlan & { data: string; status: string })[];
}) {
  try {
    // 1. Get or create Cliente
    let clienteId;
    const { data: existingCliente } = await supabase
      .from('clientes')
      .select('id')
      .ilike('nome', data.clienteNome)
      .single();

    if (existingCliente) {
      clienteId = existingCliente.id;
    } else {
      const { data: newCliente, error: errCliente } = await supabase
        .from('clientes')
        .insert({ nome: data.clienteNome })
        .select('id')
        .single();
      if (errCliente) throw new Error(`Erro ao criar cliente: ${errCliente.message}`);
      clienteId = newCliente.id;
    }

    // 2. Get or create Obra
    let obraId;
    const { data: existingObra } = await supabase
      .from('obras')
      .select('id')
      .eq('cliente_id', clienteId)
      .ilike('nome', data.obraNome)
      .single();

    if (existingObra) {
      obraId = existingObra.id;
    } else {
      const { data: newObra, error: errObra } = await supabase
        .from('obras')
        .insert({ cliente_id: clienteId, nome: data.obraNome })
        .select('id')
        .single();
      if (errObra) throw new Error(`Erro ao criar obra: ${errObra.message}`);
      obraId = newObra.id;
    }

    // 3. Get or create Tipo Estaca
    let tipoEstacaId;
    const { data: existingTipo } = await supabase
      .from('tipos_estaca')
      .select('id')
      .eq('diametro_cm', data.diametro)
      .single();

    if (existingTipo) {
      tipoEstacaId = existingTipo.id;
    } else {
      const { data: newTipo, error: errTipo } = await supabase
        .from('tipos_estaca')
        .insert({ nome: `Estaca Ø${data.diametro}`, diametro_cm: data.diametro })
        .select('id')
        .single();
      if (errTipo) throw new Error(`Erro ao criar tipo de estaca: ${errTipo.message}`);
      tipoEstacaId = newTipo.id;
    }

    // 4. Create Pedido
    const { data: newPedido, error: errPedido } = await supabase
      .from('pedidos')
      .insert({
        cliente_id: clienteId,
        obra_id: obraId,
        tipo_estaca_id: tipoEstacaId,
        quantidade_solicitada: data.quantidadeSolicitada,
        capacidade_por_caminhao: data.capacidade,
        quantidade_entregas: data.entregas.length,
        status: 'Planejado',
        diametro_utilizado: data.diametro,
        largura_utilizada: data.largura,
        comprimento_utilizado: data.comprimento,
      })
      .select('id')
      .single();

    if (errPedido) throw new Error(`Erro ao criar pedido: ${errPedido.message}`);
    const pedidoId = newPedido.id;

    // 5. Create Entregas
    const entregasToInsert = data.entregas.map((entrega) => ({
      pedido_id: pedidoId,
      numero_entrega: entrega.entrega_numero,
      quantidade_estacas: entrega.quantidade,
      data_prevista: entrega.data,
      status: entrega.status,
    }));

    const { error: errEntregas } = await supabase
      .from('entregas')
      .insert(entregasToInsert);

    if (errEntregas) throw new Error(`Erro ao criar entregas: ${errEntregas.message}`);

    return { success: true, pedidoId };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message };
  }
}
