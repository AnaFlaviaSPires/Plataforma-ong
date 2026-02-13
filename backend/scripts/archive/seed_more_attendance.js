const { sequelize, Sala, Aluno, Chamada, ChamadaRegistro } = require('../models');

async function seedAttendance() {
  try {
    console.log('Iniciando geração de dados de chamada...');
    
    const salas = await Sala.findAll({
      include: [{
        model: Aluno,
        as: 'alunos'
      }]
    });

    console.log(`Encontradas ${salas.length} salas.`);

    const now = new Date();
    // Vamos pegar os últimos 8 meses para garantir boa distribuição no gráfico
    const monthsAgo = new Date();
    monthsAgo.setMonth(now.getMonth() - 8);

    for (const sala of salas) {
      console.log(`Processando Sala: ${sala.nome} (ID: ${sala.id}) - ${sala.alunos.length} alunos.`);
      
      if (sala.alunos.length === 0) {
        console.log('  -> Sem alunos, pulando.');
        continue;
      }

      // Atribuir uma "taxa de presença" para cada aluno para criar padrões realistas
      // Alguns alunos faltam mais (60% presença), outros menos (98% presença)
      const studentReliability = {};
      sala.alunos.forEach(aluno => {
        // Random entre 0.60 (60%) e 0.98 (98%)
        studentReliability[aluno.id] = 0.60 + (Math.random() * 0.38);
      });

      // Gerar ~30 datas espalhadas pelos últimos 8 meses
      const dates = [];
      let attempts = 0;
      // Tenta gerar até conseguir 30 datas únicas ou estourar tentativas
      while (dates.length < 30 && attempts < 1000) {
        attempts++;
        const randomTime = monthsAgo.getTime() + Math.random() * (now.getTime() - monthsAgo.getTime());
        const date = new Date(randomTime);
        
        // Pular finais de semana (0 = Domingo, 6 = Sábado)
        if (date.getDay() === 0 || date.getDay() === 6) continue;
        
        // Formatar YYYY-MM-DD
        const dateStr = date.toISOString().split('T')[0];
        
        // Evitar duplicatas nesta execução (não checa banco, mas assume que novas são extras)
        if (!dates.includes(dateStr)) {
          dates.push(dateStr);
        }
      }
      
      // Ordenar datas cronologicamente
      dates.sort();

      for (const dateStr of dates) {
        try {
            // Criar Chamada
            const chamada = await Chamada.create({
              sala_id: sala.id,
              data: dateStr,
              hora: '08:00:00', // Horário padrão
              observacoes: 'Registro histórico gerado automaticamente',
              criado_por: 1 // Assume ID 1 (Admin) ou similar
            });
    
            // Criar Registros para cada aluno
            const registros = sala.alunos.map(aluno => {
              const rate = studentReliability[aluno.id];
              // Rola o dado: se o numero aleatorio for menor que a taxa, ele veio
              const isPresent = Math.random() < rate;
              
              return {
                chamada_id: chamada.id,
                aluno_id: aluno.id,
                presente: isPresent,
                observacao: isPresent ? null : 'Falta registrada pelo sistema'
              };
            });
    
            await ChamadaRegistro.bulkCreate(registros);
        } catch (err) {
            console.error(`Erro ao criar chamada para ${dateStr}:`, err.message);
        }
      }
      console.log(`  -> Criadas ${dates.length} novas chamadas com registros.`);
    }

    console.log('Processo finalizado com sucesso!');
    process.exit(0);

  } catch (error) {
    console.error('Erro fatal ao gerar dados:', error);
    process.exit(1);
  }
}

seedAttendance();
