const express = require('express');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const { listar, obter, criar, atualizar, excluir, renovar, listarAlunos } = require('../controllers/socialController');

const router = express.Router();

// Todas as rotas protegidas — APENAS assistente_social e admin
router.use(authMiddleware);
router.use(requireRole(['assistente_social', 'admin']));

router.get('/alunos', listarAlunos);
router.get('/', listar);
router.get('/:id', obter);
router.post('/', criar);
router.put('/:id', atualizar);
router.delete('/:id', excluir);
router.post('/:id/renovar', renovar);

module.exports = router;
