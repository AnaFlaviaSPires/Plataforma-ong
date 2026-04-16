const { Chamada, ChamadaRegistro, Sala, Aluno, ActionLog } = require('../models');
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

// Excluir uma chamada (apenas admin e secretaria)
async function deleteChamada(req, res, next) {
  try {
    const allowedRoles = ['admin', 'secretaria'];
    if (!allowedRoles.includes(req.user.cargo)) {
      return res.status(403).json({ error: 'Acesso negado. Apenas Secretaria e Admin podem excluir chamadas.' });
    }

    const { id } = req.params;

    const chamada = await Chamada.findByPk(id, {
      include: [
        {
          model: ChamadaRegistro,
          as: 'registros',
          include: [{ model: Aluno, as: 'aluno' }]
        }
      ]
    });

    if (!chamada) {
      return res.status(404).json({ error: 'Chamada não encontrada' });
    }

    const dadosAntigos = chamada.toJSON();

    // Reverter estatísticas de frequência dos alunos
    if (Array.isArray(chamada.registros) && chamada.registros.length > 0) {
      const presenteIds = chamada.registros.filter(r => r.presente).map(r => r.aluno_id);
      const faltaIds = chamada.registros.filter(r => !r.presente).map(r => r.aluno_id);

      if (presenteIds.length) {
        await Aluno.decrement('total_presencas', { by: 1, where: { id: presenteIds } });
      }
      if (faltaIds.length) {
        await Aluno.decrement('total_faltas', { by: 1, where: { id: faltaIds } });
      }
    }

    // Excluir registros de presença e depois a chamada
    await ChamadaRegistro.destroy({ where: { chamada_id: id } });
    await chamada.destroy();

    await logAction(req, {
      acao: 'DELETE',
      tabela: 'chamadas',
      registroId: parseInt(id),
      antigos: dadosAntigos
    });

    console.log(`[CHAMADA] ID ${id} excluída por ${req.user.nome} (${req.user.cargo})`);

    res.json({ message: 'Chamada excluída com sucesso' });
  } catch (err) {
    next(err);
  }
}

// Listar chamadas excluídas (dos logs de auditoria)
async function getDeletedChamadas(req, res, next) {
  try {
    const logs = await ActionLog.findAll({
      where: {
        acao: 'DELETE',
        tabela_afetada: 'chamadas'
      },
      order: [['created_at', 'DESC']]
    });

    const deletadas = logs.map(log => {
      const dados = log.dados_antigos || {};
      return {
        logId: log.id,
        chamadaId: log.registro_id,
        salaId: dados.sala_id,
        data: dados.data,
        hora: dados.hora,
        totalRegistros: Array.isArray(dados.registros) ? dados.registros.length : 0,
        excluidaEm: log.created_at,
        excluidaPor: log.usuario_nome
      };
    });

    res.json({ deletadas });
  } catch (err) {
    next(err);
  }
}

// Restaurar uma chamada excluída a partir do log de auditoria
async function restoreChamada(req, res, next) {
  try {
    const allowedRoles = ['admin', 'secretaria'];
    if (!allowedRoles.includes(req.user.cargo)) {
      return res.status(403).json({ error: 'Acesso negado.' });
    }

    const { logId } = req.params;

    const log = await ActionLog.findByPk(logId);
    if (!log || log.acao !== 'DELETE' || log.tabela_afetada !== 'chamadas') {
      return res.status(404).json({ error: 'Log de exclusão não encontrado' });
    }

    const dados = log.dados_antigos;
    if (!dados || !dados.sala_id || !dados.data) {
      return res.status(400).json({ error: 'Dados insuficientes no log para restauração' });
    }

    // Verificar se a chamada já não foi restaurada (evitar duplicata)
    const jaExiste = await Chamada.findOne({
      where: { sala_id: dados.sala_id, data: dados.data, hora: dados.hora || null }
    });
    if (jaExiste) {
      return res.status(409).json({ error: 'Uma chamada com mesma sala, data e hora já existe. Pode já ter sido restaurada.' });
    }

    // Recriar a chamada
    const novaChamada = await Chamada.create({
      sala_id: dados.sala_id,
      data: dados.data,
      hora: dados.hora || null,
      observacoes: dados.observacoes || null,
      criado_por: dados.criado_por || null,
      atualizado_por: req.user.id
    });

    // Recriar registros de presença
    if (Array.isArray(dados.registros) && dados.registros.length > 0) {
      const registrosData = dados.registros.map(r => ({
        chamada_id: novaChamada.id,
        aluno_id: r.aluno_id,
        presente: r.presente,
        observacao: r.observacao || null
      }));

      await ChamadaRegistro.bulkCreate(registrosData);

      // Re-incrementar estatísticas de frequência
      const presenteIds = registrosData.filter(r => r.presente).map(r => r.aluno_id);
      const faltaIds = registrosData.filter(r => !r.presente).map(r => r.aluno_id);

      if (presenteIds.length) {
        await Aluno.increment('total_presencas', { by: 1, where: { id: presenteIds } });
      }
      if (faltaIds.length) {
        await Aluno.increment('total_faltas', { by: 1, where: { id: faltaIds } });
      }
    }

    await logAction(req, {
      acao: 'RESTORE',
      tabela: 'chamadas',
      registroId: novaChamada.id,
      antigos: { logId: log.id, chamadaOriginalId: log.registro_id },
      novos: novaChamada.toJSON()
    });

    console.log(`[CHAMADA] Restaurada (novo ID ${novaChamada.id}) a partir do log ${logId} por ${req.user.nome}`);

    res.json({ message: 'Chamada restaurada com sucesso', chamadaId: novaChamada.id });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createChamada,
  getChamadas,
  deleteChamada,
  getDeletedChamadas,
  restoreChamada
};
