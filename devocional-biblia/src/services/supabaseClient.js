// Cliente Oficial Supabase para o Projeto Bíblia Devocional
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://chbfnwrhnklwbylzjjrc.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_-sWWso02IkCSGZNOjypDIw_FivIt4h-';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'devocional_supabase_auth_token'
  }
});

export const isSupabaseConfigured = () => {
  return Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);
};
