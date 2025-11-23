-- =====================================================
-- SCRIPT DE CONFIGURAÇÃO COMPLETO DO BANCO DE DADOS MYSQL
-- PLATAFORMA ONG NOVO AMANHÃ
-- =====================================================
-- Execute este script no MySQL Workbench para criar o banco completo

-- 1. CRIAR BANCO DE DADOS
-- =====================================================
CREATE DATABASE IF NOT EXISTS plataforma_ong 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Usar o banco criado
USE plataforma_ong;

-- 2. CRIAR USUÁRIO PARA A APLICAÇÃO
-- =====================================================
-- Criar usuário (caso não exista) e garantir permissões
CREATE USER IF NOT EXISTS 'ong_user'@'localhost' IDENTIFIED BY '123456';
GRANT ALL PRIVILEGES ON plataforma_ong.* TO 'ong_user'@'localhost';
FLUSH PRIVILEGES;

-- 3. CRIAR TABELAS
-- =====================================================

-- Tabela de Usuários
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    cargo ENUM('admin', 'coordenador', 'professor', 'voluntario') NOT NULL DEFAULT 'voluntario',
    ativo BOOLEAN DEFAULT TRUE,
    ultimo_login DATETIME NULL,
    avatar TEXT NULL,
    telefone VARCHAR(20) NULL,
    data_nascimento DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_cargo (cargo),
    INDEX idx_ativo (ativo)
);

-- Tabela de Professores
CREATE TABLE professores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    rg VARCHAR(20),
    data_nasc DATE NOT NULL,
    sexo ENUM('M', 'F', 'Outro') NOT NULL,
    email VARCHAR(100) UNIQUE,
    telefone VARCHAR(15),
    endereco VARCHAR(200),
    numero VARCHAR(10),
    complemento VARCHAR(50),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(9),
    formacao VARCHAR(200) NOT NULL,
    especializacao TEXT,
    experiencia_anos INT,
    registro_profissional VARCHAR(50),
    salario DECIMAL(10, 2),
    data_admissao DATE NOT NULL DEFAULT (CURRENT_DATE),
    data_demissao DATE NULL,
    status ENUM('ativo', 'inativo', 'licenca', 'ferias') NOT NULL DEFAULT 'ativo',
    carga_horaria_semanal INT,
    observacoes TEXT,
    foto_url VARCHAR(500),
    usuario_id INT NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_cpf (cpf),
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_ativo (ativo),
    INDEX idx_usuario (usuario_id)
);

-- Tabela de Cursos
CREATE TABLE cursos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    descricao TEXT,
    categoria ENUM('informatica', 'artesanato', 'culinaria', 'idiomas', 'musica', 'esportes', 'reforco_escolar', 'profissionalizante', 'outros') NOT NULL DEFAULT 'outros',
    nivel ENUM('iniciante', 'intermediario', 'avancado') NOT NULL DEFAULT 'iniciante',
    carga_horaria_total INT NOT NULL,
    duracao_meses INT NOT NULL,
    idade_minima INT,
    idade_maxima INT,
    vagas_disponiveis INT NOT NULL,
    vagas_ocupadas INT DEFAULT 0,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    horario_inicio TIME NOT NULL,
    horario_fim TIME NOT NULL,
    dias_semana JSON NOT NULL,
    local VARCHAR(200) NOT NULL,
    sala VARCHAR(50),
    material_necessario TEXT,
    pre_requisitos TEXT,
    objetivos TEXT,
    metodologia TEXT,
    avaliacao TEXT,
    certificado BOOLEAN DEFAULT TRUE,
    valor_curso DECIMAL(10, 2) DEFAULT 0.00,
    gratuito BOOLEAN DEFAULT TRUE,
    status ENUM('planejado', 'inscricoes_abertas', 'em_andamento', 'concluido', 'cancelado', 'suspenso') NOT NULL DEFAULT 'planejado',
    professor_id INT NOT NULL,
    usuario_id INT NOT NULL,
    observacoes TEXT,
    foto_url VARCHAR(500),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (professor_id) REFERENCES professores(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_codigo (codigo),
    INDEX idx_categoria (categoria),
    INDEX idx_status (status),
    INDEX idx_professor (professor_id),
    INDEX idx_data_inicio (data_inicio),
    INDEX idx_ativo (ativo)
);

-- Tabela de Alunos
CREATE TABLE alunos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    data_nasc DATE NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    rg VARCHAR(20),
    sexo ENUM('M', 'F', 'Outro') NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(150),
    
    -- Endereço
    endereco VARCHAR(200),
    numero VARCHAR(10),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(10),
    
    -- Dados do responsável
    nome_responsavel VARCHAR(100),
    cpf_responsavel VARCHAR(14),
    telefone_responsavel VARCHAR(20),
    email_responsavel VARCHAR(150),
    parentesco VARCHAR(50),
    
    -- Informações acadêmicas
    turma VARCHAR(50),
    serie VARCHAR(20),
    escola VARCHAR(150),
    
    -- Informações médicas/especiais
    restricao_alimentar TEXT,
    medicamentos TEXT,
    observacoes_medicas TEXT,
    
    -- Status e controle
    ativo BOOLEAN DEFAULT TRUE,
    data_matricula DATE NOT NULL DEFAULT (CURRENT_DATE),
    numero_matricula VARCHAR(20) UNIQUE,
    
    -- Anexos
    foto TEXT,
    documentos JSON DEFAULT ('[]'),
    
    usuario_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_cpf (cpf),
    INDEX idx_numero_matricula (numero_matricula),
    INDEX idx_ativo (ativo),
    INDEX idx_data_matricula (data_matricula)
);

-- 4. INSERIR DADOS INICIAIS
-- =====================================================

-- Usuário administrador padrão (senha: admin123)
INSERT INTO usuarios (nome, email, senha, cargo) VALUES 
('Administrador', 'admin@ongnovoamanha.org', '$2b$12$rQZ8kHWKtGKVQZ8kHWKtGOeX8kHWKtGKVQZ8kHWKtGKVQZ8kHWKtG', 'admin');

-- Professor exemplo
INSERT INTO professores (
    nome, cpf, data_nasc, sexo, email, telefone, formacao, 
    experiencia_anos, status, usuario_id
) VALUES (
    'Maria Silva Santos', '123.456.789-00', '1985-03-15', 'F', 
    'maria.silva@ongnovoamanha.org', '(11) 99999-9999', 
    'Pedagogia - Universidade de São Paulo', 5, 'ativo', 1
);

-- Curso exemplo
INSERT INTO cursos (
    nome, codigo, descricao, categoria, nivel, carga_horaria_total, 
    duracao_meses, vagas_disponiveis, data_inicio, data_fim, 
    horario_inicio, horario_fim, dias_semana, local, professor_id, usuario_id
) VALUES (
    'Informática Básica', 'INF001', 'Curso básico de informática para iniciantes', 
    'informatica', 'iniciante', 40, 2, 20, '2024-02-01', '2024-04-01', 
    '14:00:00', '16:00:00', '["segunda", "quarta", "sexta"]', 
    'Sala de Informática', 1, 1
);

-- Aluno exemplo
INSERT INTO alunos (
    nome, data_nasc, sexo, telefone, endereco, bairro, cidade, 
    estado, nome_responsavel, telefone_responsavel, turma, usuario_id
) VALUES (
    'João Pedro Silva', '2010-05-20', 'M', '(11) 98888-8888', 
    'Rua das Flores, 123', 'Centro', 'São Paulo', 'SP', 
    'Ana Silva', '(11) 97777-7777', 'Turma A', 1
);

-- 5. VERIFICAÇÕES FINAIS
-- =====================================================

-- Verificar se o banco foi criado
SHOW DATABASES LIKE 'plataforma_ong';

-- Verificar tabelas criadas
SHOW TABLES;

-- Verificar charset
SELECT DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME 
FROM information_schema.SCHEMATA 
WHERE SCHEMA_NAME = 'plataforma_ong';

-- Verificar usuário criado
SELECT User, Host FROM mysql.user WHERE User = 'ong_user';

-- Configurações adicionais
SET time_zone = '-03:00';

-- Status final
SELECT 
    'Banco de dados configurado com sucesso!' AS status,
    DATABASE() AS banco_atual,
    USER() AS usuario_atual,
    NOW() AS data_hora,
    (SELECT COUNT(*) FROM usuarios) AS total_usuarios,
    (SELECT COUNT(*) FROM professores) AS total_professores,
    (SELECT COUNT(*) FROM cursos) AS total_cursos,
    (SELECT COUNT(*) FROM alunos) AS total_alunos;
    USE plataforma_ong;
SELECT * FROM alunos;

USE plataforma_ong;

ALTER TABLE usuarios
  ADD COLUMN reset_token VARCHAR(255) NULL,
  ADD COLUMN reset_token_expires DATETIME NULL;

SELECT * FROM usuarios;

SELECT * FROM alunos;

-- SALAS / OFICINAS
CREATE TABLE salas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    professor VARCHAR(100) NOT NULL,         -- nome do professor (pode depois virar FK para professores)
    dia_semana VARCHAR(20) NOT NULL,        -- ex: 'Segunda-feira'
    horario TIME NOT NULL,
    
    -- Status / controle
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Controle de auditoria
    usuario_id INT NULL,                    -- usuário que criou
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    INDEX idx_salas_nome (nome),
    INDEX idx_salas_professor (professor),
    INDEX idx_salas_dia_semana (dia_semana),
    INDEX idx_salas_ativo (ativo)
);

-- RELAÇÃO SALA x ALUNOS (muitos-para-muitos)
CREATE TABLE sala_alunos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sala_id INT NOT NULL,
    aluno_id INT NOT NULL,
    
    -- controle opcional
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (sala_id) REFERENCES salas(id) ON DELETE CASCADE,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
    
    UNIQUE KEY uq_sala_aluno (sala_id, aluno_id),
    INDEX idx_sala (sala_id),
    INDEX idx_aluno (aluno_id),
    INDEX idx_sala_aluno_ativo (sala_id, ativo)
);


-- CABEÇALHO DA CHAMADA (uma por sala/dia/horário)
CREATE TABLE chamadas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sala_id INT NOT NULL,
    data DATE NOT NULL,                     -- dia da chamada
    hora TIME NULL,                         -- horário (opcional)
    
    -- controle
    observacoes TEXT NULL,
    criado_por INT NULL,                    -- usuario_id que iniciou
    atualizado_por INT NULL,                -- último que salvou
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (sala_id) REFERENCES salas(id) ON DELETE CASCADE,
    FOREIGN KEY (criado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (atualizado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    INDEX idx_chamadas_sala_data (sala_id, data),
    INDEX idx_chamadas_data (data)
);

-- REGISTROS DE PRESENÇA POR ALUNO
CREATE TABLE chamada_registros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chamada_id INT NOT NULL,
    aluno_id INT NOT NULL,
    
    presente BOOLEAN NOT NULL DEFAULT TRUE,
    observacao VARCHAR(255) NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (chamada_id) REFERENCES chamadas(id) ON DELETE CASCADE,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
    
    UNIQUE KEY uq_chamada_aluno (chamada_id, aluno_id),
    INDEX idx_chamada (chamada_id),
    INDEX idx_aluno (aluno_id)
);

USE plataforma_ong;

ALTER TABLE sala_alunos
  ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;