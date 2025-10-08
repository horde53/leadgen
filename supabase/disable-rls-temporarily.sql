-- ==========================================
-- DESATIVAR RLS TEMPORARIAMENTE
-- ==========================================

-- Desativar RLS na tabela users
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Desativar RLS na tabela leads também
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;

-- Verificar se foi desativado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('users', 'leads');
