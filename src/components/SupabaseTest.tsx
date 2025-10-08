import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, CheckCircle, XCircle, Loader2 } from 'lucide-react';

// Importar apenas se Supabase configurado
let testSupabaseConnection: () => Promise<any> = async () => ({ success: false, error: 'Supabase não configurado' });

try {
  const supabaseModule = await import('@/lib/supabase');
  testSupabaseConnection = supabaseModule.testSupabaseConnection;
} catch (error) {
  console.log('Supabase não configurado ainda');
}

export const SupabaseTest = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; error?: string } | null>(null);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const result = await testSupabaseConnection();
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, error: 'Erro desconhecido' });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Teste Supabase
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Teste se a conexão com o Supabase está funcionando corretamente.
          </p>
          
          <Button 
            onClick={handleTestConnection}
            disabled={isTesting}
            variant="outline"
            className="gap-2"
          >
            {isTesting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Testando...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Testar Conexão
              </>
            )}
          </Button>

          {testResult && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              testResult.success 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {testResult.success ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>✅ Conexão com Supabase estabelecida com sucesso!</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5" />
                  <div>
                    <span className="block">❌ Erro na conexão:</span>
                    <span className="text-sm">{testResult.error}</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

