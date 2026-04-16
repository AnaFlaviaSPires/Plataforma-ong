const { sequelize, User } = require('./models');
const bcrypt = require('bcryptjs');

async function makeAdmin() {
  try {
    console.log('👑 Promovendo Ana Flavia a Admin...');

    // 1. Tentar achar
    let user = await User.findOne({ 
        where: sequelize.where(
            sequelize.fn('lower', sequelize.col('nome')), 
            'LIKE', 
            '%ana flavia%'
        ) 
    });

    if (user) {
        console.log(`✅ Usuário encontrado: ${user.nome} (${user.email})`);
        user.cargo = 'admin';
        await user.save();
        console.log('🚀 Cargo atualizado para ADMIN.');
    } else {
        console.log('⚠️ Usuário Ana Flavia não encontrado. Criando novo...');
        const defaultPassword = process.env.SEED_PASSWORD || '123456';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        user = await User.create({
            nome: 'Ana Flavia',
            email: 'ana.flavia@ong.com',
            senha: hashedPassword,
            cargo: 'admin',
            ativo: true
        });
        console.log(`✅ Novo Admin criado: ${user.email} / 123456`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

makeAdmin();
