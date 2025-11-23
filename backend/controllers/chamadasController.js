const { Chamada, ChamadaRegistro, Sala, Aluno } = require('../models');

// Criar nova chamada com registros de presença
async function createChamada(req, res, next) {
  try {
    const { salaId, dataISO, hora, registros } = req.body;

    if (!salaId || !dataISO || !Array.isArray(registros)) {
      return res.status(400).json({ error: 'Dados de chamada inválidos' });
    }

    const sala = await Sala.findByPk(salaId);
    if (!sala) {
      return res.status(404).json({ error: 'Sala não encontrada' });
    }

    const chamada = await Chamada.create({
      sala_id: salaId,
      data: dataISO,
      hora: hora || null,
      observacoes: null,
      criado_por: req.user ? req.user.id : null,
      atualizado_por: req.user ? req.user.id : null
    });

    const registrosData = registros.map(r => ({
      chamada_id: chamada.id,
      aluno_id: r.idAluno,
      presente: !!r.presente,
      observacao: r.observacao || null
    }));

    if (registrosData.length) {
      await ChamadaRegistro.bulkCreate(registrosData);
    }

    const chamadaCompleta = await Chamada.findByPk(chamada.id, {
      include: [
        {
          model: ChamadaRegistro,
          as: 'registros',
          include: [{ model: Aluno, as: 'aluno' }]
        }
      ]
    });

    res.status(201).json(chamadaCompleta);
  } catch (err) {
    next(err);
  }
}

// Listar chamadas de uma sala (opcionalmente por data)
async function getChamadas(req, res, next) {
  try {
    const { salaId, data } = req.query;

    if (!salaId) {
      return res.status(400).json({ error: 'salaId é obrigatório' });
    }

    const where = { sala_id: salaId };
    if (data) {
      where.data = data;
    }

    const chamadas = await Chamada.findAll({
      where,
      order: [['data', 'DESC'], ['hora', 'DESC']],
      include: [
        {
          model: ChamadaRegistro,
          as: 'registros',
          include: [{ model: Aluno, as: 'aluno' }]
        }
      ]
    });

    res.json({ chamadas });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createChamada,
  getChamadas
};
