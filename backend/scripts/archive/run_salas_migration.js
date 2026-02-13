const fs = require('fs');
const path = require('path');
const { sequelize } = require('./models');

async function runMigration() {
  try {
    console.log('🔄 Iniciando migração de professor_id em salas...');
    
    const sqlPath = path.join(__dirname, 'database', 'add_professor_id_to_salas.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    for (const statement of statements) {
      console.log(`▶️ Executando: ${statement.substring(0, 50)}...`);
      try {
          await sequelize.query(statement);
      } catch (e) {
          console.log('⚠️ Aviso (pode já existir):', e.message);
      }
    }

    console.log('✅ Migração concluída com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    process.exit(1);
  }
}

runMigration();
