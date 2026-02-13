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

async function fixDeletedAt() {
  try {
    await sequelize.authenticate();
    console.log('Conexão estabelecida para correção.');

    const tabelas = ['alunos', 'salas', 'professores', 'doacoes'];
    
    for (const tabela of tabelas) {
      try {
        // Verificar se a coluna deletedAt existe antes de tentar renomear
        const [columns] = await sequelize.query(`SHOW COLUMNS FROM ${tabela} LIKE 'deletedAt'`);
        
        if (columns.length > 0) {
            console.log(`Renomeando deletedAt para deleted_at na tabela ${tabela}...`);
            await sequelize.query(`ALTER TABLE ${tabela} CHANGE deletedAt deleted_at TIMESTAMP NULL DEFAULT NULL;`);
            console.log(`Sucesso: ${tabela}`);
        } else {
            console.log(`Coluna deletedAt não encontrada em ${tabela} (pode já ser deleted_at ou não existir).`);
            // Verifica se já é deleted_at
            const [cols] = await sequelize.query(`SHOW COLUMNS FROM ${tabela} LIKE 'deleted_at'`);
            if (cols.length > 0) {
                console.log(`Coluna deleted_at já existe em ${tabela}.`);
            }
        }
      } catch (err) {
        console.error(`Erro ao alterar tabela ${tabela}:`, err.message);
      }
    }

    console.log('Correção concluída.');
    process.exit(0);
  } catch (error) {
    console.error('Erro fatal na correção:', error);
    process.exit(1);
  }
}

fixDeletedAt();
