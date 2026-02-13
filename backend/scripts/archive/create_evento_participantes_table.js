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

    console.log('Criando tabela evento_participantes...');
    
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS evento_participantes (
        evento_id INT NOT NULL,
        usuario_id INT NOT NULL,
        PRIMARY KEY (evento_id, usuario_id),
        FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('Tabela evento_participantes criada com sucesso.');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao criar tabela:', error);
    process.exit(1);
  }
}

createTable();
