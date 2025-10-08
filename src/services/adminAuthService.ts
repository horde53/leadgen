import { supabase } from '@/lib/supabase';

// ==========================================
// SERVIÇO DE AUTENTICAÇÃO REAL PARA ADMIN
// ==========================================

export interface AdminLogin {
  email: string;
  password: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  auth_user_id: string;
  is_active: boolean;
  created_at: string;
}

export interface AdminLoginResult {
  success: boolean;
  user?: AdminUser;
  error?: string;
}

// Autenticar admin com email + senha usando Supabase Auth
export async function authenticateAdmin({ email, password }: AdminLogin): Promise<AdminLoginResult> {
  try {
    console.log('🔐 Tentando autenticar admin:', email);
    
    // Fazer login via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error('❌ Erro na autenticação:', authError);
      return { 
        success: false, 
        error: authError.message === 'Invalid login credentials' ? 'Email ou senha incorretos' : authError.message
      };
    }

    if (!authData.user) {
      console.error('❌ Usuário não retornado');
      return { 
        success: false, 
        error: 'Erro interno de autenticação' 
      };
    }

    // Buscar dados do admin na tabela admins
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('auth_user_id', authData.user.id)
      .single();

    if (adminError || !adminData) {
      console.error('❌ Erro ao buscar dados do admin:', adminError);
      return { 
        success: false, 
        error: 'Admin não encontrado no sistema' 
      };
    }

    if (!adminData.is_active) {
      console.error('❌ Admin inativo');
      return { 
        success: false, 
        error: 'Conta de admin desativada' 
      };
    }

    // Sucesso!
    console.log('✅ Admin autenticado com sucesso:', adminData.name);
    
    const adminUser: AdminUser = {
      id: adminData.id,
      email: adminData.email,
      name: adminData.name,
      auth_user_id: adminData.auth_user_id,
      is_active: adminData.is_active,
      created_at: adminData.created_at
    };

    return {
      success: true,
      user: adminUser
    };

  } catch (error: any) {
    console.error('💥 Erro geral na autenticação do admin:', error);
    return { 
      success: false, 
      error: 'Erro interno do sistema' 
    };
  }
}

// Verificar se admin está logado
export function isAdminLoggedIn(): boolean {
  try {
    const isLoggedIn = sessionStorage.getItem('admin_logged_in');
    return isLoggedIn === 'true';
  } catch (error) {
    return false;
  }
}

// Recuperar dados do admin logado
export function getAdminSession(): AdminUser | null {
  try {
    const userData = sessionStorage.getItem('admin_user');
    const isLoggedIn = sessionStorage.getItem('admin_logged_in');
    
    if (!userData || !isLoggedIn || isLoggedIn !== 'true') {
      return null;
    }

    const user = JSON.parse(userData);
    return user;
  } catch (error) {
    console.error('❌ Erro ao recuperar sessão do admin:', error);
    return null;
  }
}

// Salvar sessão do admin
export function saveAdminSession(user: AdminUser): void {
  try {
    sessionStorage.setItem('admin_user', JSON.stringify(user));
    sessionStorage.setItem('admin_logged_in', 'true');
    console.log('💾 Sessão do admin salva');
  } catch (error) {
    console.error('❌ Erro ao salvar sessão do admin:', error);
  }
}

// Fazer logout do admin
export function logoutAdmin(): void {
  try {
    sessionStorage.removeItem('admin_user');
    sessionStorage.removeItem('admin_logged_in');
    console.log('🚪 Admin fez logout');
  } catch (error) {
    console.error('❌ Erro no logout do admin:', error);
  }
}

// Fazer logout completo (incluindo Supabase Auth)
export async function logoutAdminComplete(): Promise<void> {
  try {
    // Fazer logout do Supabase Auth
    await supabase.auth.signOut();
    
    // Limpar sessão local
    logoutAdmin();
    
    console.log('🚪 Logout completo do admin realizado');
  } catch (error) {
    console.error('❌ Erro no logout completo:', error);
    // Mesmo com erro, limpar sessão local
    logoutAdmin();
  }
}