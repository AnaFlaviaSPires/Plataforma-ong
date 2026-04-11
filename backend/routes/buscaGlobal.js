const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const { Op } = require('sequelize');

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json({ alunos: [], prontuarios: [], doacoes: [] });

    const { Aluno, Doacao, SocialProntuario } = require('../models');
    const like = { [Op.like]: `%${q}%` };
    const limit = 8;

    // Alunos
    const alunos = await Aluno.findAll({
      where: { [Op.or]: [{ nome: like }, { cpf: like }] },
      attributes: ['id', 'nome', 'data_nasc', 'status'],
      limit,
      order: [['nome', 'ASC']]
    });

    // Prontuários sociais
    let prontuarios = [];
    try {
      prontuarios = await SocialProntuario.findAll({
        where: { [Op.or]: [{ nome_completo: like }, { cpf: like }, { nis: like }] },
        attributes: ['id', 'nome_completo', 'oficina', 'vulnerabilidade', 'status'],
        limit,
        order: [['nome_completo', 'ASC']]
      });
    } catch (e) { /* tabela pode não existir ainda */ }

    // Doações
    const doacoes = await Doacao.findAll({
      where: { [Op.or]: [{ nome_doador: like }, { descricao: like }] },
      attributes: ['id', 'nome_doador', 'tipo', 'valor', 'data_doacao'],
      limit,
      order: [['data_doacao', 'DESC']]
    });

    res.json({
      alunos: alunos.map(a => ({ id: a.id, nome: a.nome, sub: `${a.status || ''} • Nasc: ${a.data_nasc || '-'}` })),
      prontuarios: prontuarios.map(p => ({ id: p.id, nome_completo: p.nome_completo, sub: `${p.oficina || '-'} • ${p.vulnerabilidade || '-'}` })),
      doacoes: doacoes.map(d => ({ id: d.id, nome_doador: d.nome_doador || 'Anônimo', sub: `${d.tipo} • R$ ${d.valor}` }))
    });
  } catch (err) { next(err); }
});

module.exports = router;
