const { sequelize, Doacao, User } = require('./models');

const DOADORES = ["Supermercado ABC", "Padaria da Esquina", "Sr. José Carlos", "Dona Maria", "Empresa Tech Solutions"];
// Ajustado: materias_higiene e status recebida
const TIPOS_DOACAO = ["alimentos", "dinheiro", "outros"]; 

async function seedDoacoes() {
  try {
    console.log('🚨 FINALIZANDO RESGATE DE DOACÕES 🚨');
    
    // Pegar Admin (ID 1)
    const admin = await User.findByPk(1);
    if (!admin) {
        console.log('Admin não encontrado. Rode o seed completo primeiro.');
        process.exit(1);
    }

    // 5. Doações
    for (let i = 0; i < 10; i++) {
        await Doacao.create({
            tipo: TIPOS_DOACAO[i % TIPOS_DOACAO.length],
            valor: (Math.random() * 500).toFixed(2),
            data_doacao: new Date(),
            nome_doador: DOADORES[i % DOADORES.length],
            status: 'recebida', // CORRIGIDO
            usuario_id: admin.id
        });
    }
    console.log('✅ 10 Doações registradas com sucesso.');
    process.exit(0);

  } catch (error) {
    console.error('❌ FALHA NO RESGATE:', error);
    process.exit(1);
  }
}

seedDoacoes();
