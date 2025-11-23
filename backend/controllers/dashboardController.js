const { Aluno, User } = require('../models');
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

    res.json({
      estatisticas_gerais: {
        total_alunos: totalAlunos,
        total_usuarios: totalUsuarios,
        alunos_inativos: alunosInativos,
        alunos_recentes: alunosRecentes,
        alunos_com_restricao: alunosComRestricao
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

module.exports = {
  getDashboardStats,
  getResumoRapido
};
