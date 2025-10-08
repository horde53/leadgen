import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, TrendingUp, Gift, MessageCircle } from 'lucide-react';
import { EconomyChart } from './EconomyChart';

interface SimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  billValue: number;
  monthlyEconomy: number;
  yearlyEconomy: number;
  equivalent: string;
}

export const SimulationModal: React.FC<SimulationModalProps> = ({
  isOpen,
  onClose,
  billValue,
  monthlyEconomy,
  yearlyEconomy,
  equivalent
}) => {
  const handleWhatsApp = () => {
    const message = `Olá! Acabei de simular minha economia de energia solar na Alexandria Energia. Minha conta atual é de R$ ${billValue.toFixed(2)} e posso economizar R$ ${yearlyEconomy.toFixed(2)} por ano! Gostaria de saber mais sobre a instalação.`;
    const url = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            <span className="bg-gradient-energy bg-clip-text text-transparent">
              Sua economia potencial com a Alexandria!
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Economy Cards */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-0 shadow-success bg-gradient-to-br from-energy/5 to-energy/10">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-energy rounded-xl flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Economia Mensal</h3>
                <p className="text-3xl font-bold text-energy">
                  R$ {monthlyEconomy.toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-energy bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Economia Anual</h3>
                <p className="text-3xl font-bold text-primary">
                  R$ {yearlyEconomy.toFixed(2)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Fun Equivalent */}
          <Card className="border-0 shadow-sm bg-gradient-to-r from-accent/5 to-primary/5">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-energy rounded-xl flex items-center justify-center mx-auto mb-3">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Sua economia equivale a:</h3>
              <p className="text-xl font-bold text-accent">{equivalent}</p>
            </CardContent>
          </Card>

          {/* Chart */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <EconomyChart billValue={billValue} monthlyEconomy={monthlyEconomy} />
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold text-foreground">
              Pronto para começar a economizar?
            </h3>
            <p className="text-muted-foreground">
              Entre em contato conosco e transforme sua conta de luz em investimento sustentável!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="energy" size="lg" onClick={handleWhatsApp}>
                <MessageCircle className="w-5 h-5" />
                Quero Economizar Agora
              </Button>
              <Button variant="outline" size="lg" onClick={onClose}>
                Fazer Nova Simulação
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};