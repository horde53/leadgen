-- ==========================================
-- CORRIGIR RLS PARA UPDATE - VERSÃO FINAL
-- ==========================================

-- Reativar RLS primeiro
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- REMOVER TODAS AS POLÍTICAS EXISTENTES
-- ==========================================

-- Remover políticas antigas que podem estar conflitando
DROP POLICY IF EXISTS "Allow Insert Users" ON "public"."users";
DROP POLICY IF EXISTS "Allow Update Users" ON "public"."users";
DROP POLICY IF EXISTS "Allow Select Users" ON "public"."users";
DROP POLICY IF EXISTS "Allow Insert Leads" ON "public"."leads";
DROP POLICY IF EXISTS "Allow Update Leads" ON "public"."leads";
DROP POLICY IF EXISTS "Allow Select Leads" ON "public"."leads";
DROP POLICY IF EXISTS "Admin Can Read All" ON "public"."users";
DROP POLICY IF EXISTS "Admin Can Read All Leads" ON "public"."leads";
DROP POLICY IF EXISTS "Admin Can Update All" ON "public"."users";
DROP POLICY IF EXISTS "Admin Can Update All Leads" ON "public"."leads";

-- ==========================================
-- CRIAR POLÍTICAS CORRETAS
-- ==========================================

-- POLÍTICAS PARA USERS (AFILIADOS)
-- 1. Permitir SELECT para todos (para listar afiliados)
CREATE POLICY "Allow Select Users" ON "public"."users"
FOR SELECT USING (true);

-- 2. Permitir INSERT para todos (para criar afiliados)
CREATE POLICY "Allow Insert Users" ON "public"."users"
FOR INSERT WITH CHECK (true);

-- 3. Permitir UPDATE para todos (para editar afiliados)
CREATE POLICY "Allow Update Users" ON "public"."users"
FOR UPDATE USING (true);

-- 4. Permitir DELETE para todos (para deletar afiliados)
CREATE POLICY "Allow Delete Users" ON "public"."users"
FOR DELETE USING (true);

-- POLÍTICAS PARA LEADS
-- 1. Permitir SELECT para todos
CREATE POLICY "Allow Select Leads" ON "public"."leads"
FOR SELECT USING (true);

-- 2. Permitir INSERT para todos (simulador público)
CREATE POLICY "Allow Insert Leads" ON "public"."leads"
FOR INSERT WITH CHECK (true);

-- 3. Permitir UPDATE para todos (para atualizar status)
CREATE POLICY "Allow Update Leads" ON "public"."leads"
FOR UPDATE USING (true);

-- 4. Permitir DELETE para todos
CREATE POLICY "Allow Delete Leads" ON "public"."leads"
FOR DELETE USING (true);

-- ==========================================
-- VERIFICAR POLÍTICAS CRIADAS
-- ==========================================

-- Ver todas as políticas da tabela users
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'users';

-- Ver todas as políticas da tabela leads
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'leads';

-- Verificar se RLS está ativo
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('users', 'leads');
