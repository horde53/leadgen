import { supabase } from '@/lib/supabase';

// ==========================================
// SERVIÇO DE AUTENTICAÇÃO PARA AFILIADOS
// ==========================================

export interface AffiliateLogin {
  email: string;
  password: string;
}

export interface AffiliateUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  affiliate_code: string;
  commission_rate: number;
  total_leads: number;
  total_closed_leads: number;
  total_commission: number;
}

export interface LoginResult {
  success: boolean;
  user?: AffiliateUser;
  error?: string;
}

// Autenticar afiliado com email + senha
export async function authenticateAffiliate({ email, password }: AffiliateLogin): Promise<LoginResult> {
  try {
    console.log('🔐 Tentando autenticar afiliado:', email);
    
    // Buscar usuário pelo email
    const { data: users, error: queryError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (queryError) {
      console.error('❌ Erro ao buscar usuário:', queryError);
      return { 
        success: false, 
        error: 'Email não encontrado' 
      };
    }

    if (!users) {
      console.error('❌ Usuário não encontrado');
      return { 
        success: false, 
        error: 'Email não encontrado' 
      };
    }

    // Verificar senha (simples comparação por enquanto)
    if (users.password_hash !== password) {
      console.error('❌ Senha incorreta');
      return { 
        success: false, 
        error: 'Senha incorreta' 
      };
    }

    // Sucesso!
    console.log('✅ Afiliado autenticado com sucesso:', users.name);
    
    const affiliateUser: AffiliateUser = {
      id: users.id,
      email: users.email,
      name: users.name,
      phone: users.phone,
      affiliate_code: users.affiliate_code,
      commission_rate: users.commission_rate,
      total_leads: users.total_leads || 0,
      total_closed_leads: users.total_closed_leads || 0,
      total_commission: users.total_commission || 0
    };

    return {
      success: true,
      user: affiliateUser
    };

  } catch (error: any) {
    console.error('💥 Erro geral na autenticação:', error);
    return { 
      success: false, 
      error: 'Erro interno do sistema' 
    };
  }
}

// Salvar sessão do afiliado
export function saveAffiliateSession(user: AffiliateUser): void {
  try {
    sessionStorage.setItem('affiliate_user', JSON.stringify(user));
    sessionStorage.setItem('affiliate_logged_in', 'true');
    console.log('💾 Sessão do afiliado salva');
  } catch (error) {
    console.error('❌ Erro ao salvar sessão:', error);
  }
}

// Recuperar sessão do afiliado
export function getAffiliateSession(): AffiliateUser | null {
  try {
    const userData = sessionStorage.getItem('affiliate_user');
    const isLoggedIn = sessionStorage.getItem('affiliate_logged_in');
    
    if (!userData || !isLoggedIn) {
      return null;
    }

    const user = JSON.parse(userData);
    console.log('🔄 Sessão do afiliado recuperada');
    return user;
  } catch (error) {
    console.error('❌ Erro ao recuperar sessão:', error);
    return null;
  }
}

// Fazer logout do afiliado
export function logoutAffiliate(): void {
  try {
    sessionStorage.removeItem('affiliate_user');
    sessionStorage.removeItem('affiliate_logged_in');
    console.log('🚪 Afiliado fez logout');
  } catch (error) {
    console.error('❌ Erro no logout:', error);
  }
}

// Verificar se afiliado está logado
export function isAffiliateLoggedIn(): boolean {
  try {
    const isLoggedIn = sessionStorage.getItem('affiliate_logged_in');
    return isLoggedIn === 'true';
  } catch (error) {
    return false;
  }
}

// Salvar estado atual do afiliado (dashboard, leadGenerator, etc.)
export function saveAffiliateCurrentState(state: string): void {
  try {
    sessionStorage.setItem('affiliate_current_state', state);
    console.log('💾 Estado atual do afiliado salvo:', state);
  } catch (error) {
    console.error('❌ Erro ao salvar estado do afiliado:', error);
  }
}

// Recuperar estado atual do afiliado
export function getAffiliateCurrentState(): string | null {
  try {
    const state = sessionStorage.getItem('affiliate_current_state');
    return state;
  } catch (error) {
    console.error('❌ Erro ao recuperar estado do afiliado:', error);
    return null;
  }
}

// Limpar estado atual do afiliado
export function clearAffiliateCurrentState(): void {
  try {
    sessionStorage.removeItem('affiliate_current_state');
    console.log('🧹 Estado atual do afiliado limpo');
  } catch (error) {
    console.error('❌ Erro ao limpar estado do afiliado:', error);
  }
}

