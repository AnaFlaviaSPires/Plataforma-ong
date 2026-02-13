const fs = require('fs');
const path = require('path');
const { sequelize } = require('./models');

async function runMigration() {
  try {
    console.log('🔄 Iniciando migração de tipos de doação...');
    
    const sqlPath = path.join(__dirname, 'database', 'update_doacao_types.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Divide o arquivo SQL em comandos individuais (separados por ;)
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    for (const statement of statements) {
      console.log(`▶️ Executando: ${statement.substring(0, 50)}...`);
      await sequelize.query(statement);
    }

    console.log('✅ Migração concluída com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    process.exit(1);
  }
}

runMigration();
