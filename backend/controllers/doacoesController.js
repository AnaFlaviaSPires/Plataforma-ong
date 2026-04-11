const { Doacao, User } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { logAction } = require('../middleware/auditMiddleware');

// Listar doações com filtros (admin/secretaria)
const getDoacoes = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, tipo, dataInicio, dataFim } = req.query;
    const offset = (page - 1) * limit;

    const where = {};

    if (search) {
      where[Op.or] = [
        { nome_doador: { [Op.like]: `%${search}%` } },
        { observacoes: { [Op.like]: `%${search}%` } },
        { descricao_itens: { [Op.like]: `%${search}%` } }
      ];
    }

    if (tipo) {
      where.tipo = tipo;
    }

    if (dataInicio || dataFim) {
      where.data_doacao = {};
      if (dataInicio) where.data_doacao[Op.gte] = new Date(`${dataInicio}T00:00:00`);
      if (dataFim) where.data_doacao[Op.lte] = new Date(`${dataFim}T23:59:59`);
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
          attributes: ['id', 'nome'],
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

// Criar nova doação (admin/secretaria)
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
      tipo,
      valor,
      quantidade,
      descricao_itens,
      observacoes,
      data_doacao
    } = req.body;

    if (!tipo) {
      return res.status(400).json({ error: 'Tipo de doação é obrigatório.' });
    }

    // Validar valor/quantidade conforme tipo
    const tiposMonetarios = ['dinheiro', 'pix'];
    if (tiposMonetarios.includes(tipo)) {
      if (!valor || parseFloat(valor) <= 0) {
        return res.status(400).json({ error: 'Informe o valor da doação.' });
      }
    } else {
      if (!quantidade || parseInt(quantidade) <= 0) {
        return res.status(400).json({ error: 'Informe a quantidade doada.' });
      }
    }

    const doacao = await Doacao.create({
      nome_doador: nome_doador || null,
      tipo,
      valor: tiposMonetarios.includes(tipo) ? parseFloat(valor) : null,
      quantidade: !tiposMonetarios.includes(tipo) ? parseInt(quantidade) : null,
      descricao_itens: descricao_itens || null,
      observacoes: observacoes || null,
      data_doacao: data_doacao ? new Date(data_doacao) : new Date(),
      status: 'recebida',
      usuario_id: req.user ? req.user.id : null
    });

    await logAction(req, {
      acao: 'CREATE',
      tabela: 'doacoes',
      registroId: doacao.id,
      novos: doacao.toJSON()
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

// Atualizar doação (admin/secretaria)
const updateDoacao = async (req, res) => {
  try {
    const { id } = req.params;
    const doacao = await Doacao.findByPk(id);

    if (!doacao) {
      return res.status(404).json({ error: 'Doação não encontrada' });
    }

    const dadosAntigos = doacao.toJSON();
    const {
      nome_doador,
      tipo,
      valor,
      quantidade,
      descricao_itens,
      observacoes,
      data_doacao
    } = req.body;

    const tiposMonetarios = ['dinheiro', 'pix'];
    const tipoFinal = tipo || doacao.tipo;

    await doacao.update({
      nome_doador: nome_doador !== undefined ? (nome_doador || null) : doacao.nome_doador,
      tipo: tipoFinal,
      valor: tiposMonetarios.includes(tipoFinal) ? (valor !== undefined ? parseFloat(valor) : doacao.valor) : null,
      quantidade: !tiposMonetarios.includes(tipoFinal) ? (quantidade !== undefined ? parseInt(quantidade) : doacao.quantidade) : null,
      descricao_itens: descricao_itens !== undefined ? descricao_itens : doacao.descricao_itens,
      observacoes: observacoes !== undefined ? observacoes : doacao.observacoes,
      data_doacao: data_doacao ? new Date(data_doacao) : doacao.data_doacao,
      alterado_por: req.user ? req.user.id : null
    });

    await logAction(req, {
      acao: 'UPDATE',
      tabela: 'doacoes',
      registroId: doacao.id,
      antigos: dadosAntigos,
      novos: doacao.toJSON()
    });

    res.json({ message: 'Doação atualizada com sucesso', doacao });
  } catch (error) {
    console.error('Erro ao atualizar doação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Soft delete doação (admin/secretaria)
const deleteDoacao = async (req, res) => {
  try {
    const { id } = req.params;
    const doacao = await Doacao.findByPk(id);

    if (!doacao) {
      return res.status(404).json({ error: 'Doação não encontrada' });
    }

    const dadosAntigos = doacao.toJSON();
    await doacao.destroy(); // paranoid: true → soft delete

    await logAction(req, {
      acao: 'DELETE',
      tabela: 'doacoes',
      registroId: doacao.id,
      antigos: dadosAntigos
    });

    res.json({ message: 'Doação removida com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir doação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Estatísticas agregadas (todos os usuários — SEM dados sensíveis)
const getEstatisticas = async (req, res) => {
  try {
    const totalDoacoes = await Doacao.count();

    // Valor total arrecadado (dinheiro + pix)
    const valorDinheiro = await Doacao.sum('valor', { where: { tipo: 'dinheiro' } }) || 0;
    const valorPix = await Doacao.sum('valor', { where: { tipo: 'pix' } }) || 0;
    const valorTotal = parseFloat(valorDinheiro) + parseFloat(valorPix);

    // Quantidade por tipo
    const porTipo = await Doacao.findAll({
      attributes: [
        'tipo',
        [Doacao.sequelize.fn('COUNT', Doacao.sequelize.col('id')), 'total'],
        [Doacao.sequelize.fn('SUM', Doacao.sequelize.col('valor')), 'soma_valor'],
        [Doacao.sequelize.fn('SUM', Doacao.sequelize.col('quantidade')), 'soma_quantidade']
      ],
      group: ['tipo'],
      raw: true
    });

    // Doações dos últimos 6 meses
    const seisAtras = new Date();
    seisAtras.setMonth(seisAtras.getMonth() - 5);
    const inicioSeisMeses = new Date(seisAtras.getFullYear(), seisAtras.getMonth(), 1);

    const mensalRaw = await Doacao.findAll({
      attributes: [
        [Doacao.sequelize.fn('YEAR', Doacao.sequelize.col('data_doacao')), 'ano'],
        [Doacao.sequelize.fn('MONTH', Doacao.sequelize.col('data_doacao')), 'mes_num'],
        [Doacao.sequelize.fn('COUNT', Doacao.sequelize.col('id')), 'total'],
        [Doacao.sequelize.fn('SUM', Doacao.sequelize.col('valor')), 'valor']
      ],
      where: { data_doacao: { [Op.gte]: inicioSeisMeses } },
      group: [
        Doacao.sequelize.fn('YEAR', Doacao.sequelize.col('data_doacao')),
        Doacao.sequelize.fn('MONTH', Doacao.sequelize.col('data_doacao'))
      ],
      raw: true
    });

    const mensalMap = {};
    mensalRaw.forEach(r => {
      mensalMap[`${r.ano}-${r.mes_num}`] = { total: parseInt(r.total), valor: parseFloat(r.valor) || 0 };
    });

    const mensal = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      mensal.push({
        mes: d.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        total: mensalMap[key]?.total || 0,
        valor: mensalMap[key]?.valor || 0
      });
    }

    res.json({
      total_doacoes: totalDoacoes,
      valor_total: valorTotal,
      por_tipo: porTipo,
      mensal
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas de doações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Confirmar recebimento da doação
const confirmarDoacao = async (req, res) => {
  try {
    const { id } = req.params;
    const doacao = await Doacao.findByPk(id);
    if (!doacao) return res.status(404).json({ error: 'Doação não encontrada' });

    const dadosAntigos = doacao.toJSON();
    await doacao.update({
      status: 'recebida',
      data_recebimento: new Date(),
      data_cancelamento: null,
      alterado_por: req.user ? req.user.id : null
    });

    await logAction(req, {
      acao: 'UPDATE',
      tabela: 'doacoes',
      registroId: doacao.id,
      antigos: dadosAntigos,
      novos: doacao.toJSON()
    });

    res.json({ message: 'Recebimento confirmado com sucesso', doacao });
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
    if (!doacao) return res.status(404).json({ error: 'Doação não encontrada' });

    const dadosAntigos = doacao.toJSON();
    await doacao.update({
      status: 'cancelada',
      data_cancelamento: new Date(),
      alterado_por: req.user ? req.user.id : null
    });

    await logAction(req, {
      acao: 'UPDATE',
      tabela: 'doacoes',
      registroId: doacao.id,
      antigos: dadosAntigos,
      novos: doacao.toJSON()
    });

    res.json({ message: 'Doação cancelada com sucesso', doacao });
  } catch (error) {
    console.error('Erro ao cancelar doação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Buscar doações na lixeira
const getLixeira = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await Doacao.findAndCountAll({
      where: { deletedAt: { [Op.not]: null } },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['deletedAt', 'DESC']],
      paranoid: false,
      include: [{
        model: User,
        as: 'usuario_registro',
        attributes: ['id', 'nome'],
        required: false
      }]
    });

    res.json({
      doacoes: rows,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(count / limit) }
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
    if (!doacao) return res.status(404).json({ error: 'Doação não encontrada' });
    if (!doacao.deletedAt) return res.status(400).json({ error: 'Doação não está na lixeira' });

    await doacao.restore();

    await logAction(req, {
      acao: 'RESTORE',
      tabela: 'doacoes',
      registroId: doacao.id,
      novos: doacao.toJSON()
    });

    res.json({ message: 'Doação restaurada com sucesso', doacao });
  } catch (error) {
    console.error('Erro ao restaurar doação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  getDoacoes,
  createDoacao,
  updateDoacao,
  deleteDoacao,
  getEstatisticas,
  confirmarDoacao,
  cancelarDoacao,
  getLixeira,
  restoreDoacao
};
