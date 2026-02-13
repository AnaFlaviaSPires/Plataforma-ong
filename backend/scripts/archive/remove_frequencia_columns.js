const { sequelize } = require('./models');

async function removeFrequenciaColumns() {
  try {
    console.log('🔧 Removendo colunas de frequência da tabela alunos...');

    // Remover coluna total_presencas
    try {
      await sequelize.query(`
        ALTER TABLE alunos 
        DROP COLUMN total_presencas
      `);
      console.log('✅ Coluna total_presencas removida');
    } catch (err) {
      if (err.original && err.original.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
        console.log('ℹ️  Coluna total_presencas não existe');
      } else {
        throw err;
      }
    }

    // Remover coluna total_faltas
    try {
      await sequelize.query(`
        ALTER TABLE alunos 
        DROP COLUMN total_faltas
      `);
      console.log('✅ Coluna total_faltas removida');
    } catch (err) {
      if (err.original && err.original.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
        console.log('ℹ️  Coluna total_faltas não existe');
      } else {
        throw err;
      }
    }

    console.log('\n🎉 Colunas de frequência removidas com sucesso!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao remover colunas:', error.message);
    process.exit(1);
  }
}

removeFrequenciaColumns();
