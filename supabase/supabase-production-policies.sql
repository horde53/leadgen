-- ==========================================
-- POLÍTICAS RLS PARA PRODUÇÃO
-- Alexandria Energia - Sistema de Afiliados
-- ==========================================

-- ==========================================
-- REMOVER POLÍTICA TEMPORÁRIA
-- ==========================================
DROP POLICY IF EXISTS "Allow all reads" ON "public"."users";

-- ==========================================
-- POLÍTICAS PARA TABELA USERS (AFILIADOS)
-- ==========================================

-- Permitir leitura de usuários para autenticação
CREATE POLICY "Users can read own profile" ON "public"."users"
FOR SELECT USING (
    auth.uid() = id OR 
    auth.jwt() ->> 'role' = 'service_role'
);

-- Permitir leitura pública de dados básicos dos afiliados (para validação)
CREATE POLICY "Public can read affiliate codes" ON "public"."users"
FOR SELECT USING (
    auth.jwt() ->> 'role' = 'anon' OR
    auth.jwt() ->> 'role' = 'authenticated' OR 
    auth.jwt() ->> 'role' = 'service_role'
);

-- Permitir criação de usuários (registro de afiliados)
CREATE POLICY "Allow affiliate registration" ON "public"."users"
FOR INSERT WITH CHECK (
    auth.jwt() ->> 'role' = 'service_role' OR -- Admin pode criar
    auth.jwt() ->> 'role' = 'authenticated'    -- Usuários logados podem criar
);

-- Permitir updates apenas do próprio usuário
CREATE POLICY "Users Can Update Own Data" ON "public"."users"
FOR UPDATE USING (
    auth.uid() = id OR 
    auth.jwt() ->> 'role' = 'service_role'
);

-- ==========================================
-- POLÍTICAS PARA TABELA LEADS
-- ==========================================

-- Permitir criação de leads (simulador público)
CREATE POLICY "Anyone Can Create Leads" ON "public"."leads"
FOR INSERT WITH CHECK (true);

-- Permitir leitura de leads para afiliados
CREATE POLICY "Affiliates Can Read Own Leads" ON "public"."leads"
FOR SELECT USING (
    auth.uid() = affiliate_id OR 
    auth.jwt() ->> 'role' = 'service_role'
);

-- Permitir atualização de leads do próprio afiliado
CREATE POLICY "Affiliates Can Update Own Leads" ON "public"."leads"
FOR UPDATE USING (
    auth.uid() = affiliate_id OR 
    auth.jwt() ->> 'role' = 'service_role'
);

-- ==========================================
-- POLÍTICAS PARA ADMINS (FUTURO)
-- ==========================================
-- Note: Estas políticas serão úteis quando implementarmos autenticação real

-- Admin pode ver todos os dados
CREATE POLICY "Admin Can Read All" ON "public"."users"
FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin Can Read All Leads" ON "public"."leads"
FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin Can Update All" ON "public"."users"
FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin Can Update All Leads" ON "public"."leads"
FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- ==========================================
-- COMENTÁRIOS SOBRE SEGURANÇA
-- ==========================================

-- IMPORTANTE: Estas políticas assumem que:
-- 1. Usuários autenticados têm seu ID no auth.uid()
-- 2. Admins têm role 'admin' no JWT
-- 3. O serviço tem role 'service_role'

-- Para produção, considere:
-- 1. Implementar autenticação real com JWT
-- 2. Usar service_role apenas para operações do backend
-- 3. Limitar CREATE/UPDATE/DELETE conforme necessário

COMMENT ON POLICY "Users Can Read Own Profile" ON users IS 'Permite usuários lerem apenas seus próprios dados';
COMMENT ON POLICY "Public Can Read Affiliate Codes" ON users IS 'Permite acesso público para verificar códigos de afiliado';
COMMENT ON POLICY "Anyone Can Create Leads" ON leads IS 'Simulador público pode criar leads';
COMMENT ON POLICY "Affiliates Can Read Own Leads" ON leads IS 'Afiliados vejam apenas seus próprios leads';

