const { Aluno, User, Doacao, Sala, Professor, Chamada, ChamadaRegistro, Evento, SalaAluno } = require('../models');
const { Op } = require('sequelize');

// Obter estatísticas gerais do dashboard
const getDashboardStats = async (req, res) => {
  try {
    // Estatísticas básicas
    const totalAlunos = await Aluno.count({ where: { ativo: true } });
    const totalUsuarios = await User.count({ where: { ativo: true } });
    const alunosInativos = await Aluno.count({ where: { ativo: false } });
    
    // Alunos cadastrados nos últimos 30 dias
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - 30);
    
    const alunosRecentes = await Aluno.count({
      where: {
        ativo: true,
        created_at: { [Op.gte]: dataLimite }
      }
    });

    // === ALUNOS POR STATUS DE MATRÍCULA ===
    const alunosPorStatus = await Aluno.findAll({
      attributes: [
        'status',
        [Aluno.sequelize.fn('COUNT', Aluno.sequelize.col('id')), 'total']
      ],
      group: ['status'],
      raw: true
    });

    // Distribuição por turma
    const alunosPorTurma = await Aluno.findAll({
      attributes: [
        'turma',
        [Aluno.sequelize.fn('COUNT', Aluno.sequelize.col('id')), 'total']
      ],
      where: { ativo: true },
      group: ['turma'],
      order: [[Aluno.sequelize.fn('COUNT', Aluno.sequelize.col('id')), 'DESC']],
      raw: true
    });

    // Distribuição por faixa etária
    const alunosComIdade = await Aluno.findAll({
      where: { ativo: true },
      attributes: ['data_nasc']
    });

    const faixasEtarias = {
      '0-5': 0,
      '6-10': 0,
      '11-15': 0,
      '16-18': 0,
      '18+': 0
    };

    alunosComIdade.forEach(aluno => {
      const hoje = new Date();
      const nascimento = new Date(aluno.data_nasc);
      let idade = hoje.getFullYear() - nascimento.getFullYear();
      const mes = hoje.getMonth() - nascimento.getMonth();
      
      if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
      }

      if (idade <= 5) faixasEtarias['0-5']++;
      else if (idade <= 10) faixasEtarias['6-10']++;
      else if (idade <= 15) faixasEtarias['11-15']++;
      else if (idade <= 18) faixasEtarias['16-18']++;
      else faixasEtarias['18+']++;
    });

    // Alunos com restrições alimentares
    const alunosComRestricao = await Aluno.count({
      where: {
        ativo: true,
        restricao_alimentar: { [Op.ne]: null }
      }
    });

    // Últimos alunos cadastrados
    const ultimosAlunos = await Aluno.findAll({
      where: { ativo: true },
      order: [['created_at', 'DESC']],
      limit: 5,
      attributes: ['id', 'nome', 'turma', 'data_matricula', 'created_at']
    });

    // Crescimento mensal (últimos 6 meses)
    const crescimentoMensal = [];
    for (let i = 5; i >= 0; i--) {
      const data = new Date();
      data.setMonth(data.getMonth() - i);
      const inicioMes = new Date(data.getFullYear(), data.getMonth(), 1);
      const fimMes = new Date(data.getFullYear(), data.getMonth() + 1, 0);

      const count = await Aluno.count({
        where: {
          created_at: {
            [Op.between]: [inicioMes, fimMes]
          }
        }
      });

      crescimentoMensal.push({
        mes: data.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        total: count
      });
    }

    // === ESTATÍSTICAS DE DOAÇÕES ===
    const totalDoacoes = await Doacao.count();
    const doacoesConfirmadas = await Doacao.count({ where: { status: 'confirmada' } });
    const doacoesPendentes = await Doacao.count({ where: { status: 'pendente' } });
    
    // Valor total de doações em dinheiro
    const valorTotalDoacoes = await Doacao.sum('valor', { 
      where: { tipo: 'dinheiro', status: 'confirmada' } 
    }) || 0;

    // Doações por tipo
    const doacoesPorTipo = await Doacao.findAll({
      attributes: [
        'tipo',
        [Doacao.sequelize.fn('COUNT', Doacao.sequelize.col('id')), 'total']
      ],
      group: ['tipo'],
      raw: true
    });

    // Doações dos últimos 6 meses
    const doacoesMensal = [];
    for (let i = 5; i >= 0; i--) {
      const data = new Date();
      data.setMonth(data.getMonth() - i);
      const inicioMes = new Date(data.getFullYear(), data.getMonth(), 1);
      const fimMes = new Date(data.getFullYear(), data.getMonth() + 1, 0);

      const count = await Doacao.count({
        where: {
          created_at: { [Op.between]: [inicioMes, fimMes] }
        }
      });

      const valor = await Doacao.sum('valor', {
        where: {
          tipo: 'dinheiro',
          status: 'confirmada',
          created_at: { [Op.between]: [inicioMes, fimMes] }
        }
      }) || 0;

      doacoesMensal.push({
        mes: data.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        total: count,
        valor: valor
      });
    }

    // === ESTATÍSTICAS DE SALAS E PROFESSORES ===
    const totalSalas = await Sala.count({ where: { ativo: true } });
    const totalProfessores = await Professor.count({ where: { status: 'ativo' } });

    // === ALUNOS POR SALA ===
    const salasComAlunos = await Sala.findAll({
      where: { ativo: true },
      attributes: ['id', 'nome', 'professor'],
      include: [{
        model: Aluno,
        as: 'alunos',
        attributes: ['id'],
        through: { attributes: [] }
      }]
    });

    const alunosPorSala = salasComAlunos.map(sala => ({
      sala_id: sala.id,
      sala_nome: sala.nome,
      professor: sala.professor,
      total_alunos: sala.alunos ? sala.alunos.length : 0
    }));

    // === ESTATÍSTICAS DE FREQUÊNCIA ===
    const totalChamadas = await Chamada.count();
    const totalPresencas = await ChamadaRegistro.count({ where: { presente: true } });
    const totalFaltas = await ChamadaRegistro.count({ where: { presente: false } });
    const taxaPresenca = totalPresencas + totalFaltas > 0 
      ? Math.round((totalPresencas / (totalPresencas + totalFaltas)) * 100) 
      : 0;

    // === FREQUÊNCIA POR SALA (últimos 30 dias) ===
    const frequenciaPorSala = await Chamada.findAll({
      where: {
        data: { [Op.gte]: dataLimite }
      },
      attributes: ['sala_id'],
      include: [
        {
          model: Sala,
          as: 'sala',
          attributes: ['nome']
        },
        {
          model: ChamadaRegistro,
          as: 'registros',
          attributes: ['presente']
        }
      ]
    });

    // Processar frequência por sala
    const frequenciaSalaMap = {};
    frequenciaPorSala.forEach(chamada => {
      const salaId = chamada.sala_id;
      const salaNome = chamada.sala?.nome || 'Sem nome';
      
      if (!frequenciaSalaMap[salaId]) {
        frequenciaSalaMap[salaId] = { 
          sala_id: salaId, 
          sala_nome: salaNome, 
          presencas: 0, 
          faltas: 0 
        };
      }
      
      if (chamada.registros) {
        chamada.registros.forEach(reg => {
          if (reg.presente) {
            frequenciaSalaMap[salaId].presencas++;
          } else {
            frequenciaSalaMap[salaId].faltas++;
          }
        });
      }
    });

    const frequenciaPorSalaArray = Object.values(frequenciaSalaMap).map(sala => ({
      ...sala,
      taxa: sala.presencas + sala.faltas > 0 
        ? Math.round((sala.presencas / (sala.presencas + sala.faltas)) * 100) 
        : 0
    }));

    // === FREQUÊNCIA POR PERÍODO (últimos 6 meses) ===
    const frequenciaMensal = [];
    for (let i = 5; i >= 0; i--) {
      const data = new Date();
      data.setMonth(data.getMonth() - i);
      const inicioMes = new Date(data.getFullYear(), data.getMonth(), 1);
      const fimMes = new Date(data.getFullYear(), data.getMonth() + 1, 0);

      const chamadasMes = await Chamada.findAll({
        where: {
          data: { [Op.between]: [inicioMes, fimMes] }
        },
        include: [{
          model: ChamadaRegistro,
          as: 'registros',
          attributes: ['presente']
        }]
      });

      let presencasMes = 0;
      let faltasMes = 0;
      chamadasMes.forEach(chamada => {
        if (chamada.registros) {
          chamada.registros.forEach(reg => {
            if (reg.presente) presencasMes++;
            else faltasMes++;
          });
        }
      });

      frequenciaMensal.push({
        mes: data.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        presencas: presencasMes,
        faltas: faltasMes,
        taxa: presencasMes + faltasMes > 0 
          ? Math.round((presencasMes / (presencasMes + faltasMes)) * 100) 
          : 0
      });
    }

    // === ESTATÍSTICAS DE EVENTOS ===
    const totalEventos = await Evento.count();
    const eventosProximos = await Evento.count({
      where: {
        inicio: { [Op.gte]: new Date() }
      }
    });

    res.json({
      estatisticas_gerais: {
        total_alunos: totalAlunos,
        total_usuarios: totalUsuarios,
        alunos_inativos: alunosInativos,
        alunos_recentes: alunosRecentes,
        alunos_com_restricao: alunosComRestricao,
        total_salas: totalSalas,
        total_professores: totalProfessores,
        total_eventos: totalEventos,
        eventos_proximos: eventosProximos
      },
      alunos: {
        por_status: alunosPorStatus,
        por_sala: alunosPorSala
      },
      doacoes: {
        total: totalDoacoes,
        confirmadas: doacoesConfirmadas,
        pendentes: doacoesPendentes,
        valor_total: valorTotalDoacoes,
        por_tipo: doacoesPorTipo,
        mensal: doacoesMensal
      },
      frequencia: {
        total_chamadas: totalChamadas,
        total_presencas: totalPresencas,
        total_faltas: totalFaltas,
        taxa_presenca: taxaPresenca,
        por_sala: frequenciaPorSalaArray,
        mensal: frequenciaMensal
      },
      distribuicoes: {
        por_turma: alunosPorTurma,
        por_faixa_etaria: faixasEtarias
      },
      ultimos_alunos: ultimosAlunos,
      crescimento_mensal: crescimentoMensal
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas do dashboard:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// Obter resumo rápido para cards do dashboard
const getResumoRapido = async (req, res) => {
  try {
    const totalAlunos = await Aluno.count({ where: { ativo: true } });
    const totalTurmas = await Aluno.count({
      distinct: true,
      col: 'turma',
      where: { 
        ativo: true,
        turma: { [Op.ne]: null }
      }
    });

    // Alunos cadastrados hoje
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);

    const alunosHoje = await Aluno.count({
      where: {
        created_at: {
          [Op.between]: [hoje, amanha]
        }
      }
    });

    // Próximos aniversários (próximos 7 dias)
    const proximaSemanaDia = new Date().getDate();
    const proximaSemanaMes = new Date().getMonth() + 1;

    const aniversariantes = await Aluno.findAll({
      where: {
        ativo: true,
        [Op.and]: [
          Aluno.sequelize.where(
            Aluno.sequelize.fn('DAY', Aluno.sequelize.col('data_nasc')),
            { [Op.between]: [proximaSemanaDia, proximaSemanaDia + 7] }
          ),
          Aluno.sequelize.where(
            Aluno.sequelize.fn('MONTH', Aluno.sequelize.col('data_nasc')),
            proximaSemanaMes
          )
        ]
      },
      attributes: ['id', 'nome', 'data_nasc'],
      limit: 5
    });

    res.json({
      total_alunos: totalAlunos,
      total_turmas: totalTurmas,
      alunos_cadastrados_hoje: alunosHoje,
      proximos_aniversarios: aniversariantes.length,
      aniversariantes: aniversariantes
    });

  } catch (error) {
    console.error('Erro ao buscar resumo rápido:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// Obter frequência de um aluno específico
const getFrequenciaAluno = async (req, res) => {
  try {
    const { alunoId } = req.params;
    const { periodo = 30 } = req.query; // dias

    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - parseInt(periodo));

    // Buscar dados do aluno
    const aluno = await Aluno.findByPk(alunoId, {
      attributes: ['id', 'nome', 'turma']
    });

    if (!aluno) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }

    // Buscar registros de chamada do aluno
    const registros = await ChamadaRegistro.findAll({
      where: { aluno_id: alunoId },
      include: [{
        model: Chamada,
        as: 'chamada',
        where: {
          data: { [Op.gte]: dataLimite }
        },
        attributes: ['data', 'sala_id'],
        include: [{
          model: Sala,
          as: 'sala',
          attributes: ['nome']
        }]
      }],
      order: [[{ model: Chamada, as: 'chamada' }, 'data', 'ASC']]
    });

    // Processar dados para o gráfico
    const frequenciaPorDia = {};
    let totalPresencas = 0;
    let totalFaltas = 0;

    registros.forEach(reg => {
      const data = reg.chamada.data;
      const dataStr = new Date(data).toLocaleDateString('pt-BR');
      
      if (!frequenciaPorDia[dataStr]) {
        frequenciaPorDia[dataStr] = { data: dataStr, presente: 0, falta: 0 };
      }
      
      if (reg.presente) {
        frequenciaPorDia[dataStr].presente++;
        totalPresencas++;
      } else {
        frequenciaPorDia[dataStr].falta++;
        totalFaltas++;
      }
    });

    const taxaPresenca = totalPresencas + totalFaltas > 0
      ? Math.round((totalPresencas / (totalPresencas + totalFaltas)) * 100)
      : 0;

    res.json({
      aluno: {
        id: aluno.id,
        nome: aluno.nome,
        turma: aluno.turma
      },
      resumo: {
        total_presencas: totalPresencas,
        total_faltas: totalFaltas,
        taxa_presenca: taxaPresenca,
        periodo_dias: parseInt(periodo)
      },
      historico: Object.values(frequenciaPorDia)
    });

  } catch (error) {
    console.error('Erro ao buscar frequência do aluno:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Listar alunos para seleção
const getAlunosLista = async (req, res) => {
  try {
    const alunos = await Aluno.findAll({
      where: { ativo: true },
      attributes: ['id', 'nome', 'turma'],
      order: [['nome', 'ASC']]
    });

    res.json({ alunos });
  } catch (error) {
    console.error('Erro ao listar alunos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  getDashboardStats,
  getResumoRapido,
  getFrequenciaAluno,
  getAlunosLista
};
