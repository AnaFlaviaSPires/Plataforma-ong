USE plataforma_ong;

-- Tabelas que faltam
CREATE TABLE IF NOT EXISTS action_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NULL,
    usuario_nome VARCHAR(100) NULL,
    acao VARCHAR(50) NOT NULL,
    tabela_afetada VARCHAR(50) NULL,
    registro_id INT NULL,
    dados_antigos JSON NULL,
    dados_novos JSON NULL,
    ip VARCHAR(45) NULL,
    url_origem VARCHAR(500) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_acao (acao),
    INDEX idx_tabela (tabela_afetada),
    INDEX idx_created_at (created_at)
);

CREATE TABLE IF NOT EXISTS password_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expira_em DATETIME NOT NULL,
    usado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_usuario (usuario_id),
    INDEX idx_expira (expira_em)
);

CREATE TABLE IF NOT EXISTS salas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    professor_id INT NOT NULL,
    dia_semana VARCHAR(20) NOT NULL,
    horario TIME NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    usuario_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (professor_id) REFERENCES professores(id) ON DELETE CASCADE,
    INDEX idx_salas_nome (nome),
    INDEX idx_salas_professor (professor_id),
    INDEX idx_salas_dia_semana (dia_semana),
    INDEX idx_salas_ativo (ativo)
);

CREATE TABLE IF NOT EXISTS sala_alunos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sala_id INT NOT NULL,
    aluno_id INT NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (sala_id) REFERENCES salas(id) ON DELETE CASCADE,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
    
    UNIQUE KEY uq_sala_aluno (sala_id, aluno_id),
    INDEX idx_sala (sala_id),
    INDEX idx_aluno (aluno_id),
    INDEX idx_sala_aluno_ativo (sala_id, ativo)
);

CREATE TABLE IF NOT EXISTS chamadas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sala_id INT NOT NULL,
    data DATE NOT NULL,
    hora TIME NULL,
    observacoes TEXT NULL,
    criado_por INT NULL,
    atualizado_por INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (sala_id) REFERENCES salas(id) ON DELETE CASCADE,
    FOREIGN KEY (criado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (atualizado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    INDEX idx_chamadas_sala_data (sala_id, data),
    INDEX idx_chamadas_data (data)
);

CREATE TABLE IF NOT EXISTS chamada_registros (
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

CREATE TABLE IF NOT EXISTS doacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    doador VARCHAR(100) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    data_doacao DATE NOT NULL,
    tipo_doacao VARCHAR(50) NOT NULL,
    descricao TEXT NULL,
    usuario_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_doacoes_data (data_doacao),
    INDEX idx_doacoes_tipo (tipo_doacao),
    INDEX idx_usuario (usuario_id)
);

CREATE TABLE IF NOT EXISTS eventos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT NULL,
    data_evento DATE NOT NULL,
    horario_inicio TIME NOT NULL,
    horario_fim TIME NOT NULL,
    local VARCHAR(200) NOT NULL,
    tipo_evento VARCHAR(50) NOT NULL,
    max_participantes INT NULL,
    criado_por INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (criado_por) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_eventos_data (data_evento),
    INDEX idx_eventos_tipo (tipo_evento),
    INDEX idx_criado_por (criado_por)
);

CREATE TABLE IF NOT EXISTS evento_participantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evento_id INT NOT NULL,
    usuario_id INT NOT NULL,
    data_inscricao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    
    UNIQUE KEY uq_evento_usuario (evento_id, usuario_id),
    INDEX idx_evento (evento_id),
    INDEX idx_usuario (usuario_id)
);

CREATE TABLE IF NOT EXISTS documentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT NULL,
    tipo_documento VARCHAR(50) NOT NULL,
    arquivo_url VARCHAR(500) NOT NULL,
    tamanho_arquivo INT NULL,
    mime_type VARCHAR(100) NULL,
    criado_por INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (criado_por) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_documentos_tipo (tipo_documento),
    INDEX idx_criado_por (criado_por),
    INDEX idx_created_at (created_at)
);

-- Verificar tabelas criadas
SHOW TABLES;
