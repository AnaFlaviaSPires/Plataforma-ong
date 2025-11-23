const { sequelize } = require('./models');

async function testDatabaseConnection() {
    console.log('🔍 Testando conexão com o banco de dados...\n');
    
    try {
        // Teste 1: Autenticação básica
        console.log('1. Testando autenticação...');
        await sequelize.authenticate();
        console.log('✅ Conexão com MySQL estabelecida com sucesso!\n');
        
        // Teste 2: Verificar se as tabelas existem
        console.log('2. Verificando tabelas existentes...');
        const [results] = await sequelize.query('SHOW TABLES');
        
        if (results.length === 0) {
            console.log('⚠️  Nenhuma tabela encontrada!');
            console.log('💡 Execute o script setup.sql no MySQL Workbench primeiro\n');
        } else {
            console.log('✅ Tabelas encontradas:');
            results.forEach(table => {
                const tableName = Object.values(table)[0];
                console.log(`   - ${tableName}`);
            });
            console.log('');
        }
        
        // Teste 3: Contar registros nas tabelas principais
        if (results.length > 0) {
            console.log('3. Verificando dados nas tabelas...');
            
            const tables = ['usuarios', 'alunos', 'professores', 'cursos'];
            
            for (const table of tables) {
                try {
                    const [countResult] = await sequelize.query(`SELECT COUNT(*) as total FROM ${table}`);
                    const count = countResult[0].total;
                    console.log(`   - ${table}: ${count} registro(s)`);
                } catch (error) {
                    console.log(`   - ${table}: Tabela não existe`);
                }
            }
        }
        
        console.log('\n🎉 Teste de conexão concluído!');
        
    } catch (error) {
        console.error('❌ Erro na conexão com o banco:', error.message);
        
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('💡 Verifique as credenciais no arquivo .env');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.log('💡 O banco "plataforma_ong" não existe. Execute o script setup.sql');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('💡 MySQL não está rodando. Inicie o serviço MySQL');
        }
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

testDatabaseConnection();
