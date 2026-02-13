const { Doacao, User } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { logAction } = require('../middleware/auditMiddleware');

// Listar doações com filtros
const getDoacoes = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, tipo, status, data } = req.query;
    const offset = (page - 1) * limit;

    const where = {};

    if (search) {
      where[Op.or] = [
        { nome_doador: { [Op.like]: `%${search}%` } },
        { observacoes: { [Op.like]: `%${search}%` } }
      ];
    }

    if (tipo) {
      where.tipo = tipo;
    }

    if (status) {
      where.status = status;
    }

    if (data) {
      // data no formato YYYY-MM-DD
      where.data_doacao = {
        [Op.gte]: new Date(`${data}T00:00:00`)
      };
    }

    const { count, rows } = await Doacao.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['data_doacao', 'DESC']],
      include: [
        {
          model: User,
          as: 'usuario_registro',
          attributes: ['id', 'nome', 'email'],
          required: false
        }
      ]
    });

    res.json({
      doacoes: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar doações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Criar nova doação
const createDoacao = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const {
      nome_doador,
      email_doador,
      telefone_doador,
      documento_doador,
      tipo,
      valor,
      descricao_itens,
      observacoes
    } = req.body;

    const doacao = await Doacao.create({
      nome_doador,
      email_doador,
      telefone_doador,
      documento_doador,
      tipo,
      valor,
      descricao_itens,
      observacoes,
      status: 'pendente',
      usuario_id: req.user ? req.user.id : null
    });

    await logAction(req, {
      acao: 'CREATE',
      tabela: 'doacoes',
      registroId: doacao.id,
      novos: doacao
    });

    res.status(201).json({
      message: 'Doação registrada com sucesso',
      doacao
    });
  } catch (error) {
    console.error('Erro ao criar doação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Confirmar recebimento da doação
const confirmarDoacao = async (req, res) => {
  try {
    const { id } = req.params;

    const doacao = await Doacao.findByPk(id);

    if (!doacao) {
      return res.status(404).json({ error: 'Doação não encontrada' });
    }

    const dadosAntigos = doacao.toJSON();
    await doacao.update({
      status: 'recebida',
      data_recebimento: new Date(),
      data_cancelamento: null
    });

    await logAction(req, {
      acao: 'UPDATE',
      tabela: 'doacoes',
      registroId: doacao.id,
      antigos: dadosAntigos,
      novos: doacao
    });

    res.json({
      message: 'Recebimento confirmado com sucesso',
      doacao
    });
  } catch (error) {
    console.error('Erro ao confirmar doação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Cancelar doação
const cancelarDoacao = async (req, res) => {
  try {
    const { id } = req.params;

    const doacao = await Doacao.findByPk(id);

    if (!doacao) {
      return res.status(404).json({ error: 'Doação não encontrada' });
    }

    const dadosAntigos = doacao.toJSON();
    await doacao.update({
      status: 'cancelada',
      data_cancelamento: new Date()
    });

    await logAction(req, {
      acao: 'UPDATE',
      tabela: 'doacoes',
      registroId: doacao.id,
      antigos: dadosAntigos,
      novos: doacao
    });

    res.json({
      message: 'Doação cancelada com sucesso',
      doacao
    });
  } catch (error) {
    console.error('Erro ao cancelar doação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Buscar doações na lixeira
const getLixeira = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    const where = {
      deletedAt: { [Op.not]: null }
    };

    if (search) {
      where[Op.or] = [
        { nome_doador: { [Op.like]: `%${search}%` } },
        { observacoes: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Doacao.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['deletedAt', 'DESC']],
      paranoid: false,
      include: [{
        model: User,
        as: 'usuario_registro',
        attributes: ['id', 'nome', 'email'],
        required: false
      }]
    });

    res.json({
      doacoes: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar lixeira de doações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Restaurar doação
const restoreDoacao = async (req, res) => {
  try {
    const { id } = req.params;

    const doacao = await Doacao.findByPk(id, { paranoid: false });

    if (!doacao) {
      return res.status(404).json({ error: 'Doação não encontrada' });
    }

    if (!doacao.deletedAt) {
      return res.status(400).json({ error: 'Doação não está na lixeira' });
    }

    await doacao.restore();

    await logAction(req, {
      acao: 'RESTORE',
      tabela: 'doacoes',
      registroId: doacao.id,
      novos: doacao
    });

    res.json({
      message: 'Doação restaurada com sucesso',
      doacao
    });

  } catch (error) {
    console.error('Erro ao restaurar doação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  getDoacoes,
  createDoacao,
  confirmarDoacao,
  cancelarDoacao,
  getLixeira,
  restoreDoacao
};
