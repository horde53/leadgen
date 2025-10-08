# Mapeamento de Status - Banco vs Frontend

## 🔄 Problema Identificado:

O banco de dados usa valores em **minúsculas** e **com underscore**, mas o frontend espera valores em **Pascal Case**.

## 📊 Mapeamento de Status:

| Banco de Dados | Frontend | Descrição |
|----------------|----------|-----------|
| `novo` | `Novo` | Lead recém-criado |
| `contatar` | `Contatar` | Lead para contato |
| `em_negociacao` | `Em Negociação` | Lead em negociação |
| `fechado` | `Fechado` | Lead convertido |
| `perdido` | `Perdido` | Lead perdido |

## 🛠️ Funções de Conversão:

### `convertStatusFromDB(dbStatus: string)`
Converte status do banco para o frontend:
```typescript
'novo' → 'Novo'
'em_negociacao' → 'Em Negociação'
```

### `convertStatusToDB(frontendStatus: Lead['status'])`
Converte status do frontend para o banco:
```typescript
'Novo' → 'novo'
'Em Negociação' → 'em_negociacao'
```

## 🎯 Onde é usado:

1. **Carregamento de leads** - `convertStatusFromDB()`
2. **Atualização de status** - `convertStatusToDB()`
3. **Exibição na tabela** - Status formatado
4. **Select de status** - Valores do frontend

## ✅ Solução:

- ✅ Status carrega corretamente do banco
- ✅ Status é salvo corretamente no banco
- ✅ Interface mostra valores formatados
- ✅ Conversão automática e transparente


