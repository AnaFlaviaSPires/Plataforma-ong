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

async function listUsers() {
  try {
    await sequelize.authenticate();
    console.log('Conectado.');
    const [users] = await sequelize.query("SELECT id, nome, email, cargo, ativo FROM usuarios");
    console.table(users);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

listUsers();
