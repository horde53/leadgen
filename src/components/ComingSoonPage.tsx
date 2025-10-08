import React from 'react';
import { ArrowLeft, LogOut, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ComingSoonPageProps {
  onBack: () => void;
  onLogout: () => void;
  pageName: string;
}

export const ComingSoonPage: React.FC<ComingSoonPageProps> = ({
  onBack,
  onLogout,
  pageName
}) => {
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
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  {pageName}
                </h1>
                <p className="text-sm text-muted-foreground">Em breve - Em construção</p>
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={onLogout}>
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="shadow-2xl border-0">
            <CardHeader className="text-center pb-8">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-12 h-12 text-primary" />
              </div>
              <CardTitle className="text-4xl font-bold text-primary mb-4">
                EM BREVE
              </CardTitle>
              <p className="text-xl text-muted-foreground">
                Estamos trabalhando duro para trazer esta funcionalidade para você!
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3">🚀 O que está por vir:</h3>
                <ul className="text-left space-y-2 text-muted-foreground">
                  <li>• Interface completa para gerenciar leads</li>
                  <li>• Filtros avançados de busca</li>
                  <li>• Relatórios detalhados</li>
                  <li>• Integração com CRM</li>
                  <li>• Notificações automáticas</li>
                </ul>
              </div>

              <div className="pt-6">
                <p className="text-sm text-muted-foreground mb-4">
                  Enquanto isso, você pode usar a Calculadora de Energia para simular economias para seus clientes.
                </p>
                <Button variant="energy" onClick={onBack} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Voltar ao Menu Principal
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};


