const bcrypt = require('bcryptjs');
const { sequelize } = require('./models');

async function fixAdminPassword() {
  try {
    console.log('Conectando ao banco...');
    await sequelize.authenticate();
    console.log('Conectado com sucesso!');

    const { User } = require('./models');
    
    // Encontrar usuário admin
    const admin = await User.findOne({ where: { email: 'admin@ongnovoamanha.org' } });
    
    if (!admin) {
      console.log('Usuário admin não encontrado!');
      return;
    }

    // Gerar hash correto com bcryptjs (forçando $2b$)
    const rounds = 12;
    const tempHash = await bcrypt.hash('admin123', rounds);
    // Converter $2a$ para $2b$ manualmente se necessário
    const hashedPassword = tempHash.replace(/^\$2a\$/, '$2b$');
    
    console.log('Hash gerado:', tempHash);
    console.log('Hash corrigido:', hashedPassword);
    
    // Atualizar senha
    admin.senha = hashedPassword;
    await admin.save();
    
    console.log('Senha do admin atualizada com sucesso!');
    console.log('Novo hash:', hashedPassword);
    
    // Testar verificação com debug
    console.log('Senha original: admin123');
    console.log('Hash no banco:', admin.senha);
    
    // Testar bcrypt compare diretamente
    const directCompare = await bcrypt.compare('admin123', admin.senha);
    console.log('Teste direto bcrypt.compare:', directCompare ? '✅ Válido' : '❌ Inválido');
    
    // Testar método do modelo
    const isValid = await admin.verificarSenha('admin123');
    console.log('Teste método do modelo:', isValid ? '✅ Válido' : '❌ Inválido');
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await sequelize.close();
  }
}

fixAdminPassword();
