const { sequelize } = require('./models');

async function addFrequenciaColumns() {
  try {
    console.log('🔧 Adicionando colunas de frequência na tabela alunos...');

    // Verificar e adicionar coluna total_presencas
    try {
      await sequelize.query(`
        ALTER TABLE alunos 
        ADD COLUMN total_presencas INT NOT NULL DEFAULT 0
      `);
      console.log('✅ Coluna total_presencas adicionada');
    } catch (err) {
      if (err.original && err.original.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  Coluna total_presencas já existe');
      } else {
        throw err;
      }
    }

    // Verificar e adicionar coluna total_faltas
    try {
      await sequelize.query(`
        ALTER TABLE alunos 
        ADD COLUMN total_faltas INT NOT NULL DEFAULT 0
      `);
      console.log('✅ Coluna total_faltas adicionada');
    } catch (err) {
      if (err.original && err.original.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  Coluna total_faltas já existe');
      } else {
        throw err;
      }
    }

    console.log('\n🎉 Colunas de frequência configuradas com sucesso!');
    console.log('📊 Agora os contadores serão atualizados automaticamente a cada chamada registrada.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao adicionar colunas:', error.message);
    process.exit(1);
  }
}

addFrequenciaColumns();
