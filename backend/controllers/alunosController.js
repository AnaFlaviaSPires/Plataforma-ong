const { Aluno, User } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

// Listar todos os alunos
const getAlunos = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ativo, turma } = req.query;
    const offset = (page - 1) * limit;

    // Construir filtros
    const where = {};
    
    if (search) {
      where[Op.or] = [
        { nome: { [Op.like]: `%${search}%` } },
        { numero_matricula: { [Op.like]: `%${search}%` } },
        { cpf: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // Filtro de status: só aplicar quando o parâmetro 'ativo' for fornecido
    if (ativo !== undefined) {
      where.ativo = (ativo === 'true');
    }
    
    if (turma) {
      where.turma = turma;
    }

    const { count, rows } = await Aluno.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['nome', 'ASC']],
      include: [{
        model: User,
        as: 'usuario_cadastro',
        attributes: ['id', 'nome', 'email'],
        required: false // LEFT JOIN em vez de INNER JOIN
      }]
    });

    // Adicionar idade calculada
    const alunosComIdade = rows.map(aluno => ({
      ...aluno.toJSON(),
      idade: aluno.getIdade()
    }));

    res.json({
      alunos: alunosComIdade,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Erro ao buscar alunos:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// Buscar aluno por ID
const getAluno = async (req, res) => {
  try {
    const { id } = req.params;

    const aluno = await Aluno.findByPk(id, {
      include: [{
        model: User,
        as: 'usuario_cadastro',
        attributes: ['id', 'nome', 'email']
      }]
    });

    if (!aluno) {
      return res.status(404).json({
        error: 'Aluno não encontrado'
      });
    }

    res.json({
      ...aluno.toJSON(),
      idade: aluno.getIdade()
    });

  } catch (error) {
    console.error('Erro ao buscar aluno:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// Criar novo aluno
const createAluno = async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const alunoData = {
      ...req.body,
      usuario_id: req.user ? req.user.id : 1 // Usar ID 1 (admin) se não houver usuário autenticado
    };

    // Verificar se CPF já existe (se fornecido)
    if (alunoData.cpf) {
      const existingAluno = await Aluno.findOne({
        where: { cpf: alunoData.cpf }
      });

      if (existingAluno) {
        return res.status(409).json({
          error: 'CPF já cadastrado'
        });
      }
    }

    const aluno = await Aluno.create(alunoData);

    res.status(201).json({
      message: 'Aluno cadastrado com sucesso',
      aluno: {
        ...aluno.toJSON(),
        idade: aluno.getIdade()
      }
    });

  } catch (error) {
    console.error('Erro ao criar aluno:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// Atualizar aluno
const updateAluno = async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    const aluno = await Aluno.findByPk(id);

    if (!aluno) {
      return res.status(404).json({
        error: 'Aluno não encontrado'
      });
    }

    // Verificar se CPF já existe em outro aluno (se fornecido)
    if (updateData.cpf && updateData.cpf !== aluno.cpf) {
      const existingAluno = await Aluno.findOne({
        where: { 
          cpf: updateData.cpf,
          id: { [Op.ne]: id }
        }
      });

      if (existingAluno) {
        return res.status(409).json({
          error: 'CPF já cadastrado para outro aluno'
        });
      }
    }

    // Normalizar campo 'ativo': converter strings para boolean e
    // preservar valor atual se campo não vier no payload
    if (Object.prototype.hasOwnProperty.call(updateData, 'ativo')) {
      const v = updateData.ativo;
      if (typeof v === 'string') {
        const normalized = v.trim().toLowerCase();
        updateData.ativo = (
          normalized === 'true' ||
          normalized === '1' ||
          normalized === 'on' ||
          normalized === 'yes' ||
          normalized === 'sim' ||
          normalized === 'matriculado'
        );
      } else {
        updateData.ativo = Boolean(v);
      }
    } else {
      // Não tocar no status quando não enviado
      delete updateData.ativo;
    }

    await aluno.update(updateData);

    res.json({
      message: 'Aluno atualizado com sucesso',
      aluno: {
        ...aluno.toJSON(),
        idade: aluno.getIdade()
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar aluno:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// Excluir aluno (hard delete)
const deleteAluno = async (req, res) => {
  try {
    const { id } = req.params;

    const aluno = await Aluno.findByPk(id);

    if (!aluno) {
      return res.status(404).json({
        error: 'Aluno não encontrado'
      });
    }

    // Hard delete - remover definitivamente
    await aluno.destroy();

    res.json({
      message: 'Aluno removido com sucesso'
    });

  } catch (error) {
    console.error('Erro ao excluir aluno:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// Reativar aluno
const reactivateAluno = async (req, res) => {
  try {
    const { id } = req.params;

    const aluno = await Aluno.findByPk(id);

    if (!aluno) {
      return res.status(404).json({
        error: 'Aluno não encontrado'
      });
    }

    await aluno.update({ ativo: true });

    res.json({
      message: 'Aluno reativado com sucesso',
      aluno: {
        ...aluno.toJSON(),
        idade: aluno.getIdade()
      }
    });

  } catch (error) {
    console.error('Erro ao reativar aluno:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// Buscar alunos por turma
const getAlunosPorTurma = async (req, res) => {
  try {
    const { turma } = req.params;

    const alunos = await Aluno.findAll({
      where: { 
        turma,
        ativo: true
      },
      order: [['nome', 'ASC']]
    });

    const alunosComIdade = alunos.map(aluno => ({
      ...aluno.toJSON(),
      idade: aluno.getIdade()
    }));

    res.json({
      turma,
      total: alunos.length,
      alunos: alunosComIdade
    });

  } catch (error) {
    console.error('Erro ao buscar alunos por turma:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// Estatísticas dos alunos
const getEstatisticas = async (req, res) => {
  try {
    const totalAlunos = await Aluno.count({ where: { ativo: true } });
    const totalInativos = await Aluno.count({ where: { ativo: false } });
    
    const alunosPorTurma = await Aluno.findAll({
      attributes: [
        'turma',
        [Aluno.sequelize.fn('COUNT', Aluno.sequelize.col('id')), 'total']
      ],
      where: { ativo: true },
      group: ['turma'],
      raw: true
    });

    const alunosComRestricao = await Aluno.count({
      where: {
        ativo: true,
        restricao_alimentar: { [Op.ne]: null }
      }
    });

    res.json({
      total_alunos: totalAlunos,
      total_inativos: totalInativos,
      alunos_por_turma: alunosPorTurma,
      alunos_com_restricao_alimentar: alunosComRestricao
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  getAlunos,
  getAluno,
  createAluno,
  updateAluno,
  deleteAluno,
  reactivateAluno,
  getAlunosPorTurma,
  getEstatisticas
};
