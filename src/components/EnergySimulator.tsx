import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap, TrendingUp, Gift, MessageCircle, Calculator, Upload, FileText } from 'lucide-react';
import { EconomyChart } from './EconomyChart';
import { uploadEnergyBill } from '@/services/fileUploadService';
import { createLead, getAffiliateByCode } from '@/services/supabaseQueries';
import { formatPhoneNumber, unformatPhoneNumber } from '@/utils/phoneFormatter';
import type { Lead } from '@/types';

interface EnergySimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulationComplete: (lead: Lead) => void;
}

export const EnergySimulator: React.FC<EnergySimulatorProps> = ({
  isOpen,
  onClose,
  onSimulationComplete
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    billValue: '',
    clientName: '',
    whatsapp: '',
    energyBill: null as File | null
  });
  const [affiliateData, setAffiliateData] = useState<{
    name: string;
    phone: string;
  } | null>(null);

  // Função para lidar com mudança no campo WhatsApp
  const handleWhatsAppChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setFormData(prev => ({ ...prev, whatsapp: formatted }));
  };


  const calculateEconomy = (billValue: number) => {
    const monthlyEconomy = billValue * 0.15; // 15% de economia
    const yearlyEconomy = monthlyEconomy * 12;
    return { monthlyEconomy, yearlyEconomy };
  };

  const getFunEquivalent = (yearlyEconomy: number) => {
    if (yearlyEconomy < 200) return 'Um jantar romântico por mês';
    if (yearlyEconomy < 500) return 'Uma viagem de fim de semana';
    if (yearlyEconomy < 1000) return 'Um smartphone novo por ano';
    if (yearlyEconomy < 2000) return 'Uma TV 4K de 55" por ano';
    if (yearlyEconomy < 5000) return 'Uma moto usada por ano';
    return 'Um carro popular por ano';
  };

  const handleNext = async () => {
    if (step === 1 && formData.billValue && formData.clientName && formData.whatsapp && formData.energyBill) {
      // Salvar lead automaticamente
      await handleComplete();
      // Ir para step 2
      setStep(2);
    }
  };

  const handleComplete = async () => {
    try {
      const billValue = parseFloat(formData.billValue);
      const { monthlyEconomy, yearlyEconomy } = calculateEconomy(billValue);
      const equivalent = getFunEquivalent(yearlyEconomy);

      // Buscar afiliado pelo código de referência
      const affiliateRef = sessionStorage.getItem('affiliateRef');
      let affiliateId = null;
      let commissionRate = 40.00; // Taxa padrão

      if (affiliateRef) {
        const affiliateResult = await getAffiliateByCode(affiliateRef);
        if (affiliateResult.data) {
          affiliateId = affiliateResult.data.id;
          commissionRate = affiliateResult.data.commission_rate;
          // Salvar dados do afiliado para usar no WhatsApp
          setAffiliateData({
            name: affiliateResult.data.name,
            phone: affiliateResult.data.phone || '5511999999999' // Fallback se não tiver telefone
          });
        }
      }

      // Gerar ID único para o lead
      const leadId = Date.now().toString();
      
      // Fazer upload do arquivo (obrigatório)
      const uploadResult = await uploadEnergyBill(formData.energyBill!, leadId);
      if (!uploadResult.success || !uploadResult.url) {
        alert(`Erro no upload: ${uploadResult.error}`);
        return;
      }
      const energyBillUrl = uploadResult.url;

      // Calcular comissão (40% do valor mensal da conta)
      const commissionAmount = billValue * (commissionRate / 100);

      // Criar lead no banco de dados
      const leadData = {
        client_name: formData.clientName,
        client_phone: unformatPhoneNumber(formData.whatsapp), // Remove formatação antes de salvar
        energy_bill_value: billValue,
        monthly_economy: monthlyEconomy,
        yearly_economy: yearlyEconomy,
        commission_amount: commissionAmount,
        commission_rate: commissionRate,
        affiliate_id: affiliateId,
        energy_bill_file: energyBillUrl
      };

      const createResult = await createLead(leadData);
      
      if (createResult.error) {
        alert(`Erro ao salvar lead: ${createResult.error}`);
        return;
      }

      // Criar objeto Lead para o frontend
      const newLead: Lead = {
        id: createResult.data.id,
        billValue,
        monthlyEconomy,
        yearlyEconomy,
        status: 'Novo',
        createdAt: new Date(createResult.data.created_at),
        clientName: formData.clientName,
        energyBillFile: energyBillUrl,
        affiliateId: affiliateId
      };

      onSimulationComplete(newLead);

      // Limpar referência do sessionStorage
      sessionStorage.removeItem('affiliateRef');

    } catch (error) {
      console.error('Erro ao processar simulação:', error);
      alert('Erro inesperado ao processar simulação. Tente novamente.');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, energyBill: file }));
    }
  };

  const billValue = parseFloat(formData.billValue) || 0;
  const { monthlyEconomy, yearlyEconomy } = calculateEconomy(billValue);
  const equivalent = getFunEquivalent(yearlyEconomy);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            <span className="bg-gradient-energy bg-clip-text text-transparent">
              Simulador de Economia Solar
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Steps */}
          <div className="flex justify-center space-x-4 mb-8">
            {[1, 2].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {stepNumber}
              </div>
            ))}
          </div>

          {/* Step 1: All Information */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Informações para simulação</h3>
                <p className="text-muted-foreground">
                  Preencha os dados abaixo para calcular sua economia potencial com energia solar
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="billValue">Valor da sua conta de luz (R$)</Label>
                  <Input
                    id="billValue"
                    type="number"
                    placeholder="Ex: 350"
                    value={formData.billValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, billValue: e.target.value }))}
                  />
                </div>


                <div>
                  <Label htmlFor="clientName">Nome completo</Label>
                  <Input
                    id="clientName"
                    placeholder="Seu nome completo"
                    value={formData.clientName}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    placeholder="(11) 99999-9999"
                    value={formData.whatsapp}
                    onChange={(e) => handleWhatsAppChange(e.target.value)}
                    maxLength={15}
                  />
                </div>

                <div>
                  <Label htmlFor="energyBill">Upload da conta de energia *</Label>
                  
                  {/* Aviso importante sobre legibilidade */}
                  <div className="mt-2 mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-amber-600 text-xs font-bold">!</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-amber-800 mb-1">
                          ⚠️ Atenção: Verifique a legibilidade da sua conta!
                        </p>
                        <p className="text-xs text-amber-700">
                          <strong>Tem certeza que realizou um upload legível?</strong> Mais uma vez, caso esteja ilegível, 
                          não será possível verificar a validade do desconto. Certifique-se de que todos os dados 
                          (nome, endereço, valor, consumo) estão claramente visíveis na imagem.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    📋 <strong>Obrigatório:</strong> Envie uma foto legível da sua conta de energia. 
                    A imagem deve estar nítida e com todos os dados visíveis para garantir o desconto.
                  </p>
                  <div className="mt-2">
                    <input
                      type="file"
                      id="energyBill"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="energyBill"
                      className="flex items-center justify-center w-full h-24 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-primary/50 transition-colors bg-muted/20"
                    >
                      <div className="flex flex-col items-center gap-2 text-center">
                        {formData.energyBill ? (
                          <>
                            <FileText className="w-8 h-8 text-primary" />
                            <span className="text-sm text-primary font-medium">
                              {formData.energyBill.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Clique para trocar o arquivo
                            </span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground font-medium">
                              Clique para fazer upload da conta
                            </span>
                            <span className="text-xs text-muted-foreground">
                              PDF, JPG, PNG (máx. 10MB) - Obrigatório
                            </span>
                          </>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Results */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Sua economia com energia solar</h3>
                <p className="text-muted-foreground">
                  Veja quanto você pode economizar anualmente
                </p>
              </div>

              {/* Economy Cards */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="border-0 shadow-success bg-gradient-to-br from-energy/5 to-energy/10">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-energy rounded-xl flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-foreground mb-1">Economia Mensal</h4>
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
                    <h4 className="text-lg font-semibold text-foreground mb-1">Economia Anual</h4>
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
                  <h4 className="text-lg font-semibold text-foreground mb-2">Sua economia equivale a:</h4>
                  <p className="text-xl font-bold text-accent">{equivalent}</p>
                </CardContent>
              </Card>

              {/* Chart */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                  <EconomyChart billValue={billValue} monthlyEconomy={monthlyEconomy} />
                </CardContent>
              </Card>

              {/* CTA Section */}
              <Card className="border-0 shadow-lg bg-gradient-to-r from-primary/5 to-energy/5">
                <CardContent className="p-8 text-center">
                  <h4 className="text-2xl font-bold mb-4 text-foreground">
                    Pronto para começar a economizar?
                  </h4>
                  <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                    Nossa equipe especializada irá te ajudar a contratar a Alexandria Energia e começar a economizar já no próximo mês.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      size="lg" 
                      className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => {
                        const phoneNumber = affiliateData?.phone || "5511999999999";
                        const consultantName = affiliateData?.name || "Consultor";
                        const message = `Olá ${consultantName}! Gostaria de saber mais sobre a Alexandria Energia e começar a economizar na minha conta de luz.`;
                        window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
                      }}
                    >
                      <MessageCircle className="w-5 h-5" />
                      Falar com {affiliateData?.name || 'Consultor'} no WhatsApp
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="gap-2"
                      onClick={() => {
                        setStep(1);
                        setFormData({
                          billValue: '',
                          clientName: '',
                          whatsapp: '',
                          energyBill: null
                        });
                      }}
                    >
                      <Calculator className="w-5 h-5" />
                      Fazer Nova Simulação
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation Buttons - Only for Step 1 */}
          {step === 1 && (
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={onClose}
              >
                Cancelar
              </Button>

              <Button
                onClick={handleNext}
                disabled={
                  !formData.billValue || 
                  !formData.clientName || 
                  !formData.whatsapp ||
                  !formData.energyBill
                }
              >
                Simular Economia
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

