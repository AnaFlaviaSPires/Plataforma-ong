// ============================================================
// database.js v5 - TiDB Cloud SSL Fix
// ============================================================
console.log('>>> database.js v5 carregado');

const { Sequelize } = require('sequelize');
const mysql2 = require('mysql2');
require('dotenv').config();

// CAMADA 3: Monkey-patch mysql2 para SEMPRE usar SSL
// Isso garante SSL independente de como o Sequelize passa as opções
const originalCreateConnection = mysql2.createConnection;
mysql2.createConnection = function(config) {
  if (!config.ssl) {
    config.ssl = {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: false
    };
    console.log('>>> mysql2 patch: SSL injetado na conexão');
  }
  return originalCreateConnection.call(mysql2, config);
};

// Determinar parâmetros de conexão
let dbName, dbUser, dbPass, dbHost, dbPort;

if (process.env.DATABASE_URL) {
  const dbUrl = new URL(process.env.DATABASE_URL);
  dbName = dbUrl.pathname.replace('/', '');
  dbUser = decodeURIComponent(dbUrl.username);
  dbPass = decodeURIComponent(dbUrl.password);
  dbHost = dbUrl.hostname;
  dbPort = dbUrl.port || 4000;
} else {
  dbName = process.env.DB_NAME;
  dbUser = process.env.DB_USER;
  dbPass = process.env.DB_PASSWORD;
  dbHost = process.env.DB_HOST;
  dbPort = process.env.DB_PORT || 3306;
}

console.log('>>> DB:', { host: dbHost, port: dbPort, database: dbName });

// CAMADA 1: SSL via dialectOptions (método padrão do Sequelize)
const sequelize = new Sequelize(dbName, dbUser, dbPass, {
  host: dbHost,
  port: dbPort,
  dialect: 'mysql',
  dialectModule: mysql2,
  logging: false,
  dialectOptions: {
    ssl: {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: false
    }
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

// CAMADA 2: Hook beforeConnect para injetar SSL no dialectOptions
sequelize.addHook('beforeConnect', (config) => {
  console.log('>>> beforeConnect hook executado');
  config.dialectOptions = config.dialectOptions || {};
  config.dialectOptions.ssl = {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: false
  };
});

module.exports = sequelize;
