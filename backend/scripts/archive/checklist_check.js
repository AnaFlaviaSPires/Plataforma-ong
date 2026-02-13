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
    logging: false
  }
);

async function check() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão MySQL ok');

    const [tables] = await sequelize.query('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);
    
    const required = ['usuarios', 'action_logs', 'password_resets'];
    const missing = required.filter(t => !tableNames.includes(t));

    if (missing.length === 0) {
        console.log('✅ Tabelas críticas existem');
    } else {
        console.error('❌ Faltando tabelas:', missing);
    }

    // Checar ENUM
    const [columns] = await sequelize.query("SHOW COLUMNS FROM usuarios LIKE 'cargo'");
    const type = columns[0].Type;
    console.log('ℹ️ Enum atual:', type);
    
    if (type.includes("'admin','professor','secretaria','assistente_social'")) {
        console.log('✅ Enum cargos correto');
    } else {
        console.error('❌ Enum cargos incorreto ou contém valores antigos');
    }

    process.exit(0);
  } catch (err) {
    console.error('Erro:', err);
    process.exit(1);
  }
}

check();
