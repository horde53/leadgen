# Sistema de Logging Mascarado

## Como funciona:

### Em Desenvolvimento (DEV):
- Todos os dados são exibidos completos no console
- Facilita o debug e desenvolvimento

### Em Produção (PROD):
- Dados sensíveis são automaticamente mascarados
- Mantém a funcionalidade sem expor informações

## Exemplos de Mascaramento:

### ANTES (Dados Expostos):
```javascript
{
  id: 'fa3a4411-2844-485a-bb49-2d8a7fa5c874',
  name: 'TUTUZERA',
  email: 'tutuzera@gmail.com',
  phone: '(61) 99548-498',
  client_phone: '1101241654',
  energy_bill_file: 'https://qpqvmfdmsdrtklieeugw.supabase.co/storage/v1/object/public/energy-bills/leads/17594911'
}
```

### DEPOIS (Dados Mascarados em Produção):
```javascript
{
  id: 'fa3a...c874',
  name: 'TUTUZERA',
  email: 't***a@gmail.com',
  phone: '(61) 9***-**98',
  client_phone: '11***654',
  energy_bill_file: '[Arquivo: 17594911]'
}
```

## Tipos de Mascaramento:

- **E-mails:** `t***a@gmail.com`
- **Telefones:** `(61) 9***-**98`
- **URLs de arquivos:** `[Arquivo: nome_do_arquivo]`
- **UUIDs:** `fa3a...c874`
- **Senhas:** `********`

## Uso:

```typescript
import { appLogger } from '@/utils/logger';

// Em desenvolvimento: mostra dados completos
// Em produção: mascara dados sensíveis
appLogger.log('Dados do usuário:', userData);
appLogger.error('Erro:', error);
appLogger.warn('Aviso:', warning);
appLogger.info('Info:', info);
```


