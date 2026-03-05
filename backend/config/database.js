// Configuração baseada no exemplo oficial TiDB Cloud + Sequelize:
// https://github.com/tidb-samples/tidb-nodejs-sequelize-quickstart
const { Sequelize } = require('sequelize');
require('dotenv').config();

console.log('*** database.js v8 ***');

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
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  },
  timezone: '-03:00',
});

module.exports = sequelize;
