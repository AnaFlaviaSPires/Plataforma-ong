const { sequelize } = require('./models');

async function deepCheck() {
  try {
    console.log('🕵️ Investigação Profunda de Dados (SQL Puro)...\n');

    // Verificar conexão atual para ter certeza de onde estamos
    const config = require('./config/database');
    console.log(`🔌 Conectado em: ${config.host} (Database: ${config.database})`);

    // Contar TUDO (SQL cru ignora o filtro do Sequelize de soft-delete)
    const [alunosRaw] = await sequelize.query("SELECT COUNT(*) as total FROM alunos");
    const [alunosDeleted] = await sequelize.query("SELECT COUNT(*) as total FROM alunos WHERE deleted_at IS NOT NULL");
    
    const [usersRaw] = await sequelize.query("SELECT COUNT(*) as total FROM usuarios");
    
    console.log('---------------------------------------------------');
    console.log(`🎓 Total de Alunos (Físico): ${alunosRaw[0].total}`);
    console.log(`🗑️ Alunos Deletados (Logicamente): ${alunosDeleted[0].total}`);
    console.log(`✅ Alunos Ativos (Visíveis): ${alunosRaw[0].total - alunosDeleted[0].total}`);
    console.log('---------------------------------------------------');
    console.log(`👥 Total de Usuários (Físico): ${usersRaw[0].total}`);
    console.log('---------------------------------------------------');

    if (alunosRaw[0].total > 1) {
        console.log('🎉 BINGO! Os dados existem!');
        if (alunosDeleted[0].total > 0) {
            console.log('⚠️ Eles estão marcados como DELETADOS. Podemos restaurá-los com um comando.');
        }
    } else {
        console.log('⚠️ O banco parece realmente vazio. Verifique se o HOST mudou.');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

deepCheck();
