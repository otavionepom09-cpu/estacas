import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/['"]/g, '').trim();
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.replace(/['"]/g, '').trim();
    if (!url || !key) {
      throw new Error('Supabase URL e Anon Key não configurados. Verifique as variáveis de ambiente.');
    }
    _supabase = createClient(url, key);
  }
  return _supabase;
}
