const { Aluno, User } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { logAction } = require('../middleware/auditMiddleware');

// Listar todos os alunos
const getAlunos = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ativo, status, turma } = req.query;
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
    
    // Filtro de status
    if (status) {
      where.status = status;
    } 
    // Retrocompatibilidade com filtro 'ativo'
    else if (ativo !== undefined) {
       const isAtivo = (ativo === 'true');
       if (isAtivo) {
         where.status = { [Op.in]: ['matriculado', 'aguardando_vaga'] };
       } else {
         where.status = { [Op.notIn]: ['matriculado', 'aguardando_vaga'] };
       }
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
    // Verificação de Permissão: Apenas Admin e Secretaria
    const allowedRoles = ['admin', 'secretaria'];
    if (!allowedRoles.includes(req.user.cargo)) {
        return res.status(403).json({ error: 'Acesso negado. Apenas Admin e Secretaria podem cadastrar alunos.' });
    }

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

    await logAction(req, {
      acao: 'CREATE',
      tabela: 'alunos',
      registroId: aluno.id,
      novos: aluno
    });

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
    // Verificação de Permissão: Apenas Admin e Secretaria
    const allowedRoles = ['admin', 'secretaria'];
    if (!allowedRoles.includes(req.user.cargo)) {
        return res.status(403).json({ error: 'Acesso negado. Apenas Admin e Secretaria podem editar alunos.' });
    }

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

    // Normalizar campo 'ativo' apenas se 'status' não for enviado
    if (!updateData.status && Object.prototype.hasOwnProperty.call(updateData, 'ativo')) {
      const v = updateData.ativo;
      let isActive = false;
      
      if (typeof v === 'string') {
        const normalized = v.trim().toLowerCase();
        isActive = (
          normalized === 'true' ||
          normalized === '1' ||
          normalized === 'on' ||
          normalized === 'yes' ||
          normalized === 'sim' ||
          normalized === 'matriculado'
        );
      } else {
        isActive = Boolean(v);
      }
      
      // Mapear para status se necessário (o hook do model também faz isso, mas aqui é explícito)
      updateData.status = isActive ? 'matriculado' : 'inativo';
    }

    const dadosAntigos = aluno.toJSON();
    await aluno.update(updateData);

    await logAction(req, {
      acao: 'UPDATE',
      tabela: 'alunos',
      registroId: aluno.id,
      antigos: dadosAntigos,
      novos: aluno
    });

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
    // Verificação de Permissão: Apenas Admin
    if (req.user.cargo !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado. Apenas Administradores podem excluir alunos.' });
    }

    const { id } = req.params;

    const aluno = await Aluno.findByPk(id);

    if (!aluno) {
      return res.status(404).json({
        error: 'Aluno não encontrado'
      });
    }

    // Hard delete - remover definitivamente (agora soft delete devido ao paranoid)
    const dadosAntigos = aluno.toJSON();
    await aluno.destroy();

    await logAction(req, {
      acao: 'DELETE',
      tabela: 'alunos',
      registroId: aluno.id,
      antigos: dadosAntigos
    });

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
    // Verificação de Permissão: Apenas Admin e Secretaria
    const allowedRoles = ['admin', 'secretaria'];
    if (!allowedRoles.includes(req.user.cargo)) {
        return res.status(403).json({ error: 'Acesso negado. Apenas Admin e Secretaria podem reativar alunos.' });
    }

    const { id } = req.params;

    const aluno = await Aluno.findByPk(id);

    if (!aluno) {
      return res.status(404).json({
        error: 'Aluno não encontrado'
      });
    }

    const dadosAntigos = aluno.toJSON();
    // Reativar define como matriculado
    await aluno.update({ status: 'matriculado', ativo: true });

    await logAction(req, {
      acao: 'UPDATE',
      tabela: 'alunos',
      registroId: aluno.id,
      antigos: dadosAntigos,
      novos: aluno
    });

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
        status: 'matriculado' // Apenas alunos ativos na turma
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
    const totalMatriculados = await Aluno.count({ where: { status: 'matriculado' } });
    const totalAguardando = await Aluno.count({ where: { status: 'aguardando_vaga' } });
    const totalInativos = await Aluno.count({ where: { status: 'inativo' } });
    const totalCancelados = await Aluno.count({ where: { status: 'cancelado' } });
    const totalFormados = await Aluno.count({ where: { status: 'formado' } });
    
    // Agrupamento por status
    const alunosPorStatus = await Aluno.findAll({
      attributes: [
        'status',
        [Aluno.sequelize.fn('COUNT', Aluno.sequelize.col('id')), 'total']
      ],
      group: ['status'],
      raw: true
    });

    const alunosPorTurma = await Aluno.findAll({
      attributes: [
        'turma',
        [Aluno.sequelize.fn('COUNT', Aluno.sequelize.col('id')), 'total']
      ],
      where: { status: 'matriculado' },
      group: ['turma'],
      raw: true
    });

    const alunosComRestricao = await Aluno.count({
      where: {
        status: 'matriculado',
        restricao_alimentar: { [Op.ne]: null }
      }
    });

    res.json({
      total_alunos: totalMatriculados + totalAguardando, // Ativos no sentido amplo
      total_matriculados: totalMatriculados,
      total_aguardando: totalAguardando,
      total_inativos: totalInativos,
      total_cancelados: totalCancelados,
      total_formados: totalFormados,
      alunos_por_status: alunosPorStatus,
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

// Buscar alunos na lixeira (excluídos logicamente)
const getLixeira = async (req, res) => {
  try {
    // Verificação de Permissão: Apenas Admin
    if (req.user.cargo !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado. Apenas Administradores podem acessar a lixeira.' });
    }

    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    const where = {
      deletedAt: { [Op.not]: null } // Filtra apenas os excluídos
    };

    if (search) {
      where[Op.or] = [
        { nome: { [Op.like]: `%${search}%` } },
        { cpf: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Aluno.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['deletedAt', 'DESC']], // Recém excluídos primeiro
      paranoid: false, // Importante: permite buscar registros com deletedAt preenchido
      include: [{
        model: User,
        as: 'usuario_cadastro',
        attributes: ['id', 'nome', 'email'],
        required: false
      }]
    });

    res.json({
      alunos: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar lixeira:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// Restaurar aluno excluído
const restoreAluno = async (req, res) => {
  try {
    // Verificação de Permissão: Apenas Admin
    if (req.user.cargo !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado. Apenas Administradores podem restaurar alunos.' });
    }

    const { id } = req.params;

    // Busca inclusive os excluídos (paranoid: false)
    const aluno = await Aluno.findByPk(id, { paranoid: false });

    if (!aluno) {
      return res.status(404).json({
        error: 'Aluno não encontrado'
      });
    }

    if (!aluno.deletedAt) {
      return res.status(400).json({
        error: 'Este aluno não está na lixeira'
      });
    }

    await aluno.restore();

    await logAction(req, {
      acao: 'RESTORE',
      tabela: 'alunos',
      registroId: aluno.id,
      novos: aluno
    });

    res.json({
      message: 'Aluno restaurado com sucesso',
      aluno: aluno
    });

  } catch (error) {
    console.error('Erro ao restaurar aluno:', error);
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
  getEstatisticas,
  getLixeira,
  restoreAluno
};
