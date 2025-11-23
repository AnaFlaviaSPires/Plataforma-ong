const { sequelize, Aluno } = require('./models');

async function debugCreateAluno() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado ao MySQL\n');
        
        // Dados de teste
        const dadosTeste = {
            nome: 'Maria Silva Debug',
            data_nasc: '2010-03-15',
            sexo: 'F',
            usuario_id: 1
        };
        
        console.log('📝 Tentando criar aluno com dados:', dadosTeste);
        
        // Tentar criar aluno usando o modelo Sequelize
        const novoAluno = await Aluno.create(dadosTeste);
        
        console.log('✅ Aluno criado com sucesso!');
        console.log('ID:', novoAluno.id);
        console.log('Nome:', novoAluno.nome);
        console.log('Data criação:', novoAluno.createdAt);
        
        // Verificar se foi salvo no banco
        const alunoSalvo = await Aluno.findByPk(novoAluno.id);
        if (alunoSalvo) {
            console.log('✅ Confirmado: aluno existe no banco');
        } else {
            console.log('❌ ERRO: aluno não foi encontrado no banco!');
        }
        
        // Contar total de alunos
        const total = await Aluno.count();
        console.log(`📊 Total de alunos no banco: ${total}`);
        
    } catch (error) {
        console.error('❌ Erro ao criar aluno:', error.message);
        if (error.errors) {
            console.error('Detalhes dos erros:');
            error.errors.forEach(err => {
                console.error(`- ${err.path}: ${err.message}`);
            });
        }
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

debugCreateAluno();
