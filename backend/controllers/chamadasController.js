const { Chamada, ChamadaRegistro, Sala, Aluno } = require('../models');
const { logAction } = require('../middleware/auditMiddleware');

// Criar nova chamada com registros de presença
async function createChamada(req, res, next) {
  try {
    // Permissões: Apenas Admin e Professor
    const allowedRoles = ['admin', 'professor'];
    if (!allowedRoles.includes(req.user.cargo)) {
        return res.status(403).json({ error: 'Acesso negado. Apenas Professores e Admin podem registrar chamadas.' });
    }

    const { salaId, dataISO, hora, registros } = req.body;

    if (!salaId || !dataISO || !Array.isArray(registros)) {
      return res.status(400).json({ error: 'Dados de chamada inválidos' });
    }

    const sala = await Sala.findByPk(salaId);
    if (!sala) {
      return res.status(404).json({ error: 'Sala não encontrada' });
    }

    // Validação de permissão para Professor: Apenas salas vinculadas
    if (req.user && req.user.cargo === 'professor') {
      const nomeProfessorSala = sala.professor ? sala.professor.trim().toLowerCase() : '';
      const nomeUsuario = req.user.nome.trim().toLowerCase();
      
      // Comparação flexível para lidar com variações de nome
      if (!nomeProfessorSala.includes(nomeUsuario) && !nomeUsuario.includes(nomeProfessorSala)) {
        
        await logAction(req, {
          acao: 'FORBIDDEN',
          tabela: 'salas',
          registroId: sala.id,
          novos: { tentativa: 'Registrar Chamada', motivo: 'Sala não vinculada ao professor' }
        });

        return res.status(403).json({ 
          error: 'Acesso negado. Você só pode registrar chamadas nas salas em que é o professor responsável.' 
        });
      }
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
      presente: r.presente === true || r.presente === 'true' || r.presente === 1 ? true : false,
      observacao: r.observacao || null
    }));

    if (registrosData.length) {
      await ChamadaRegistro.bulkCreate(registrosData);
      
      // Atualizar estatísticas de frequência em bulk (para Power BI)
      const presenteIds = registrosData.filter(r => r.presente).map(r => r.aluno_id);
      const faltaIds = registrosData.filter(r => !r.presente).map(r => r.aluno_id);
      const todosIds = registrosData.map(r => r.aluno_id);

      if (presenteIds.length) {
        await Aluno.increment('total_presencas', { by: 1, where: { id: presenteIds } });
      }
      if (faltaIds.length) {
        await Aluno.increment('total_faltas', { by: 1, where: { id: faltaIds } });
      }
      if (todosIds.length) {
        await Aluno.update(
          { ultima_atualizacao_frequencia: new Date() },
          { where: { id: todosIds } }
        );
      }
      
      // Log para debug de persistência
      console.log(`[CHAMADA] ID ${chamada.id} gravada. Total: ${registrosData.length}, Presentes: ${registrosData.filter(r=>r.presente).length}, Faltas: ${registrosData.filter(r=>!r.presente).length}`);
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

    await logAction(req, {
      acao: 'CREATE',
      tabela: 'chamadas',
      registroId: chamada.id,
      novos: chamadaCompleta
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
