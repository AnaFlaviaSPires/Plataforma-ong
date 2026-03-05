const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuração da conexão com MySQL
// Compatível com TiDB Cloud (SSL obrigatório)
let sequelize;

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

console.log('🔧 DB Config:', { host: dbHost, port: dbPort, database: dbName, user: dbUser ? '***' : 'undefined' });

sequelize = new Sequelize(dbName, dbUser, dbPass, {
  host: dbHost,
  port: dbPort,
  dialect: 'mysql',
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

// Hook para GARANTIR que SSL é injetado em cada conexão mysql2
// Isso contorna qualquer problema de merge de opções do Sequelize
sequelize.addHook('beforeConnect', (config) => {
  console.log('🔒 beforeConnect: injetando SSL na conexão mysql2');
  config.ssl = {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: false
  };
});

module.exports = sequelize;
