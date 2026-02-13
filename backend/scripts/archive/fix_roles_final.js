require('dotenv').config({ path: '../.env' });
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false
  }
);

async function fixRoles() {
  try {
    await sequelize.authenticate();
    console.log('Conectado. Iniciando migração de perfis...');

    // 1. Ana Flávia -> Admin
    // Buscando por ID 1 (assumindo que é ela baseada na ordem) ou pelo nome parcial
    console.log('Definindo Ana Flávia como Admin...');
    await sequelize.query(`
        UPDATE usuarios 
        SET cargo = 'admin', ativo = 1 
        WHERE id = 1 OR nome LIKE '%Ana Flávia%' OR email LIKE '%anaah%';
    `);

    // 2. Definindo cargos para os demais
    // Vou fazer um update por ID para garantir distribuição
    const updates = [
        { id: 2, cargo: 'secretaria' },
        { id: 3, cargo: 'assistente_social' },
        { id: 4, cargo: 'professor' },
        { id: 5, cargo: 'professor' },
        { id: 6, cargo: 'secretaria' },
        { id: 7, cargo: 'assistente_social' }
    ];

    for (const u of updates) {
        console.log(`Atualizando ID ${u.id} para ${u.cargo}...`);
        await sequelize.query(`
            UPDATE usuarios 
            SET cargo = '${u.cargo}', ativo = 1 
            WHERE id = ${u.id} AND cargo != 'admin'; -- Não sobrescreve se virou admin por engano
        `);
    }

    // 3. Garantir que ninguém ficou com cargo inválido
    console.log('Limpando resíduos...');
    await sequelize.query(`
        UPDATE usuarios 
        SET cargo = 'secretaria', ativo = 1 
        WHERE cargo NOT IN ('admin', 'professor', 'secretaria', 'assistente_social');
    `);

    console.log('Migração concluída com sucesso!');
    
    // Mostrar resultado final
    const [users] = await sequelize.query("SELECT id, nome, cargo, ativo FROM usuarios");
    console.table(users);

    process.exit(0);
  } catch (error) {
    console.error('Erro na migração:', error);
    process.exit(1);
  }
}

fixRoles();
