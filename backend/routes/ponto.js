const express = require('express');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const {
  registrarPonto,
  getMeusPontos,
  getPontosFuncionario,
  getListaPontos,
  corrigirPonto,
  getStatusAtual
} = require('../controllers/pontoController');

const router = express.Router();

// Rotas protegidas
router.use(authMiddleware);

// Status atual do funcionário (qualquer cargo)
router.get('/status',
  requireRole(['admin', 'secretaria', 'professor', 'assistente_social']),
  getStatusAtual
);

// Registrar ponto (qualquer cargo)
router.post('/registrar',
  requireRole(['admin', 'secretaria', 'professor', 'assistente_social']),
  registrarPonto
);

// Meus registros de ponto
router.get('/meus',
  requireRole(['admin', 'secretaria', 'professor', 'assistente_social']),
  getMeusPontos
);

// Lista geral de pontos (admin apenas)
router.get('/lista',
  requireRole(['admin']),
  getListaPontos
);

// Registros de um funcionário específico (admin apenas)
router.get('/funcionario/:id',
  requireRole(['admin']),
  getPontosFuncionario
);

// Corrigir registro (admin apenas)
router.put('/corrigir',
  requireRole(['admin']),
  corrigirPonto
);

module.exports = router;
