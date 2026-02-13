const { sequelize, User } = require('./models');
const bcrypt = require('bcryptjs');

async function makeAdmin() {
  try {
    const emailAlvo = 'anaflaviaspires@hotmail.com';
    console.log(`👑 Promovendo ${emailAlvo} a Admin...`);

    // 1. Tentar achar pelo email exato
    let user = await User.findOne({ where: { email: emailAlvo } });

    if (user) {
        console.log(`✅ Usuário encontrado: ${user.nome}`);
        user.cargo = 'admin';
        await user.save();
        console.log('🚀 Cargo atualizado para ADMIN.');
    } else {
        console.log('⚠️ Usuário não encontrado. Criando novo...');
        const hashedPassword = await bcrypt.hash('123456', 10);
        
        user = await User.create({
            nome: 'Ana Flavia',
            email: emailAlvo,
            senha: hashedPassword,
            cargo: 'admin',
            ativo: true
        });
        console.log(`✅ Novo Admin criado com sucesso.`);
        console.log(`📧 Email: ${emailAlvo}`);
        console.log(`🔑 Senha: 123456`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

makeAdmin();
