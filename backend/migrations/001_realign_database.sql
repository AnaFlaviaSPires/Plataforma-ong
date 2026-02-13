-- =====================================================
-- MIGRAÇÃO: REALINHAMENTO DO BANCO COM O SISTEMA
-- Data: 2026-01-25
-- Versão: 1.0
-- =====================================================
-- Este script alinha a estrutura do banco de dados
-- com o frontend e backend do sistema.
-- =====================================================

USE plataforma_ong;

-- =====================================================
-- 1. BACKUP DAS TABELAS EXISTENTES (segurança)
-- =====================================================
-- Criar tabelas de backup antes de modificar
CREATE TABLE IF NOT EXISTS _backup_doacoes_old AS SELECT * FROM doacoes;
CREATE TABLE IF NOT EXISTS _backup_alunos_old AS SELECT * FROM alunos;

-- =====================================================
-- 2. RECRIAR TABELA DOACOES (alinhada com frontend)
-- =====================================================
-- Frontend envia: nome_doador, tipo, valor, descricao_itens
-- Model espera: nome_doador, email_doador, telefone_doador, documento_doador, tipo, valor, descricao_itens, observacoes, status, data_doacao, data_recebimento, data_cancelamento, usuario_id

DROP TABLE IF EXISTS doacoes_new;
CREATE TABLE doacoes_new (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Dados do doador
    nome_doador VARCHAR(150) NOT NULL DEFAULT 'Anônimo',
    email_doador VARCHAR(150) NULL,
    telefone_doador VARCHAR(30) NULL,
    documento_doador VARCHAR(30) NULL,
    
    -- Informações da doação
    tipo ENUM('alimentos', 'materiais_higiene', 'materiais_escolares', 'dinheiro', 'outros') NOT NULL DEFAULT 'outros',
    valor DECIMAL(10, 2) NULL DEFAULT 0,
    descricao_itens TEXT NULL,
    observacoes TEXT NULL,
    
    -- Status e datas
    status ENUM('pendente', 'recebida', 'cancelada') NOT NULL DEFAULT 'pendente',
    data_doacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_recebimento DATETIME NULL,
    data_cancelamento DATETIME NULL,
    
    -- Auditoria
    usuario_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_doacoes_tipo (tipo),
    INDEX idx_doacoes_status (status),
    INDEX idx_doacoes_data (data_doacao),
    INDEX idx_doacoes_usuario (usuario_id)
);

-- Migrar dados existentes (se houver)
INSERT INTO doacoes_new (nome_doador, tipo, valor, descricao_itens, data_doacao, usuario_id, created_at, updated_at)
SELECT 
    COALESCE(doador, 'Anônimo') as nome_doador,
    CASE tipo_doacao
        WHEN 'alimento' THEN 'alimentos'
        WHEN 'higiene' THEN 'materiais_higiene'
        WHEN 'material_escolar' THEN 'materiais_escolares'
        WHEN 'financeiro' THEN 'dinheiro'
        WHEN 'dinheiro' THEN 'dinheiro'
        ELSE 'outros'
    END as tipo,
    COALESCE(valor, 0) as valor,
    descricao as descricao_itens,
    data_doacao,
    usuario_id,
    created_at,
    updated_at
FROM doacoes;

-- Substituir tabela antiga pela nova
DROP TABLE IF EXISTS doacoes;
RENAME TABLE doacoes_new TO doacoes;

-- =====================================================
-- 3. ATUALIZAR TABELA ALUNOS (adicionar campos faltantes)
-- =====================================================
-- Verificar e adicionar colunas que faltam

-- Adicionar coluna status se não existir
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'plataforma_ong' AND TABLE_NAME = 'alunos' AND COLUMN_NAME = 'status');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE alunos ADD COLUMN status ENUM(''matriculado'', ''inativo'', ''cancelado'', ''formado'', ''aguardando_vaga'') NOT NULL DEFAULT ''matriculado'' AFTER ativo', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Adicionar coluna deleted_at se não existir
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'plataforma_ong' AND TABLE_NAME = 'alunos' AND COLUMN_NAME = 'deleted_at');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE alunos ADD COLUMN deleted_at TIMESTAMP NULL AFTER updated_at', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Adicionar coluna total_presencas se não existir
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'plataforma_ong' AND TABLE_NAME = 'alunos' AND COLUMN_NAME = 'total_presencas');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE alunos ADD COLUMN total_presencas INT NOT NULL DEFAULT 0', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Adicionar coluna total_faltas se não existir
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'plataforma_ong' AND TABLE_NAME = 'alunos' AND COLUMN_NAME = 'total_faltas');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE alunos ADD COLUMN total_faltas INT NOT NULL DEFAULT 0', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Adicionar coluna parentesco se não existir (frontend usa parentesco_responsavel mas model usa parentesco)
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'plataforma_ong' AND TABLE_NAME = 'alunos' AND COLUMN_NAME = 'parentesco');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE alunos ADD COLUMN parentesco VARCHAR(50) NULL AFTER email_responsavel', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Atualizar status dos alunos existentes baseado no campo ativo
UPDATE alunos SET status = 'matriculado' WHERE ativo = 1 AND (status IS NULL OR status = '');
UPDATE alunos SET status = 'inativo' WHERE ativo = 0 AND (status IS NULL OR status = '');

-- =====================================================
-- 4. ATUALIZAR TABELA SALAS (adicionar campo professor texto)
-- =====================================================
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'plataforma_ong' AND TABLE_NAME = 'salas' AND COLUMN_NAME = 'professor');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE salas ADD COLUMN professor VARCHAR(100) NULL AFTER nome', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Adicionar deleted_at para soft delete
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'plataforma_ong' AND TABLE_NAME = 'salas' AND COLUMN_NAME = 'deleted_at');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE salas ADD COLUMN deleted_at TIMESTAMP NULL AFTER updated_at', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- 5. VERIFICAÇÃO FINAL
-- =====================================================
SELECT 'MIGRAÇÃO CONCLUÍDA COM SUCESSO!' as status;

SELECT 
    'doacoes' as tabela, 
    COUNT(*) as registros,
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'plataforma_ong' AND TABLE_NAME = 'doacoes') as colunas
FROM doacoes
UNION ALL
SELECT 
    'alunos' as tabela, 
    COUNT(*) as registros,
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'plataforma_ong' AND TABLE_NAME = 'alunos') as colunas
FROM alunos
UNION ALL
SELECT 
    'salas' as tabela, 
    COUNT(*) as registros,
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'plataforma_ong' AND TABLE_NAME = 'salas') as colunas
FROM salas
UNION ALL
SELECT 
    'usuarios' as tabela, 
    COUNT(*) as registros,
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'plataforma_ong' AND TABLE_NAME = 'usuarios') as colunas
FROM usuarios;
