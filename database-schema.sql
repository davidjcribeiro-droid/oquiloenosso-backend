-- Estrutura do banco de dados para O Quilo é Nosso 2025
-- Execute este script no Supabase SQL Editor

-- ===== TABELA PRATOS =====
CREATE TABLE IF NOT EXISTS pratos (
  id BIGSERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  restaurante VARCHAR(255) NOT NULL,
  descricao TEXT,
  chef VARCHAR(255),
  estado VARCHAR(2),
  categoria VARCHAR(100),
  tempo VARCHAR(50),
  porcoes VARCHAR(50),
  imagem TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== TABELA JURADOS =====
CREATE TABLE IF NOT EXISTS jurados (
  id BIGSERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  telefone VARCHAR(20),
  especialidade VARCHAR(255),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== TABELA AVALIAÇÕES =====
CREATE TABLE IF NOT EXISTS avaliacoes (
  id BIGSERIAL PRIMARY KEY,
  prato_id BIGINT REFERENCES pratos(id) ON DELETE CASCADE,
  jurado_id BIGINT REFERENCES jurados(id) ON DELETE CASCADE,
  jurado_nome VARCHAR(255) NOT NULL,
  
  -- Critérios de avaliação (1-5 estrelas)
  originalidade INTEGER CHECK (originalidade >= 1 AND originalidade <= 5),
  receita INTEGER CHECK (receita >= 1 AND receita <= 5),
  apresentacao INTEGER CHECK (apresentacao >= 1 AND apresentacao <= 5),
  harmonia INTEGER CHECK (harmonia >= 1 AND harmonia <= 5),
  sabor INTEGER CHECK (sabor >= 1 AND sabor <= 5),
  adequacao INTEGER CHECK (adequacao >= 1 AND adequacao <= 5),
  
  -- Pontuações calculadas
  pontuacao_total INTEGER,
  media_ponderada DECIMAL(4,2),
  
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Garantir que cada jurado avalie cada prato apenas uma vez
  UNIQUE(prato_id, jurado_id)
);

-- ===== TABELA RECEITAS =====
CREATE TABLE IF NOT EXISTS receitas (
  id BIGSERIAL PRIMARY KEY,
  prato_id BIGINT REFERENCES pratos(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  ingredientes TEXT,
  modo_preparo TEXT,
  tempo_preparo VARCHAR(50),
  rendimento VARCHAR(50),
  dificuldade VARCHAR(20),
  arquivo_pdf TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== ÍNDICES PARA PERFORMANCE =====
CREATE INDEX IF NOT EXISTS idx_pratos_ativo ON pratos(ativo);
CREATE INDEX IF NOT EXISTS idx_pratos_categoria ON pratos(categoria);
CREATE INDEX IF NOT EXISTS idx_jurados_ativo ON jurados(ativo);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_prato ON avaliacoes(prato_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_jurado ON avaliacoes(jurado_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_created ON avaliacoes(created_at);
CREATE INDEX IF NOT EXISTS idx_receitas_prato ON receitas(prato_id);

-- ===== FUNÇÕES PARA CÁLCULOS AUTOMÁTICOS =====

-- Função para calcular pontuação total e média ponderada
CREATE OR REPLACE FUNCTION calcular_pontuacao()
RETURNS TRIGGER AS $$
DECLARE
  peso_originalidade INTEGER := 2;
  peso_receita INTEGER := 2;
  peso_apresentacao INTEGER := 1;
  peso_harmonia INTEGER := 2;
  peso_sabor INTEGER := 3;
  peso_adequacao INTEGER := 3;
  peso_total INTEGER := 13; -- Soma de todos os pesos
  pontuacao INTEGER;
  media DECIMAL(4,2);
BEGIN
  -- Calcular pontuação total (nota × peso)
  pontuacao := (NEW.originalidade * peso_originalidade) +
               (NEW.receita * peso_receita) +
               (NEW.apresentacao * peso_apresentacao) +
               (NEW.harmonia * peso_harmonia) +
               (NEW.sabor * peso_sabor) +
               (NEW.adequacao * peso_adequacao);
  
  -- Calcular média ponderada
  media := pontuacao::DECIMAL / peso_total;
  
  -- Atualizar os campos calculados
  NEW.pontuacao_total := pontuacao;
  NEW.media_ponderada := media;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular automaticamente as pontuações
CREATE TRIGGER trigger_calcular_pontuacao
  BEFORE INSERT OR UPDATE ON avaliacoes
  FOR EACH ROW
  EXECUTE FUNCTION calcular_pontuacao();

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER trigger_pratos_updated_at
  BEFORE UPDATE ON pratos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_jurados_updated_at
  BEFORE UPDATE ON jurados
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_receitas_updated_at
  BEFORE UPDATE ON receitas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===== DADOS INICIAIS =====

-- Inserir jurados padrão
INSERT INTO jurados (nome, email, especialidade, ativo) VALUES
  ('Ana Paula', 'ana.paula@email.com', 'Culinária Regional', true),
  ('Bruno Silva', 'bruno.silva@email.com', 'Gastronomia Internacional', true),
  ('Carla Mendes', 'carla.mendes@email.com', 'Confeitaria e Doces', true),
  ('Diego Rocha', 'diego.rocha@email.com', 'Carnes e Grelhados', true),
  ('Fernanda Alves', 'fernanda.alves@email.com', 'Culinária Saudável', true)
ON CONFLICT (email) DO NOTHING;

-- Inserir pratos padrão
INSERT INTO pratos (nome, restaurante, descricao, chef, estado, categoria, tempo, porcoes, imagem) VALUES
  (
    'Presunto Artesanal de Frango com Pequi',
    'Junior Cozinha Brasileira',
    'Presunto artesanal de frango com pequi recheado, empanado em semente de abóbora, acompanhado de musseline de agrião e crispy de casca de maçã',
    'Alex Ricardo dos Reis Martins',
    'GO',
    'Prato Principal',
    '90 min',
    '4-6 pessoas',
    '/images/pratos/junior_cozinha_brasileira.png'
  ),
  (
    'Café da Manhã Inglês Completo',
    'Sabores Internacionais',
    'Café da manhã tradicional inglês com ovos, bacon, linguiça, feijão e cogumelos',
    'Chef Internacional',
    'SP',
    'Café da Manhã',
    '45 min',
    '2 pessoas',
    '/images/pratos/cafe_manha_ingles.jpg'
  ),
  (
    'Salada Caesar com Camarão',
    'Tempero da Bahia',
    'Salada caesar clássica com camarões grelhados, croutons artesanais e molho especial',
    'Chef Baiano',
    'BA',
    'Entrada',
    '30 min',
    '3-4 pessoas',
    '/images/pratos/salada_caesar_camarao.jpg'
  ),
  (
    'Risotto de Cogumelos Selvagens',
    'Bella Italia',
    'Risotto cremoso com mix de cogumelos selvagens, parmesão envelhecido e trufa negra',
    'Chef Italiano',
    'RJ',
    'Prato Principal',
    '60 min',
    '4 pessoas',
    '/images/pratos/risotto_cogumelos.jpg'
  ),
  (
    'Brownie de Chocolate com Sorvete',
    'Doce Tentação',
    'Brownie artesanal de chocolate belga com sorvete de baunilha e calda quente',
    'Chef Confeiteiro',
    'MG',
    'Sobremesa',
    '40 min',
    '6-8 pessoas',
    '/images/pratos/brownie_chocolate.jpg'
  ),
  (
    'Peixe Grelhado com Legumes',
    'Mar & Terra',
    'Peixe fresco grelhado com legumes da estação e molho de ervas finas',
    'Chef do Mar',
    'SC',
    'Prato Principal',
    '35 min',
    '2-3 pessoas',
    '/images/pratos/peixe_grelhado.jpg'
  )
ON CONFLICT DO NOTHING;

-- ===== POLÍTICAS DE SEGURANÇA (RLS) =====

-- Habilitar Row Level Security
ALTER TABLE pratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE jurados ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE receitas ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir leitura pública (necessário para o sistema de votação)
CREATE POLICY "Permitir leitura pública de pratos" ON pratos FOR SELECT USING (true);
CREATE POLICY "Permitir leitura pública de jurados" ON jurados FOR SELECT USING (true);
CREATE POLICY "Permitir leitura pública de avaliações" ON avaliacoes FOR SELECT USING (true);
CREATE POLICY "Permitir leitura pública de receitas" ON receitas FOR SELECT USING (true);

-- Políticas para permitir inserção/atualização (necessário para o sistema funcionar)
CREATE POLICY "Permitir inserção de avaliações" ON avaliacoes FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir inserção de pratos" ON pratos FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir inserção de jurados" ON jurados FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir inserção de receitas" ON receitas FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização de pratos" ON pratos FOR UPDATE USING (true);
CREATE POLICY "Permitir atualização de jurados" ON jurados FOR UPDATE USING (true);
CREATE POLICY "Permitir atualização de receitas" ON receitas FOR UPDATE USING (true);

CREATE POLICY "Permitir exclusão de pratos" ON pratos FOR DELETE USING (true);
CREATE POLICY "Permitir exclusão de jurados" ON jurados FOR DELETE USING (true);
CREATE POLICY "Permitir exclusão de receitas" ON receitas FOR DELETE USING (true);

-- ===== COMENTÁRIOS PARA DOCUMENTAÇÃO =====
COMMENT ON TABLE pratos IS 'Tabela com os pratos participantes da competição';
COMMENT ON TABLE jurados IS 'Tabela com os jurados cadastrados';
COMMENT ON TABLE avaliacoes IS 'Tabela com as avaliações dos jurados para cada prato';
COMMENT ON TABLE receitas IS 'Tabela com as receitas dos pratos';

COMMENT ON COLUMN avaliacoes.originalidade IS 'Critério: Originalidade (peso 2)';
COMMENT ON COLUMN avaliacoes.receita IS 'Critério: Receita - execução e produtos (peso 2)';
COMMENT ON COLUMN avaliacoes.apresentacao IS 'Critério: Apresentação (peso 1)';
COMMENT ON COLUMN avaliacoes.harmonia IS 'Critério: Harmonia do prato (peso 2)';
COMMENT ON COLUMN avaliacoes.sabor IS 'Critério: Sabor (peso 3)';
COMMENT ON COLUMN avaliacoes.adequacao IS 'Critério: Adequação ao serviço a quilo (peso 3)';

-- ===== FIM DO SCRIPT =====
-- Total de pesos: 13 (2+2+1+2+3+3)
-- Pontuação máxima: 65 pontos (5 estrelas × 13 pesos)
-- Média máxima: 5.0
