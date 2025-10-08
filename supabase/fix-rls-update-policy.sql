-- ==========================================
-- CORRIGIR POLÍTICAS RLS PARA UPDATE
-- Alexandria Energia - Sistema de Afiliados
-- ==========================================

-- Primeiro, vamos verificar as políticas existentes
-- SELECT * FROM pg_policies WHERE tablename = 'users';

-- ==========================================
-- REMOVER POLÍTICAS CONFLITANTES
-- ==========================================

-- Remover política temporária se existir
DROP POLICY IF EXISTS "Allow Update Users" ON "public"."users";

-- ==========================================
-- CRIAR POLÍTICA CORRETA PARA UPDATE
-- ==========================================

-- Permitir UPDATE para service_role (admin)
CREATE POLICY "Allow Update Users" ON "public"."users"
FOR UPDATE USING (
    auth.jwt() ->> 'role' = 'service_role' OR
    auth.jwt() ->> 'role' = 'admin'
);

-- ==========================================
-- VERIFICAR SE PRECISA DE POLÍTICA PARA SELECT
-- ==========================================

-- Se ainda não tem política de SELECT, criar uma
CREATE POLICY "Allow Select Users" ON "public"."users"
FOR SELECT USING (
    auth.jwt() ->> 'role' = 'service_role' OR
    auth.jwt() ->> 'role' = 'admin' OR
    auth.jwt() ->> 'role' = 'anon'
);

-- ==========================================
-- POLÍTICAS PARA LEADS TAMBÉM
-- ==========================================

-- Garantir que leads também tenham políticas corretas
CREATE POLICY "Allow Update Leads" ON "public"."leads"
FOR UPDATE USING (
    auth.jwt() ->> 'role' = 'service_role' OR
    auth.jwt() ->> 'role' = 'admin'
);

-- ==========================================
-- TESTE DAS POLÍTICAS
-- ==========================================

-- Para testar se as políticas estão funcionando:
-- 1. Vá no Supabase Dashboard → Table Editor → users
-- 2. Tente editar um registro manualmente
-- 3. Se der erro, as políticas ainda estão bloqueando

-- ==========================================
-- ALTERNATIVA: DESATIVAR RLS TEMPORARIAMENTE
-- ==========================================

-- Se ainda não funcionar, desative RLS temporariamente:
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE leads DISABLE ROW LEVEL SECURITY;

-- IMPORTANTE: Reative depois com:
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
