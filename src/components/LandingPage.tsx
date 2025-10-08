import React, { useState } from 'react';
import { Zap, Calculator, TrendingUp, Lightbulb, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EconomyChart } from './EconomyChart';
import { SimulationModal } from './SimulationModal';
import heroImage from '@/assets/hero-solar.jpg';
import type { Lead } from '@/types';

interface LandingPageProps {
  onLogin: () => void;
  onSimulationComplete: (lead: Lead) => void;
}

const distributors = [
  'CPFL Energia',
  'Enel São Paulo',
  'Enel Rio',
  'Neoenergia',
  'Light',
  'Cemig',
  'Copel',
  'Equatorial',
  'EDP',
  'Energisa'
];

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onSimulationComplete }) => {
  const [billValue, setBillValue] = useState<string>('');
  const [distributor, setDistributor] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [simulation, setSimulation] = useState<{
    monthlyEconomy: number;
    yearlyEconomy: number;
    equivalent: string;
  } | null>(null);

  const handleSimulation = () => {
    if (!billValue || !distributor) return;

    const value = parseFloat(billValue.replace(/[^\d,]/g, '').replace(',', '.'));
    const monthlyEconomy = value * 0.15;
    const yearlyEconomy = monthlyEconomy * 12;

    // Equivalências divertidas baseadas na economia anual
    const getEquivalent = (economy: number) => {
      if (economy >= 1000) return `${Math.floor(economy / 300)} meses de streaming premium!`;
      if (economy >= 600) return `${Math.floor(economy / 100)} jantares românticos!`;
      if (economy >= 300) return `${Math.floor(economy / 50)} pizzas grandes!`;
      return `${Math.floor(economy / 25)} cafés especiais!`;
    };

    const simulationData = {
      monthlyEconomy,
      yearlyEconomy,
      equivalent: getEquivalent(yearlyEconomy)
    };

    setSimulation(simulationData);
    setShowModal(true);

    // Salvar lead
    const lead: Lead = {
      id: Date.now().toString(),
      billValue: value,
      distributor,
      monthlyEconomy,
      yearlyEconomy,
      status: 'Novo',
      createdAt: new Date(),
    };

    onSimulationComplete(lead);
  };

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, '');
    const formatted = (parseFloat(numericValue) / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
    return formatted;
  };

  const handleBillValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    setBillValue(formatted);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-energy rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Alexandria Energia</h1>
          </div>
          <Button variant="ghost" onClick={onLogin} className="text-muted-foreground hover:text-foreground">
            Área do Afiliado
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-energy/10 text-energy px-4 py-2 rounded-full mb-6">
            <Leaf className="w-4 h-4" />
            <span className="text-sm font-medium">Energia Solar Inteligente</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            Economize na sua conta de luz em{' '}
            <span className="bg-gradient-energy bg-clip-text text-transparent">
              3 passos simples
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Descubra quanto você pode economizar com energia solar e transforme sua conta de luz em investimento sustentável
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="border-0 shadow-sm hover:shadow-energy transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Calculator className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Simulação Gratuita</h3>
                <p className="text-sm text-muted-foreground">Calcule sua economia em poucos segundos</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-success transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-energy/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-energy" />
                </div>
                <h3 className="font-semibold mb-2">Até 95% de Economia</h3>
                <p className="text-sm text-muted-foreground">Reduza drasticamente sua conta de luz</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-glow transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">Sustentabilidade</h3>
                <p className="text-sm text-muted-foreground">Contribua para um futuro mais verde</p>
              </CardContent>
            </Card>
          </div>

          {/* Hero Image */}
          <div className="mb-12 rounded-2xl overflow-hidden shadow-glow">
            <img 
              src={heroImage} 
              alt="Painel solar moderno em residência com economia de energia" 
              className="w-full h-64 md:h-80 object-cover"
            />
          </div>
        </div>

        {/* Simulation Form */}
        <Card className="max-w-md mx-auto shadow-energy border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              <span className="bg-gradient-energy bg-clip-text text-transparent">
                Simule sua Economia
              </span>
            </CardTitle>
            <p className="text-muted-foreground">Preencha os dados abaixo para descobrir quanto você pode economizar</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Qual o valor médio da sua conta de luz?
              </label>
              <Input
                type="text"
                placeholder="R$ 0,00"
                value={billValue}
                onChange={handleBillValueChange}
                className="text-lg h-12"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Selecione sua distribuidora
              </label>
              <Select value={distributor} onValueChange={setDistributor}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Escolha sua distribuidora" />
                </SelectTrigger>
                <SelectContent>
                  {distributors.map((dist) => (
                    <SelectItem key={dist} value={dist}>
                      {dist}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleSimulation}
              disabled={!billValue || !distributor}
              variant="energy"
              size="xl"
              className="w-full"
            >
              <Calculator className="w-5 h-5" />
              Calcular Economia
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Simulation Modal */}
      {showModal && simulation && (
        <SimulationModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          billValue={parseFloat(billValue.replace(/[^\d,]/g, '').replace(',', '.'))}
          monthlyEconomy={simulation.monthlyEconomy}
          yearlyEconomy={simulation.yearlyEconomy}
          equivalent={simulation.equivalent}
        />
      )}
    </div>
  );
};