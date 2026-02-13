const { sequelize } = require('./models');

async function addFrequenciaFields() {
  try {
    console.log('🔧 Adicionando campos de frequência na tabela alunos...');

    // Adicionar coluna total_presencas
    try {
      await sequelize.query(`
        ALTER TABLE alunos 
        ADD COLUMN total_presencas INT NOT NULL DEFAULT 0 
        COMMENT 'Total de presenças registradas - uso analítico'
      `);
      console.log('✅ Coluna total_presencas adicionada');
    } catch (err) {
      if (err.original && err.original.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  Coluna total_presencas já existe');
      } else {
        throw err;
      }
    }

    // Adicionar coluna total_faltas
    try {
      await sequelize.query(`
        ALTER TABLE alunos 
        ADD COLUMN total_faltas INT NOT NULL DEFAULT 0 
        COMMENT 'Total de faltas registradas - uso analítico'
      `);
      console.log('✅ Coluna total_faltas adicionada');
    } catch (err) {
      if (err.original && err.original.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  Coluna total_faltas já existe');
      } else {
        throw err;
      }
    }

    // Adicionar coluna ultima_atualizacao_frequencia
    try {
      await sequelize.query(`
        ALTER TABLE alunos 
        ADD COLUMN ultima_atualizacao_frequencia DATETIME NULL 
        COMMENT 'Última atualização dos dados de frequência'
      `);
      console.log('✅ Coluna ultima_atualizacao_frequencia adicionada');
    } catch (err) {
      if (err.original && err.original.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  Coluna ultima_atualizacao_frequencia já existe');
      } else {
        throw err;
      }
    }

    console.log('\n🎉 Campos de frequência configurados com sucesso!');
    console.log('📊 Esses dados serão atualizados automaticamente e usados no Power BI.');
    console.log('⚠️  Nada será exibido no frontend - apenas armazenamento para análise.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao adicionar campos:', error.message);
    process.exit(1);
  }
}

addFrequenciaFields();
