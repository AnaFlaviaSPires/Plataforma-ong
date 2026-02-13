const { sequelize, User } = require('./models');
const bcrypt = require('bcryptjs');

async function createTestUsers() {
  try {
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const users = [
        { nome: 'Prof Teste', email: 'prof_teste@ong.com', cargo: 'professor' },
        { nome: 'Sec Teste', email: 'sec_teste@ong.com', cargo: 'secretaria' },
        { nome: 'Social Teste', email: 'social_teste@ong.com', cargo: 'assistente_social' }
    ];

    console.log('🛠️ Criando usuários de teste...');

    for (const u of users) {
        const [user, created] = await User.findOrCreate({
            where: { email: u.email },
            defaults: {
                nome: u.nome,
                senha: hashedPassword,
                cargo: u.cargo,
                ativo: true
            }
        });
        
        // Garantir cargo correto se já existia
        if (!created && user.cargo !== u.cargo) {
            user.cargo = u.cargo;
            await user.save();
        }
        
        console.log(`✅ ${u.cargo.toUpperCase()}: ${u.email} / 123456 (ID: ${user.id})`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

createTestUsers();
