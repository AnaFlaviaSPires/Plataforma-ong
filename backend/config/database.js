const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuração da conexão com MySQL
// Compatível com TiDB Cloud, PlanetScale e outros serviços MySQL com SSL
let sequelize;

if (process.env.DATABASE_URL) {
  // Conexão via DATABASE_URL (TiDB Cloud / serviços cloud)
  // Parsear a URL para extrair componentes e garantir SSL
  const dbUrl = new URL(process.env.DATABASE_URL);
  sequelize = new Sequelize(
    dbUrl.pathname.replace('/', ''),  // database name
    decodeURIComponent(dbUrl.username),
    decodeURIComponent(dbUrl.password),
    {
      host: dbUrl.hostname,
      port: dbUrl.port || 4000,
      dialect: 'mysql',
      dialectModule: require('mysql2'),
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
    }
  );
} else {
  // Conexão via variáveis individuais (desenvolvimento local)
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      dialectModule: require('mysql2'),
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
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
    }
  );
}

module.exports = sequelize;
