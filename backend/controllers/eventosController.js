const { Evento, User, EventoParticipante } = require('../models');
const { logAction } = require('../middleware/auditMiddleware');
const { Op } = require('sequelize');

// Listar Eventos
async function getEventos(req, res, next) {
  try {
    const { start, end } = req.query; // FullCalendar envia 'start' e 'end'
    const where = {};

    // Filtro por intervalo de datas (essencial para calendario)
    if (start && end) {
      where[Op.and] = [
        { inicio: { [Op.lt]: end } },
        { fim: { [Op.gt]: start } }
      ];
    }

    const userId = req.user.id;
    const userRole = req.user.cargo;

    const eventos = await Evento.findAll({
      where,
      include: [
          { model: User, as: 'criador', attributes: ['id', 'nome'] },
          { model: User, as: 'participantes', attributes: ['id', 'nome'], through: { attributes: [] } }
      ],
      order: [['inicio', 'ASC']]
    });

    // Filtragem de permissão (Pós-processamento para simplificar query)
    let resultado = eventos;
    if (userRole !== 'admin' && userRole !== 'secretaria') {
        resultado = eventos.filter(ev => {
            if (ev.visibilidade === 'public') return true;
            if (ev.criado_por === userId) return true;
            if (ev.participantes && ev.participantes.some(p => p.id === userId)) return true;
            return false;
        });
    }
    
    // Adicionar array simples de IDs para o front
    const resposta = resultado.map(ev => {
        const json = ev.toJSON();
        json.participantesIds = ev.participantes ? ev.participantes.map(p => p.id) : [];
        return json;
    });

    res.json(resposta);
  } catch (err) {
    next(err);
  }
}

// Criar Evento
async function createEvento(req, res, next) {
  try {
    const { titulo, descricao, inicio, fim, dia_inteiro, categoria, visibilidade, participantes } = req.body;

    if (!titulo || !inicio || !fim) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    const evento = await Evento.create({
      titulo,
      descricao,
      inicio,
      fim,
      dia_inteiro: !!dia_inteiro,
      categoria: categoria || 'event',
      visibilidade: visibilidade || 'public',
      criado_por: req.user.id
    });

    // Salvar participantes se fornecidos
    if (Array.isArray(participantes) && participantes.length > 0) {
        const inserts = participantes.map(uid => ({
            evento_id: evento.id,
            usuario_id: uid
        }));
        await EventoParticipante.bulkCreate(inserts, { ignoreDuplicates: true });
    }

    // Recarregar com participantes para log
    const eventoCompleto = await Evento.findByPk(evento.id, {
        include: [{ model: User, as: 'participantes', attributes: ['id', 'nome'] }]
    });

    await logAction(req, {
      acao: 'CREATE',
      tabela: 'eventos',
      registroId: evento.id,
      novos: eventoCompleto
    });

    res.status(201).json(eventoCompleto);
  } catch (err) {
    next(err);
  }
}

// Atualizar Evento
async function updateEvento(req, res, next) {
  try {
    const { id } = req.params;
    const evento = await Evento.findByPk(id);

    if (!evento) return res.status(404).json({ error: 'Evento não encontrado' });

    // Permissão: Criador ou Admin
    if (evento.criado_por !== req.user.id && req.user.cargo !== 'admin') {
        return res.status(403).json({ error: 'Sem permissão para editar este evento' });
    }

    const dadosAntigos = evento.toJSON();

    const { titulo, descricao, inicio, fim, dia_inteiro, categoria, visibilidade, participantes } = req.body;

    await evento.update({
      titulo: titulo || evento.titulo,
      descricao: descricao !== undefined ? descricao : evento.descricao,
      inicio: inicio || evento.inicio,
      fim: fim || evento.fim,
      dia_inteiro: dia_inteiro !== undefined ? !!dia_inteiro : evento.dia_inteiro,
      categoria: categoria || evento.categoria,
      visibilidade: visibilidade || evento.visibilidade
    });

    // Atualizar participantes se fornecidos
    if (Array.isArray(participantes)) {
        await EventoParticipante.destroy({ where: { evento_id: id } });
        if (participantes.length > 0) {
            const inserts = participantes.map(uid => ({
                evento_id: evento.id,
                usuario_id: uid
            }));
            await EventoParticipante.bulkCreate(inserts, { ignoreDuplicates: true });
        }
    }

    const eventoCompleto = await Evento.findByPk(evento.id, {
        include: [{ model: User, as: 'participantes', attributes: ['id', 'nome'] }]
    });

    await logAction(req, {
      acao: 'UPDATE',
      tabela: 'eventos',
      registroId: evento.id,
      antigos: dadosAntigos,
      novos: eventoCompleto
    });

    res.json(eventoCompleto);
  } catch (err) {
    next(err);
  }
}

// Excluir Evento
async function deleteEvento(req, res, next) {
  try {
    const { id } = req.params;
    const evento = await Evento.findByPk(id);

    if (!evento) return res.status(404).json({ error: 'Evento não encontrado' });

    // Permissão: Criador ou Admin
    if (evento.criado_por !== req.user.id && req.user.cargo !== 'admin') {
        return res.status(403).json({ error: 'Sem permissão para excluir este evento' });
    }

    await evento.destroy(); // Soft delete

    await logAction(req, {
      acao: 'DELETE',
      tabela: 'eventos',
      registroId: evento.id,
      antigos: evento
    });

    res.json({ message: 'Evento excluído' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getEventos, createEvento, updateEvento, deleteEvento };
