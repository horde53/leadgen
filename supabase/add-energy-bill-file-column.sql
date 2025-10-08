-- Adicionar coluna para arquivo da conta de energia na tabela leads
ALTER TABLE public.leads 
ADD COLUMN energy_bill_file TEXT;

-- Comentário para documentar a coluna
COMMENT ON COLUMN public.leads.energy_bill_file IS 'URL do arquivo da conta de energia (opcional)';
