import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const rawUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const rawKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_ANO || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    const url = rawUrl?.replace(/['"]/g, '').trim();
    const key = rawKey?.replace(/['"]/g, '').trim();
    if (!url || !key) {
      throw new Error('Supabase URL e Anon Key não configurados. Verifique as variáveis de ambiente.');
    }
    _supabase = createClient(url, key);
  }
  return _supabase;
}
