import React, { useState } from 'react';
import { Zap, Lock, Mail, ArrowLeft, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { authenticateAdmin, saveAdminSession, type AdminUser } from '@/services/adminAuthService';

interface AdminLoginPageProps {
  onBack: () => void;
  onLogin: (user: AdminUser) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onBack, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;

    setIsLoading(true);

    try {
      const result = await authenticateAdmin({ email, password });
      
      if (result.success && result.user) {
        // Salvar sessão
        saveAdminSession(result.user);
        
        // Notificar sucesso
        alert(`Bem-vindo, ${result.user.name}!`);
        
        // Redirecionar
        onLogin(result.user);
      } else {
        alert(result.error || 'Erro desconhecido');
      }
    } catch (error: any) {
      alert('Erro interno do sistema');
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
            Área Administrativa
          </h2>
          <p className="text-muted-foreground">
            Acesso restrito para administradores
          </p>
        </div>

        {/* Login Form */}
        <Card className="shadow-energy border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <User className="w-5 h-5" />
              <span className="bg-gradient-energy bg-clip-text text-transparent">
                Login Administrador
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="email"
                    placeholder="admin@alexandriaenergia.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-11"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !email || !password}
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
                    <User className="w-4 h-4 mr-2" />
                    Entrar como Admin
                  </>
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                Use suas credenciais de administrador
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

