import React, { useState, useMemo, useEffect } from 'react';
import { Zap, LogOut, Users, TrendingUp, DollarSign, UserPlus, Edit, Trash2, Eye, Loader2, XCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { getAdminDashboardData, getAllUsers, getAllLeads, addUser, updateUser, deleteUser } from '@/services/supabaseQueries';
import { formatPhoneNumber, unformatPhoneNumber, displayPhoneNumber } from '@/utils/phoneFormatter';
import type { AppData, Lead, Affiliate } from '@/types';

interface AdminDashboardProps {
  onLogout: () => void;
  appData: AppData;
  onAddAffiliate: (affiliate: Omit<Affiliate, 'id' | 'createdAt'>) => void;
  onUpdateLead: (leadId: string, status: Lead['status']) => void;
}

const statusColors = {
  'Novo': 'bg-blue-100 text-blue-800',
  'Contatar': 'bg-yellow-100 text-yellow-800',
  'Em Negociação': 'bg-orange-100 text-orange-800',
  'Fechado': 'bg-green-100 text-green-800',
  'Perdido': 'bg-red-100 text-red-800',
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onLogout,
  appData,
  onAddAffiliate,
  onUpdateLead
}) => {
  const [isAddAffiliateOpen, setIsAddAffiliateOpen] = useState(false);
  const [isEditAffiliateOpen, setIsEditAffiliateOpen] = useState(false);
  const [isDeleteAffiliateOpen, setIsDeleteAffiliateOpen] = useState(false);
  const [isConfirmUpdateOpen, setIsConfirmUpdateOpen] = useState(false);
  const [newAffiliate, setNewAffiliate] = useState({ name: '', email: '', whatsapp: '', password: '' });
  const [editingAffiliate, setEditingAffiliate] = useState<any>(null);
  const [deletingAffiliate, setDeletingAffiliate] = useState<any>(null);
  const [selectedAffiliateFilter, setSelectedAffiliateFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [affiliateSearchTerm, setAffiliateSearchTerm] = useState<string>('');
  
  // Estados para dados reais do Supabase
  const [supabaseData, setSupabaseData] = useState({
    metrics: { totalAffiliates: 0, totalLeads: 0, totalClosed: 0, totalCommissions: 0 },
    users: [] as any[],
    leads: [] as any[],
    loading: true,
    error: null as string | null
  });

  // Carregar dados do Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        setSupabaseData(prev => ({ ...prev, loading: true, error: null }));
        
        const [dashboardResult, usersResult, leadsResult] = await Promise.all([
          getAdminDashboardData(),
          getAllUsers(),
          getAllLeads()
        ]);
        
        if (dashboardResult.error || usersResult.error || leadsResult.error) {
          throw new Error('Erro ao carregar dados do banco');
        }
        
        setSupabaseData({
          metrics: dashboardResult.data,
          users: usersResult.data || [],
          leads: leadsResult.data || [],
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setSupabaseData(prev => ({ 
          ...prev, 
          loading: false, 
          error: error instanceof Error ? error.message : 'Erro desconhecido' 
        }));
      }
    };
    
    loadData();
  }, []);

  // Usar dados do Supabase em vez dos mock
  const metrics = supabaseData.loading 
    ? { totalAffiliates: 0, totalLeads: 0, totalClosed: 0, totalCommissions: 0 }
    : supabaseData.metrics;

  const filteredLeads = useMemo(() => {
    return supabaseData.leads.filter(lead => {
      const affiliateMatch = selectedAffiliateFilter === 'all' || lead.affiliate_id === selectedAffiliateFilter;
      const statusMatch = selectedStatusFilter === 'all' || lead.status === selectedStatusFilter;
      const nameMatch = searchTerm === '' || 
        (lead.client_name && lead.client_name.toLowerCase().includes(searchTerm.toLowerCase()));
      return affiliateMatch && statusMatch && nameMatch;
    });
  }, [supabaseData.leads, selectedAffiliateFilter, selectedStatusFilter, searchTerm]);

  const filteredAffiliates = useMemo(() => {
    return supabaseData.users.filter(affiliate => {
      const nameMatch = affiliateSearchTerm === '' || 
        (affiliate.name && affiliate.name.toLowerCase().includes(affiliateSearchTerm.toLowerCase()));
      const emailMatch = affiliateSearchTerm === '' || 
        (affiliate.email && affiliate.email.toLowerCase().includes(affiliateSearchTerm.toLowerCase()));
      return nameMatch || emailMatch;
    });
  }, [supabaseData.users, affiliateSearchTerm]);

  // Função para lidar com mudança no campo WhatsApp (Adicionar)
  const handleWhatsAppChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setNewAffiliate(prev => ({ ...prev, whatsapp: formatted }));
  };

  // Função para lidar com mudança no campo WhatsApp (Editar)
  const handleEditWhatsAppChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setEditingAffiliate(prev => ({ ...prev, whatsapp: formatted }));
  };

  const handleAddAffiliate = async () => {
    if (newAffiliate.name && newAffiliate.email && newAffiliate.password) {
      try {
        const result = await addUser({
          email: newAffiliate.email,
          password_hash: newAffiliate.password, // Senha definida pelo admin
          name: newAffiliate.name,
          commission_rate: 40.00,
          phone: unformatPhoneNumber(newAffiliate.whatsapp) || null // Remove formatação antes de salvar
          // affiliate_code será gerado automaticamente pelo trigger
        });
        
        if (result.error) {
          alert('Erro ao criar afiliado: ' + result.error);
          return;
        }

        // Recarregar dados do Supabase
        await reloadSupabaseData();
        
        setNewAffiliate({ name: '', email: '', whatsapp: '', password: '' });
        setIsAddAffiliateOpen(false);
        alert('Afiliado criado com sucesso! Credenciais: Email: ' + newAffiliate.email + ', Senha: ' + newAffiliate.password);
      } catch (error) {
        alert('Erro ao criar afiliado: ' + error);
      }
    }
  };

  const handleEditAffiliate = (affiliate: any) => {
    console.log('🔍 Afiliado selecionado para edição:', affiliate);
    setEditingAffiliate({
      id: affiliate.id,
      name: affiliate.name,
      email: affiliate.email,
      whatsapp: formatPhoneNumber(affiliate.phone || ''), // Formatar telefone ao carregar
      password: '' // Não mostrar senha atual
    });
    setIsEditAffiliateOpen(true);
  };

  const handleUpdateAffiliate = () => {
    if (!editingAffiliate || !editingAffiliate.name || !editingAffiliate.email) {
      alert('Preencha nome e email');
      return;
    }

    // Abrir modal de confirmação
    setIsConfirmUpdateOpen(true);
  };

  const handleConfirmUpdate = async () => {
    try {
      console.log('🔍 Dados do afiliado sendo editado:', editingAffiliate);
      console.log('🔍 ID do afiliado:', editingAffiliate.id);

      const updateData: any = {
        name: editingAffiliate.name,
        email: editingAffiliate.email,
        phone: unformatPhoneNumber(editingAffiliate.whatsapp) || null // Remove formatação antes de salvar
      };

      // Só atualizar senha se foi preenchida
      if (editingAffiliate.password) {
        updateData.password_hash = editingAffiliate.password;
      }

      console.log('🔍 Dados para atualização:', updateData);

      const result = await updateUser(editingAffiliate.id, updateData);
      
      if (result.error) {
        alert('Erro ao atualizar afiliado: ' + result.error);
        return;
      }

      // Recarregar dados do Supabase
      await reloadSupabaseData();
      
      setEditingAffiliate(null);
      setIsEditAffiliateOpen(false);
      setIsConfirmUpdateOpen(false);
      alert('Afiliado atualizado com sucesso!');
    } catch (error) {
      alert('Erro ao atualizar afiliado: ' + error);
    }
  };

  const handleDeleteAffiliate = (affiliate: any) => {
    setDeletingAffiliate(affiliate);
    setIsDeleteAffiliateOpen(true);
  };

  const handleConfirmDeleteAffiliate = async () => {
    if (!deletingAffiliate) return;

    try {
      const result = await deleteUser(deletingAffiliate.id);
      
      if (result.error) {
        alert('Erro ao deletar afiliado: ' + result.error);
        return;
      }

      // Recarregar dados do Supabase
      await reloadSupabaseData();
      
      setDeletingAffiliate(null);
      setIsDeleteAffiliateOpen(false);
      alert('Afiliado deletado com sucesso!');
    } catch (error) {
      alert('Erro ao deletar afiliado: ' + error);
    }
  };

  const reloadSupabaseData = async () => {
    try {
      const [dashboardResult, usersResult, leadsResult] = await Promise.all([
        getAdminDashboardData(),
        getAllUsers(),
        getAllLeads()
      ]);
      
      if (dashboardResult.data && usersResult.data && leadsResult.data) {
        setSupabaseData({
          metrics: dashboardResult.data,
          users: usersResult.data,
          leads: leadsResult.data,
          loading: false,
          error: null
        });
      }
    } catch (error) {
      console.error('Erro ao recarregar dados:', error);
    }
  };

  const getAffiliateName = (affiliateId?: string) => {
    if (!affiliateId) return 'Sem Afiliado';
    const affiliate = supabaseData.users.find(a => a.id === affiliateId);
    return affiliate?.name || 'Afiliado Desconhecido';
  };

  const getAffiliateLeadsCount = (affiliateId: string) => {
    return supabaseData.users.find(user => user.id === affiliateId)?.total_closed_leads || 0;
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
                Painel Administrativo 🔧
              </h1>
              <p className="text-sm text-muted-foreground">Gerencie todo o sistema</p>
            </div>
          </div>
          <Button variant="outline" onClick={onLogout}>
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Metrics */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-sm hover:shadow-energy transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Afiliados</p>
                  <p className="text-3xl font-bold text-primary">{metrics.totalAffiliates}</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Leads Gerados</p>
                  <p className="text-3xl font-bold text-energy">{metrics.totalLeads}</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Clientes Fechados</p>
                  <p className="text-3xl font-bold text-accent">{metrics.totalClosed}</p>
                </div>
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-energy transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Comissões a Pagar</p>
                  <p className="text-3xl font-bold text-destructive">
                    R$ {metrics.totalCommissions.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Message */}
        {supabaseData.error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-800">
                <XCircle className="w-5 h-5" />
                <span>Erro ao carregar dados: {supabaseData.error}</span>
              </div>
            </CardContent>
          </Card>
        )}


        {/* Affiliate Management */}
        <Card className="shadow-sm border-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Gerenciamento de Afiliados
            </CardTitle>
            <div className="flex gap-2 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={affiliateSearchTerm}
                  onChange={(e) => setAffiliateSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Dialog open={isAddAffiliateOpen} onOpenChange={setIsAddAffiliateOpen}>
                <DialogTrigger asChild>
                  <Button variant="energy">
                    <UserPlus className="w-4 h-4" />
                    Adicionar Afiliado
                  </Button>
                </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Afiliado</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={newAffiliate.name}
                      onChange={(e) => setNewAffiliate(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nome do afiliado"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newAffiliate.email}
                      onChange={(e) => setNewAffiliate(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="whatsapp">WhatsApp (opcional)</Label>
                    <Input
                      id="whatsapp"
                      value={newAffiliate.whatsapp}
                      onChange={(e) => handleWhatsAppChange(e.target.value)}
                      placeholder="(11) 99999-9999"
                      maxLength={15}
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Senha Inicial</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newAffiliate.password}
                      onChange={(e) => setNewAffiliate(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Senha para primeiro acesso"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      O afiliado receberá esta senha através de instruções separadas
                    </p>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsAddAffiliateOpen(false)}>
                      Cancelar
                    </Button>
                    <Button variant="energy" onClick={handleAddAffiliate}>
                      Adicionar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Modal de Editar Afiliado */}
            <Dialog open={isEditAffiliateOpen} onOpenChange={setIsEditAffiliateOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Editar Afiliado</DialogTitle>
                </DialogHeader>
                {editingAffiliate && (
                  <div className="space-y-4 pt-4">
                    <div>
                      <Label htmlFor="edit-name">Nome</Label>
                      <Input
                        id="edit-name"
                        value={editingAffiliate.name}
                        onChange={(e) => setEditingAffiliate(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Nome do afiliado"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-email">Email</Label>
                      <Input
                        id="edit-email"
                        type="email"
                        value={editingAffiliate.email}
                        onChange={(e) => setEditingAffiliate(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="email@exemplo.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-whatsapp">WhatsApp (opcional)</Label>
                      <Input
                        id="edit-whatsapp"
                        value={editingAffiliate.whatsapp || ''}
                        onChange={(e) => handleEditWhatsAppChange(e.target.value)}
                        placeholder="(11) 99999-9999"
                        maxLength={15}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-password">Nova Senha (opcional)</Label>
                      <Input
                        id="edit-password"
                        type="password"
                        value={editingAffiliate.password}
                        onChange={(e) => setEditingAffiliate(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Deixe em branco para manter a senha atual"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Deixe em branco para manter a senha atual
                      </p>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setIsEditAffiliateOpen(false)}>
                        Cancelar
                      </Button>
                      <Button variant="energy" onClick={handleUpdateAffiliate}>
                        Salvar Alterações
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Modal de Confirmar Atualização */}
            <Dialog open={isConfirmUpdateOpen} onOpenChange={setIsConfirmUpdateOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Confirmar Atualização</DialogTitle>
                </DialogHeader>
                {editingAffiliate && (
                  <div className="space-y-4 pt-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-blue-800 font-medium">
                        ✅ Deseja realmente atualizar este afiliado?
                      </p>
                      <p className="text-blue-600 text-sm mt-2">
                        <strong>Nome:</strong> {editingAffiliate.name}<br/>
                        <strong>Email:</strong> {editingAffiliate.email}
                      </p>
                      <p className="text-blue-600 text-xs mt-2">
                        As alterações serão salvas permanentemente no banco de dados.
                      </p>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setIsConfirmUpdateOpen(false)}>
                        Cancelar
                      </Button>
                      <Button 
                        variant="energy" 
                        onClick={handleConfirmUpdate}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Confirmar Atualização
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Modal de Confirmar Exclusão */}
            <Dialog open={isDeleteAffiliateOpen} onOpenChange={setIsDeleteAffiliateOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Confirmar Exclusão</DialogTitle>
                </DialogHeader>
                {deletingAffiliate && (
                  <div className="space-y-4 pt-4">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-800 font-medium">
                        ⚠️ Tem certeza que deseja excluir este afiliado?
                      </p>
                      <p className="text-red-600 text-sm mt-2">
                        <strong>Nome:</strong> {deletingAffiliate.name}<br/>
                        <strong>Email:</strong> {deletingAffiliate.email}
                      </p>
                      <p className="text-red-600 text-xs mt-2">
                        Esta ação não pode ser desfeita. Todos os dados do afiliado serão removidos permanentemente.
                      </p>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setIsDeleteAffiliateOpen(false)}>
                        Cancelar
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={handleConfirmDeleteAffiliate}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir Afiliado
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {/* Indicador de resultados */}
            <div className="mb-4 text-sm text-muted-foreground">
              {supabaseData.loading ? (
                "Carregando afiliados..."
              ) : (
                `${filteredAffiliates.length} de ${supabaseData.users.length} afiliados encontrados`
              )}
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>WhatsApp</TableHead>
                    <TableHead>Leads Fechados</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supabaseData.loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Carregando afiliados...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredAffiliates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Search className="w-8 h-8 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {affiliateSearchTerm 
                              ? 'Nenhum afiliado encontrado com o termo de busca'
                              : 'Nenhum afiliado cadastrado ainda'
                            }
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAffiliates.map((affiliate) => (
                      <TableRow key={affiliate.id}>
                        <TableCell className="font-medium">{affiliate.name}</TableCell>
                        <TableCell>{affiliate.email}</TableCell>
                        <TableCell>{displayPhoneNumber(affiliate.phone || '') || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-energy/10 text-energy">
                            {affiliate.total_closed_leads || 0}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEditAffiliate(affiliate)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDeleteAffiliate(affiliate)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Lead Management */}
        <Card className="shadow-sm border-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-energy" />
              Gerenciamento de Leads
            </CardTitle>
            <div className="flex gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por nome do cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <Select value={selectedAffiliateFilter} onValueChange={setSelectedAffiliateFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por afiliado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os afiliados</SelectItem>
                  {supabaseData.users.map((affiliate) => (
                    <SelectItem key={affiliate.id} value={affiliate.id}>
                      {affiliate.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedStatusFilter} onValueChange={setSelectedStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="novo">Novo</SelectItem>
                  <SelectItem value="contatar">Contatar</SelectItem>
                  <SelectItem value="em_negociacao">Em Negociação</SelectItem>
                  <SelectItem value="fechado">Fechado</SelectItem>
                  <SelectItem value="perdido">Perdido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {/* Indicador de resultados */}
            <div className="mb-4 text-sm text-muted-foreground">
              {supabaseData.loading ? (
                "Carregando leads..."
              ) : (
                `${filteredLeads.length} de ${supabaseData.leads.length} leads encontrados`
              )}
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Afiliado</TableHead>
                    <TableHead>Valor da Conta</TableHead>
                    <TableHead>Economia Anual</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Conta de Energia</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supabaseData.loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Carregando leads...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredLeads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Search className="w-8 h-8 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {searchTerm || selectedAffiliateFilter !== 'all' || selectedStatusFilter !== 'all' 
                              ? 'Nenhum lead encontrado com os filtros aplicados'
                              : 'Nenhum lead cadastrado ainda'
                            }
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>{lead.client_name || 'Nome não informado'}</TableCell>
                        <TableCell>{getAffiliateName(lead.affiliate_id)}</TableCell>
                        <TableCell>R$ {lead.energy_bill_value.toFixed(2)}</TableCell>
                        <TableCell className="font-medium text-energy">
                          R$ {lead.yearly_economy.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={lead.status}
                            onValueChange={(value) => onUpdateLead(lead.id, value as Lead['status'])}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="novo">Novo</SelectItem>
                              <SelectItem value="contatar">Contatar</SelectItem>
                              <SelectItem value="em_negociacao">Em Negociação</SelectItem>
                              <SelectItem value="fechado">Fechado</SelectItem>
                              <SelectItem value="perdido">Perdido</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {lead.energy_bill_file ? (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => window.open(lead.energy_bill_file, '_blank')} 
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
                          {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};