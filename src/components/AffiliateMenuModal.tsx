import React from 'react';
import { Calculator, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AffiliateMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCalculator: () => void;
  onSelectLeadGenerator: () => void;
  userName?: string;
}

export const AffiliateMenuModal: React.FC<AffiliateMenuModalProps> = ({
  isOpen,
  onClose,
  onSelectCalculator,
  onSelectLeadGenerator,
  userName
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold text-primary">
                Bem-vindo, {userName || 'Afiliado'}! 👋
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Escolha uma das opções abaixo para continuar
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Calculadora - Dashboard Atual */}
          <Button
            variant="outline"
            className="w-full h-20 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300"
            onClick={onSelectCalculator}
          >
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Calculator className="w-6 h-6 text-primary" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-foreground">Calculadora de Energia</div>
              <div className="text-sm text-muted-foreground">Simule economias para seus clientes</div>
            </div>
          </Button>

          {/* Gerador de Leads - EM BREVE */}
          <Button
            variant="outline"
            className="w-full h-20 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300"
            onClick={onSelectLeadGenerator}
          >
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-foreground">Gerador de Leads</div>
              <div className="text-sm text-muted-foreground">Busque estabelecimentos no Google Maps</div>
            </div>
          </Button>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Selecione uma opção para acessar a funcionalidade desejada
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};