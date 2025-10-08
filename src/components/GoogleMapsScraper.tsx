import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Loader2, MapPin, Phone, Globe, Star, Users, Search } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix para ícones do Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface ScrapedLead {
  id: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  instagram?: string;
  rating?: number;
  reviewCount?: number;
  businessType: string;
  latitude?: number;
  longitude?: number;
}

interface GoogleMapsScraperProps {
  onResults?: (results: ScrapedLead[]) => void;
  initialSearchTerm?: string;
  initialLocation?: string;
}

export const GoogleMapsScraper: React.FC<GoogleMapsScraperProps> = ({ 
  onResults, 
  initialSearchTerm = '', 
  initialLocation = '' 
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [location, setLocation] = useState(initialLocation);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<ScrapedLead[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-15.7801, -47.9292]); // Brasília
  const [searchProgress, setSearchProgress] = useState(0);

  // Carregar resultados do cache local
  useEffect(() => {
    const cachedResults = localStorage.getItem('scrapedResults');
    if (cachedResults) {
      try {
        const parsedResults = JSON.parse(cachedResults);
        setResults(parsedResults);
        if (onResults) {
          onResults(parsedResults);
        }
      } catch (error) {
        console.error('Erro ao carregar cache:', error);
      }
    }
  }, [onResults]);

  // Iniciar busca automaticamente se receber dados iniciais
  useEffect(() => {
    if (initialSearchTerm && initialLocation) {
      handleSearch();
    }
  }, [initialSearchTerm, initialLocation]);

  // Geocoding gratuito com Nominatim
  const geocodeLocation = async (address: string): Promise<[number, number] | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const data = await response.json();
      
      if (data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
      return null;
    } catch (error) {
      console.error('Erro no geocoding:', error);
      return null;
    }
  };

  // Simular scrapping do Google Maps (por enquanto)
  const simulateScraping = async (term: string, loc: string): Promise<ScrapedLead[]> => {
    const mockResults: ScrapedLead[] = [
      {
        id: '1',
        name: 'Bakery Mine Flavor',
        address: 'CL 22, Quadra 13 Conjunto G, 01 - Sobradinho, Brasília - DF',
        phone: '(61) 3387-5565',
        website: 'www.bakerymine.com',
        instagram: '@bakerymine',
        rating: 4.3,
        reviewCount: 929,
        businessType: 'Panificadora',
        latitude: -15.7801,
        longitude: -47.9292
      },
      {
        id: '2',
        name: 'Padaria São José',
        address: 'SQN 304, Bloco A - Asa Norte, Brasília - DF',
        phone: '(61) 3345-6789',
        rating: 4.1,
        reviewCount: 456,
        businessType: 'Panificadora',
        latitude: -15.7801,
        longitude: -47.9292
      },
      {
        id: '3',
        name: 'Confeitaria Doce Vida',
        address: 'SCS Quadra 2, Bloco A - Asa Sul, Brasília - DF',
        phone: '(61) 3222-3333',
        website: 'www.docevida.com.br',
        rating: 4.5,
        reviewCount: 1234,
        businessType: 'Confeitaria',
        latitude: -15.7801,
        longitude: -47.9292
      }
    ];

    // Simular progresso
    for (let i = 0; i <= 100; i += 10) {
      setSearchProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    return mockResults;
  };

  const handleSearch = async () => {
    if (!searchTerm.trim() || !location.trim()) {
      alert('Por favor, preencha o termo de busca e a localização');
      return;
    }

    setIsSearching(true);
    setSearchProgress(0);
    setResults([]);

    try {
      // Geocoding da localização
      const coordinates = await geocodeLocation(location);
      if (coordinates) {
        setMapCenter(coordinates);
      }

      // Simular scrapping (substituir por scrapping real depois)
      const scrapedResults = await simulateScraping(searchTerm, location);
      
      setResults(scrapedResults);
      
      // Salvar no cache local
      localStorage.setItem('scrapedResults', JSON.stringify(scrapedResults));
      
      if (onResults) {
        onResults(scrapedResults);
      }

    } catch (error) {
      console.error('Erro na busca:', error);
      alert('Erro ao realizar a busca. Tente novamente.');
    } finally {
      setIsSearching(false);
      setSearchProgress(0);
    }
  };

  const clearResults = () => {
    setResults([]);
    localStorage.removeItem('scrapedResults');
    if (onResults) {
      onResults([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Formulário de Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Estabelecimentos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Termo de Busca
              </label>
              <Input
                placeholder="Ex: panificadoras, farmácias, restaurantes"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isSearching}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Localização
              </label>
              <Input
                placeholder="Ex: Brasília - DF, São Paulo - SP"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={isSearching}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleSearch} 
              disabled={isSearching}
              className="flex-1"
            >
              {isSearching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Buscando... {searchProgress}%
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </>
              )}
            </Button>
            
            {results.length > 0 && (
              <Button variant="outline" onClick={clearResults}>
                Limpar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mapa */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Mapa dos Resultados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 w-full rounded-lg overflow-hidden border">
              <MapContainer
                center={mapCenter}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {results.map((result) => (
                  result.latitude && result.longitude && (
                    <Marker
                      key={result.id}
                      position={[result.latitude, result.longitude]}
                    >
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-semibold">{result.name}</h3>
                          <p className="text-sm text-gray-600">{result.address}</p>
                          {result.phone && (
                            <p className="text-sm flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {result.phone}
                            </p>
                          )}
                          {result.rating && (
                            <p className="text-sm flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              {result.rating} ({result.reviewCount} avaliações)
                            </p>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  )
                ))}
              </MapContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultados */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Resultados Encontrados
              </span>
              <Badge variant="secondary">
                {results.length} estabelecimentos
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((result) => (
                <Card key={result.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg">{result.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {result.businessType}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>{result.address}</span>
                        </div>
                        
                        {result.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 flex-shrink-0" />
                            <span>{result.phone}</span>
                          </div>
                        )}
                        
                        {result.website && (
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 flex-shrink-0" />
                            <a 
                              href={`https://${result.website}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {result.website}
                            </a>
                          </div>
                        )}
                        
                        {result.instagram && (
                          <div className="flex items-center gap-2">
                            <span className="text-pink-600">📷</span>
                            <span>{result.instagram}</span>
                          </div>
                        )}
                        
                        {result.rating && (
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                            <span className="font-medium">{result.rating}</span>
                            <span className="text-gray-500">
                              ({result.reviewCount} avaliações)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
