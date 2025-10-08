export type AppState = 'landing' | 'login' | 'affiliateLogin' | 'affiliateDashboard' | 'adminDashboard' | 'affiliateMenu' | 'comingSoon' | 'leadGenerator';

export interface Lead {
  id: string;
  billValue: number;
  monthlyEconomy: number;
  yearlyEconomy: number;
  status: 'Novo' | 'Contatar' | 'Em Negociação' | 'Fechado' | 'Perdido';
  affiliateId?: string;
  createdAt: Date;
  clientName?: string;
  clientPhone?: string; // Telefone/WhatsApp do cliente
  energyBillFile: string; // URL do arquivo da conta de energia (obrigatório)
}

export interface Affiliate {
  id: string;
  name: string;
  email: string;
  whatsapp?: string;
  createdAt: Date;
}

export interface Admin {
  id: string;
  email: string;
}

export interface AppData {
  leads: Lead[];
  affiliates: Affiliate[];
  currentUser?: {
    id: string;
    email: string;
    type: 'affiliate' | 'admin';
    name?: string;
  };
}