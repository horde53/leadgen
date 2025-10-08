import React, { useState, useMemo, useEffect } from 'react';
import { Zap, LogOut, Link2, Users, TrendingUp, DollarSign, Copy, Check, Eye, Phone, Settings, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { getAffiliateLeads, updateUser, getTopAffiliates } from '@/services/supabaseQueries';
import { formatPhoneNumber, unformatPhoneNumber, displayPhoneNumber } from '@/utils/phoneFormatter';
import { GoogleMapsScraper } from './GoogleMapsScraper';
import type { AppData, Lead } from '@/types';

interface AffiliateDashboardProps {
  onLogout: () => void;
  onBackToMenu: () => void;
  appData: AppData;
  onUpdateLead: (leadId: string, status: Lead['status'], clientName?: string) => void;
  affiliateUser?: any; // Dados reais do afiliado logado
}

const statusColors = {
  'Novo': 'bg-blue-100 text-blue-800',
  'Contatar': 'bg-yellow-100 text-yellow-800',
  'Em Negociação': 'bg-orange-100 text-orange-800',
  'Fechado': 'bg-green-100 text-green-800',
  'Perdido': 'bg-red-100 text-red-800',
};

// Função para converter status do banco para o frontend
const convertStatusFromDB = (dbStatus: string): Lead['status'] => {
  const statusMap: { [key: string]: Lead['status'] } = {
    'novo': 'Novo',
    'contatar': 'Contatar',
    'em_negociacao': 'Em Negociação',
    'fechado': 'Fechado',
    'perdido': 'Perdido'
  };
  return statusMap[dbStatus] || 'Novo';
};

// Função para converter status do frontend para o banco
const convertStatusToDB = (frontendStatus: Lead['status']): string => {
  const statusMap: { [key in Lead['status']]: string } = {
    'Novo': 'novo',
    'Contatar': 'contatar',
    'Em Negociação': 'em_negociacao',
    'Fechado': 'fechado',
    'Perdido': 'perdido'
  };
  return statusMap[frontendStatus] || 'novo';
};

export const AffiliateDashboard: React.FC<AffiliateDashboardProps> = ({
  onLogout,
  onBackToMenu,
  appData,
  onUpdateLead,
  affiliateUser
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [editingNames, setEditingNames] = useState<{ [key: string]: string }>({});
  const [realLeads, setRealLeads] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [topAffiliates, setTopAffiliates] = useState<any[]>([]);
  const [loadingTopAffiliates, setLoadingTopAffiliates] = useState(true);
  const [leadsSearchTerm, setLeadsSearchTerm] = useState<string>('');
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState(false);
  const [scrapedResults, setScrapedResults] = useState<any[]>([]);
  const [editProfileData, setEditProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Usar dados reais do afiliado se disponível, senão usar dados mockados
  const currentAffiliate = affiliateUser || appData.affiliates.find(a => a.email === appData.currentUser?.email);
  
  // Função para carregar leads
  const loadAffiliateLeads = async () => {
    if (currentAffiliate?.id) {
      setLoadingLeads(true);
      try {
        const result = await getAffiliateLeads(currentAffiliate.id);
        if (result.data) {
          // Converter dados do banco para o formato do frontend
          const convertedLeads: Lead[] = result.data.map((lead: any) => ({
            id: lead.id,
            billValue: lead.energy_bill_value,
            monthlyEconomy: lead.monthly_economy,
            yearlyEconomy: lead.yearly_economy,
            status: convertStatusFromDB(lead.status),
            affiliateId: lead.affiliate_id,
            createdAt: new Date(lead.created_at),
            clientName: lead.client_name,
            clientPhone: lead.client_phone,
            energyBillFile: lead.energy_bill_file
          }));
          setRealLeads(convertedLeads);
        }
      } catch (error) {
        console.error('Erro ao carregar leads:', error);
      } finally {
        setLoadingLeads(false);
      }
    }
  };

  // Função para carregar top afiliados
  const loadTopAffiliates = async () => {
    setLoadingTopAffiliates(true);
    try {
      const result = await getTopAffiliates();
      if (result.data) {
        setTopAffiliates(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar top afiliados:', error);
    } finally {
      setLoadingTopAffiliates(false);
    }
  };

  // Carregar leads reais do banco de dados
  useEffect(() => {
    loadAffiliateLeads();
  }, [currentAffiliate?.id]);

  // Carregar top afiliados
  useEffect(() => {
    loadTopAffiliates();
  }, []);

  // Usar leads reais se disponíveis, senão usar dados mockados
  const allAffiliateLeads = realLeads.length > 0 ? realLeads : appData.leads.filter(lead => lead.affiliateId === currentAffiliate?.id);

  // Filtrar leads por termo de busca
  const affiliateLeads = useMemo(() => {
    return allAffiliateLeads.filter(lead => {
      const nameMatch = leadsSearchTerm === '' || 
        (lead.clientName && lead.clientName.toLowerCase().includes(leadsSearchTerm.toLowerCase()));
      const phoneMatch = leadsSearchTerm === '' || 
        (lead.clientPhone && lead.clientPhone.toLowerCase().includes(leadsSearchTerm.toLowerCase()));
      return nameMatch || phoneMatch;
    });
  }, [allAffiliateLeads, leadsSearchTerm]);

  const metrics = useMemo(() => {
    const newLeads = affiliateLeads.filter(lead => lead.status === 'Novo').length;
    const closedLeads = affiliateLeads.filter(lead => lead.status === 'Fechado').length;
    // Comissão é 40% do valor mensal da conta (billValue)
    const projectedCommission = affiliateLeads
      .filter(lead => lead.status === 'Fechado')
      .reduce((sum, lead) => sum + (lead.billValue * 0.40), 0);

    return { newLeads, closedLeads, projectedCommission };
  }, [affiliateLeads]);

  // Usar top afiliados reais se disponíveis, senão usar dados mockados
  const affiliateRanking = topAffiliates.length > 0 ? topAffiliates.map(affiliate => ({
    ...affiliate,
    closedCount: affiliate.total_closed_leads || 0
  })) : appData.affiliates.map(affiliate => {
      const closedCount = appData.leads.filter(
        lead => lead.affiliateId === affiliate.id && lead.status === 'Fechado'
      ).length;
      return { ...affiliate, closedCount };
    }).sort((a, b) => b.closedCount - a.closedCount).slice(0, 5);

  const handleCopyLink = () => {
    // Link deve apontar para a landing page (página inicial), não para o painel
    const affiliateLink = `${window.location.origin}/?ref=${currentAffiliate?.affiliate_code}`;
    navigator.clipboard.writeText(affiliateLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    
    // Abrir o link em nova aba
    window.open(affiliateLink, '_blank');
  };

  const handleNameEdit = (leadId: string, name: string) => {
    setEditingNames(prev => ({ ...prev, [leadId]: name }));
  };

  const handleNameSave = (leadId: string) => {
    const name = editingNames[leadId];
    const lead = affiliateLeads.find(l => l.id === leadId);
    if (lead && name) {
      onUpdateLead(leadId, lead.status, name);
      setEditingNames(prev => {
        const { [leadId]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleStatusChange = async (leadId: string, status: Lead['status']) => {
    const lead = affiliateLeads.find(l => l.id === leadId);
    // Converter status do frontend para o formato do banco
    const dbStatus = convertStatusToDB(status);
    await onUpdateLead(leadId, status, lead?.clientName);
    // Recarregar leads após atualização
    loadAffiliateLeads();
  };

  // Função para lidar com mudança no campo WhatsApp (Editar Perfil)
  const handleProfilePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setEditProfileData(prev => ({ ...prev, phone: formatted }));
  };

  // Função para abrir modal de edição de perfil
  const handleEditProfile = () => {
    if (currentAffiliate) {
      console.log('🔍 Dados do afiliado atual:', currentAffiliate);
      console.log('📱 Phone do afiliado:', currentAffiliate.phone);
      setEditProfileData({
        name: currentAffiliate.name || '',
        email: currentAffiliate.email || '',
        phone: formatPhoneNumber(currentAffiliate.phone || ''), // Formatar ao carregar
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setIsEditProfileOpen(true);
    }
  };

  // Função para validar e abrir modal de confirmação
  const handleSaveProfile = () => {
    // Validações
    if (!editProfileData.name || !editProfileData.email) {
      alert('Nome e email são obrigatórios');
      return;
    }

    if (editProfileData.newPassword && editProfileData.newPassword !== editProfileData.confirmPassword) {
      alert('Nova senha e confirmação não coincidem');
      return;
    }

    // Abrir modal de confirmação
    setIsConfirmSaveOpen(true);
  };

  // Função para executar o salvamento após confirmação
  const handleConfirmSave = async () => {
    if (!currentAffiliate?.id) return;

    try {
      const updateData: any = {
        name: editProfileData.name,
        email: editProfileData.email,
        phone: unformatPhoneNumber(editProfileData.phone) || null // Remove formatação antes de salvar
      };

      // Se há nova senha, incluir no update
      if (editProfileData.newPassword) {
        updateData.password_hash = editProfileData.newPassword;
      }

      const result = await updateUser(currentAffiliate.id, updateData);
      
      if (result.error) {
        alert(`Erro ao atualizar perfil: ${result.error}`);
        return;
      }

      alert('Perfil atualizado com sucesso!');
      setIsEditProfileOpen(false);
      setIsConfirmSaveOpen(false);
      
      // Limpar dados do formulário
      setEditProfileData({
        name: '',
        email: '',
        phone: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      alert('Erro inesperado ao atualizar perfil');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-energy rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Olá, {currentAffiliate?.name || 'Afiliado'}! 👋
              </h1>
              <p className="text-sm text-muted-foreground">Gerencie seus leads e vendas</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onBackToMenu}>
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            <Button variant="outline" onClick={handleEditProfile}>
              <Settings className="w-4 h-4" />
              Editar Perfil
            </Button>
          <Button variant="outline" onClick={onLogout}>
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Quick Actions */}
        <Card className="shadow-energy border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="w-5 h-5 text-primary" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="energy" onClick={handleCopyLink} className="w-full sm:w-auto">
              {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedLink ? 'Link Copiado!' : 'Gerar Meu Link de Divulgação'}
            </Button>
            {copiedLink && (
              <p className="text-sm text-muted-foreground mt-2">
                Link copiado para a área de transferência!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Metrics */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-sm hover:shadow-energy transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Novas Simulações</p>
                  <p className="text-3xl font-bold text-primary">{metrics.newLeads}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-success transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Clientes Convertidos</p>
                  <p className="text-3xl font-bold text-energy">{metrics.closedLeads}</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Comissão Projetada</p>
                  <p className="text-3xl font-bold text-accent">
                    R$ {metrics.projectedCommission.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      

        {/* Leads Table */}
        <Card className="shadow-sm border-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Meus Leads</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por nome ou telefone..."
                value={leadsSearchTerm}
                onChange={(e) => setLeadsSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </CardHeader>
          <CardContent>
            {/* Indicador de resultados */}
            <div className="mb-4 text-sm text-muted-foreground">
              {loadingLeads ? (
                "Carregando leads..."
              ) : (
                `${affiliateLeads.length} de ${allAffiliateLeads.length} leads encontrados`
              )}
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>WhatsApp</TableHead>
                    <TableHead>Valor da Conta</TableHead>
                    <TableHead>Economia Anual</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Conta de Energia</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingLeads ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                          Carregando leads...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : affiliateLeads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Search className="w-8 h-8 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {leadsSearchTerm 
                              ? 'Nenhum lead encontrado com o termo de busca'
                              : 'Nenhum lead cadastrado ainda'
                            }
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    affiliateLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        {editingNames[lead.id] !== undefined ? (
                          <div className="flex gap-2">
                            <Input
                              value={editingNames[lead.id]}
                              onChange={(e) => handleNameEdit(lead.id, e.target.value)}
                              className="h-8"
                              placeholder="Nome do cliente"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleNameSave(lead.id)}
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <div
                            className="cursor-pointer hover:text-primary"
                            onClick={() => setEditingNames(prev => ({ ...prev, [lead.id]: lead.clientName || '' }))}
                          >
                            {lead.clientName || 'Clique para adicionar nome'}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-green-600" />
                          <span className="text-sm">
                            {displayPhoneNumber(lead.clientPhone || '') || 'Não informado'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-primary">
                          R$ {lead.billValue.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">
                        R$ {lead.yearlyEconomy.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={lead.status}
                          onValueChange={(value) => handleStatusChange(lead.id, value as Lead['status'])}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Novo">Novo</SelectItem>
                            <SelectItem value="Contatar">Contatar</SelectItem>
                            <SelectItem value="Em Negociação">Em Negociação</SelectItem>
                            <SelectItem value="Fechado">Fechado</SelectItem>
                            <SelectItem value="Perdido">Perdido</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {lead.energyBillFile ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(lead.energyBillFile, '_blank')}
                            className="gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            Ver Conta
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-sm">Não enviada</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                      </TableCell>
                    </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Ranking */}
        <Card className="shadow-sm border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-energy" />
              🏆 Top 5 Afiliados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loadingTopAffiliates ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-energy mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Carregando ranking...</p>
                </div>
              ) : affiliateRanking.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">Nenhum afiliado encontrado</p>
                </div>
              ) : (
                affiliateRanking.map((affiliate, index) => (
                <div
                  key={affiliate.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    affiliate.id === currentAffiliate?.id ? 'bg-primary/5 border border-primary/20' : 'bg-muted/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-500 text-white' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="font-medium">
                      {affiliate.name}
                      {affiliate.id === currentAffiliate?.id && ' (Você)'}
                    </span>
                  </div>
                  <Badge variant="secondary" className="bg-energy/10 text-energy">
                    {affiliate.closedCount} vendas
                  </Badge>
                </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Edição de Perfil */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                value={editProfileData.name}
                onChange={(e) => setEditProfileData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Seu nome completo"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editProfileData.email}
                onChange={(e) => setEditProfileData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <Label htmlFor="phone">WhatsApp</Label>
              <Input
                id="phone"
                value={editProfileData.phone}
                onChange={(e) => handleProfilePhoneChange(e.target.value)}
                placeholder="(11) 99999-9999"
                maxLength={15}
              />
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-3">Alterar Senha (opcional)</h4>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="newPassword">Nova senha</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={editProfileData.newPassword}
                    onChange={(e) => setEditProfileData(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Deixe em branco para manter a atual"
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={editProfileData.confirmPassword}
                    onChange={(e) => setEditProfileData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirme a nova senha"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsEditProfileOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveProfile}
                className="flex-1"
              >
                Salvar Alterações
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Salvamento */}
      <AlertDialog open={isConfirmSaveOpen} onOpenChange={setIsConfirmSaveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Alterações</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja salvar as alterações no seu perfil? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSave}>
              Sim, Salvar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};