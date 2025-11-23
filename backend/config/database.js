const { Sequelize } = require('sequelize');
require('dotenv').config();

// Log temporário para depuração das variáveis de ambiente do banco
console.log('DEBUG DB CONFIG:', {
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  DB_PORT: process.env.DB_PORT,
});

// Configuração da conexão com MySQL
const sequelize = new Sequelize(
  process.env.DB_NAME || 'plataforma_ong',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '5808',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    },
    timezone: '-03:00' // Fuso horário do Brasil
  }
);

module.exports = sequelize;
