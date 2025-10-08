-- ==========================================
-- POLÍTICA PARA PERMITIR INSERÇÃO DE USUÁRIOS
-- ==========================================

-- Permitir qualquer pessoa inserir usuários (para o admin addicionar afiliados)
CREATE POLICY "Allow Insert Users" ON "public"."users"
FOR INSERT WITH CHECK (true);

-- Permitir atualização de usuários também (caso precise)
CREATE POLICY "Allow Update Users" ON "public"."users"
FOR UPDATE USING (true);

-- Políticas para leads também
CREATE POLICY "Allow Insert Leads" ON "public"."leads"
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow Update Leads" ON "public"."leads"
FOR UPDATE USING (true);

