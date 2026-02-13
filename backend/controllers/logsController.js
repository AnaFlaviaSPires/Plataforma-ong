const { ActionLog, User } = require('../models');
const { Op } = require('sequelize');

// Listar logs de auditoria com filtros
const getLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, usuario, acao, tabela, dataInicio, dataFim } = req.query;
    const offset = (page - 1) * limit;

    const where = {};

    if (usuario) {
      where.usuario_nome = { [Op.like]: `%${usuario}%` };
    }

    if (acao) {
      where.acao = acao;
    }

    if (tabela) {
      where.tabela_afetada = tabela;
    }

    if (dataInicio || dataFim) {
      where.created_at = {};
      if (dataInicio) {
        where.created_at[Op.gte] = new Date(`${dataInicio}T00:00:00`);
      }
      if (dataFim) {
        where.created_at[Op.lte] = new Date(`${dataFim}T23:59:59`);
      }
    }

    const { count, rows } = await ActionLog.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      include: [
        {
          model: User,
          as: 'usuario',
          attributes: ['id', 'nome', 'email', 'cargo']
        }
      ]
    });

    res.json({
      logs: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Erro ao buscar logs:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = { getLogs };
