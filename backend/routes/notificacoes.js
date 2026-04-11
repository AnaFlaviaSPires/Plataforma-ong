const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const { listar, marcarLida, gerarAutomaticas } = require('../controllers/notificacaoController');

const router = express.Router();

router.use(authMiddleware);

router.get('/', listar);
router.post('/marcar-lida', marcarLida);
router.post('/gerar', gerarAutomaticas);

module.exports = router;
