import React, { useState } from 'react';
import { ArrowLeft, Lock, Mail, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { authenticateAffiliate, saveAffiliateSession, LoginResult } from '@/services/authService';

interface AffiliateLoginPageProps {
  onBack: () => void;
  onLoginSuccess: (user: any) => void;
}

export const AffiliateLoginPage: React.FC<AffiliateLoginPageProps> = ({ 
  onBack, 
  onLoginSuccess 
}) => {
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginData.email || !loginData.password) {
      setError('Por favor, preencha email e senha');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result: LoginResult = await authenticateAffiliate(loginData);
      
      if (result.success && result.user) {
        // Salvar sessão
        saveAffiliateSession(result.user);
        
        // Notificar sucesso
        alert(`Bem-vindo, ${result.user.name}!`);
        
        // Redirecionar
        onLoginSuccess(result.user);
      } else {
        setError(result.error || 'Erro desconhecido');
      }
    } catch (error: any) {
      setError('Erro interno do sistema');
      console.error('Erro no login:', error);
    } finally {
      setIsLoading(false);
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
            Área do Afiliado
          </h2>
          <p className="text-muted-foreground">
            Faça login com suas credenciais de acesso
          </p>
        </div>

        {/* Login Form */}
        <Card className="shadow-energy border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-center">
              <span className="bg-gradient-energy bg-clip-text text-transparent">
                Entrar
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10 h-11"
                    required
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
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    className="pl-10 h-11"
                    required
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || !loginData.email || !loginData.password}
                variant="energy"
                size="lg"
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Lock className="w-4 h-4 mr-2 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Entrar
                  </>
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                Problemas para acessar? Entre em contato com o administrador.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

