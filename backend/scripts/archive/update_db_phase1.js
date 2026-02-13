require('dotenv').config({ path: '../.env' });
const { Sequelize } = require('sequelize');

// Configuração direta para evitar carregar modelos e hooks desnecessários agora
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: console.log
  }
);

async function runMigration() {
  try {
    await sequelize.authenticate();
    console.log('Conexão estabelecida com sucesso.');

    // 1. Expandir ENUM de perfis
    console.log('--- Expandindo ENUM de perfis ---');
    await sequelize.query(`
      ALTER TABLE usuarios 
      MODIFY COLUMN cargo ENUM('admin', 'coordenador', 'professor', 'voluntario', 'secretaria', 'assistente_social') 
      NOT NULL DEFAULT 'voluntario';
    `);
    console.log('ENUM expandido.');

    // 2. Criar tabela de logs
    console.log('--- Criando tabela de logs ---');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS action_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NULL,
        usuario_nome VARCHAR(100),
        acao VARCHAR(50) NOT NULL,
        tabela_afetada VARCHAR(50),
        registro_id INT,
        dados_antigos JSON,
        dados_novos JSON,
        ip VARCHAR(45),
        url_origem VARCHAR(255),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_usuario (usuario_id),
        INDEX idx_acao (acao),
        INDEX idx_data (created_at),
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('Tabela action_logs verificada/criada.');

    // 3. Adicionar deletedAt (Lixeira)
    console.log('--- Adicionando colunas deletedAt ---');
    const tabelas = ['alunos', 'salas', 'professores', 'doacoes'];
    
    for (const tabela of tabelas) {
      try {
        // Verifica se a coluna existe
        const [results] = await sequelize.query(`
          SELECT count(*) as count 
          FROM information_schema.columns 
          WHERE table_schema = '${process.env.DB_NAME}' 
          AND table_name = '${tabela}' 
          AND column_name = 'deletedAt';
        `);
        
        if (results[0].count === 0) {
            await sequelize.query(`ALTER TABLE ${tabela} ADD COLUMN deletedAt TIMESTAMP NULL DEFAULT NULL;`);
            console.log(`Coluna deletedAt adicionada em ${tabela}.`);
        } else {
            console.log(`Coluna deletedAt já existe em ${tabela}.`);
        }
      } catch (err) {
        console.error(`Erro ao alterar tabela ${tabela}:`, err.message);
      }
    }

    console.log('--- Migração Fase 1 concluída com sucesso ---');
    process.exit(0);
  } catch (error) {
    console.error('Erro fatal na migração:', error);
    process.exit(1);
  }
}

runMigration();
