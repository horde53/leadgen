import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, LogOut, Search, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { GoogleMapsScraper } from './GoogleMapsScraper';
import { MapOnlyView } from './MapOnlyView';
import { Star, Phone, Globe, MapPin, Users, Download, MessageCircle, Target as TargetIcon } from 'lucide-react';
import type { AppData } from '@/types';

interface AffiliateLeadGeneratorProps {
  onBack: () => void;
  onLogout: () => void;
  appData: AppData;
}

export const AffiliateLeadGenerator: React.FC<AffiliateLeadGeneratorProps> = ({
  onBack,
  onLogout,
  appData
}) => {
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [showLeadsTable, setShowLeadsTable] = useState(false);
  const [scrapedResults, setScrapedResults] = useState<any[]>([]);
  const [searchData, setSearchData] = useState({
    niche: '',
    location: ''
  });

  // DEBUG: Monitorar mudanças no estado do modal
  useEffect(() => {
    console.log('🔍 DEBUG: showResultsModal mudou para:', showResultsModal);
    if (showResultsModal) {
      console.log('✅ DEBUG: Modal está TRUE - deve estar visível');
    } else {
      console.log('❌ DEBUG: Modal está FALSE - deve estar oculto');
    }
  }, [showResultsModal]);


  const handleStartSearch = () => {
    setShowSearchModal(true);
  };

  const handleSearchSubmit = () => {
    if (!searchData.niche.trim() || !searchData.location.trim()) {
      alert('Por favor, preencha todos os campos');
      return;
    }
    
    setShowSearchModal(false);
    setShowSearchResults(true);
  };

  // Gerar dados mockados para fallback
  const generateMockResults = (query: string, location: string) => {
    const mockResults = [
      {
        id: '1',
        name: `${query} Central`,
        category: query,
        rating: '4.3',
        reviewCount: 929,
        phone: '(11) 99999-9999',
        website: 'www.exemplo.com',
        instagram: '@exemplo',
        address: `${location}, SP`,
        latitude: -23.5505,
        longitude: -46.6333
      },
      {
        id: '2',
        name: `${query} Premium`,
        category: query,
        rating: '4.7',
        reviewCount: 156,
        phone: '(11) 88888-8888',
        website: 'www.premium.com',
        instagram: '@premium',
        address: `${location}, SP`,
        latitude: -23.5505,
        longitude: -46.6333
      },
      {
        id: '3',
        name: `${query} Express`,
        category: query,
        rating: '4.1',
        reviewCount: 89,
        phone: '(11) 77777-7777',
        website: undefined,
        instagram: '@express',
        address: `${location}, SP`,
        latitude: -23.5505,
        longitude: -46.6333
      }
    ];
    return mockResults;
  };

  const handleScrapedResults = async (searchData: { query: string; location: string }) => {
    try {
      console.log('🎯 Iniciando scraping para:', searchData.query, 'em', searchData.location);
      
      // Chama a API de scraping em background
      const response = await fetch('/api/scrape-maps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchData.query,
          location: searchData.location
        })
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Scraping realizado com sucesso:', data.count, 'leads encontrados');
        setScrapedResults(data.leads);
        // Aguarda um pouco para a animação desaparecer antes de mostrar o modal
        setTimeout(() => {
          setShowResultsModal(true);
        }, 500);
      } else {
        console.error('❌ Erro no scraping:', data.error);
        // Fallback para dados mockados em caso de erro
        const mockResults = generateMockResults(searchData.query, searchData.location);
        setScrapedResults(mockResults);
        setTimeout(() => {
          setShowResultsModal(true);
        }, 500);
      }
    } catch (error) {
      console.error('❌ Erro na requisição:', error);
      // Fallback para dados mockados em caso de erro
      const mockResults = generateMockResults(searchData.query, searchData.location);
      setScrapedResults(mockResults);
      setTimeout(() => {
        setShowResultsModal(true);
      }, 500);
    }
  };

  // FUNÇÃO ÚNICA PARA FECHAR O MODAL - SÓ PODE SER CHAMADA POR CLIQUE!
  const handleCloseModal = () => {
    console.log('🎯 handleCloseModal chamado - FECHANDO MODAL POR CLIQUE');
    setShowResultsModal(false);
    setShowLeadsTable(true);
  };

  const handleBackToHome = () => {
    setShowSearchResults(false);
    setShowLeadsTable(false);
    setSearchData({ niche: '', location: '' });
  };

  const handleNewSearch = () => {
    setShowLeadsTable(false);
    setShowSearchResults(false);
    setSearchData({ niche: '', location: '' });
  };

  // Se estiver mostrando a tabela de leads
  if (showLeadsTable) {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-energy rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                  Leads Encontrados: {scrapedResults.length}
              </h1>
                <p className="text-sm text-muted-foreground">
                  {searchData.niche} em {searchData.location}
                </p>
            </div>
          </div>
          <div className="flex gap-2">
              <Button variant="outline" onClick={handleNewSearch}>
                <Search className="w-4 h-4" />
                Nova Busca
            </Button>
            <Button variant="outline" onClick={onLogout}>
                <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

        {/* Tabela de Leads */}
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            {/* Header com estatísticas */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Leads Encontrados
                  </CardTitle>
                  <Button onClick={() => {
                    const csvContent = [
                      ['Nome', 'Categoria', 'Classificação', 'Avaliações', 'Telefone', 'Website', 'Instagram', 'Endereço'],
                      ...scrapedResults.map(lead => [
                        lead.name,
                        lead.category,
                        lead.rating.toString(),
                        lead.reviewCount.toString(),
                        lead.phone,
                        lead.website || '',
                        lead.instagram || '',
                        lead.address
                      ])
                    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const link = document.createElement('a');
                    const url = URL.createObjectURL(blob);
                    link.setAttribute('href', url);
                    link.setAttribute('download', `leads_${new Date().toISOString().split('T')[0]}.csv`);
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{scrapedResults.length}</div>
                    <div className="text-sm text-muted-foreground">Total de Leads</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {scrapedResults.filter(r => r.phone).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Com Telefone</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {scrapedResults.filter(r => r.website).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Com Website</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-600">
                      {scrapedResults.filter(r => r.instagram).length}
                  </div>
                    <div className="text-sm text-muted-foreground">Com Instagram</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabela de Leads */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Classificação</TableHead>
                        <TableHead>Redes/Site</TableHead>
                        <TableHead>Avaliações</TableHead>
                        <TableHead>Endereço</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scrapedResults.map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell className="font-medium">
                            <div className="max-w-[200px]">
                              <div className="font-semibold truncate">{lead.name}</div>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <Badge variant="outline">{lead.category}</Badge>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="font-medium">{lead.rating}</span>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex gap-1">
                              {lead.website && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    const url = lead.website!.startsWith('http') ? lead.website! : `https://${lead.website!}`;
                                    window.open(url, '_blank');
                                  }}
                                  className="h-8 w-8 p-0"
                                >
                                  <Globe className="w-4 h-4" />
                                </Button>
                              )}
                              {lead.instagram && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    const handle = lead.instagram!.startsWith('@') ? lead.instagram!.slice(1) : lead.instagram!;
                                    window.open(`https://instagram.com/${handle}`, '_blank');
                                  }}
                                  className="h-8 w-8 p-0 text-pink-600"
                                >
                                  <span className="text-sm">📷</span>
                                </Button>
                              )}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {lead.reviewCount.toLocaleString()} avaliações
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="max-w-[250px]">
                              <div className="flex items-start gap-1">
                                <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                                <span className="text-sm text-muted-foreground line-clamp-2">
                                  {lead.address}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-mono">{lead.phone}</span>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(`tel:${lead.phone}`, '_self')}
                                className="h-8 w-8 p-0"
                              >
                                <Phone className="w-4 h-4" />
                              </Button>
                            <Button
                              size="sm"
                                variant="outline"
                                onClick={() => {
                                  const cleanPhone = lead.phone.replace(/\D/g, '');
                                  window.open(`https://wa.me/55${cleanPhone}`, '_blank');
                                }}
                                className="h-8 w-8 p-0 text-green-600"
                              >
                                <MessageCircle className="w-4 h-4" />
                            </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Se estiver mostrando resultados, exibir o scraper
  if (showSearchResults) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-border">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-energy rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Buscando: {searchData.niche} em {searchData.location}
                </h1>
                <p className="text-sm text-muted-foreground">Encontre empresas para energia solar</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleBackToHome}>
                <ArrowLeft className="w-4 h-4" />
                Nova Busca
              </Button>
              <Button variant="outline" onClick={onLogout}>
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
                  </div>
                </div>
        </header>

        {/* Conteúdo Principal - Mapa em tela cheia */}
        <div className="h-[calc(100vh-80px)] w-full relative">
          <MapOnlyView 
            location={searchData.location}
            searchTerm={searchData.niche}
            onSearchComplete={(searchData) => handleScrapedResults(searchData)}
          />
          
          {/* Confetes explodindo */}
          {showResultsModal && (
            <div className="absolute inset-0 pointer-events-none z-[99]">
              {/* Confetes coloridos com animação inline */}
              <div 
                className="absolute w-3 h-3 bg-red-500 rounded-full" 
                style={{ 
                  left: '10%', 
                  top: '10%',
                  animation: 'confettiFall 3s ease-out forwards',
                  animationDelay: '0s'
                }}
              ></div>
              <div 
                className="absolute w-3 h-3 bg-blue-500 rounded-full" 
                style={{ 
                  left: '20%', 
                  top: '15%',
                  animation: 'confettiFall 3s ease-out forwards',
                  animationDelay: '0.1s'
                }}
              ></div>
              <div 
                className="absolute w-3 h-3 bg-green-500 rounded-full" 
                style={{ 
                  left: '30%', 
                  top: '8%',
                  animation: 'confettiFall 3s ease-out forwards',
                  animationDelay: '0.2s'
                }}
              ></div>
              <div 
                className="absolute w-3 h-3 bg-yellow-500 rounded-full" 
                style={{ 
                  left: '40%', 
                  top: '12%',
                  animation: 'confettiFall 3s ease-out forwards',
                  animationDelay: '0.3s'
                }}
              ></div>
              <div 
                className="absolute w-3 h-3 bg-purple-500 rounded-full" 
                style={{ 
                  left: '50%', 
                  top: '6%',
                  animation: 'confettiFall 3s ease-out forwards',
                  animationDelay: '0.4s'
                }}
              ></div>
              <div 
                className="absolute w-3 h-3 bg-pink-500 rounded-full" 
                style={{ 
                  left: '60%', 
                  top: '14%',
                  animation: 'confettiFall 3s ease-out forwards',
                  animationDelay: '0.5s'
                }}
              ></div>
              <div 
                className="absolute w-3 h-3 bg-orange-500 rounded-full" 
                style={{ 
                  left: '70%', 
                  top: '9%',
                  animation: 'confettiFall 3s ease-out forwards',
                  animationDelay: '0.6s'
                }}
              ></div>
              <div 
                className="absolute w-3 h-3 bg-cyan-500 rounded-full" 
                style={{ 
                  left: '80%', 
                  top: '11%',
                  animation: 'confettiFall 3s ease-out forwards',
                  animationDelay: '0.7s'
                }}
              ></div>
              <div 
                className="absolute w-3 h-3 bg-red-500 rounded-full" 
                style={{ 
                  left: '90%', 
                  top: '7%',
                  animation: 'confettiFall 3s ease-out forwards',
                  animationDelay: '0.8s'
                }}
              ></div>
              
              {/* Mais confetes */}
              <div 
                className="absolute w-3 h-3 bg-blue-500 rounded-full" 
                style={{ 
                  left: '15%', 
                  top: '20%',
                  animation: 'confettiFall 3s ease-out forwards',
                  animationDelay: '0.9s'
                }}
              ></div>
              <div 
                className="absolute w-3 h-3 bg-green-500 rounded-full" 
                style={{ 
                  left: '25%', 
                  top: '18%',
                  animation: 'confettiFall 3s ease-out forwards',
                  animationDelay: '1s'
                }}
              ></div>
              <div 
                className="absolute w-3 h-3 bg-yellow-500 rounded-full" 
                style={{ 
                  left: '35%', 
                  top: '22%',
                  animation: 'confettiFall 3s ease-out forwards',
                  animationDelay: '1.1s'
                }}
              ></div>
              <div 
                className="absolute w-3 h-3 bg-purple-500 rounded-full" 
                style={{ 
                  left: '45%', 
                  top: '16%',
                  animation: 'confettiFall 3s ease-out forwards',
                  animationDelay: '1.2s'
                }}
              ></div>
              <div 
                className="absolute w-3 h-3 bg-pink-500 rounded-full" 
                style={{ 
                  left: '55%', 
                  top: '24%',
                  animation: 'confettiFall 3s ease-out forwards',
                  animationDelay: '1.3s'
                }}
              ></div>
              <div 
                className="absolute w-3 h-3 bg-orange-500 rounded-full" 
                style={{ 
                  left: '65%', 
                  top: '19%',
                  animation: 'confettiFall 3s ease-out forwards',
                  animationDelay: '1.4s'
                }}
              ></div>
              <div 
                className="absolute w-3 h-3 bg-cyan-500 rounded-full" 
                style={{ 
                  left: '75%', 
                  top: '21%',
                  animation: 'confettiFall 3s ease-out forwards',
                  animationDelay: '1.5s'
                }}
              ></div>
              <div 
                className="absolute w-3 h-3 bg-red-500 rounded-full" 
                style={{ 
                  left: '85%', 
                  top: '17%',
                  animation: 'confettiFall 3s ease-out forwards',
                  animationDelay: '1.6s'
                }}
              ></div>
              <div 
                className="absolute w-3 h-3 bg-blue-500 rounded-full" 
                style={{ 
                  left: '95%', 
                  top: '23%',
                  animation: 'confettiFall 3s ease-out forwards',
                  animationDelay: '1.7s'
                }}
              ></div>
              
              {/* MUITO MAIS CONFETES! */}
              <div className="absolute w-2 h-2 bg-green-500 rounded-full" style={{ left: '5%', top: '25%', animation: 'confettiFall 3s ease-out forwards', animationDelay: '1.8s' }}></div>
              <div className="absolute w-2 h-2 bg-yellow-500 rounded-full" style={{ left: '12%', top: '30%', animation: 'confettiFall 3s ease-out forwards', animationDelay: '1.9s' }}></div>
              <div className="absolute w-2 h-2 bg-purple-500 rounded-full" style={{ left: '22%', top: '28%', animation: 'confettiFall 3s ease-out forwards', animationDelay: '2s' }}></div>
              <div className="absolute w-2 h-2 bg-pink-500 rounded-full" style={{ left: '32%', top: '32%', animation: 'confettiFall 3s ease-out forwards', animationDelay: '2.1s' }}></div>
              <div className="absolute w-2 h-2 bg-orange-500 rounded-full" style={{ left: '42%', top: '26%', animation: 'confettiFall 3s ease-out forwards', animationDelay: '2.2s' }}></div>
              <div className="absolute w-2 h-2 bg-cyan-500 rounded-full" style={{ left: '52%', top: '34%', animation: 'confettiFall 3s ease-out forwards', animationDelay: '2.3s' }}></div>
              <div className="absolute w-2 h-2 bg-red-500 rounded-full" style={{ left: '62%', top: '29%', animation: 'confettiFall 3s ease-out forwards', animationDelay: '2.4s' }}></div>
              <div className="absolute w-2 h-2 bg-blue-500 rounded-full" style={{ left: '72%', top: '31%', animation: 'confettiFall 3s ease-out forwards', animationDelay: '2.5s' }}></div>
              <div className="absolute w-2 h-2 bg-green-500 rounded-full" style={{ left: '82%', top: '27%', animation: 'confettiFall 3s ease-out forwards', animationDelay: '2.6s' }}></div>
              <div className="absolute w-2 h-2 bg-yellow-500 rounded-full" style={{ left: '92%', top: '33%', animation: 'confettiFall 3s ease-out forwards', animationDelay: '2.7s' }}></div>
              
              {/* CONFETES EXTRAS - LINHA 3 */}
              <div className="absolute w-2 h-2 bg-purple-500 rounded-full" style={{ left: '8%', top: '40%', animation: 'confettiFall 3s ease-out forwards', animationDelay: '2.8s' }}></div>
              <div className="absolute w-2 h-2 bg-pink-500 rounded-full" style={{ left: '18%', top: '45%', animation: 'confettiFall 3s ease-out forwards', animationDelay: '2.9s' }}></div>
              <div className="absolute w-2 h-2 bg-orange-500 rounded-full" style={{ left: '28%', top: '42%', animation: 'confettiFall 3s ease-out forwards', animationDelay: '3s' }}></div>
              <div className="absolute w-2 h-2 bg-cyan-500 rounded-full" style={{ left: '38%', top: '48%', animation: 'confettiFall 3s ease-out forwards', animationDelay: '3.1s' }}></div>
              <div className="absolute w-2 h-2 bg-red-500 rounded-full" style={{ left: '48%', top: '44%', animation: 'confettiFall 3s ease-out forwards', animationDelay: '3.2s' }}></div>
              <div className="absolute w-2 h-2 bg-blue-500 rounded-full" style={{ left: '58%', top: '46%', animation: 'confettiFall 3s ease-out forwards', animationDelay: '3.3s' }}></div>
              <div className="absolute w-2 h-2 bg-green-500 rounded-full" style={{ left: '68%', top: '43%', animation: 'confettiFall 3s ease-out forwards', animationDelay: '3.4s' }}></div>
              <div className="absolute w-2 h-2 bg-yellow-500 rounded-full" style={{ left: '78%', top: '47%', animation: 'confettiFall 3s ease-out forwards', animationDelay: '3.5s' }}></div>
              <div className="absolute w-2 h-2 bg-purple-500 rounded-full" style={{ left: '88%', top: '41%', animation: 'confettiFall 3s ease-out forwards', animationDelay: '3.6s' }}></div>
              <div className="absolute w-2 h-2 bg-pink-500 rounded-full" style={{ left: '98%', top: '45%', animation: 'confettiFall 3s ease-out forwards', animationDelay: '3.7s' }}></div>
              
              {/* CONFETES EXTRAS - LINHA 4 */}
              <div className="absolute w-2 h-2 bg-orange-500 rounded-full" style={{ left: '3%', top: '55%', animation: 'confettiFall 3s ease-out forwards', animationDelay: '3.8s' }}></div>
              <div className="absolute w-2 h-2 bg-cyan-500 rounded-full" style={{ left: '13%', top: '58%', animation: 'confettiFall 3s ease-out forwards', animationDelay: '3.9s' }}></div>
              <div className="absolute w-2 h-2 bg-red-500 rounded-full" style={{ left: '23%', top: '52%', animation: 'confettiFall 3s ease-out forwards', animationDelay: '4s' }}></div>
              <div className="absolute w-2 h-2 bg-blue-500 rounded-full" style={{ left: '33%', top: '56%', animation: 'confettiFall 3s ease-out forwards', animationDelay: '4.1s' }}></div>
              <div className="absolute w-2 h-2 bg-green-500 rounded-full" style={{ left: '43%', top: '54%', animation: 'confettiFall 3s ease-out forwards', animationDelay: '4.2s' }}></div>
              <div className="absolute w-2 h-2 bg-yellow-500 rounded-full" style={{ left: '53%', top: '59%', animation: 'confettiFall 3s ease-out forwards', animationDelay: '4.3s' }}></div>
              <div className="absolute w-2 h-2 bg-purple-500 rounded-full" style={{ left: '63%', top: '51%', animation: 'confettiFall 3s ease-out forwards', animationDelay: '4.4s' }}></div>
              <div className="absolute w-2 h-2 bg-pink-500 rounded-full" style={{ left: '73%', top: '55%', animation: 'confettiFall 3s ease-out forwards', animationDelay: '4.5s' }}></div>
              <div className="absolute w-2 h-2 bg-orange-500 rounded-full" style={{ left: '83%', top: '53%', animation: 'confettiFall 3s ease-out forwards', animationDelay: '4.6s' }}></div>
              <div className="absolute w-2 h-2 bg-cyan-500 rounded-full" style={{ left: '93%', top: '57%', animation: 'confettiFall 3s ease-out forwards', animationDelay: '4.7s' }}></div>
              
              {/* CONFETES EXTRAS - LINHA 5 */}
              <div className="absolute w-2 h-2 bg-red-500 rounded-full" style={{ left: '7%', top: '65%', animation: 'confettiFall 3s ease-out forwards', animationDelay: '4.8s' }}></div>
              <div className="absolute w-2 h-2 bg-blue-500 rounded-full" style={{ left: '17%', top: '68%', animation: 'confettiFall 3s ease-out forwards', animationDelay: '4.9s' }}></div>
              <div className="absolute w-2 h-2 bg-green-500 rounded-full" style={{ left: '27%', top: '62%', animation: 'confettiFall 3s ease-out forwards', animationDelay: '5s' }}></div>
              <div className="absolute w-2 h-2 bg-yellow-500 rounded-full" style={{ left: '37%', top: '66%', animation: 'confettiFall 3s ease-out forwards', animationDelay: '5.1s' }}></div>
              <div className="absolute w-2 h-2 bg-purple-500 rounded-full" style={{ left: '47%', top: '64%', animation: 'confettiFall 3s ease-out forwards', animationDelay: '5.2s' }}></div>
              <div className="absolute w-2 h-2 bg-pink-500 rounded-full" style={{ left: '57%', top: '69%', animation: 'confettiFall 3s ease-out forwards', animationDelay: '5.3s' }}></div>
              <div className="absolute w-2 h-2 bg-orange-500 rounded-full" style={{ left: '67%', top: '61%', animation: 'confettiFall 3s ease-out forwards', animationDelay: '5.4s' }}></div>
              <div className="absolute w-2 h-2 bg-cyan-500 rounded-full" style={{ left: '77%', top: '65%', animation: 'confettiFall 3s ease-out forwards', animationDelay: '5.5s' }}></div>
              <div className="absolute w-2 h-2 bg-red-500 rounded-full" style={{ left: '87%', top: '63%', animation: 'confettiFall 3s ease-out forwards', animationDelay: '5.6s' }}></div>
              <div className="absolute w-2 h-2 bg-blue-500 rounded-full" style={{ left: '97%', top: '67%', animation: 'confettiFall 3s ease-out forwards', animationDelay: '5.7s' }}></div>
            </div>
          )}

          {/* Modal de Resultados - DENTRO do container do mapa */}
          {showResultsModal && (
            <div 
              className="absolute inset-0 bg-black/50 flex items-center justify-center z-[100]" 
              style={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: 'auto'
              }}
            >
              <div 
                className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl border-4 border-red-500"
                style={{ 
                  position: 'relative'
                }}
              >
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Target className="w-10 h-10 text-green-600" />
                  </div>
                  
                  <div>
                    <h3 className="text-3xl font-bold text-foreground mb-2">
                      🎉 Sua busca tem {scrapedResults.length} leads!
                    </h3>
                    <p className="text-muted-foreground text-lg">
                      Encontramos <strong>{scrapedResults.length} estabelecimentos</strong> de <strong>{searchData.niche}</strong> em <strong>{searchData.location}</strong>
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-bold text-green-600">{scrapedResults.filter(r => r.phone).length}</div>
                        <div className="text-muted-foreground">Com Telefone</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-blue-600">{scrapedResults.filter(r => r.website).length}</div>
                        <div className="text-muted-foreground">Com Website</div>
                      </div>
              </div>
            </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleCloseModal} 
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Ver Todos os Leads
                </Button>
              </div>
                </div>
                          </div>
                    </div>
                  )}
        </div>
      </div>
    );
  }

  // Tela inicial
  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-energy rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Gerador de Leads B2B 🎯
              </h1>
              <p className="text-sm text-muted-foreground">Encontre empresas para energia solar</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
              Voltar
                </Button>
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="w-4 h-4" />
              Sair
                </Button>
              </div>
            </div>
      </header>

      {/* Conteúdo Principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          {/* Mensagem Principal */}
          <Card className="shadow-energy border-0 mb-8">
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 bg-gradient-energy rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold text-foreground mb-2">
                Busque por Negócios Locais e Profissionais
              </CardTitle>
              <p className="text-lg text-muted-foreground">
                Encontre estabelecimentos ideais para oferecer energia solar
              </p>
            </CardHeader>
            <CardContent>
                <Button
                size="lg" 
                className="w-full sm:w-auto px-8 py-3 text-lg"
                onClick={handleStartSearch}
              >
                <Search className="w-5 h-5 mr-2" />
                Buscar Estabelecimentos
                </Button>
            </CardContent>
          </Card>

          {/* Cards de Informação */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Localização Precisa</h3>
                <p className="text-sm text-muted-foreground">
                  Busque em qualquer cidade ou região do Brasil
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Dados Completos</h3>
                <p className="text-sm text-muted-foreground">
                  Telefone, endereço, website e redes sociais
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-semibold mb-2">Foco em Resultados</h3>
                <p className="text-sm text-muted-foreground">
                  Encontre leads qualificados para energia solar
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
              </div>

      {/* Modal de Busca */}
      <Dialog open={showSearchModal} onOpenChange={setShowSearchModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Buscar Estabelecimentos
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="niche">Que tipo de negócio você está procurando?</Label>
                  <Input
                id="niche"
                placeholder="Ex: Padarias, Petshop, Elétrica, Farmácias..."
                value={searchData.niche}
                onChange={(e) => setSearchData(prev => ({ ...prev, niche: e.target.value }))}
              />
                </div>

                <div>
                  <Label htmlFor="location">Onde estão esses negócios?</Label>
                  <Input
                    id="location"
                placeholder="Ex: São Paulo, Curitiba, Copacabana, Pinheiros..."
                value={searchData.location}
                onChange={(e) => setSearchData(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>

            <div className="flex gap-2 pt-4">
                  <Button 
                onClick={handleSearchSubmit} 
                className="flex-1"
                disabled={!searchData.niche.trim() || !searchData.location.trim()}
              >
                <Search className="w-4 h-4 mr-2" />
                Começar Busca
                  </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowSearchModal(false)}
              >
                Cancelar
                    </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
