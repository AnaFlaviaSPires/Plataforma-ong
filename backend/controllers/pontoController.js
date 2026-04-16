const { Ponto, User } = require('../models');
const { logAction } = require('../middleware/auditMiddleware');
const { Op } = require('sequelize');

// Coordenadas da ONG e raio permitido (em metros)
const ONG_LAT = parseFloat(process.env.ONG_LATITUDE) || -22.8218;
const ONG_LNG = parseFloat(process.env.ONG_LONGITUDE) || -45.1947;
const ONG_RAIO_METROS = parseInt(process.env.ONG_RAIO_PONTO) || 100;

// Calcular distância entre dois pontos (fórmula de Haversine)
function calcularDistanciaMetros(lat1, lng1, lat2, lng2) {
  const R = 6371000; // raio da Terra em metros
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Registrar ponto (entrada, inicio_intervalo, fim_intervalo, saida)
async function registrarPonto(req, res, next) {
  try {
    const { tipo, latitude, longitude } = req.body;
    const funcionarioId = req.user.id;

    // Validação de geolocalização
    if (latitude == null || longitude == null) {
      return res.status(400).json({ error: 'Localização não informada. Ative o GPS/localização do seu dispositivo e tente novamente.' });
    }

    const distancia = calcularDistanciaMetros(latitude, longitude, ONG_LAT, ONG_LNG);
    if (distancia > ONG_RAIO_METROS) {
      return res.status(403).json({
        error: `Você está a ${Math.round(distancia)} metros da ONG. O registro de ponto só é permitido dentro de um raio de ${ONG_RAIO_METROS} metros.`,
        distancia: Math.round(distancia),
        raioPermitido: ONG_RAIO_METROS
      });
    }

    const tiposValidos = ['entrada', 'inicio_intervalo', 'fim_intervalo', 'saida'];
    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({ error: 'Tipo de registro inválido. Use: entrada, inicio_intervalo, fim_intervalo, saida' });
    }

    // Buscar registros do dia atual para validar sequência
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);

    const registrosDoDia = await Ponto.findAll({
      where: {
        funcionario_id: funcionarioId,
        timestamp: { [Op.gte]: hoje, [Op.lt]: amanha }
      },
      order: [['timestamp', 'ASC']]
    });

    const ultimoRegistro = registrosDoDia.length > 0 ? registrosDoDia[registrosDoDia.length - 1] : null;
    const ultimoTipo = ultimoRegistro ? ultimoRegistro.tipo : null;

    // Validações de sequência lógica
    if (tipo === 'entrada') {
      if (ultimoTipo && ultimoTipo !== 'saida') {
        return res.status(400).json({ error: 'Você já registrou entrada hoje e ainda não registrou saída.' });
      }
    }

    if (tipo === 'inicio_intervalo') {
      if (!ultimoTipo || ultimoTipo === 'saida') {
        return res.status(400).json({ error: 'Registre a entrada antes de iniciar o intervalo.' });
      }
      if (ultimoTipo === 'inicio_intervalo') {
        return res.status(400).json({ error: 'Você já iniciou o intervalo. Finalize-o primeiro.' });
      }
    }

    if (tipo === 'fim_intervalo') {
      if (ultimoTipo !== 'inicio_intervalo') {
        return res.status(400).json({ error: 'Registre o início do intervalo antes de finalizá-lo.' });
      }
    }

    if (tipo === 'saida') {
      if (!ultimoTipo || ultimoTipo === 'saida') {
        return res.status(400).json({ error: 'Registre a entrada antes de registrar a saída.' });
      }
      if (ultimoTipo === 'inicio_intervalo') {
        return res.status(400).json({ error: 'Finalize o intervalo antes de registrar a saída.' });
      }
    }

    // Não permitir dois registros iguais seguidos
    if (ultimoTipo === tipo) {
      return res.status(400).json({ error: `Você já registrou "${tipo}" como último registro.` });
    }

    const ponto = await Ponto.create({
      funcionario_id: funcionarioId,
      tipo,
      timestamp: new Date(),
      criado_por: funcionarioId,
      alterado: false
    });

    await logAction(req, {
      acao: 'CREATE',
      tabela: 'pontos',
      registroId: ponto.id,
      novos: ponto.toJSON()
    });

    res.status(201).json({
      message: `${tipo.charAt(0).toUpperCase() + tipo.slice(1).replace('_', ' ')} registrada com sucesso`,
      ponto
    });
  } catch (err) {
    next(err);
  }
}

// Consultar registros do próprio funcionário
async function getMeusPontos(req, res, next) {
  try {
    const funcionarioId = req.user.id;
    const { dataInicio, dataFim, page = 1, limit = 31 } = req.query;
    const offset = (page - 1) * limit;

    const where = { funcionario_id: funcionarioId };

    if (dataInicio || dataFim) {
      where.timestamp = {};
      if (dataInicio) where.timestamp[Op.gte] = new Date(`${dataInicio}T00:00:00`);
      if (dataFim) where.timestamp[Op.lte] = new Date(`${dataFim}T23:59:59`);
    }

    const { count, rows } = await Ponto.findAndCountAll({
      where,
      order: [['timestamp', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      pontos: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    next(err);
  }
}

// Consultar registros de um funcionário específico (admin)
async function getPontosFuncionario(req, res, next) {
  try {
    const { id } = req.params;
    const { dataInicio, dataFim, page = 1, limit = 31 } = req.query;
    const offset = (page - 1) * limit;

    const where = { funcionario_id: id };

    if (dataInicio || dataFim) {
      where.timestamp = {};
      if (dataInicio) where.timestamp[Op.gte] = new Date(`${dataInicio}T00:00:00`);
      if (dataFim) where.timestamp[Op.lte] = new Date(`${dataFim}T23:59:59`);
    }

    const funcionario = await User.findByPk(id, {
      attributes: ['id', 'nome', 'email', 'cargo']
    });

    if (!funcionario) {
      return res.status(404).json({ error: 'Funcionário não encontrado' });
    }

    const { count, rows } = await Ponto.findAndCountAll({
      where,
      order: [['timestamp', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      funcionario,
      pontos: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    next(err);
  }
}

// Listar todos os funcionários com resumo de ponto (admin)
async function getListaPontos(req, res, next) {
  try {
    const { dataInicio, dataFim } = req.query;

    const funcionarios = await User.findAll({
      where: { ativo: true },
      attributes: ['id', 'nome', 'email', 'cargo'],
      order: [['nome', 'ASC']]
    });

    const whereDate = {};
    if (dataInicio || dataFim) {
      whereDate.timestamp = {};
      if (dataInicio) whereDate.timestamp[Op.gte] = new Date(`${dataInicio}T00:00:00`);
      if (dataFim) whereDate.timestamp[Op.lte] = new Date(`${dataFim}T23:59:59`);
    }

    const resultado = [];
    for (const func of funcionarios) {
      const where = { funcionario_id: func.id, ...whereDate };
      const pontos = await Ponto.findAll({
        where,
        order: [['timestamp', 'ASC']]
      });
      resultado.push({
        funcionario: func,
        pontos,
        totalRegistros: pontos.length
      });
    }

    res.json({ lista: resultado });
  } catch (err) {
    next(err);
  }
}

// Corrigir registro de ponto (admin) — cria novo registro, marca original como alterado
async function corrigirPonto(req, res, next) {
  try {
    const allowedRoles = ['admin'];
    if (!allowedRoles.includes(req.user.cargo)) {
      return res.status(403).json({ error: 'Apenas administradores podem corrigir registros de ponto.' });
    }

    const { pontoId, novoTimestamp, novoTipo, motivo } = req.body;

    if (!pontoId || !motivo) {
      return res.status(400).json({ error: 'ID do ponto e motivo da alteração são obrigatórios.' });
    }

    if (!motivo || motivo.trim().length < 5) {
      return res.status(400).json({ error: 'Justificativa deve ter pelo menos 5 caracteres.' });
    }

    const pontoOriginal = await Ponto.findByPk(pontoId);
    if (!pontoOriginal) {
      return res.status(404).json({ error: 'Registro de ponto não encontrado.' });
    }

    const dadosAntigos = pontoOriginal.toJSON();

    // Marcar o registro original como alterado
    pontoOriginal.alterado = true;
    pontoOriginal.alterado_por = req.user.id;
    pontoOriginal.motivo_alteracao = motivo.trim();
    await pontoOriginal.save();

    // Criar novo registro corrigido
    const pontoCriado = await Ponto.create({
      funcionario_id: pontoOriginal.funcionario_id,
      tipo: novoTipo || pontoOriginal.tipo,
      timestamp: novoTimestamp ? new Date(novoTimestamp) : pontoOriginal.timestamp,
      criado_por: req.user.id,
      alterado: true,
      alterado_por: req.user.id,
      motivo_alteracao: `Correção: ${motivo.trim()} (ref. registro #${pontoOriginal.id})`
    });

    await logAction(req, {
      acao: 'UPDATE',
      tabela: 'pontos',
      registroId: pontoOriginal.id,
      antigos: dadosAntigos,
      novos: { pontoCorrigidoId: pontoCriado.id, motivo: motivo.trim() }
    });

    res.json({
      message: 'Registro corrigido com sucesso',
      pontoOriginal: pontoOriginal.toJSON(),
      pontoCorrigido: pontoCriado.toJSON()
    });
  } catch (err) {
    next(err);
  }
}

// Editar registro de ponto (admin) — atualiza diretamente com auditoria
async function editarPonto(req, res, next) {
  try {
    const { id } = req.params;
    const { tipo, timestamp, motivo } = req.body;

    if (!motivo || motivo.trim().length < 5) {
      return res.status(400).json({ error: 'Justificativa deve ter pelo menos 5 caracteres.' });
    }

    const ponto = await Ponto.findByPk(id);
    if (!ponto) {
      return res.status(404).json({ error: 'Registro de ponto não encontrado.' });
    }

    const dadosAntigos = ponto.toJSON();

    // Validar tipo se fornecido
    if (tipo) {
      const tiposValidos = ['entrada', 'inicio_intervalo', 'fim_intervalo', 'saida'];
      if (!tiposValidos.includes(tipo)) {
        return res.status(400).json({ error: 'Tipo inválido.' });
      }
      ponto.tipo = tipo;
    }

    if (timestamp) {
      ponto.timestamp = new Date(timestamp);
    }

    ponto.alterado = true;
    ponto.alterado_por = req.user.id;
    ponto.motivo_alteracao = motivo.trim();
    await ponto.save();

    await logAction(req, {
      acao: 'UPDATE',
      tabela: 'pontos',
      registroId: ponto.id,
      antigos: dadosAntigos,
      novos: ponto.toJSON()
    });

    res.json({ message: 'Registro atualizado com sucesso', ponto: ponto.toJSON() });
  } catch (err) {
    next(err);
  }
}

// Excluir registro de ponto (admin) — hard delete com auditoria
async function excluirPonto(req, res, next) {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    if (!motivo || motivo.trim().length < 5) {
      return res.status(400).json({ error: 'Justificativa deve ter pelo menos 5 caracteres.' });
    }

    const ponto = await Ponto.findByPk(id);
    if (!ponto) {
      return res.status(404).json({ error: 'Registro de ponto não encontrado.' });
    }

    const dadosAntigos = ponto.toJSON();

    await ponto.destroy();

    await logAction(req, {
      acao: 'DELETE',
      tabela: 'pontos',
      registroId: id,
      antigos: dadosAntigos,
      novos: { motivo: motivo.trim() }
    });

    res.json({ message: 'Registro excluído com sucesso' });
  } catch (err) {
    next(err);
  }
}

// Status atual do funcionário no dia
async function getStatusAtual(req, res, next) {
  try {
    const funcionarioId = req.user.id;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);

    const registrosDoDia = await Ponto.findAll({
      where: {
        funcionario_id: funcionarioId,
        timestamp: { [Op.gte]: hoje, [Op.lt]: amanha }
      },
      order: [['timestamp', 'ASC']]
    });

    const ultimoRegistro = registrosDoDia.length > 0 ? registrosDoDia[registrosDoDia.length - 1] : null;

    let status = 'Sem registro hoje';
    let acoesDisponiveis = ['entrada'];

    if (ultimoRegistro) {
      switch (ultimoRegistro.tipo) {
        case 'entrada':
          status = 'Em expediente';
          acoesDisponiveis = ['inicio_intervalo', 'saida'];
          break;
        case 'inicio_intervalo':
          status = 'Em intervalo';
          acoesDisponiveis = ['fim_intervalo'];
          break;
        case 'fim_intervalo':
          status = 'Em expediente';
          acoesDisponiveis = ['inicio_intervalo', 'saida'];
          break;
        case 'saida':
          status = 'Expediente encerrado';
          acoesDisponiveis = [];
          break;
      }
    }

    res.json({
      status,
      acoesDisponiveis,
      proximaAcao: acoesDisponiveis[0] || null,
      registrosDoDia,
      ultimoRegistro
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  registrarPonto,
  getMeusPontos,
  getPontosFuncionario,
  getListaPontos,
  corrigirPonto,
  editarPonto,
  excluirPonto,
  getStatusAtual
};
