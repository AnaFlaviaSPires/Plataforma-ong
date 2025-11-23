const { sequelize } = require('./models');

async function checkAlunos() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado ao MySQL\n');
        
        // Verificar quantos alunos existem
        const [results] = await sequelize.query('SELECT COUNT(*) as total FROM alunos');
        console.log(`📊 Total de alunos no banco: ${results[0].total}\n`);
        
        // Listar todos os alunos
        const [alunos] = await sequelize.query('SELECT id, nome, data_nasc, created_at FROM alunos ORDER BY id DESC');
        
        console.log('📋 Lista de alunos no banco:');
        console.log('ID | Nome | Data Nasc | Criado em');
        console.log('---|------|-----------|----------');
        
        alunos.forEach(aluno => {
            const dataFormatada = new Date(aluno.created_at).toLocaleString('pt-BR');
            console.log(`${aluno.id} | ${aluno.nome} | ${aluno.data_nasc} | ${dataFormatada}`);
        });
        
        if (alunos.length === 0) {
            console.log('❌ Nenhum aluno encontrado no banco!');
        }
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

checkAlunos();
