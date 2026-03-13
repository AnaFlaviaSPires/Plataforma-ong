const { Sala, SalaAluno, Aluno, User, Professor } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { logAction } = require('../middleware/auditMiddleware');

// Listar todas as salas com contagem de alunos e detalhes do professor
async function getSalas(req, res, next) {
  try {
    const salas = await Sala.findAll({
      include: [
        {
          model: Aluno,
          as: 'alunos',
          through: { attributes: [] }
        },
        {
          model: Professor,
          as: 'professor_responsavel',
          attributes: ['id', 'nome', 'email'],
          required: false
        }
      ],
      order: [['nome', 'ASC']]
    });

    // Normaliza saída para o front
    const data = salas.map(s => ({
      id: s.id,
      nome: s.nome,
      professor: s.professor, // Mantém compatibilidade com front antigo
      professor_id: s.professor_id,
      professor_nome: s.professor_responsavel?.nome || s.professor, // Prioriza relação, fallback para string
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

// Obter detalhes de uma sala
async function getSala(req, res, next) {
  try {
    const { id } = req.params;
    const sala = await Sala.findByPk(id, {
      include: [
        {
          model: Aluno,
          as: 'alunos',
          through: { attributes: [] }
        },
        {
          model: Professor,
          as: 'professor_responsavel',
          attributes: ['id', 'nome', 'email'],
          required: false
        }
      ]
    });

    if (!sala) {
      return res.status(404).json({ error: 'Sala não encontrada' });
    }

    res.json({
        ...sala.toJSON(),
        professor_nome: sala.professor_responsavel?.nome || sala.professor
    });
  } catch (err) {
    next(err);
  }
}

// Criar nova sala
async function createSala(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { nome, professor, professor_id, dia_semana, horario, alunosIds } = req.body;

    // Valida se professor_id existe na tabela de professores
    let finalProfessorId = null;
    let finalProfessorNome = professor || 'Não Informado';
    
    if (professor_id) {
        const profExiste = await Professor.findByPk(professor_id);
        if (profExiste) {
            finalProfessorId = profExiste.id;
            finalProfessorNome = profExiste.nome;
        }
    }
    
    // Se não encontrou por ID, tenta buscar pelo nome
    if (!finalProfessorId && professor) {
        const profEncontrado = await Professor.findOne({ where: { nome: professor } });
        if (profEncontrado) {
            finalProfessorId = profEncontrado.id;
            finalProfessorNome = profEncontrado.nome;
        }
    }

    const sala = await Sala.create({
      nome,
      professor: finalProfessorNome,
      professor_id: finalProfessorId,
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

    const salaCompleta = await Sala.findByPk(sala.id, {
      include: [
          { model: Aluno, as: 'alunos', through: { attributes: [] } },
          { model: Professor, as: 'professor_responsavel', attributes: ['id', 'nome', 'email'], required: false }
      ]
    });

    await logAction(req, {
      acao: 'CREATE',
      tabela: 'salas',
      registroId: sala.id,
      novos: salaCompleta
    });

    res.status(201).json({ message: 'Sala criada com sucesso', sala: salaCompleta });
  } catch (err) {
    next(err);
  }
}

// Atualizar sala
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

    const { nome, professor, professor_id, dia_semana, horario, ativo, alunosIds } = req.body;

    const dadosAntigos = sala.toJSON();

    // Valida se professor_id existe na tabela de professores
    let finalProfessorId = sala.professor_id;
    let finalProfessorNome = sala.professor;
    
    if (professor_id !== undefined) {
        if (professor_id) {
            const profExiste = await Professor.findByPk(professor_id);
            if (profExiste) {
                finalProfessorId = profExiste.id;
                finalProfessorNome = profExiste.nome;
            }
        } else {
            // professor_id foi explicitamente setado como null/vazio
            finalProfessorId = null;
            finalProfessorNome = professor || sala.professor;
        }
    } else if (professor) {
        // Tenta buscar pelo nome se não veio ID
        const profEncontrado = await Professor.findOne({ where: { nome: professor } });
        if (profEncontrado) {
            finalProfessorId = profEncontrado.id;
            finalProfessorNome = profEncontrado.nome;
        } else {
            finalProfessorNome = professor;
        }
    }

    await sala.update({
      nome: nome ?? sala.nome,
      professor: finalProfessorNome,
      professor_id: finalProfessorId,
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

    const salaCompleta = await Sala.findByPk(sala.id, {
      include: [
          { model: Aluno, as: 'alunos', through: { attributes: [] } },
          { model: Professor, as: 'professor_responsavel', attributes: ['id', 'nome', 'email'], required: false }
      ]
    });

    await logAction(req, {
      acao: 'UPDATE',
      tabela: 'salas',
      registroId: sala.id,
      antigos: dadosAntigos,
      novos: salaCompleta
    });

    res.json(salaCompleta);
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

    const dadosAntigos = sala.toJSON();
    
    // Não removemos SalaAluno fisicamente para permitir restauração completa
    // Como Sala é paranoid, ao restaurar ela, os vínculos voltam a fazer sentido
    await sala.destroy();

    await logAction(req, {
      acao: 'DELETE',
      tabela: 'salas',
      registroId: sala.id,
      antigos: dadosAntigos
    });

    res.json({ message: 'Sala excluída com sucesso' });
  } catch (err) {
    next(err);
  }
}

// Buscar lixeira de salas
async function getLixeira(req, res, next) {
  try {
    // Verificação de Permissão: Apenas Admin
    if (req.user.cargo !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado. Apenas Administradores podem acessar a lixeira de salas.' });
    }
    const salas = await Sala.findAll({
      where: { deletedAt: { [Op.not]: null } },
      paranoid: false,
      include: [{ model: Aluno, as: 'alunos', through: { attributes: [] } }],
      order: [['deletedAt', 'DESC']]
    });
    res.json({ salas });
  } catch (err) {
    next(err);
  }
}

// Restaurar sala
async function restoreSala(req, res, next) {
  try {
    // Verificação de Permissão: Apenas Admin
    if (req.user.cargo !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado. Apenas Administradores podem restaurar salas.' });
    }
    const { id } = req.params;
    const sala = await Sala.findByPk(id, { paranoid: false });
    if (!sala) return res.status(404).json({ error: 'Sala não encontrada' });
    if (!sala.deletedAt) return res.status(400).json({ error: 'Sala não está na lixeira' });

    await sala.restore();

    await logAction(req, {
      acao: 'RESTORE',
      tabela: 'salas',
      registroId: sala.id,
      novos: sala
    });

    res.json({ message: 'Sala restaurada com sucesso', sala });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSalas,
  getSala,
  createSala,
  updateSala,
  deleteSala,
  getLixeira,
  restoreSala
};
