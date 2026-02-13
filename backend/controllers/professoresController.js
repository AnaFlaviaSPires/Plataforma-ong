const { Professor, User } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { logAction } = require('../middleware/auditMiddleware');

// Listar todos os professores
const getProfessores = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, ativo } = req.query;
    const offset = (page - 1) * limit;

    // Construir filtros
    const where = {
      // Regra de Negócio: Apenas professores que são usuários do sistema
      usuario_id: { [Op.not]: null }
    };
    
    if (search) {
      where[Op.and] = [
          { usuario_id: { [Op.not]: null } }, // Redundância para segurança
          {
            [Op.or]: [
                { nome: { [Op.like]: `%${search}%` } },
                { cpf: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { formacao: { [Op.like]: `%${search}%` } }
            ]
          }
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

    await logAction(req, {
      acao: 'CREATE',
      tabela: 'professores',
      registroId: professor.id,
      novos: professor
    });

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

    const dadosAntigos = professor.toJSON();
    await professor.update(req.body);

    await logAction(req, {
      acao: 'UPDATE',
      tabela: 'professores',
      registroId: professor.id,
      antigos: dadosAntigos,
      novos: professor
    });

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
    const dadosAntigos = professor.toJSON();
    // Não precisa atualizar ativo=false se usar destroy com paranoid, mas vou manter consistência
    // await professor.update({ ativo: false }); 
    // Melhor usar apenas destroy() para o paranoid funcionar limpo e ir para lixeira
    await professor.destroy();

    await logAction(req, {
      acao: 'DELETE',
      tabela: 'professores',
      registroId: professor.id,
      antigos: dadosAntigos
    });

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

    await logAction(req, {
      acao: 'RESTORE',
      tabela: 'professores',
      registroId: professor.id,
      novos: professor
    });

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

// Buscar professores na lixeira (excluídos logicamente)
const getLixeira = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    const where = {
      deletedAt: { [Op.not]: null }
    };

    if (search) {
      where[Op.or] = [
        { nome: { [Op.like]: `%${search}%` } },
        { cpf: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Professor.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['deletedAt', 'DESC']],
      paranoid: false,
      include: [{
        model: User,
        as: 'usuario_cadastro',
        attributes: ['id', 'nome', 'email'],
        required: false
      }]
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
    console.error('Erro ao buscar lixeira de professores:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
};

// Restaurar professor (específico da lixeira)
const restoreProfessor = async (req, res) => {
  try {
    const { id } = req.params;

    const professor = await Professor.findByPk(id, { paranoid: false });

    if (!professor) {
      return res.status(404).json({ error: 'Professor não encontrado' });
    }

    if (!professor.deletedAt) {
      return res.status(400).json({ error: 'Professor não está na lixeira' });
    }

    await professor.restore();
    // Garantir que volte ativo
    await professor.update({ ativo: true, status: 'ativo' });

    await logAction(req, {
      acao: 'RESTORE',
      tabela: 'professores',
      registroId: professor.id,
      novos: professor
    });

    res.json({
      message: 'Professor restaurado com sucesso',
      professor
    });

  } catch (error) {
    console.error('Erro ao restaurar professor:', error);
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
  getEstatisticas,
  getLixeira,
  restoreProfessor
};
