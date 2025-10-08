import { createClient } from '@supabase/supabase-js';
import { appLogger } from '@/utils/logger';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ==========================================
// QUERIES PARA USERS (AFILIADOS)
// ==========================================

export async function getAllUsers() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return { data: [], error };
  }
}

export async function getUsersMetrics() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, total_leads, total_closed_leads');
    
    if (error) throw error;
    
    const metrics = data.reduce((acc, user) => {
      acc.totalAffiliates += 1;
      acc.totalLeads += user.total_leads || 0;
      acc.totalClosed += user.total_closed_leads || 0;
      return acc;
    }, {
      totalAffiliates: 0,
      totalLeads: 0,
      totalClosed: 0
    });
    
    return { data: metrics, error: null };
  } catch (error) {
    console.error('Erro ao buscar métricas de usuários:', error);
    return { data: { totalAffiliates: 0, totalLeads: 0, totalClosed: 0 }, error };
  }
}

export async function addUser(userData: {
  email: string;
  password_hash: string;
  name: string;
  affiliate_code?: string; // Tornar opcional
  commission_rate?: number;
  phone?: string;
}) {
  try {
    // Não enviar affiliate_code vazio - deixar o trigger gerar
    const dataToInsert = {
      email: userData.email,
      password_hash: userData.password_hash,
      name: userData.name,
      commission_rate: userData.commission_rate || 40.00,
      phone: userData.phone || null
    };

    appLogger.log('🚀 Criando usuário com dados:', dataToInsert);

    const { data, error } = await supabase
      .from('users')
      .insert([dataToInsert])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erro detalhado:', error);
      throw error;
    }
    
    appLogger.log('✅ Usuário criado com sucesso:', data);
    return { data, error: null };
  } catch (error) {
    console.error('💥 Erro ao criar usuário:', error);
    return { data: null, error };
  }
}

// Atualizar usuário (afiliado) - FUNÇÃO CORRETA
export async function updateUser(userId: string, userData: any) {
  appLogger.log('🔄 UPDATE - ID:', userId);
  appLogger.log('🔄 UPDATE - Dados:', userData);

  const { data, error } = await supabase
    .from('users')
    .update(userData)
    .eq('id', userId)
    .select('id, name, email, phone');
  
  appLogger.log('📊 Resultado UPDATE:', { data, error });
  
  if (error) {
    console.error('❌ Erro no UPDATE:', error);
    return { data: null, error: error.message };
  }
  
  if (!data || data.length === 0) {
    console.error('❌ UPDATE não afetou nenhuma linha!');
    return { data: null, error: 'UPDATE não afetou nenhuma linha' };
  }
  
  appLogger.log('✅ UPDATE REALMENTE funcionou!', data[0]);
  return { data: data[0], error: null };
}

// Deletar usuário (afiliado)
export async function deleteUser(userId: string) {
  try {
    appLogger.log('🗑️ Deletando usuário:', userId);

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);
    
    if (error) {
      console.error('❌ Erro ao deletar usuário:', error);
      throw error;
    }
    
    appLogger.log('✅ Usuário deletado com sucesso');
    return { data: true, error: null };
  } catch (error) {
    console.error('💥 Erro ao deletar usuário:', error);
    return { data: null, error };
  }
}

// ==========================================
// QUERIES PARA LEADS
// ==========================================

// Buscar leads de um afiliado específico
export async function getAffiliateLeads(affiliateId: string) {
  try {
    appLogger.log('🔍 Buscando leads do afiliado:', affiliateId);
    
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('affiliate_id', affiliateId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Erro ao buscar leads do afiliado:', error);
      return { data: null, error: error.message };
    }
    
    appLogger.log('✅ Leads do afiliado encontrados:', data?.length || 0);
    return { data: data || [], error: null };
  } catch (error) {
    console.error('💥 Erro ao buscar leads do afiliado:', error);
    return { data: null, error };
  }
}

export async function getAllLeads() {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select(`
        *,
        users!leads_affiliate_id_fkey (
          id,
          name,
          affiliate_code
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao buscar leads:', error);
    return { data: [], error };
  }
}

export async function getLeadsMetrics() {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('status, commission_amount');
    
    if (error) throw error;
    
    const metrics = data.reduce((acc, lead) => {
      acc.totalLeads += 1;
      if (lead.status === 'fechado') {
        acc.totalClosed += 1;
        acc.totalCommissions += lead.commission_amount || 0;
      }
      return acc;
    }, {
      totalLeads: 0,
      totalClosed: 0,
      totalCommissions: 0
    });
    
    return { data: metrics, error: null };
  } catch (error) {
    console.error('Erro ao buscar métricas de leads:', error);
    return { data: { totalLeads: 0, totalClosed: 0, totalCommissions: 0 }, error };
  }
}


export async function updateLeadStatus(leadId: string, status: string) {
  try {
    const { data, error } = await supabase
      .from('leads')
      .update({ status })
      .eq('id', leadId)
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao atualizar status do lead:', error);
    return { data: null, error };
  }
}

// ==========================================
// QUERIES COMINADAS PARA DASHBOARD
// ==========================================

export async function getAdminDashboardData() {
  try {
    const [usersData, leadsData] = await Promise.all([
      supabase.from('users').select('id, total_leads, total_closed_leads'),
      supabase.from('leads').select('status, commission_amount')
    ]);

    if (usersData.error) throw usersData.error;
    if (leadsData.error) throw leadsData.error;

    const affiliatesMetrics = usersData.data.reduce((acc, user) => {
      acc.totalAffiliates += 1;
      acc.totalUserLeads += user.total_leads || 0;
      acc.totalClosedFromUsers += user.total_closed_leads || 0;
      return acc;
    }, { totalAffiliates: 0, totalUserLeads: 0, totalClosedFromUsers: 0 });

    const leadsMetrics = leadsData.data.reduce((acc, lead) => {
      acc.totalLeads += 1;
      if (lead.status === 'fechado') {
        acc.totalClosed += 1;
        acc.totalCommissions += lead.commission_amount || 0;
      }
      return acc;
    }, { totalLeads: 0, totalClosed: 0, totalCommissions: 0 });

    return {
      data: {
        totalAffiliates: affiliatesMetrics.totalAffiliates,
        totalLeads: leadsMetrics.totalLeads,
        totalClosed: leadsMetrics.totalClosed,
        totalCommissions: leadsMetrics.totalCommissions
      },
      error: null
    };
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    return { 
      data: { totalAffiliates: 0, totalLeads: 0, totalClosed: 0, totalCommissions: 0 }, 
      error 
    };
  }
}

export async function getAffiliateDashboardData(affiliateId: string) {
  try {
    const [affiliateData, leadsData] = await Promise.all([
      supabase.from('users').select('*').eq('id', affiliateId).single(),
      supabase.from('leads').select('*').eq('affiliate_id', affiliateId)
    ]);

    if (affiliateData.error) throw affiliateData.error;
    if (leadsData.error) throw leadsData.error;

    const metrics = leadsData.data.reduce((acc, lead) => {
      if (lead.status === 'novo') acc.newLeads += 1;
      if (lead.status === 'fechado') acc.closedLeads += 1;
      acc.projectedCommission += lead.commission_amount || 0;
      return acc;
    }, { newLeads: 0, closedLeads: 0, projectedCommission: 0 });

    return {
      data: {
        affiliate: affiliateData.data,
        leads: leadsData.data,
        metrics
      },
      error: null
    };
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard do afiliado:', error);
    return { data: null, error };
  }
}

// Criar novo lead
export async function createLead(leadData: {
  client_name: string;
  client_phone: string;
  energy_bill_value: number;
  monthly_economy: number;
  yearly_economy: number;
  commission_amount: number;
  commission_rate: number;
  affiliate_id: string;
  energy_bill_file: string;
}) {
  try {
    appLogger.log('🔄 CREATE LEAD - Dados:', leadData);

    const { data, error } = await supabase
      .from('leads')
      .insert([leadData])
      .select()
      .single();

    appLogger.log('📊 Resultado CREATE LEAD:', { data, error });

    if (error) {
      appLogger.error('❌ Erro no CREATE LEAD:', error);
      return { data: null, error: error.message };
    }

    appLogger.log('✅ CREATE LEAD REALMENTE funcionou!', data);
    return { data, error: null };
  } catch (error) {
    appLogger.error('❌ Erro inesperado no CREATE LEAD:', error);
    return { data: null, error: 'Erro inesperado ao criar lead' };
  }
}

// Buscar afiliado pelo código de referência
export async function getAffiliateByCode(affiliateCode: string) {
  try {
    appLogger.log('🔍 BUSCAR AFILIADO - Código:', affiliateCode);

    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, phone, commission_rate')
      .eq('affiliate_code', affiliateCode)
      .single();

    appLogger.log('📊 Resultado BUSCAR AFILIADO:', { data, error });

    if (error) {
      appLogger.error('❌ Erro no BUSCAR AFILIADO:', error);
      return { data: null, error: error.message };
    }

    appLogger.log('✅ AFILIADO ENCONTRADO!', data);
    return { data, error: null };
  } catch (error) {
    appLogger.error('❌ Erro inesperado no BUSCAR AFILIADO:', error);
    return { data: null, error: 'Erro inesperado ao buscar afiliado' };
  }
}

// ==========================================
// FUNÇÕES DE RANKING
// ==========================================

// Buscar top 5 afiliados por número de vendas (leads fechados)
export async function getTopAffiliates() {
  try {
    appLogger.log('🔍 Buscando top afiliados...');
    
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        phone,
        affiliate_code,
        commission_rate,
        total_leads,
        total_closed_leads,
        total_commission
      `)
      .order('total_closed_leads', { ascending: false })
      .limit(5);

    if (error) {
      appLogger.error('❌ Erro ao buscar top afiliados:', error);
      return { data: null, error: error.message };
    }

    appLogger.log('✅ Top afiliados carregados:', data?.length || 0);
    return { data, error: null };
  } catch (error: any) {
    appLogger.error('💥 Erro inesperado ao buscar top afiliados:', error);
    return { data: null, error: 'Erro inesperado ao buscar top afiliados' };
  }
}
