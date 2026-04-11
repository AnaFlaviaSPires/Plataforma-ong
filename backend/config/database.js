// Configuração baseada no exemplo oficial TiDB Cloud + Sequelize:
// https://github.com/tidb-samples/tidb-nodejs-sequelize-quickstart
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 4000,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'test',
  logging: false,
  dialectOptions: {
    ssl: {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: true,
    },
  },
  pool: {
    max: parseInt(process.env.DB_POOL_MAX) || 10,
    min: parseInt(process.env.DB_POOL_MIN) || 2,
    acquire: 30000,
    idle: 10000,
    evict: 60000,
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  },
  timezone: '-03:00',
});

module.exports = sequelize;
