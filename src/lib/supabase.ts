import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL ou chave anônima não encontrada');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Função para testar a conexão
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1000);
    
    if (error) {
      console.error('Erro na conexão Supabase:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Conexão Supabase OK!');
    return { success: true, data };
  } catch (err) {
    console.error('❌ Erro ao testar Supabase:', err);
    return { success: false, error: 'Erro de conexão' };
  }
}

