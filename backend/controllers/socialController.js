const { SocialProntuario, SocialFamilia, SocialDespesa, SocialResponsavel, SocialHistorico, SocialAnexo, Aluno } = require('../models');
const { Op } = require('sequelize');

// Helper: registrar evento no histórico
async function registrarHistorico(prontuarioId, tipoEvento, descricao, usuario) {
  await SocialHistorico.create({
    prontuario_id: prontuarioId,
    tipo_evento: tipoEvento,
    descricao,
    usuario_id: usuario?.id || null,
    usuario_nome: usuario?.nome || 'Sistema'
  });
}

// GET /social — Listar prontuários
async function listar(req, res, next) {
  try {
    const { busca, oficina, vulnerabilidade, status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (busca) where.nome_completo = { [Op.like]: `%${busca}%` };
    if (oficina) where.oficina = oficina;
    if (vulnerabilidade) where.vulnerabilidade = vulnerabilidade;
    if (status) where.status = status;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await SocialProntuario.findAndCountAll({
      where,
      order: [['nome_completo', 'ASC']],
      limit: parseInt(limit),
      offset,
      include: [{ model: Aluno, as: 'aluno', attributes: ['id', 'nome'], required: false }]
    });

    res.json({
      prontuarios: rows,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(count / parseInt(limit)) }
    });
  } catch (err) { next(err); }
}

// GET /social/:id — Obter prontuário completo
async function obter(req, res, next) {
  try {
    const prontuario = await SocialProntuario.findByPk(req.params.id, {
      include: [
        { model: Aluno, as: 'aluno', attributes: ['id', 'nome', 'data_nasc'], required: false },
        { model: SocialFamilia, as: 'familia', order: [['id', 'ASC']] },
        { model: SocialDespesa, as: 'despesas', order: [['id', 'ASC']] },
        { model: SocialResponsavel, as: 'responsaveis', order: [['id', 'ASC']] },
        { model: SocialHistorico, as: 'historico', order: [['data', 'DESC']], limit: 50 },
        { model: SocialAnexo, as: 'anexos', order: [['data', 'DESC']] }
      ]
    });
    if (!prontuario) return res.status(404).json({ error: 'Prontuário não encontrado' });

    // Calcular renda
    const rendaTotal = (prontuario.familia || []).reduce((s, f) => s + (parseFloat(f.renda) || 0), 0);
    const membros = (prontuario.familia || []).length || 1;
    const despesaTotal = (prontuario.despesas || []).reduce((s, d) => s + (parseFloat(d.valor) || 0), 0);

    res.json({
      prontuario,
      calculados: { renda_total: rendaTotal, renda_per_capita: +(rendaTotal / membros).toFixed(2), despesa_total: despesaTotal }
    });
  } catch (err) { next(err); }
}

// POST /social — Criar prontuário
async function criar(req, res, next) {
  try {
    const dados = req.body;
    dados.criado_por = req.user.id;
    dados.versao = 1;

    const prontuario = await SocialProntuario.create(dados);

    // Criar família se enviada
    if (Array.isArray(dados.familia)) {
      for (const f of dados.familia) {
        await SocialFamilia.create({ ...f, prontuario_id: prontuario.id });
      }
    }
    // Criar despesas se enviadas
    if (Array.isArray(dados.despesas)) {
      for (const d of dados.despesas) {
        await SocialDespesa.create({ ...d, prontuario_id: prontuario.id });
      }
    }
    // Criar responsáveis se enviados
    if (Array.isArray(dados.responsaveis)) {
      for (const r of dados.responsaveis) {
        await SocialResponsavel.create({ ...r, prontuario_id: prontuario.id });
      }
    }

    await registrarHistorico(prontuario.id, 'CRIACAO', 'Prontuário criado', req.user);

    res.status(201).json({ message: 'Prontuário criado com sucesso', prontuario });
  } catch (err) { next(err); }
}

// PUT /social/:id — Atualizar prontuário
async function atualizar(req, res, next) {
  try {
    const prontuario = await SocialProntuario.findByPk(req.params.id);
    if (!prontuario) return res.status(404).json({ error: 'Prontuário não encontrado' });

    const dados = req.body;
    const mudancas = [];

    // Detectar mudanças para histórico
    const camposMonitorados = ['vulnerabilidade', 'status', 'oficina', 'escola'];
    for (const campo of camposMonitorados) {
      if (dados[campo] !== undefined && dados[campo] !== prontuario[campo]) {
        mudancas.push(`${campo}: "${prontuario[campo]}" → "${dados[campo]}"`);
      }
    }
    if (dados.avaliacao && JSON.stringify(dados.avaliacao) !== JSON.stringify(prontuario.avaliacao)) {
      mudancas.push('Avaliação social atualizada');
    }
    if (dados.saude && JSON.stringify(dados.saude) !== JSON.stringify(prontuario.saude)) {
      mudancas.push('Dados de saúde atualizados');
    }
    if (dados.moradia && JSON.stringify(dados.moradia) !== JSON.stringify(prontuario.moradia)) {
      mudancas.push('Dados de moradia atualizados');
    }

    // Não sobrescrever campos de controle
    delete dados.id;
    delete dados.criado_por;
    delete dados.versao;
    delete dados.criado_em;

    await prontuario.update(dados);

    // Atualizar família
    if (Array.isArray(dados.familia)) {
      await SocialFamilia.destroy({ where: { prontuario_id: prontuario.id } });
      for (const f of dados.familia) {
        await SocialFamilia.create({ ...f, prontuario_id: prontuario.id });
      }
      mudancas.push('Composição familiar atualizada');
    }
    // Atualizar despesas
    if (Array.isArray(dados.despesas)) {
      await SocialDespesa.destroy({ where: { prontuario_id: prontuario.id } });
      for (const d of dados.despesas) {
        await SocialDespesa.create({ ...d, prontuario_id: prontuario.id });
      }
      mudancas.push('Despesas atualizadas');
    }
    // Atualizar responsáveis
    if (Array.isArray(dados.responsaveis)) {
      await SocialResponsavel.destroy({ where: { prontuario_id: prontuario.id } });
      for (const r of dados.responsaveis) {
        await SocialResponsavel.create({ ...r, prontuario_id: prontuario.id });
      }
      mudancas.push('Responsáveis atualizados');
    }

    if (mudancas.length > 0) {
      await registrarHistorico(prontuario.id, 'EDICAO', mudancas.join('; '), req.user);
    }

    res.json({ message: 'Prontuário atualizado com sucesso', prontuario });
  } catch (err) { next(err); }
}

// DELETE /social/:id — Excluir prontuário
async function excluir(req, res, next) {
  try {
    const prontuario = await SocialProntuario.findByPk(req.params.id);
    if (!prontuario) return res.status(404).json({ error: 'Prontuário não encontrado' });

    // Excluir relacionados
    await SocialFamilia.destroy({ where: { prontuario_id: prontuario.id } });
    await SocialDespesa.destroy({ where: { prontuario_id: prontuario.id } });
    await SocialResponsavel.destroy({ where: { prontuario_id: prontuario.id } });
    await SocialAnexo.destroy({ where: { prontuario_id: prontuario.id } });
    await SocialHistorico.destroy({ where: { prontuario_id: prontuario.id } });
    await prontuario.destroy();

    res.json({ message: 'Prontuário excluído com sucesso' });
  } catch (err) { next(err); }
}

// POST /social/:id/renovar — Renovar matrícula (clonar prontuário)
async function renovar(req, res, next) {
  try {
    const original = await SocialProntuario.findByPk(req.params.id, {
      include: [
        { model: SocialFamilia, as: 'familia' },
        { model: SocialDespesa, as: 'despesas' },
        { model: SocialResponsavel, as: 'responsaveis' }
      ]
    });
    if (!original) return res.status(404).json({ error: 'Prontuário não encontrado' });

    const dados = original.toJSON();
    delete dados.id;
    delete dados.criado_em;
    delete dados.atualizado_em;
    dados.versao = (original.versao || 1) + 1;
    dados.criado_por = req.user.id;
    dados.declaracao_aceita = false;
    dados.declaracao_data = null;
    dados.declaracao_responsavel = null;

    const novo = await SocialProntuario.create(dados);

    // Clonar família
    for (const f of (original.familia || [])) {
      const fd = f.toJSON(); delete fd.id; delete fd.criado_em; delete fd.atualizado_em;
      await SocialFamilia.create({ ...fd, prontuario_id: novo.id });
    }
    // Clonar despesas
    for (const d of (original.despesas || [])) {
      const dd = d.toJSON(); delete dd.id; delete dd.criado_em; delete dd.atualizado_em;
      await SocialDespesa.create({ ...dd, prontuario_id: novo.id });
    }
    // Clonar responsáveis
    for (const r of (original.responsaveis || [])) {
      const rd = r.toJSON(); delete rd.id; delete rd.criado_em; delete rd.atualizado_em;
      await SocialResponsavel.create({ ...rd, prontuario_id: novo.id });
    }

    // Marcar original como inativo
    await original.update({ status: 'inativo' });

    await registrarHistorico(novo.id, 'RENOVACAO', `Renovação a partir do prontuário #${original.id} (v${original.versao})`, req.user);
    await registrarHistorico(original.id, 'RENOVACAO', `Prontuário renovado → novo #${novo.id} (v${novo.versao})`, req.user);

    res.status(201).json({ message: 'Matrícula renovada com sucesso', prontuario: novo });
  } catch (err) { next(err); }
}

// GET /social/alunos — Lista de alunos para vincular
async function listarAlunos(req, res, next) {
  try {
    const alunos = await Aluno.findAll({
      attributes: ['id', 'nome', 'data_nasc'],
      where: { status: 'matriculado' },
      order: [['nome', 'ASC']]
    });
    res.json({ alunos });
  } catch (err) { next(err); }
}

module.exports = { listar, obter, criar, atualizar, excluir, renovar, listarAlunos };
