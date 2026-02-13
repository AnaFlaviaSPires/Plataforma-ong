const { sequelize } = require('./models');

async function autoCreateProfessores() {
  try {
    // Buscar usuários 'professor' que não estão na tabela 'professores'
    const [users] = await sequelize.query(`
      SELECT u.id, u.nome, u.email 
      FROM usuarios u
      LEFT JOIN professores p ON p.usuario_id = u.id
      WHERE u.cargo = 'professor' AND p.id IS NULL
    `);

    if (users.length === 0) {
      console.log('✅ Todos os usuários professores já possuem cadastro na tabela professores.');
      process.exit(0);
    }

    console.log(`⚠️ Encontrados ${users.length} usuários sem cadastro de professor. Criando...`);

    for (const user of users) {
      // Cria um CPF fictício único para passar na validação (ou deixa null se o banco permitir)
      // O banco tem UNIQUE no CPF, então vamos gerar um dummy
      const dummyCPF = `000.000.000-${user.id.toString().padStart(2, '0')}`; 

      await sequelize.query(`
        INSERT INTO professores (
          nome, email, usuario_id, 
          data_nasc, sexo, formacao, status, ativo, created_at, updated_at
        ) VALUES (
          :nome, :email, :uid,
          '2000-01-01', 'Outro', 'Não Informada', 'ativo', 1, NOW(), NOW()
        )
      `, {
        replacements: {
          nome: user.nome,
          email: user.email,
          uid: user.id
        }
      });
      console.log(`✅ Professor criado para: ${user.nome}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Erro:', error);
    process.exit(1);
  }
}

autoCreateProfessores();
