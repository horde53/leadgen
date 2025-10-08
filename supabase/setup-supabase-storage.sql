-- =============================================
-- CONFIGURAÇÃO DO STORAGE PARA UPLOAD DE ARQUIVOS
-- =============================================

-- IMPORTANTE: Este bucket deve ser criado via Dashboard do Supabase
-- Vá em: Storage > Create Bucket
-- Nome: energy-bills
-- Public: true
-- File size limit: 10MB
-- Allowed MIME types: application/pdf, image/jpeg, image/jpg, image/png

-- 1. Bucket deve ser criado manualmente no Dashboard do Supabase
-- Nome: energy-bills
-- Público: Sim
-- Limite de tamanho: 10MB
-- Tipos permitidos: PDF, JPG, PNG

-- 2. Política para permitir upload de arquivos (qualquer um pode fazer upload)
CREATE POLICY "Anyone can upload energy bills" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'energy-bills' AND
    auth.role() = 'anon' -- Permite upload anônimo (para leads)
);

-- 3. Política para permitir visualização de arquivos (qualquer um pode ver)
CREATE POLICY "Anyone can view energy bills" ON storage.objects
FOR SELECT USING (
    bucket_id = 'energy-bills'
);

-- 4. Política para permitir que afiliados vejam arquivos dos seus leads
CREATE POLICY "Affiliates can view their leads' energy bills" ON storage.objects
FOR SELECT USING (
    bucket_id = 'energy-bills' AND
    (
        auth.role() = 'service_role' OR -- Admin pode ver tudo
        EXISTS (
            SELECT 1 FROM public.leads 
            WHERE leads.energy_bill_file = storage.objects.name 
            AND leads.affiliate_id = auth.uid()
        )
    )
);

-- 5. Política para permitir que admins gerenciem todos os arquivos
CREATE POLICY "Admins can manage all energy bills" ON storage.objects
FOR ALL USING (
    bucket_id = 'energy-bills' AND
    auth.role() = 'service_role'
);

-- 6. Comentários para documentação
COMMENT ON TABLE storage.buckets IS 'Buckets para armazenamento de arquivos';
COMMENT ON COLUMN storage.buckets.file_size_limit IS 'Limite de tamanho em bytes (10MB = 10485760)';
COMMENT ON COLUMN storage.buckets.allowed_mime_types IS 'Tipos de arquivo permitidos: PDF, JPG, PNG';
