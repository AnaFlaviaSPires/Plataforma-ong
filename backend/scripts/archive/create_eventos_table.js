require('dotenv').config({ path: '../.env' });
const { Sequelize } = require('sequelize');

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

async function createTable() {
  try {
    await sequelize.authenticate();
    console.log('Conexão estabelecida.');

    console.log('Criando tabela eventos...');
    
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS eventos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        descricao TEXT,
        inicio DATETIME NOT NULL,
        fim DATETIME NOT NULL,
        dia_inteiro BOOLEAN DEFAULT FALSE,
        categoria ENUM('meeting', 'event', 'task', 'reminder') DEFAULT 'event',
        visibilidade ENUM('public', 'private') DEFAULT 'public',
        criado_por INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at DATETIME NULL,
        FOREIGN KEY (criado_por) REFERENCES usuarios(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('Tabela eventos criada com sucesso.');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao criar tabela:', error);
    process.exit(1);
  }
}

createTable();
