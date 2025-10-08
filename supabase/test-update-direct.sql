-- ==========================================
-- TESTE DIRETO NO BANCO
-- ==========================================

-- 1. Verificar se o ID existe
SELECT id, name, email, phone FROM users WHERE id = '51b5dc4e-2012-4ac3-99c8-bb17f3f59068';

-- 2. Se não existir, ver todos os IDs disponíveis
SELECT id, name, email, phone FROM users ORDER BY created_at DESC LIMIT 10;

-- 3. Teste de UPDATE direto (substitua por um ID que existe)
-- UPDATE users 
-- SET name = 'Teste Update', email = 'teste@update.com', phone = '11999999999'
-- WHERE id = 'SUBSTITUA_POR_ID_REAL';

-- 4. Verificar se RLS está ativo
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users';
