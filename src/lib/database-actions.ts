"use server";

import { createClient } from '@supabase/supabase-js';
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
  json_planejamento?: any;
}) {
  try {
    const rawUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const rawKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_ANO || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    const url = rawUrl?.replace(/['"]/g, '').trim();
    const key = rawKey?.replace(/['"]/g, '').trim();
    
    if (!url || !key) {
      throw new Error(`Variáveis de ambiente ausentes no servidor. URL: ${!!url}, KEY: ${!!key}`);
    }

    const supabase = createClient(url, key, {
      global: { fetch: (reqUrl, init) => fetch(reqUrl, { ...init, cache: 'no-store' }) }
    });

    // 1. Get or create Cliente
    const { data: existingClientes, error: errFind1 } = await supabase
      .from('clientes')
      .select('id')
      .ilike('nome', data.clienteNome)
      .limit(1);

    let clienteId: string;

    if (!errFind1 && existingClientes && existingClientes.length > 0) {
      clienteId = existingClientes[0].id as string;
    } else {
      const { data: newCliente, error: errCliente } = await supabase
        .from('clientes')
        .insert({ nome: data.clienteNome })
        .select('id')
        .single();
      if (errCliente || !newCliente) throw new Error(`Erro ao criar cliente: ${errCliente?.message}`);
      clienteId = (newCliente as { id: string }).id;
    }

    // 2. Get or create Obra
    const { data: existingObras, error: errFind2 } = await supabase
      .from('obras')
      .select('id')
      .eq('cliente_id', clienteId)
      .ilike('nome', data.obraNome)
      .limit(1);

    let obraId: string;

    if (!errFind2 && existingObras && existingObras.length > 0) {
      obraId = existingObras[0].id as string;
    } else {
      const { data: newObra, error: errObra } = await supabase
        .from('obras')
        .insert({ cliente_id: clienteId, nome: data.obraNome })
        .select('id')
        .single();
      if (errObra || !newObra) throw new Error(`Erro ao criar obra: ${errObra?.message}`);
      obraId = (newObra as { id: string }).id;
    }

    // 3. Get or create Tipo Estaca
    const { data: existingTipos, error: errFind3 } = await supabase
      .from('tipos_estaca')
      .select('id')
      .eq('diametro_cm', data.diametro)
      .limit(1);

    let tipoEstacaId: string;

    if (!errFind3 && existingTipos && existingTipos.length > 0) {
      tipoEstacaId = existingTipos[0].id as string;
    } else {
      const { data: newTipo, error: errTipo } = await supabase
        .from('tipos_estaca')
        .insert({ nome: `Estaca Ø${data.diametro}`, diametro_cm: data.diametro })
        .select('id')
        .single();
      if (errTipo || !newTipo) throw new Error(`Erro ao criar tipo de estaca: ${errTipo?.message}`);
      tipoEstacaId = (newTipo as { id: string }).id;
    }

    // 4. Create Pedido (sem json_planejamento para evitar problema de cache do schema)
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

    if (errPedido || !newPedido) throw new Error(`Erro ao criar pedido: ${errPedido?.message}`);
    const pedidoId = (newPedido as { id: string }).id;

    // 4b. Salva json_planejamento via update separado para evitar problema de cache do PostgREST
    if (data.json_planejamento) {
      await supabase
        .from('pedidos')
        .update({ json_planejamento: data.json_planejamento })
        .eq('id', pedidoId)
        .then(({ error: errJson }) => {
          if (errJson) console.warn('json_planejamento não salvo:', errJson.message);
        });
    }

    // 5. Create Entregas
    const entregasToInsert = data.entregas.map((entrega) => ({
      pedido_id: pedidoId,
      numero_entrega: entrega.entrega_numero,
      quantidade_estacas: entrega.quantidade,
      data_prevista: entrega.data || null,
      status: entrega.status,
    }));

    const { error: errEntregas } = await supabase
      .from('entregas')
      .insert(entregasToInsert);

    if (errEntregas) throw new Error(`Erro ao criar entregas: ${errEntregas.message}`);

    return { success: true, pedidoId };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error("Server Action Error:", msg);
    return { success: false, error: msg };
  }
}

export async function deleteOrder(pedidoId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const rawUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const rawKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_ANO || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const url = rawUrl?.replace(/['"]/g, '').trim();
    const key = rawKey?.replace(/['"]/g, '').trim();
    if (!url || !key) throw new Error('Supabase não configurado.');

    const supabase = createClient(url, key);

    // Entregas are cascade deleted via foreign key
    const { error } = await supabase
      .from('pedidos')
      .delete()
      .eq('id', pedidoId);

    if (error) throw new Error(error.message);
    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro desconhecido';
    return { success: false, error: msg };
  }
}

export async function getClientesEObras() {
  try {
    const rawUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const rawKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_ANO || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const url = rawUrl?.replace(/['"]/g, '').trim();
    const key = rawKey?.replace(/['"]/g, '').trim();
    if (!url || !key) return { clientes: [], obras: [] };

    const supabase = createClient(url, key);

    const { data: cl } = await supabase.from('clientes').select('nome');
    const { data: ob } = await supabase.from('obras').select('nome');

    return {
      clientes: Array.from(new Set(cl?.map(c => c.nome) || [])),
      obras: Array.from(new Set(ob?.map(o => o.nome) || []))
    };
  } catch {
    return { clientes: [], obras: [] };
  }
}

export async function deleteClient(clienteId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const rawUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const rawKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_ANO || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const url = rawUrl?.replace(/['"]/g, '').trim();
    const key = rawKey?.replace(/['"]/g, '').trim();
    if (!url || !key) throw new Error('Supabase não configurado.');
    const supabase = createClient(url, key, {
      global: { fetch: (reqUrl, init) => fetch(reqUrl, { ...init, cache: 'no-store' }) }
    });
    // Cascata: obras → pedidos → entregas serão apagados via FK CASCADE
    const { error } = await supabase.from('clientes').delete().eq('id', clienteId);
    if (error) throw new Error(error.message);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function checkDatabaseSchema() {
  try {
    const rawUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const rawKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_ANO || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const url = rawUrl?.replace(/['"]/g, '').trim();
    const key = rawKey?.replace(/['"]/g, '').trim();
    if (!url || !key) return { success: false, message: 'Faltam variáveis de ambiente (URL/Key)' };

    const supabase = createClient(url, key);

    // Tenta selecionar todas as colunas
    const { error: errTodos } = await supabase.from('pedidos').select('*').limit(1);
    
    // Tenta selecionar especificamente a coluna nova
    const { error: errJson } = await supabase.from('pedidos').select('json_planejamento').limit(1);

    const ref = url.match(/https:\/\/(.*?)\.supabase\.co/)?.[1] || 'Desconhecido';

    let diagnostico = `🔍 PROJETO CONECTADO NA VERCEL: ${ref}\n\n`;
    
    if (errTodos && errTodos.message.includes('relation "pedidos" does not exist')) {
      diagnostico += `❌ A tabela 'pedidos' NÃO EXISTE neste projeto!`;
    } else {
      diagnostico += `✅ A tabela 'pedidos' existe.\n`;
      
      if (errJson && errJson.message.includes('Could not find')) {
        diagnostico += `❌ A coluna 'json_planejamento' NÃO EXISTE (ou o cache não atualizou) neste projeto.`;
      } else {
        diagnostico += `✅ A coluna 'json_planejamento' EXISTE e está pronta para uso!`;
      }
    }

    return { success: true, message: diagnostico, ref };
  } catch (e: any) {
    return { success: false, message: `Erro no diagnóstico: ${e.message}` };
  }
}
