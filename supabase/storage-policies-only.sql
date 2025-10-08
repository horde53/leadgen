-- =============================================
-- POLÍTICAS DO STORAGE (Execute APÓS criar o bucket)
-- =============================================

-- IMPORTANTE: Primeiro crie o bucket manualmente no Dashboard do Supabase:
-- 1. Vá em Storage > Create Bucket
-- 2. Nome: energy-bills
-- 3. Public: true
-- 4. File size limit: 10MB
-- 5. Allowed MIME types: application/pdf, image/jpeg, image/jpg, image/png

-- 1. Política para permitir upload de arquivos (qualquer um pode fazer upload)
CREATE POLICY "Anyone can upload energy bills" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'energy-bills' AND
    auth.role() = 'anon' -- Permite upload anônimo (para leads)
);

-- 2. Política para permitir visualização de arquivos (qualquer um pode ver)
CREATE POLICY "Anyone can view energy bills" ON storage.objects
FOR SELECT USING (
    bucket_id = 'energy-bills'
);

-- 3. Política para permitir que afiliados vejam arquivos dos seus leads
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

-- 4. Política para permitir que admins gerenciem todos os arquivos
CREATE POLICY "Admins can manage all energy bills" ON storage.objects
FOR ALL USING (
    bucket_id = 'energy-bills' AND
    auth.role() = 'service_role'
);
