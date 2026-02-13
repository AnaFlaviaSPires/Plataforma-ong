const { sequelize, User } = require('./models');

async function checkRoles() {
  try {
    const users = await User.findAll({
        attributes: ['id', 'nome', 'email', 'cargo']
    });

    console.log('📋 RELATÓRIO DE CARGOS:');
    console.log('--------------------------------------------------');
    users.forEach(u => {
        console.log(`[${u.id}] ${u.nome} (${u.email}) -> CARGO: ${u.cargo}`);
    });
    console.log('--------------------------------------------------');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

checkRoles();
