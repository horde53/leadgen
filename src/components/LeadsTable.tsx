import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Phone, Globe, MapPin, Users, Download, MessageCircle } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  phone: string;
  website?: string;
  instagram?: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

interface LeadsTableProps {
  results: Lead[];
}

export const LeadsTable: React.FC<LeadsTableProps> = ({ results }) => {
  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${cleanPhone}`, '_blank');
  };

  const handleWebsite = (website: string) => {
    const url = website.startsWith('http') ? website : `https://${website}`;
    window.open(url, '_blank');
  };

  const handleInstagram = (instagram: string) => {
    const handle = instagram.startsWith('@') ? instagram.slice(1) : instagram;
    window.open(`https://instagram.com/${handle}`, '_blank');
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Nome', 'Categoria', 'Classificação', 'Avaliações', 'Telefone', 'Website', 'Instagram', 'Endereço'],
      ...results.map(lead => [
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
  };

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Leads Encontrados
            </CardTitle>
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{results.length}</div>
              <div className="text-sm text-muted-foreground">Total de Leads</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {results.filter(r => r.phone).length}
              </div>
              <div className="text-sm text-muted-foreground">Com Telefone</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {results.filter(r => r.website).length}
              </div>
              <div className="text-sm text-muted-foreground">Com Website</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600">
                {results.filter(r => r.instagram).length}
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
                {results.map((lead) => (
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
                            onClick={() => handleWebsite(lead.website!)}
                            className="h-8 w-8 p-0"
                          >
                            <Globe className="w-4 h-4" />
                          </Button>
                        )}
                        {lead.instagram && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleInstagram(lead.instagram!)}
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
                          onClick={() => handleCall(lead.phone)}
                          className="h-8 w-8 p-0"
                        >
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleWhatsApp(lead.phone)}
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
  );
};

