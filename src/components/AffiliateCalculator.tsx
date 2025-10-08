import React, { useState } from 'react';
import { ArrowLeft, LogOut, Zap, Calculator, TrendingUp, Users, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnergySimulator } from '@/components/EnergySimulator';
import type { AppData, Lead } from '@/types';

interface AffiliateCalculatorProps {
  onBack: () => void;
  onLogout: () => void;
  appData: AppData;
  onUpdateLead: (leadId: string, status: Lead['status'], clientName?: string) => void;
}

export const AffiliateCalculator: React.FC<AffiliateCalculatorProps> = ({
  onBack,
  onLogout,
  appData,
  onUpdateLead
}) => {
  const [showSimulator, setShowSimulator] = useState(false);

  const currentAffiliate = appData.affiliates.find(a => a.email === appData.currentUser?.email);
  const affiliateLeads = appData.leads.filter(lead => lead.affiliateId === currentAffiliate?.id);

  const totalSimulations = affiliateLeads.length;
  const totalEconomy = affiliateLeads.reduce((sum, lead) => sum + lead.yearlyEconomy, 0);
  const closedDeals = affiliateLeads.filter(lead => lead.status === 'Fechado').length;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Menu
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-energy rounded-lg flex items-center justify-center">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Calculadora de Energia
                </h1>
                <p className="text-sm text-muted-foreground">Simule economias para seus clientes</p>
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={onLogout}>
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-sm hover:shadow-energy transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Simulações</p>
                  <p className="text-3xl font-bold text-primary">{totalSimulations}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-success transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Economia Total Gerada</p>
                  <p className="text-3xl font-bold text-energy">R$ {totalEconomy.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-energy/10 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-energy" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-glow transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Negócios Fechados</p>
                  <p className="text-3xl font-bold text-accent">{closedDeals}</p>
                </div>
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Calculator Card */}
        <Card className="shadow-energy border-0">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Zap className="w-8 h-8 text-primary" />
              Calculadora de Economia Energética
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Simule quanto seus clientes podem economizar com energia solar
            </p>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="max-w-2xl mx-auto">
              <p className="text-lg text-muted-foreground mb-6">
                Use nossa calculadora avançada para mostrar aos seus clientes o potencial de economia 
                com energia solar. A ferramenta calcula automaticamente o tamanho ideal do sistema 
                e o retorno do investimento.
              </p>
              
              <Button 
                variant="energy" 
                size="xl" 
                className="gap-2 text-lg px-8 py-6"
                onClick={() => setShowSimulator(true)}
              >
                <Calculator className="w-6 h-6" />
                Iniciar Nova Simulação
              </Button>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Cálculo Automático</h3>
                <p className="text-sm text-muted-foreground">
                  Sistema inteligente que calcula o melhor tamanho de painel para cada cliente
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-energy/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-energy" />
                </div>
                <h3 className="font-semibold mb-2">Análise de ROI</h3>
                <p className="text-sm text-muted-foreground">
                  Mostra o retorno do investimento e tempo de payback do sistema
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">Relatório Completo</h3>
                <p className="text-sm text-muted-foreground">
                  Gera relatório detalhado para apresentar aos clientes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Energy Simulator Modal */}
      <EnergySimulator
        isOpen={showSimulator}
        onClose={() => setShowSimulator(false)}
        onSimulationComplete={(lead) => {
          // Handle simulation completion
          console.log('New simulation completed:', lead);
        }}
      />
    </div>
  );
};


