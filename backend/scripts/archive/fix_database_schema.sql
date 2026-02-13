USE plataforma_ong;

-- CORRIGIR TABELA DOACOES - Alinhar com o model
ALTER TABLE doacoes 
ADD COLUMN IF NOT EXISTS nome_doador VARCHAR(150) NOT NULL DEFAULT 'Anônimo' AFTER id,
ADD COLUMN IF NOT EXISTS email_doador VARCHAR(150) NULL AFTER nome_doador,
ADD COLUMN IF NOT EXISTS telefone_doador VARCHAR(30) NULL AFTER email_doador,
ADD COLUMN IF NOT EXISTS documento_doador VARCHAR(30) NULL AFTER telefone_doador,
ADD COLUMN IF NOT EXISTS tipo ENUM('alimentos', 'materiais_higiene', 'materiais_escolares', 'dinheiro', 'outros') NOT NULL DEFAULT 'outros' AFTER valor,
ADD COLUMN IF NOT EXISTS descricao_itens TEXT NULL AFTER tipo,
ADD COLUMN IF NOT EXISTS observacoes TEXT NULL AFTER descricao_itens,
ADD COLUMN IF NOT EXISTS status ENUM('pendente', 'recebida', 'cancelada') NOT NULL DEFAULT 'pendente' AFTER observacoes,
ADD COLUMN IF NOT EXISTS data_recebimento DATE NULL AFTER data_doacao,
ADD COLUMN IF NOT EXISTS data_cancelamento DATE NULL AFTER data_recebimento,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL AFTER updated_at;

-- Migrar dados existentes
UPDATE doacoes SET 
    nome_doador = doador,
    tipo = CASE tipo_doacao 
        WHEN 'alimento' THEN 'alimentos'
        WHEN 'higiene' THEN 'materiais_higiene'
        WHEN 'escolar' THEN 'materiais_escolares'
        WHEN 'financeiro' THEN 'dinheiro'
        ELSE 'outros'
    END,
    descricao_itens = descricao
WHERE nome_doador = 'Anônimo' OR nome_doador IS NULL;

-- Remover colunas antigas (após migração)
-- ALTER TABLE doacoes DROP COLUMN doador;
-- ALTER TABLE doacoes DROP COLUMN tipo_doacao;
-- ALTER TABLE doacoes DROP COLUMN descricao;

-- CORRIGIR TABELA SALAS - Adicionar coluna professor (texto) se não existir
ALTER TABLE salas 
ADD COLUMN IF NOT EXISTS professor VARCHAR(100) NULL AFTER nome;

-- CORRIGIR TABELA ALUNOS - Garantir colunas faltantes
ALTER TABLE alunos 
ADD COLUMN IF NOT EXISTS status ENUM('matriculado', 'inativo', 'cancelado', 'formado', 'aguardando_vaga') NOT NULL DEFAULT 'matriculado' AFTER ativo,
ADD COLUMN IF NOT EXISTS total_presencas INT NOT NULL DEFAULT 0 AFTER documentos,
ADD COLUMN IF NOT EXISTS total_faltas INT NOT NULL DEFAULT 0 AFTER total_presencas,
ADD COLUMN IF NOT EXISTS ultima_atualizacao_frequencia DATE NULL COMMENT 'Última atualização dos dados de frequência' AFTER total_faltas,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL AFTER updated_at;

-- Atualizar alunos existentes
UPDATE alunos SET status = 'matriculado' WHERE status IS NULL;

-- Verificar estrutura final
SELECT 'doacoes' as tabela, COUNT(*) as total FROM doacoes
UNION ALL
SELECT 'salas' as tabela, COUNT(*) as total FROM salas  
UNION ALL
SELECT 'alunos' as tabela, COUNT(*) as total FROM alunos
UNION ALL
SELECT 'usuarios' as tabela, COUNT(*) as total FROM usuarios;
