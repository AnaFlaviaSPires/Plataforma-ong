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

async function sanitizeProfiles() {
  try {
    await sequelize.authenticate();
    console.log('Conexão estabelecida. Iniciando sanitização de perfis...');

    // 1. Atualizar dados legados
    console.log('Migrando perfis antigos...');
    await sequelize.query("UPDATE usuarios SET cargo='admin' WHERE cargo='coordenador'");
    await sequelize.query("UPDATE usuarios SET cargo='secretaria' WHERE cargo='voluntario'");
    
    // Garantir que qualquer outro valor inválido vire 'secretaria' (fallback seguro)
    await sequelize.query("UPDATE usuarios SET cargo='secretaria' WHERE cargo NOT IN ('admin', 'professor', 'secretaria', 'assistente_social')");

    // 2. Alterar estrutura da tabela (Sanitização do ENUM)
    console.log('Alterando coluna cargo para novo ENUM restrito...');
    await sequelize.query(`
      ALTER TABLE usuarios
      MODIFY COLUMN cargo ENUM('admin', 'professor', 'secretaria', 'assistente_social')
      NOT NULL DEFAULT 'secretaria'
    `);

    console.log('Sanitização concluída com sucesso.');
    process.exit(0);
  } catch (error) {
    console.error('Erro fatal na sanitização:', error);
    process.exit(1);
  }
}

sanitizeProfiles();
