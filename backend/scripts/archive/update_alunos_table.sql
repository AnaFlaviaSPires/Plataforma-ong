USE plataforma_ong;

-- Adicionar colunas faltantes na tabela alunos
ALTER TABLE alunos ADD COLUMN status ENUM('matriculado', 'inativo', 'cancelado', 'formado', 'aguardando_vaga') NOT NULL DEFAULT 'matriculado' AFTER ativo;
ALTER TABLE alunos ADD COLUMN total_presencas INT NOT NULL DEFAULT 0 COMMENT 'Total de presenças registradas - uso analítico' AFTER documentos;
ALTER TABLE alunos ADD COLUMN total_faltas INT NOT NULL DEFAULT 0 COMMENT 'Total de faltas registradas - uso analítico' AFTER total_presencas;
ALTER TABLE alunos ADD COLUMN ultima_atualizacao_frequencia DATE NULL COMMENT 'Última atualização dos dados de frequência' AFTER total_faltas;
ALTER TABLE alunos ADD COLUMN deleted_at TIMESTAMP NULL AFTER updated_at;

-- Atualizar valores existentes
UPDATE alunos SET status = 'matriculado' WHERE status IS NULL;
UPDATE alunos SET total_presencas = 0 WHERE total_presencas IS NULL;
UPDATE alunos SET total_faltas = 0 WHERE total_faltas IS NULL;

-- Adicionar índices
ALTER TABLE alunos 
ADD INDEX IF NOT EXISTS idx_status (status),
ADD INDEX IF NOT EXISTS idx_deleted_at (deleted_at),
ADD INDEX IF NOT EXISTS idx_turma (turma);

-- Verificar estrutura
DESCRIBE alunos;
