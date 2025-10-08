import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnergySimulator } from '@/components/EnergySimulator';
import { LoginPage } from '@/components/LoginPage';
import { AdminLoginPage } from '@/components/AdminLoginPage';
import { AffiliateLoginPage } from '@/components/AffiliateLoginPage';
import { AffiliateDashboard } from '@/components/AffiliateDashboard';
import { AdminDashboard } from '@/components/AdminDashboard';
import { AffiliateMenuModal } from '@/components/AffiliateMenuModal';
import { ComingSoonPage } from '@/components/ComingSoonPage';
import { AffiliateLeadGenerator } from '@/components/AffiliateLeadGenerator';
import { authenticateAffiliate, saveAffiliateSession, getAffiliateSession, isAffiliateLoggedIn, logoutAffiliate, saveAffiliateCurrentState, getAffiliateCurrentState, clearAffiliateCurrentState, type AffiliateUser } from '@/services/authService';
import { isAdminLoggedIn, getAdminSession, logoutAdminComplete, type AdminUser } from '@/services/adminAuthService';
import { Zap, Users, Calculator, TrendingUp, ArrowLeft } from 'lucide-react';
import energyIcon from '@/assets/energy-icon.svg';
import type { AppState, AppData, Lead, Affiliate } from '@/types';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('landing');
  const [affiliateUser, setAffiliateUser] = useState<AffiliateUser | null>(null);
  const [appData, setAppData] = useState<AppData>({
    leads: [
      {
        id: '1',
        billValue: 350,
        monthlyEconomy: 52.5,
        yearlyEconomy: 630,
        status: 'Fechado',
        affiliateId: '1',
        createdAt: new Date('2024-03-10'),
        clientName: 'Ana Paula Costa',
        clientPhone: '(11) 99999-1111',
        energyBillFile: 'https://example.com/bill1.pdf',
      },
      {
        id: '2',
        billValue: 180,
        monthlyEconomy: 27,
        yearlyEconomy: 324,
        status: 'Em Negociação',
        affiliateId: '1',
        createdAt: new Date('2024-03-15'),
        clientName: 'Roberto Lima',
        clientPhone: '(11) 99999-2222',
        energyBillFile: 'https://example.com/bill2.pdf',
      },
      {
        id: '3',
        billValue: 420,
        monthlyEconomy: 63,
        yearlyEconomy: 756,
        status: 'Contatar',
        affiliateId: '2',
        createdAt: new Date('2024-03-18'),
        clientPhone: '(11) 99999-3333',
        energyBillFile: 'https://example.com/bill3.pdf',
      },
      {
        id: '4',
        billValue: 290,
        monthlyEconomy: 43.5,
        yearlyEconomy: 522,
        status: 'Fechado',
        affiliateId: '2',
        createdAt: new Date('2024-03-20'),
        clientName: 'Fernanda Rodrigues',
        clientPhone: '(11) 99999-4444',
        energyBillFile: 'https://example.com/bill4.pdf',
      },
      {
        id: '5',
        billValue: 150,
        monthlyEconomy: 22.5,
        yearlyEconomy: 270,
        status: 'Novo',
        affiliateId: '3',
        createdAt: new Date('2024-03-22'),
        clientPhone: '(11) 99999-5555',
        energyBillFile: 'https://example.com/bill5.pdf',
      },
    ],
    affiliates: [
      {
        id: '1',
        name: 'João Silva',
        email: 'joao@exemplo.com',
        whatsapp: '(11) 99999-0001',
        createdAt: new Date('2024-01-15'),
      },
      {
        id: '2',
        name: 'Maria Santos',
        email: 'maria@exemplo.com',
        whatsapp: '(11) 99999-0002',
        createdAt: new Date('2024-02-10'),
      },
      {
        id: '3',
        name: 'Carlos Oliveira',
        email: 'carlos@exemplo.com',
        whatsapp: '(11) 99999-0003',
        createdAt: new Date('2024-03-05'),
      },
      {
        id: '4',
        name: 'Ana Beatriz',
        email: 'ana@exemplo.com',
        whatsapp: '(11) 99999-0004',
        createdAt: new Date('2024-03-12'),
      },
      {
        id: '5',
        name: 'Rafael Souza',
        email: 'rafael@exemplo.com',
        whatsapp: '(11) 99999-0005',
        createdAt: new Date('2024-03-18'),
      },
    ],
  });

  // Check for affiliate referral in URL and existing session
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refId = urlParams.get('ref');
    
    if (refId) {
      // Store referral ID for later use in leads
      sessionStorage.setItem('affiliateRef', refId);
    }

    // Verificar se há sessão de admin ativa
    if (isAdminLoggedIn()) {
      const adminUser = getAdminSession();
      if (adminUser) {
        setAppData(prev => ({
          ...prev,
          currentUser: {
            id: adminUser.id,
            email: adminUser.email,
            type: 'admin' as const,
            name: adminUser.name
          },
        }));
        setAppState('adminDashboard');
        return; // Não verificar sessão de afiliado se admin está logado
      }
    }

    // Verificar se há sessão de afiliado ativa
    if (isAffiliateLoggedIn()) {
      const savedUser = getAffiliateSession();
      if (savedUser) {
        setAffiliateUser(savedUser);
        
        // Se há ref na URL, mostrar landing page mesmo com afiliado logado
        if (refId) {
          setAppState('landing');
          return;
        }
        
        // Se não há ref, verificar se há estado salvo do afiliado
        const currentState = getAffiliateCurrentState();
        if (currentState && (currentState === 'affiliateDashboard' || currentState === 'leadGenerator')) {
          // Manter no dashboard atual
          setAppState(currentState as AppState);
          return;
        }
        
        // Se não há estado salvo, ir para o menu de seleção
        setAppState('affiliateMenu');
        return;
      }
    }

    // Se não há sessão ativa, mostrar landing page
    setAppState('landing');
  }, []);

  const handleSimulationComplete = (lead: Lead) => {
    const affiliateRef = sessionStorage.getItem('affiliateRef');
    const newLead = {
      ...lead,
      affiliateId: affiliateRef || undefined,
    };

    setAppData(prev => ({
      ...prev,
      leads: [...prev.leads, newLead],
    }));
  };

  const handleLogin = (user: AdminUser) => {
    setAppData(prev => ({
      ...prev,
      currentUser: {
        id: user.id,
        email: user.email,
        type: 'admin' as const,
        name: user.name
      },
    }));

    setAppState('adminDashboard');
  };

  const handleAffiliateLoginSuccess = (user: AffiliateUser) => {
    setAffiliateUser(user);
    setAppState('affiliateMenu');
  };


  const handleLogout = () => {
    setAppData(prev => ({
      ...prev,
      currentUser: undefined,
    }));
    
    // Limpar sessão de afiliado se necessário
    if (affiliateUser) {
      setAffiliateUser(null);
      logoutAffiliate();
      clearAffiliateCurrentState(); // Limpar estado atual também
    }
    
    // Limpar sessão do admin
    logoutAdminComplete();
    
    setAppState('landing');
  };

  const handleAddAffiliate = (affiliateData: Omit<Affiliate, 'id' | 'createdAt'>) => {
    const newAffiliate: Affiliate = {
      ...affiliateData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };

    setAppData(prev => ({
      ...prev,
      affiliates: [...prev.affiliates, newAffiliate],
    }));
  };

  const handleUpdateLead = async (leadId: string, status: Lead['status'], clientName?: string) => {
    try {
      // Importar a função de atualização do Supabase
      const { updateLeadStatus } = await import('@/services/supabaseQueries');
      
      // Converter status do frontend para o formato do banco
      const statusMap: { [key in Lead['status']]: string } = {
        'Novo': 'novo',
        'Contatar': 'contatar',
        'Em Negociação': 'em_negociacao',
        'Fechado': 'fechado',
        'Perdido': 'perdido'
      };
      const dbStatus = statusMap[status] || 'novo';
      
      // Atualizar no banco de dados
      const result = await updateLeadStatus(leadId, dbStatus);
      
      if (result.error) {
        console.error('Erro ao atualizar lead:', result.error);
        alert('Erro ao atualizar status do lead');
        return;
      }
      
      // Atualizar dados locais apenas se a atualização no banco foi bem-sucedida
      setAppData(prev => ({
        ...prev,
        leads: prev.leads.map(lead =>
          lead.id === leadId
            ? { ...lead, status, ...(clientName && { clientName }) }
            : lead
        ),
      }));
      
    } catch (error) {
      console.error('Erro inesperado ao atualizar lead:', error);
      alert('Erro inesperado ao atualizar status do lead');
    }
  };

  // Navigation handlers for affiliate menu
  const handleAffiliateMenuClose = () => {
    setAppState('landing');
  };

  const handleSelectCalculator = () => {
    setAppState('affiliateDashboard'); // Redireciona para a dashboard atual
    saveAffiliateCurrentState('affiliateDashboard'); // Salvar estado atual
  };

  const handleSelectLeadGenerator = () => {
    setAppState('leadGenerator'); // Redireciona para o gerador de leads
    saveAffiliateCurrentState('leadGenerator'); // Salvar estado atual
  };

  const handleBackToMenu = () => {
    setAppState('affiliateMenu');
    clearAffiliateCurrentState(); // Limpar estado salvo ao voltar para o menu
  };

  const [showSimulator, setShowSimulator] = useState(false);

  // Render current page based on app state
  switch (appState) {
    case 'login':
      return (
        <AdminLoginPage
          onBack={() => setAppState('landing')}
          onLogin={handleLogin}
        />
      );

    case 'affiliateLogin':
      return (
        <AffiliateLoginPage
          onBack={() => setAppState('landing')}
          onLoginSuccess={(user) => handleAffiliateLoginSuccess(user)}
        />
      );

    case 'affiliateMenu':
      return (
        <AffiliateMenuModal
          isOpen={true}
          onClose={handleAffiliateMenuClose}
          onSelectCalculator={handleSelectCalculator}
          onSelectLeadGenerator={handleSelectLeadGenerator}
          userName={affiliateUser?.name || appData.currentUser?.name}
        />
      );

    case 'comingSoon':
      return (
        <ComingSoonPage
          onBack={handleBackToMenu}
          onLogout={handleLogout}
          pageName="Gerador de Leads"
        />
      );

    case 'leadGenerator':
      return (
        <AffiliateLeadGenerator
          onBack={handleBackToMenu}
          onLogout={handleLogout}
          appData={appData}
        />
      );

    case 'affiliateDashboard':
      return (
        <AffiliateDashboard
          onLogout={handleLogout}
          onBackToMenu={handleBackToMenu}
          appData={appData}
          onUpdateLead={handleUpdateLead}
          affiliateUser={affiliateUser}
        />
      );

    case 'adminDashboard':
      return (
        <AdminDashboard
          onLogout={handleLogout}
          appData={appData}
          onAddAffiliate={handleAddAffiliate}
          onUpdateLead={handleUpdateLead}
        />
      );

    default:
      return (
        <>
          <div className="min-h-screen bg-gradient-subtle">
            {/* Header */}
            <header className="border-b bg-card/50 backdrop-blur-sm">
              <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={energyIcon} alt="Alexandria Energia" className="w-10 h-10" />
                    <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                      Alexandria Energia
                    </h1>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="gap-2"
                      onClick={() => setAppState('affiliateLogin')}
                    >
                      <Users className="w-4 h-4" />
                      Afiliado
                    </Button>
                    <Button 
                      variant="outline" 
                      className="gap-2"
                      onClick={() => setAppState('login')}
                    >
                      <Users className="w-4 h-4" />
                      Admin
                    </Button>
                  </div>
                </div>
              </div>
            </header>

            {/* Hero Section */}
            <section className="py-20">
              <div className="container mx-auto px-4 text-center">
                <div className="max-w-4xl mx-auto">
                  <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                    <Zap className="w-4 h-4" />
                    Tecnologia de Ponta em Energia
                  </div>
                  
                  <h1 className="text-5xl md:text-7xl font-bold mb-6">
                    Revolucione sua{" "}
                    <span className="bg-gradient-hero bg-clip-text text-transparent">
                      conta de luz
                    </span>
                  </h1>
                  
                  <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
                    A Alexandria Energia traz a mais avançada tecnologia para otimizar seu consumo energético e garantir economia real na sua conta de luz.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                    <Button 
                      variant="hero" 
                      size="xl" 
                      className="gap-2"
                      onClick={() => setShowSimulator(true)}
                    >
                      <Calculator className="w-5 h-5" />
                      Simular Economia Agora
                    </Button>
                    <Button 
                      variant="outline" 
                      size="xl" 
                      className="gap-2"
                      onClick={() => setAppState('affiliateLogin')}
                    >
                      <Users className="w-5 h-5" />
                      Área do Afiliado
                    </Button>
                  </div>

                  {/* Features Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    <Card className="shadow-lg hover:shadow-xl transition-shadow">
                      <CardHeader>
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Zap className="w-8 h-8 text-primary" />
                        </div>
                        <CardTitle className="text-center">Tecnologia Avançada</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground text-center">
                          Sistemas inteligentes que otimizam automaticamente seu consumo energético sem afetar seu conforto.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="shadow-lg hover:shadow-xl transition-shadow">
                      <CardHeader>
                        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <TrendingUp className="w-8 h-8 text-success" />
                        </div>
                        <CardTitle className="text-center">Economia Garantida</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground text-center">
                          Reduza até 25% da sua conta de energia com nossa tecnologia comprovada e suporte especializado.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="shadow-lg hover:shadow-xl transition-shadow">
                      <CardHeader>
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Users className="w-8 h-8 text-primary" />
                        </div>
                        <CardTitle className="text-center">Suporte Completo</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground text-center">
                          Equipe especializada disponível para te ajudar em todo o processo, desde a simulação até a instalação.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-hero">
              <div className="container mx-auto px-4 text-center">
                <div className="max-w-3xl mx-auto text-white">
                  <h2 className="text-4xl font-bold mb-6">
                    Pronto para economizar na sua conta de luz?
                  </h2>
                  <p className="text-xl opacity-90 mb-8">
                    Faça uma simulação gratuita e descubra quanto você pode economizar mensalmente com a Alexandria Energia.
                  </p>
                  <Button 
                    variant="secondary" 
                    size="xl" 
                    className="gap-2"
                    onClick={() => setShowSimulator(true)}
                  >
                    <Calculator className="w-5 h-5" />
                    Fazer Simulação Gratuita
                  </Button>
                </div>
              </div>
            </section>
          </div>

          {/* Energy Simulator Modal */}
          <EnergySimulator
            isOpen={showSimulator}
            onClose={() => setShowSimulator(false)}
            onSimulationComplete={handleSimulationComplete}
          />
        </>
      );
  }
};

export default Index;
