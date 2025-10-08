import React, { useState } from 'react';
import { Zap, Lock, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AppData } from '@/types';

interface LoginPageProps {
  onBack: () => void;
  onLogin: (email: string, type: 'affiliate' | 'admin') => void;
  appData: AppData;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onBack, onLogin, appData }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const handleLogin = () => {
    if (!email || !password) return;

    // Simulate authentication logic
    if (isAdmin) {
      // Admin login
      onLogin(email, 'admin');
    } else {
      // Affiliate login
      const affiliate = appData.affiliates.find(a => a.email === email);
      if (affiliate) {
        onLogin(email, 'affiliate');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="absolute top-4 left-4 md:top-8 md:left-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-energy rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Alexandria Energia</h1>
          </div>
          
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {isAdmin ? 'Acesso Administrativo' : 'Área do Afiliado'}
          </h2>
          <p className="text-muted-foreground">
            {isAdmin ? 'Gerencie todo o sistema' : 'Acesse seu painel de vendas'}
          </p>
        </div>

        {/* Login Form */}
        <Card className="shadow-energy border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-center">
              <span className="bg-gradient-energy bg-clip-text text-transparent">
                Fazer Login
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
            </div>

            <Button
              onClick={handleLogin}
              disabled={!email || !password}
              variant="energy"
              size="lg"
              className="w-full"
            >
              <Lock className="w-4 h-4" />
              Entrar
            </Button>

            {/* Switch Login Type */}
            <div className="text-center pt-4 border-t border-border">
              <Button
                variant="ghost"
                onClick={() => setIsAdmin(!isAdmin)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {isAdmin ? 'Acessar como Afiliado' : 'Acesso Admin'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};