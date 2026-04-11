const { Op } = require('sequelize');

// Models are loaded lazily to avoid circular deps
function getModels() {
  return require('../models');
}

// GET /notificacoes — listar notificações do usuário
async function listar(req, res, next) {
  try {
    const { Notificacao } = getModels();
    const { lida, limit = 20 } = req.query;
    const where = {
      [Op.or]: [
        { usuario_id: req.user.id },
        { usuario_id: null }
      ]
    };
    if (lida !== undefined) where.lida = lida === 'true';

    const notificacoes = await Notificacao.findAll({
      where,
      order: [['criado_em', 'DESC']],
      limit: parseInt(limit)
    });

    const naoLidas = await Notificacao.count({
      where: { ...where, lida: false }
    });

    res.json({ notificacoes, nao_lidas: naoLidas });
  } catch (err) { next(err); }
}

// POST /notificacoes/marcar-lida — marcar notificações como lidas
async function marcarLida(req, res, next) {
  try {
    const { Notificacao } = getModels();
    const { ids } = req.body;

    if (ids && Array.isArray(ids) && ids.length > 0) {
      await Notificacao.update({ lida: true }, {
        where: { id: { [Op.in]: ids }, [Op.or]: [{ usuario_id: req.user.id }, { usuario_id: null }] }
      });
    } else {
      // Marcar todas
      await Notificacao.update({ lida: true }, {
        where: { [Op.or]: [{ usuario_id: req.user.id }, { usuario_id: null }], lida: false }
      });
    }

    res.json({ message: 'Notificações marcadas como lidas' });
  } catch (err) { next(err); }
}

// POST /notificacoes/gerar — gerar notificações automáticas (chamada interna/admin)
async function gerarAutomaticas(req, res, next) {
  try {
    const { Notificacao, User, Aluno, ChamadaRegistro, SocialProntuario, sequelize } = getModels();
    const geradas = [];

    // 1. Usuários pendentes de aprovação (para admins)
    try {
      const pendentes = await User.count({ where: { ativo: false } });
      if (pendentes > 0) {
        const existe = await Notificacao.findOne({
          where: { tipo: 'cadastro_pendente', lida: false, criado_em: { [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
        });
        if (!existe) {
          await Notificacao.create({
            tipo: 'cadastro_pendente',
            titulo: `${pendentes} cadastro(s) pendente(s) de aprovação`,
            mensagem: `Existem ${pendentes} usuários aguardando aprovação.`,
            link: 'admin-usuarios.html',
            usuario_id: null
          });
          geradas.push('cadastro_pendente');
        }
      }
    } catch (e) { console.error('Notif cadastro_pendente:', e.message); }

    // 2. Alunos com faltas consecutivas (>= 3)
    try {
      const [results] = await sequelize.query(`
        SELECT a.id, a.nome, COUNT(*) as faltas
        FROM chamada_registros cr
        JOIN alunos a ON a.id = cr.aluno_id
        WHERE cr.status = 'falta'
          AND cr.createdAt >= DATE_SUB(NOW(), INTERVAL 15 DAY)
        GROUP BY a.id, a.nome
        HAVING faltas >= 3
        LIMIT 10
      `);
      for (const r of results) {
        const existe = await Notificacao.findOne({
          where: { tipo: 'faltas_consecutivas', lida: false, dados: { aluno_id: r.id } }
        });
        if (!existe) {
          await Notificacao.create({
            tipo: 'faltas_consecutivas',
            titulo: `${r.nome} tem ${r.faltas} faltas recentes`,
            mensagem: `O aluno ${r.nome} acumula ${r.faltas} faltas nos últimos 15 dias.`,
            link: 'chamada.html',
            usuario_id: null,
            dados: { aluno_id: r.id }
          });
          geradas.push('faltas_' + r.nome);
        }
      }
    } catch (e) { console.error('Notif faltas:', e.message); }

    // 3. Crianças com alta vulnerabilidade (para assistente social)
    try {
      if (SocialProntuario) {
        const altaVuln = await SocialProntuario.count({ where: { vulnerabilidade: 'alta', status: 'ativo' } });
        if (altaVuln > 0) {
          const existe = await Notificacao.findOne({
            where: { tipo: 'alta_vulnerabilidade', lida: false, criado_em: { [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
          });
          if (!existe) {
            await Notificacao.create({
              tipo: 'alta_vulnerabilidade',
              titulo: `${altaVuln} criança(s) com alta vulnerabilidade`,
              mensagem: `Existem ${altaVuln} prontuários marcados com alta vulnerabilidade.`,
              link: 'acompanhamento-social.html',
              usuario_id: null
            });
            geradas.push('alta_vulnerabilidade');
          }
        }
      }
    } catch (e) { console.error('Notif vulnerabilidade:', e.message); }

    res.json({ message: 'Verificação concluída', geradas });
  } catch (err) { next(err); }
}

module.exports = { listar, marcarLida, gerarAutomaticas };
