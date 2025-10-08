-- ==========================================
-- CORRIGIR GENERATION DE CÓDIGO DE AFILIADO
-- ==========================================

-- Primeiro, vamos verificar se o trigger existe
-- E recriar a função de geração de código afiliado

-- Recriar função para gerar código único mais robusto
CREATE OR REPLACE FUNCTION generate_affiliate_code()
RETURNS TRIGGER AS $$
DECLARE
    new_code TEXT;
    counter INTEGER := 0;
BEGIN
    LOOP
        -- Gerar código com timestamp + random para garantir unicidade
        new_code := UPPER(
            SUBSTRING(MD5(NOW()::text || RANDOM()::text || counter::text), 1, 6)
        );
        
        -- Verificar se já existe
        EXIT WHEN NOT EXISTS (SELECT 1 FROM users WHERE affiliate_code = new_code);
        
        -- Counter para evitar loop infinito
        counter := counter + 1;
        IF counter > 100 THEN
            new_code := 'AF' || FLOOR(RANDOM() * 10000);
            EXIT;
        END IF;
    END LOOP;
    
    NEW.affiliate_code := new_code;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recriar trigger
DROP TRIGGER IF EXISTS generate_user_affiliate_code ON users;
CREATE TRIGGER generate_user_affiliate_code 
    BEFORE INSERT ON users
    FOR EACH ROW 
    EXECUTE FUNCTION generate_affiliate_code();

-- Teste para verificar se funciona
-- (Descomente para testar)
/*
INSERT INTO users (email, password_hash, name, affiliate_code) 
VALUES ('test_unique_@test.com', 'password123', 'Test User', '');
*/
