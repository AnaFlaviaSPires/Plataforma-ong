const { sequelize } = require('./models');

async function createAdmin() {
  try {
    console.log('Conectando ao banco...');
    await sequelize.authenticate();
    console.log('Conectado com sucesso!');

    const { User } = require('./models');
    
    // Deletar admin existente
    await User.destroy({ where: { email: 'admin@ongnovoamanha.org' } });
    console.log('Admin antigo removido');
    
    // Criar novo admin usando o modelo (com hash automático)
    const admin = await User.create({
      nome: 'Administrador',
      email: 'admin@ongnovoamanha.org',
      senha: 'admin123',
      cargo: 'admin',
      ativo: true
    });
    
    console.log('Novo admin criado com sucesso!');
    console.log('ID:', admin.id);
    console.log('Email:', admin.email);
    console.log('Hash gerado:', admin.senha);
    
    // Testar login
    const testUser = await User.findOne({ where: { email: 'admin@ongnovoamanha.org' } });
    const isValid = await testUser.verificarSenha('admin123');
    console.log('Teste de senha:', isValid ? '✅ Válido' : '❌ Inválido');
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await sequelize.close();
  }
}

createAdmin();
