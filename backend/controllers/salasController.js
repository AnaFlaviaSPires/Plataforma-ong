const { Sala, SalaAluno, Aluno } = require('../models');
const { validationResult } = require('express-validator');

// Listar todas as salas com contagem de alunos
async function getSalas(req, res, next) {
  try {
    const salas = await Sala.findAll({
      include: [{
        model: Aluno,
        as: 'alunos',
        through: { attributes: [] }
      }],
      order: [['nome', 'ASC']]
    });

    // Normaliza saída para o front:
    // - diaSemana em vez de dia_semana
    // - inclui lista de alunos (id, nome) para permitir contagem e futuras expansões
    const data = salas.map(s => ({
      id: s.id,
      nome: s.nome,
      professor: s.professor,
      diaSemana: s.dia_semana,
      horario: s.horario,
      ativo: s.ativo,
      total_alunos: Array.isArray(s.alunos) ? s.alunos.length : 0,
      alunos: Array.isArray(s.alunos)
        ? s.alunos.map(a => ({ id: a.id, nome: a.nome }))
        : []
    }));

    res.json({ salas: data });
  } catch (err) {
    next(err);
  }
}

// Obter detalhes de uma sala (incluindo alunos vinculados)
async function getSala(req, res, next) {
  try {
    const { id } = req.params;
    const sala = await Sala.findByPk(id, {
      include: [{
        model: Aluno,
        as: 'alunos',
        through: { attributes: [] }
      }]
    });

    if (!sala) {
      return res.status(404).json({ error: 'Sala não encontrada' });
    }

    res.json(sala);
  } catch (err) {
    next(err);
  }
}

// Criar nova sala com lista de alunos
async function createSala(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { nome, professor, dia_semana, horario, alunosIds } = req.body;

    const sala = await Sala.create({
      nome,
      professor,
      dia_semana,
      horario,
      usuario_id: req.user ? req.user.id : null
    });

    if (Array.isArray(alunosIds) && alunosIds.length) {
      const registros = alunosIds.map(idAluno => ({
        sala_id: sala.id,
        aluno_id: idAluno
      }));
      await SalaAluno.bulkCreate(registros, { ignoreDuplicates: true });
    }

    const salaComAlunos = await Sala.findByPk(sala.id, {
      include: [{ model: Aluno, as: 'alunos', through: { attributes: [] } }]
    });

    res.status(201).json(salaComAlunos);
  } catch (err) {
    next(err);
  }
}

// Atualizar sala e alunos vinculados
async function updateSala(req, res, next) {
  try {
    const { id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const sala = await Sala.findByPk(id);
    if (!sala) {
      return res.status(404).json({ error: 'Sala não encontrada' });
    }

    const { nome, professor, dia_semana, horario, ativo, alunosIds } = req.body;

    await sala.update({
      nome: nome ?? sala.nome,
      professor: professor ?? sala.professor,
      dia_semana: dia_semana ?? sala.dia_semana,
      horario: horario ?? sala.horario,
      ativo: typeof ativo === 'boolean' ? ativo : sala.ativo
    });

    if (Array.isArray(alunosIds)) {
      await SalaAluno.destroy({ where: { sala_id: sala.id } });
      if (alunosIds.length) {
        const registros = alunosIds.map(idAluno => ({ sala_id: sala.id, aluno_id: idAluno }));
        await SalaAluno.bulkCreate(registros, { ignoreDuplicates: true });
      }
    }

    const salaComAlunos = await Sala.findByPk(sala.id, {
      include: [{ model: Aluno, as: 'alunos', through: { attributes: [] } }]
    });

    res.json(salaComAlunos);
  } catch (err) {
    next(err);
  }
}

// Excluir sala (hard delete por enquanto)
async function deleteSala(req, res, next) {
  try {
    const { id } = req.params;
    const sala = await Sala.findByPk(id);
    if (!sala) {
      return res.status(404).json({ error: 'Sala não encontrada' });
    }

    await SalaAluno.destroy({ where: { sala_id: id } });
    await sala.destroy();

    res.json({ message: 'Sala excluída com sucesso' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSalas,
  getSala,
  createSala,
  updateSala,
  deleteSala
};
