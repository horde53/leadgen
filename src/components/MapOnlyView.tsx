import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Loader2, Search, MapPin } from 'lucide-react';
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

interface MapOnlyViewProps {
  location: string;
  searchTerm: string;
  onSearchComplete?: (searchData: { query: string; location: string }) => void;
}

export const MapOnlyView: React.FC<MapOnlyViewProps> = ({ location, searchTerm, onSearchComplete }) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>([-15.7801, -47.9292]); // Brasília padrão
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchProgress, setSearchProgress] = useState(0);

  // Gerar dados mockados para teste
  const generateMockResults = (term: string, loc: string) => {
    const mockResults = [
      {
        id: '1',
        name: 'Bakery Mine Flavor',
        category: 'Panificadora',
        rating: 4.3,
        reviewCount: 929,
        phone: '(61) 3387-5565',
        website: 'www.bakerymine.com',
        instagram: '@bakerymine',
        address: 'CL 22, Quadra 13 Conjunto G, 01 - Sobradinho, Brasília - DF',
        latitude: -15.7801,
        longitude: -47.9292
      },
      {
        id: '2',
        name: 'Padaria São José',
        category: 'Panificadora',
        rating: 4.1,
        reviewCount: 456,
        phone: '(61) 3345-6789',
        website: null,
        instagram: null,
        address: 'SQN 304, Bloco A - Asa Norte, Brasília - DF',
        latitude: -15.7801,
        longitude: -47.9292
      },
      {
        id: '3',
        name: 'Confeitaria Doce Vida',
        category: 'Confeitaria',
        rating: 4.5,
        reviewCount: 1234,
        phone: '(61) 3222-3333',
        website: 'www.docevida.com.br',
        instagram: '@docevida',
        address: 'SCS Quadra 2, Bloco A - Asa Sul, Brasília - DF',
        latitude: -15.7801,
        longitude: -47.9292
      },
      {
        id: '4',
        name: 'Padaria Central',
        category: 'Panificadora',
        rating: 4.0,
        reviewCount: 678,
        phone: '(61) 3456-7890',
        website: null,
        instagram: '@padariacentral',
        address: 'SCS Quadra 1, Bloco B - Asa Sul, Brasília - DF',
        latitude: -15.7801,
        longitude: -47.9292
      },
      {
        id: '5',
        name: 'Bakery Premium',
        category: 'Panificadora',
        rating: 4.7,
        reviewCount: 234,
        phone: '(61) 3567-8901',
        website: 'www.bakerypremium.com.br',
        instagram: '@bakerypremium',
        address: 'SQN 205, Bloco C - Asa Norte, Brasília - DF',
        latitude: -15.7801,
        longitude: -47.9292
      }
    ];

    // Filtrar baseado no termo de busca
    return mockResults.filter(result => 
      result.name.toLowerCase().includes(term.toLowerCase()) ||
      result.category.toLowerCase().includes(term.toLowerCase())
    );
  };

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

  // Carregar localização quando o componente monta
  useEffect(() => {
    const loadLocation = async () => {
      if (!location) return;
      
      setIsLoading(true);
      setIsSearching(true);
      setError(null);
      setSearchProgress(0);
      
      try {
        // Simular progresso da busca
        const progressInterval = setInterval(() => {
          setSearchProgress(prev => {
            if (prev >= 100) {
              clearInterval(progressInterval);
              return 100;
            }
            return prev + Math.random() * 8;
          });
        }, 200);

        const coordinates = await geocodeLocation(location);
        
        if (coordinates) {
          setMapCenter(coordinates);
          
          // Simular tempo de busca (15-20 segundos)
          setTimeout(() => {
            setIsSearching(false);
            clearInterval(progressInterval);
            
            // Chama callback com dados da busca para iniciar scraping
            console.log('onSearchComplete existe?', !!onSearchComplete);
            if (onSearchComplete) {
              console.log('Chamando onSearchComplete com dados da busca');
              onSearchComplete({ query: searchTerm, location: location });
            }
          }, 18000);
        } else {
          setError('Localização não encontrada');
          setIsSearching(false);
          clearInterval(progressInterval);
        }
      } catch (error) {
        setError('Erro ao carregar localização');
        setIsSearching(false);
        console.error('Erro:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLocation();
  }, [location]);

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg font-medium">Carregando mapa...</p>
          <p className="text-sm text-muted-foreground">
            Buscando: {searchTerm} em {location}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-lg font-medium text-red-600 mb-2">Erro</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={mapCenter}
        zoom={16}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Marcador da localização */}
        <Marker position={mapCenter}>
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold text-lg">{searchTerm}</h3>
              <p className="text-sm text-gray-600">{location}</p>
              <p className="text-xs text-gray-500 mt-1">
                Área de busca selecionada
              </p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {/* Overlay de busca com raios animados */}
      {isSearching && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] z-50 flex items-center justify-center">
          {/* Raios que se movem pela tela */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Raio horizontal que se move de cima para baixo */}
            <div 
              className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-60"
              style={{
                animation: 'scanVertical 3s linear infinite',
                top: '0%'
              }}
            ></div>
            
            {/* Raio horizontal que se move de baixo para cima */}
            <div 
              className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-60"
              style={{
                animation: 'scanVerticalReverse 4s linear infinite',
                top: '100%'
              }}
            ></div>
            
            {/* Raio vertical que se move da esquerda para direita */}
            <div 
              className="absolute top-0 w-1 h-full bg-gradient-to-b from-transparent via-green-400 to-transparent opacity-60"
              style={{
                animation: 'scanHorizontal 5s linear infinite',
                left: '0%'
              }}
            ></div>
            
            {/* Raio vertical que se move da direita para esquerda */}
            <div 
              className="absolute top-0 w-1 h-full bg-gradient-to-b from-transparent via-purple-400 to-transparent opacity-60"
              style={{
                animation: 'scanHorizontalReverse 6s linear infinite',
                left: '100%'
              }}
            ></div>
            
            {/* Raio diagonal que se move */}
            <div 
              className="absolute w-2 h-2 bg-gradient-radial from-yellow-400 to-transparent opacity-40"
              style={{
                animation: 'scanDiagonal 8s linear infinite',
                top: '0%',
                left: '0%'
              }}
            ></div>
            
            {/* Raio diagonal reverso */}
            <div 
              className="absolute w-2 h-2 bg-gradient-radial from-pink-400 to-transparent opacity-40"
              style={{
                animation: 'scanDiagonalReverse 7s linear infinite',
                top: '100%',
                left: '100%'
              }}
            >            </div>
          </div>

          {/* Pontos piscando aleatoriamente - simulando locais sendo encontrados */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Linha 1 - Pontos superiores */}
            <div className="absolute w-4 h-4 bg-red-500 rounded-full shadow-lg border-2 border-white" style={{ left: '10%', top: '10%', animation: 'pulse 1.5s ease-in-out infinite, fadeInOut 2.5s ease-in-out infinite' }}></div>
            <div className="absolute w-4 h-4 bg-blue-500 rounded-full shadow-lg border-2 border-white" style={{ left: '25%', top: '15%', animation: 'pulse 1.5s ease-in-out infinite 0.2s, fadeInOut 3s ease-in-out infinite 0.5s' }}></div>
            <div className="absolute w-4 h-4 bg-green-500 rounded-full shadow-lg border-2 border-white" style={{ left: '40%', top: '8%', animation: 'pulse 1.5s ease-in-out infinite 0.4s, fadeInOut 2.8s ease-in-out infinite 1s' }}></div>
            <div className="absolute w-4 h-4 bg-yellow-500 rounded-full shadow-lg border-2 border-white" style={{ left: '55%', top: '12%', animation: 'pulse 1.5s ease-in-out infinite 0.6s, fadeInOut 3.2s ease-in-out infinite 1.5s' }}></div>
            <div className="absolute w-4 h-4 bg-purple-500 rounded-full shadow-lg border-2 border-white" style={{ left: '70%', top: '18%', animation: 'pulse 1.5s ease-in-out infinite 0.8s, fadeInOut 2.6s ease-in-out infinite 2s' }}></div>
            <div className="absolute w-4 h-4 bg-orange-500 rounded-full shadow-lg border-2 border-white" style={{ left: '85%', top: '14%', animation: 'pulse 1.5s ease-in-out infinite 1s, fadeInOut 3.4s ease-in-out infinite 0.3s' }}></div>
            
            {/* Linha 2 - Pontos do meio superior */}
            <div className="absolute w-4 h-4 bg-pink-500 rounded-full shadow-lg border-2 border-white" style={{ left: '5%', top: '25%', animation: 'pulse 1.5s ease-in-out infinite 0.1s, fadeInOut 2.9s ease-in-out infinite 0.8s' }}></div>
            <div className="absolute w-4 h-4 bg-cyan-500 rounded-full shadow-lg border-2 border-white" style={{ left: '20%', top: '30%', animation: 'pulse 1.5s ease-in-out infinite 0.3s, fadeInOut 3.1s ease-in-out infinite 1.2s' }}></div>
            <div className="absolute w-4 h-4 bg-red-500 rounded-full shadow-lg border-2 border-white" style={{ left: '35%', top: '28%', animation: 'pulse 1.5s ease-in-out infinite 0.5s, fadeInOut 2.7s ease-in-out infinite 1.8s' }}></div>
            <div className="absolute w-4 h-4 bg-blue-500 rounded-full shadow-lg border-2 border-white" style={{ left: '50%', top: '32%', animation: 'pulse 1.5s ease-in-out infinite 0.7s, fadeInOut 3.3s ease-in-out infinite 0.4s' }}></div>
            <div className="absolute w-4 h-4 bg-green-500 rounded-full shadow-lg border-2 border-white" style={{ left: '65%', top: '26%', animation: 'pulse 1.5s ease-in-out infinite 0.9s, fadeInOut 2.8s ease-in-out infinite 1.1s' }}></div>
            <div className="absolute w-4 h-4 bg-yellow-500 rounded-full shadow-lg border-2 border-white" style={{ left: '80%', top: '29%', animation: 'pulse 1.5s ease-in-out infinite 1.1s, fadeInOut 3.5s ease-in-out infinite 1.6s' }}></div>
            <div className="absolute w-4 h-4 bg-purple-500 rounded-full shadow-lg border-2 border-white" style={{ left: '95%', top: '33%', animation: 'pulse 1.5s ease-in-out infinite 1.3s, fadeInOut 2.6s ease-in-out infinite 2.2s' }}></div>
            
            {/* Linha 3 - Pontos do centro */}
            <div className="absolute w-4 h-4 bg-orange-500 rounded-full shadow-lg border-2 border-white" style={{ left: '12%', top: '45%', animation: 'pulse 1.5s ease-in-out infinite 0.2s, fadeInOut 3.2s ease-in-out infinite 0.6s' }}></div>
            <div className="absolute w-4 h-4 bg-pink-500 rounded-full shadow-lg border-2 border-white" style={{ left: '28%', top: '48%', animation: 'pulse 1.5s ease-in-out infinite 0.4s, fadeInOut 2.9s ease-in-out infinite 1.3s' }}></div>
            <div className="absolute w-4 h-4 bg-cyan-500 rounded-full shadow-lg border-2 border-white" style={{ left: '44%', top: '42%', animation: 'pulse 1.5s ease-in-out infinite 0.6s, fadeInOut 3.4s ease-in-out infinite 0.1s' }}></div>
            <div className="absolute w-4 h-4 bg-red-500 rounded-full shadow-lg border-2 border-white" style={{ left: '60%', top: '46%', animation: 'pulse 1.5s ease-in-out infinite 0.8s, fadeInOut 2.8s ease-in-out infinite 1.7s' }}></div>
            <div className="absolute w-4 h-4 bg-blue-500 rounded-full shadow-lg border-2 border-white" style={{ left: '76%', top: '44%', animation: 'pulse 1.5s ease-in-out infinite 1s, fadeInOut 3.1s ease-in-out infinite 0.9s' }}></div>
            <div className="absolute w-4 h-4 bg-green-500 rounded-full shadow-lg border-2 border-white" style={{ left: '92%', top: '49%', animation: 'pulse 1.5s ease-in-out infinite 1.2s, fadeInOut 2.7s ease-in-out infinite 2.4s' }}></div>
            
            {/* Linha 4 - Pontos do meio inferior */}
            <div className="absolute w-4 h-4 bg-yellow-500 rounded-full shadow-lg border-2 border-white" style={{ left: '8%', top: '62%', animation: 'pulse 1.5s ease-in-out infinite 0.1s, fadeIn-out 3.3s ease-in-out infinite 0.7s' }}></div>
            <div className="absolute w-4 h-4 bg-purple-500 rounded-full shadow-lg border-2 border-white" style={{ left: '24%', top: '65%', animation: 'pulse 1.5s ease-in-out infinite 0.3s, fadeInOut 2.6s ease-in-out infinite 1.4s' }}></div>
            <div className="absolute w-4 h-4 bg-orange-500 rounded-full shadow-lg border-2 border-white" style={{ left: '40%', top: '60%', animation: 'pulse 1.5s ease-in-out infinite 0.5s, fadeInOut 3.5s ease-in-out infinite 0.2s' }}></div>
            <div className="absolute w-4 h-4 bg-pink-500 rounded-full shadow-lg border-2 border-white" style={{ left: '56%', top: '64%', animation: 'pulse 1.5s ease-in-out infinite 0.7s, fadeInOut 2.9s ease-in-out infinite 1.8s' }}></div>
            <div className="absolute w-4 h-4 bg-cyan-500 rounded-full shadow-lg border-2 border-white" style={{ left: '72%', top: '61%', animation: 'pulse 1.5s ease-in-out infinite 0.9s, fadeInOut 3.2s ease-in-out infinite 1s' }}></div>
            <div className="absolute w-4 h-4 bg-red-500 rounded-full shadow-lg border-2 border-white" style={{ left: '88%', top: '66%', animation: 'pulse 1.5s ease-in-out infinite 1.1s, fadeInOut 2.8s ease-in-out infinite 2.5s' }}></div>
            
            {/* Linha 5 - Pontos inferiores */}
            <div className="absolute w-4 h-4 bg-blue-500 rounded-full shadow-lg border-2 border-white" style={{ left: '15%', top: '78%', animation: 'pulse 1.5s ease-in-out infinite 0.2s, fadeInOut 3.4s ease-in-out infinite 0.5s' }}></div>
            <div className="absolute w-4 h-4 bg-green-500 rounded-full shadow-lg border-2 border-white" style={{ left: '32%', top: '82%', animation: 'pulse 1.5s ease-in-out infinite 0.4s, fadeInOut 2.7s ease-in-out infinite 1.2s' }}></div>
            <div className="absolute w-4 h-4 bg-yellow-500 rounded-full shadow-lg border-2 border-white" style={{ left: '48%', top: '76%', animation: 'pulse 1.5s ease-in-out infinite 0.6s, fadeInOut 3.1s ease-in-out infinite 0.8s' }}></div>
            <div className="absolute w-4 h-4 bg-purple-500 rounded-full shadow-lg border-2 border-white" style={{ left: '64%', top: '80%', animation: 'pulse 1.5s ease-in-out infinite 0.8s, fadeInOut 2.9s ease-in-out infinite 1.9s' }}></div>
            <div className="absolute w-4 h-4 bg-orange-500 rounded-full shadow-lg border-2 border-white" style={{ left: '80%', top: '77%', animation: 'pulse 1.5s ease-in-out infinite 1s, fadeInOut 3.3s ease-in-out infinite 0.3s' }}></div>
            <div className="absolute w-4 h-4 bg-pink-500 rounded-full shadow-lg border-2 border-white" style={{ left: '96%', top: '81%', animation: 'pulse 1.5s ease-in-out infinite 1.2s, fadeInOut 2.6s ease-in-out infinite 2.1s' }}></div>
            
            {/* Pontos extras espalhados */}
            <div className="absolute w-3 h-3 bg-cyan-500 rounded-full shadow-lg border border-white" style={{ left: '18%', top: '35%', animation: 'pulse 2s ease-in-out infinite 0.3s, fadeInOut 4s ease-in-out infinite 0.9s' }}></div>
            <div className="absolute w-3 h-3 bg-red-500 rounded-full shadow-lg border border-white" style={{ left: '52%', top: '20%', animation: 'pulse 2s ease-in-out infinite 0.7s, fadeInOut 3.8s ease-in-out infinite 1.5s' }}></div>
            <div className="absolute w-3 h-3 bg-blue-500 rounded-full shadow-lg border border-white" style={{ left: '38%', top: '55%', animation: 'pulse 2s ease-in-out infinite 1.1s, fadeInOut 4.2s ease-in-out infinite 0.4s' }}></div>
            <div className="absolute w-3 h-3 bg-green-500 rounded-full shadow-lg border border-white" style={{ left: '68%', top: '35%', animation: 'pulse 2s ease-in-out infinite 1.5s, fadeInOut 3.6s ease-in-out infinite 2.2s' }}></div>
            <div className="absolute w-3 h-3 bg-yellow-500 rounded-full shadow-lg border border-white" style={{ left: '22%', top: '70%', animation: 'pulse 2s ease-in-out infinite 0.9s, fadeInOut 4.4s ease-in-out infinite 0.7s' }}></div>
            <div className="absolute w-3 h-3 bg-purple-500 rounded-full shadow-lg border border-white" style={{ left: '78%', top: '55%', animation: 'pulse 2s ease-in-out infinite 1.3s, fadeInOut 3.2s ease-in-out infinite 1.8s' }}></div>
          </div>

          {/* Card de busca na parte inferior */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200 p-4 min-w-[320px]">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-gradient-energy rounded-full flex items-center justify-center animate-pulse">
                  <Search className="w-6 h-6 text-white animate-bounce" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    Buscando estabelecimentos...
                  </h3>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-blue-600">{searchTerm}</span> em <span className="font-semibold text-green-600">{location}</span>
                  </p>
                </div>
              </div>
              
              {/* Barra de progresso */}
              <div className="mb-3">
                <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 via-blue-500 to-green-400 h-full rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${searchProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  {Math.round(searchProgress)}% concluído
                </p>
              </div>
              
              {/* Status */}
              <div className="text-center">
                <p className="text-sm text-gray-600 animate-pulse">
                  🔍 Analisando estabelecimentos na região...
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estilos CSS para as animações dos raios */}
      <style jsx>{`
        @keyframes scanVertical {
          0% { top: -10px; }
          100% { top: 100%; }
        }
        
        @keyframes scanVerticalReverse {
          0% { top: 100%; }
          100% { top: -10px; }
        }
        
        @keyframes scanHorizontal {
          0% { left: -10px; }
          100% { left: 100%; }
        }
        
        @keyframes scanHorizontalReverse {
          0% { left: 100%; }
          100% { left: -10px; }
        }
        
        @keyframes scanDiagonal {
          0% { 
            top: -10px; 
            left: -10px; 
          }
          25% { 
            top: 25%; 
            left: 25%; 
          }
          50% { 
            top: 50%; 
            left: 50%; 
          }
          75% { 
            top: 75%; 
            left: 75%; 
          }
          100% { 
            top: 100%; 
            left: 100%; 
          }
        }
        
        @keyframes scanDiagonalReverse {
          0% { 
            top: 100%; 
            left: 100%; 
          }
          25% { 
            top: 75%; 
            left: 75%; 
          }
          50% { 
            top: 50%; 
            left: 50%; 
          }
          75% { 
            top: 25%; 
            left: 25%; 
          }
          100% { 
            top: -10px; 
            left: -10px; 
          }
        }
        
        @keyframes fadeInOut {
          0%, 100% { 
            opacity: 0; 
            transform: scale(0.5);
          }
          50% { 
            opacity: 1; 
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};
