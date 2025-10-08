# 🗺️ Configuração do Google Maps

## 📋 Pré-requisitos

1. **Conta Google** (gmail.com)
2. **Cartão de crédito** (para ativar a API)
3. **Projeto no Google Cloud Console**

## 🚀 Passo a Passo

### **1. Criar Projeto no Google Cloud Console**

1. Acesse: https://console.cloud.google.com/
2. Clique em "Selecionar projeto" → "Novo projeto"
3. Nome: "Alexandria Energia"
4. Clique em "Criar"

### **2. Ativar APIs Necessárias**

1. No menu lateral, vá em "APIs e serviços" → "Biblioteca"
2. Busque e ative:
   - **Maps JavaScript API**
   - **Geocoding API**
   - **Places API** (opcional, para busca avançada)

### **3. Criar Chave de API**

1. Vá em "APIs e serviços" → "Credenciais"
2. Clique em "Criar credenciais" → "Chave de API"
3. Copie a chave gerada
4. **IMPORTANTE**: Configure restrições de segurança

### **4. Configurar Restrições de Segurança**

1. Clique na chave criada
2. Em "Restrições de aplicativo":
   - **Restrições de API**: Selecione as APIs ativadas
3. Em "Restrições de chave":
   - **Restrições de HTTP**: Adicione seu domínio
   - **Restrições de IP**: Adicione IPs permitidos

### **5. Atualizar o Código**

No arquivo `index.html`, substitua `YOUR_API_KEY` pela sua chave:

```html
<script async defer 
  src="https://maps.googleapis.com/maps/api/js?key=SUA_CHAVE_AQUI&libraries=places&callback=initMap">
</script>
```

## 💰 **Custos**

### **Gratuito (Mensal)**
- **Maps JavaScript API**: 28.000 carregamentos
- **Geocoding API**: 40.000 requisições
- **Places API**: 1.000 requisições

### **Pago (Após limite)**
- **Maps JavaScript API**: $7 por 1.000 carregamentos
- **Geocoding API**: $5 por 1.000 requisições
- **Places API**: $17 por 1.000 requisições

## 🔒 **Segurança**

### **Restrições Recomendadas**
1. **Restrições de HTTP**: Apenas seu domínio
2. **Restrições de API**: Apenas APIs necessárias
3. **Monitoramento**: Ative alertas de uso

### **Exemplo de Configuração**
```
Domínios permitidos:
- localhost (desenvolvimento)
- seudominio.com
- www.seudominio.com

APIs permitidas:
- Maps JavaScript API
- Geocoding API
```

## 🧪 **Teste Local**

### **1. Desenvolvimento**
```bash
# Adicione ao hosts file (opcional)
127.0.0.1 localhost
```

### **2. Verificar Console**
Abra o DevTools e verifique:
- ✅ "Google Maps carregado"
- ✅ Sem erros de API
- ✅ Mapa renderizando

## 🚀 **Deploy**

### **1. Hospedagem Compartilhada**
- Upload dos arquivos
- Configurar domínio nas restrições
- Testar em produção

### **2. Vercel/Netlify**
- Adicionar variável de ambiente
- Configurar build
- Deploy automático

## ⚠️ **Troubleshooting**

### **Erro: "Google Maps não carregou"**
- Verificar se a chave está correta
- Verificar restrições de domínio
- Verificar se as APIs estão ativadas

### **Erro: "Geocoding falhou"**
- Verificar se Geocoding API está ativada
- Verificar cota mensal
- Verificar formato da cidade

### **Erro: "Quota exceeded"**
- Verificar uso no console
- Aumentar limites ou otimizar código
- Implementar cache

## 📊 **Monitoramento**

### **Google Cloud Console**
1. Vá em "APIs e serviços" → "Painel"
2. Monitore:
   - Requisições por API
   - Custos por API
   - Erros e latência

### **Alertas Recomendados**
- 80% da cota mensal
- Erros > 5%
- Latência > 2s

## 🎯 **Otimizações**

### **1. Cache de Geocoding**
```javascript
// Cache local para evitar requisições repetidas
const geocodingCache = new Map();

const getCachedCoordinates = async (city) => {
  if (geocodingCache.has(city)) {
    return geocodingCache.get(city);
  }
  
  const result = await GeocodingService.getCoordinates(city);
  geocodingCache.set(city, result);
  return result;
};
```

### **2. Lazy Loading**
```javascript
// Carregar mapa apenas quando necessário
const loadMap = () => {
  if (!window.google) {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`;
    document.head.appendChild(script);
  }
};
```

## 📱 **Mobile**

### **Responsividade**
- Mapa se adapta ao tamanho da tela
- Controles de zoom otimizados
- Touch gestures habilitados

### **Performance**
- Carregamento otimizado
- Imagens em baixa resolução
- Cache inteligente

---

**🎉 Pronto! Agora você tem um mapa real do Google Maps integrado ao seu gerador de leads!**
