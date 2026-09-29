-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clientes
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  documento TEXT,
  telefone TEXT,
  email TEXT,
  endereco TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Obras
CREATE TABLE IF NOT EXISTS obras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  endereco TEXT,
  cidade TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configurações de Caminhão
CREATE TABLE IF NOT EXISTS configuracoes_caminhao (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  largura_util_cm INTEGER NOT NULL CHECK (largura_util_cm > 0),
  comprimento_util_cm INTEGER NOT NULL CHECK (comprimento_util_cm > 0),
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tipos de Estaca
CREATE TABLE IF NOT EXISTS tipos_estaca (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  diametro_cm INTEGER NOT NULL CHECK (diametro_cm > 0),
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pedidos
CREATE TABLE IF NOT EXISTS pedidos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  obra_id UUID NOT NULL REFERENCES obras(id),
  tipo_estaca_id UUID NOT NULL REFERENCES tipos_estaca(id),
  quantidade_solicitada INTEGER NOT NULL CHECK (quantidade_solicitada > 0),
  capacidade_por_caminhao INTEGER NOT NULL CHECK (capacidade_por_caminhao > 0),
  quantidade_entregas INTEGER NOT NULL CHECK (quantidade_entregas > 0),
  status TEXT NOT NULL DEFAULT 'Planejado',
  observacoes TEXT,
  -- Histórico das dimensões
  diametro_utilizado INTEGER NOT NULL,
  largura_utilizada INTEGER NOT NULL,
  comprimento_utilizado INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Entregas
CREATE TABLE IF NOT EXISTS entregas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  numero_entrega INTEGER NOT NULL,
  quantidade_estacas INTEGER NOT NULL CHECK (quantidade_estacas > 0),
  data_prevista DATE,
  data_entrega DATE,
  status TEXT NOT NULL DEFAULT 'Programada',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_obras_cliente_id ON obras(cliente_id);
CREATE INDEX idx_pedidos_cliente_id ON pedidos(cliente_id);
CREATE INDEX idx_pedidos_obra_id ON pedidos(obra_id);
CREATE INDEX idx_entregas_pedido_id ON entregas(pedido_id);
CREATE INDEX idx_entregas_data_prevista ON entregas(data_prevista);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clientes_modtime BEFORE UPDATE ON clientes FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_obras_modtime BEFORE UPDATE ON obras FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_configuracoes_caminhao_modtime BEFORE UPDATE ON configuracoes_caminhao FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_tipos_estaca_modtime BEFORE UPDATE ON tipos_estaca FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_pedidos_modtime BEFORE UPDATE ON pedidos FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_entregas_modtime BEFORE UPDATE ON entregas FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- RLS Configuration
-- For a simple single-tenant setup without full auth right now, we can enable RLS and just allow anon or setup basic policies.
-- Let's just create them so they are ready, but allow all access for now (or public access).
-- A full auth implementation would change these policies to auth.uid() = ...
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE obras ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes_caminhao ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_estaca ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE entregas ENABLE ROW LEVEL SECURITY;

-- Creating permissive policies for MVP (to be replaced in a real prod scenario)
CREATE POLICY "Enable all access for anon" ON clientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for anon" ON obras FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for anon" ON configuracoes_caminhao FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for anon" ON tipos_estaca FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for anon" ON pedidos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for anon" ON entregas FOR ALL USING (true) WITH CHECK (true);

-- Insert some initial seed data
INSERT INTO configuracoes_caminhao (nome, largura_util_cm, comprimento_util_cm) VALUES ('Caminhão Padrão', 245, 240);
INSERT INTO tipos_estaca (nome, diametro_cm) VALUES ('Estaca Ø30', 30);
INSERT INTO tipos_estaca (nome, diametro_cm) VALUES ('Estaca Ø40', 40);
INSERT INTO tipos_estaca (nome, diametro_cm) VALUES ('Estaca Ø50', 50);
