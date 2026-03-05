// ============================================================
// database.js v6 - TiDB Cloud SSL Fix
// ============================================================
console.log('=== DATABASE.JS V6 CARREGADO ===');

const { Sequelize } = require('sequelize');
const mysql2 = require('mysql2');
require('dotenv').config();

// SSL obrigatório para TiDB Cloud
const SSL_CONFIG = { minVersion: 'TLSv1.2', rejectUnauthorized: false };

// Proxy que intercepta mysql2.createConnection e FORÇA SSL
const mysql2Wrapped = new Proxy(mysql2, {
  get(target, prop) {
    if (prop === 'createConnection') {
      return function(config) {
        config.ssl = SSL_CONFIG;
        console.log('=== MYSQL2 PROXY: SSL FORCADO ===');
        return target.createConnection(config);
      };
    }
    return target[prop];
  }
});

// Parâmetros de conexão (variáveis individuais)
const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT || 3306;
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASSWORD;

console.log('=== DB CONFIG ===', { host: dbHost, port: dbPort, database: dbName });

const sequelize = new Sequelize(dbName, dbUser, dbPass, {
  host: dbHost,
  port: parseInt(dbPort),
  dialect: 'mysql',
  dialectModule: mysql2Wrapped,
  logging: false,
  dialectOptions: {
    ssl: SSL_CONFIG
  },
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
  timezone: '-03:00'
});

// Hook extra: injetar SSL antes de cada conexão
sequelize.addHook('beforeConnect', (config) => {
  config.ssl = SSL_CONFIG;
  console.log('=== BEFORE CONNECT: SSL INJETADO ===');
});

module.exports = sequelize;
