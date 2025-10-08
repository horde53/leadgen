-- ==========================================
-- SCHEMA SIMPLES - ALEXANDRIA ENERGIA
-- Sistema básico: Afiliados + Leads
-- ==========================================

-- ==========================================
-- 1. TIPOS ENUM SIMPLES
-- ==========================================
CREATE TYPE lead_status AS ENUM ('novo', 'contatar', 'em_negociacao', 'fechado', 'perdido');

-- ==========================================
-- 2. TABELAS PRINCIPAIS (SIMPLES)
-- ==========================================

-- Afiliados
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    affiliate_code TEXT UNIQUE NOT NULL, -- Código para ?ref=CODIGO
    commission_rate DECIMAL(5,2) DEFAULT 40.00, -- % comissão
    total_leads INTEGER DEFAULT 0,
    total_closed_leads INTEGER DEFAULT 0,
    total_commission DECIMAL(10,2) DEFAULT 0.00, -- Total de comissões acumuladas
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leads (Clientes)
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Dados do cliente (somente o essencial)
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    energy_bill_value DECIMAL(10,2) NOT NULL, -- Valor da conta de luz
    energy_bill_file TEXT, -- URL do arquivo da conta de energia (opcional)
    
    -- Cálculo de economia
    monthly_economy DECIMAL(10,2) NOT NULL, -- Economia mensal (15% da conta)
    yearly_economy DECIMAL(10,2) NOT NULL, -- Economia anual
    
    -- Afiliação
    affiliate_id UUID REFERENCES users(id), -- Qual afiliado trouxe este lead
    
    -- Comissão do afiliado
    commission_amount DECIMAL(10,2) NOT NULL, -- Valor que o afiliado vai receber
    commission_rate DECIMAL(5,2) NOT NULL, -- Taxa usada para calcular (ex: 40%)
    
    -- Status
    status lead_status DEFAULT 'novo',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 3. ÍNDICES SIMPLES
-- ==========================================
CREATE INDEX idx_leads_affiliate_id ON leads(affiliate_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_affiliate_code ON users(affiliate_code);

-- ==========================================
-- 4. FUNÇÕES BÁSICAS
-- ==========================================

-- Atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Gerar código único de afiliado automaticamente
CREATE OR REPLACE FUNCTION generate_affiliate_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.affiliate_code IS NULL THEN
        LOOP
            NEW.affiliate_code := upper(substring(md5(random()::text) from 1 for 6));
            EXIT WHEN NOT EXISTS (SELECT 1 FROM users WHERE affiliate_code = NEW.affiliate_code);
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER generate_user_affiliate_code BEFORE INSERT ON users
    FOR EACH ROW EXECUTE FUNCTION generate_affiliate_code();

-- Atualizar contadores e calcular comissões do afiliado
CREATE OR REPLACE FUNCTION update_affiliate_counters()
RETURNS TRIGGER AS $$
DECLARE
    affiliate_rate DECIMAL(5,2);
BEGIN
    -- Se é um novo lead, calcular economia e comissão
    IF TG_OP = 'INSERT' AND NEW.affiliate_id IS NOT NULL THEN
        -- Buscar taxa de comissão do afiliado
        SELECT commission_rate INTO affiliate_rate FROM users WHERE id = NEW.affiliate_id;
        
        -- Calcular economia (15% da conta) e comissão
        NEW.monthly_economy = NEW.energy_bill_value * 0.15; -- 15% de economia mensal
        NEW.yearly_economy = NEW.monthly_economy * 12; -- Economia anual
        NEW.commission_amount = NEW.energy_bill_value * affiliate_rate / 100; -- Comissão sobre valor da conta
        NEW.commission_rate = affiliate_rate; -- Salvar qual taxa foi usada
        
        -- Atualizar contadores do afiliado
        UPDATE users SET 
            total_leads = total_leads + 1,
            updated_at = NOW()
        WHERE id = NEW.affiliate_id;
    END IF;
    
    -- Se mudou para fechado, somar a comissão aos totais
    IF NEW.status = 'fechado' AND OLD.status != 'fechado' THEN
        UPDATE users SET 
            total_closed_leads = total_closed_leads + 1,
            total_commission = total_commission + NEW.commission_amount,
            updated_at = NOW()
        WHERE id = NEW.affiliate_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leads_count_and_status AFTER INSERT OR UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_affiliate_counters();

-- ==========================================
-- 5. ROW LEVEL SECURITY (SIMPLES)
-- ==========================================

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Afiliados só veem seus próprios dados
CREATE POLICY "Users can view own data" ON users
    FOR ALL USING (auth.uid() = id);

-- Afiliados só veem seus próprios leads
CREATE POLICY "Affiliates can view own leads" ON leads
    FOR SELECT USING (auth.uid() = affiliate_id);

CREATE POLICY "Affiliates can update own leads" ON leads
    FOR UPDATE USING (auth.uid() = affiliate_id);

-- Qualquer um pode criar leads (simulador público)
CREATE POLICY "Anyone can insert leads" ON leads
    FOR INSERT WITH CHECK (true);

-- ==========================================
-- 6. DADOS INICIAIS (ADMIN)
-- ==========================================

-- Criar admin padrão (senha: admin123)
INSERT INTO users (email, password_hash, name, affiliate_code) VALUES 
('admin@alexandriaenergia.com', crypt('admin123', gen_salt('bf')), 'Administrador', 'ADMIN');

-- ==========================================
-- SCHEMA COMPLETO E SIMPLES
-- ==========================================

-- Comentários das tabelas
COMMENT ON TABLE users IS 'Afiliados do sistema Alexandria Energia';
COMMENT ON TABLE leads IS 'Leads gerados pelo simulador público';
