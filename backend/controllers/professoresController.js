const { Professor, User } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

// Listar todos os professores
const getProfessores = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, ativo } = req.query;
    const offset = (page - 1) * limit;

    // Construir filtros
    const where = {};
    
    if (search) {
      where[Op.or] = [
        { nome: { [Op.like]: `%${search}%` } },
        { cpf: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { formacao: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (status) {
      where.status = status;
    }
    
    if (ativo !== undefined) {
      where.ativo = ativo === 'true';
    }

    const { count, rows } = await Professor.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [{
        model: User,
        as: 'usuario_cadastro',
        attributes: ['id', 'nome', 'email']
      }],
      order: [['nome', 'ASC']]
    });

    res.json({
      professores: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Erro ao buscar professores:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
};

// Buscar professor por ID
const getProfessor = async (req, res) => {
  try {
    const { id } = req.params;

    const professor = await Professor.findByPk(id, {
      include: [{
        model: User,
        as: 'usuario_cadastro',
        attributes: ['id', 'nome', 'email']
      }]
    });

    if (!professor) {
      return res.status(404).json({
        error: 'Professor não encontrado'
      });
    }

    res.json(professor);

  } catch (error) {
    console.error('Erro ao buscar professor:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
};

// Criar novo professor
const createProfessor = async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    // Adicionar ID do usuário que está cadastrando
    const professorData = {
      ...req.body,
      usuario_id: req.user.id
    };

    const professor = await Professor.create(professorData);

    res.status(201).json({
      message: 'Professor cadastrado com sucesso',
      professor
    });

  } catch (error) {
    console.error('Erro ao criar professor:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        error: 'CPF ou email já cadastrado',
        details: error.errors
      });
    }

    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
};

// Atualizar professor
const updateProfessor = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const professor = await Professor.findByPk(id);

    if (!professor) {
      return res.status(404).json({
        error: 'Professor não encontrado'
      });
    }

    await professor.update(req.body);

    res.json({
      message: 'Professor atualizado com sucesso',
      professor
    });

  } catch (error) {
    console.error('Erro ao atualizar professor:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        error: 'CPF ou email já cadastrado',
        details: error.errors
      });
    }

    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
};

// Excluir professor (soft delete)
const deleteProfessor = async (req, res) => {
  try {
    const { id } = req.params;

    const professor = await Professor.findByPk(id);

    if (!professor) {
      return res.status(404).json({
        error: 'Professor não encontrado'
      });
    }

    // Soft delete
    await professor.update({ ativo: false });
    await professor.destroy();

    res.json({
      message: 'Professor excluído com sucesso'
    });

  } catch (error) {
    console.error('Erro ao excluir professor:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
};

// Reativar professor
const reactivateProfessor = async (req, res) => {
  try {
    const { id } = req.params;

    const professor = await Professor.findByPk(id, {
      paranoid: false // Incluir registros "deletados"
    });

    if (!professor) {
      return res.status(404).json({
        error: 'Professor não encontrado'
      });
    }

    await professor.restore();
    await professor.update({ ativo: true, status: 'ativo' });

    res.json({
      message: 'Professor reativado com sucesso',
      professor
    });

  } catch (error) {
    console.error('Erro ao reativar professor:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
};

// Buscar professores por status
const getProfessoresPorStatus = async (req, res) => {
  try {
    const { status } = req.params;

    const professores = await Professor.findAll({
      where: { 
        status,
        ativo: true 
      },
      include: [{
        model: User,
        as: 'usuario_cadastro',
        attributes: ['id', 'nome', 'email']
      }],
      order: [['nome', 'ASC']]
    });

    res.json(professores);

  } catch (error) {
    console.error('Erro ao buscar professores por status:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
};

// Estatísticas dos professores
const getEstatisticas = async (req, res) => {
  try {
    const totalProfessores = await Professor.count({
      where: { ativo: true }
    });

    const professoresAtivos = await Professor.count({
      where: { 
        ativo: true,
        status: 'ativo'
      }
    });

    const professoresInativos = await Professor.count({
      where: { 
        ativo: true,
        status: 'inativo'
      }
    });

    const professoresLicenca = await Professor.count({
      where: { 
        ativo: true,
        status: 'licenca'
      }
    });

    const professoresFerias = await Professor.count({
      where: { 
        ativo: true,
        status: 'ferias'
      }
    });

    // Estatísticas por formação
    const porFormacao = await Professor.findAll({
      attributes: [
        'formacao',
        [Professor.sequelize.fn('COUNT', Professor.sequelize.col('id')), 'total']
      ],
      where: { ativo: true },
      group: ['formacao'],
      order: [[Professor.sequelize.fn('COUNT', Professor.sequelize.col('id')), 'DESC']]
    });

    // Média de experiência
    const mediaExperiencia = await Professor.findOne({
      attributes: [
        [Professor.sequelize.fn('AVG', Professor.sequelize.col('experiencia_anos')), 'media']
      ],
      where: { 
        ativo: true,
        experiencia_anos: { [Op.not]: null }
      }
    });

    res.json({
      total: totalProfessores,
      ativos: professoresAtivos,
      inativos: professoresInativos,
      licenca: professoresLicenca,
      ferias: professoresFerias,
      porFormacao,
      mediaExperiencia: parseFloat(mediaExperiencia?.dataValues?.media || 0).toFixed(1)
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
};

module.exports = {
  getProfessores,
  getProfessor,
  createProfessor,
  updateProfessor,
  deleteProfessor,
  reactivateProfessor,
  getProfessoresPorStatus,
  getEstatisticas
};
