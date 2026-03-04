const { Sequelize } = require('sequelize');
require('dotenv').config();

// Opções comuns do Sequelize
// Compatível com TiDB Cloud, PlanetScale e outros serviços MySQL com SSL
const commonOptions = {
  dialect: 'mysql',
  dialectModule: require('mysql2'),
  dialectOptions: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
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
};

// Configuração da conexão com MySQL
// Suporta DATABASE_URL (TiDB Cloud/PlanetScale/serviços cloud) ou variáveis individuais
// Exemplo DATABASE_URL: mysql://user:password@host:4000/database
let sequelize;

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, commonOptions);
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      ...commonOptions
    }
  );
}

module.exports = sequelize;
