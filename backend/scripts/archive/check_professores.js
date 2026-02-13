const { sequelize } = require('./models');

async function checkProfessores() {
  try {
    // 1. Buscar usuários com cargo 'professor'
    const [users] = await sequelize.query(
      "SELECT id, nome, email, cargo FROM usuarios WHERE cargo = 'professor'"
    );

    // 2. Buscar professores cadastrados
    const [professores] = await sequelize.query(
      "SELECT id, nome, email, usuario_id FROM professores"
    );

    console.log('\n=== USUÁRIOS COM PERFIL PROFESSOR ===');
    users.forEach(u => console.log(`[ID: ${u.id}] ${u.nome} (${u.email})`));

    console.log('\n=== PROFESSORES CADASTRADOS (RH) ===');
    professores.forEach(p => console.log(`[ID: ${p.id}] ${p.nome} (User ID: ${p.usuario_id})`));

    // Cruzamento
    console.log('\n=== ANÁLISE DE VÍNCULOS ===');
    users.forEach(u => {
      const vinculado = professores.find(p => p.usuario_id === u.id);
      if (vinculado) {
        console.log(`✅ ${u.nome} -> Tem cadastro de professor (ID: ${vinculado.id})`);
      } else {
        console.log(`❌ ${u.nome} -> NÃO tem cadastro de professor. Precisa cadastrar!`);
      }
    });

    process.exit(0);
  } catch (error) {
    console.error('Erro:', error);
    process.exit(1);
  }
}

checkProfessores();
