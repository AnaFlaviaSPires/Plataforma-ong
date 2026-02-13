const express = require('express');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const { createChamada, getChamadas } = require('../controllers/chamadasController');

const router = express.Router();

// Rotas protegidas
router.use(authMiddleware);

// Criar nova chamada com registros de presença
router.post('/', 
  requireRole(['admin', 'professor']), 
  createChamada
);

// Listar chamadas de uma sala (e opcionalmente por data)
router.get('/', 
  requireRole(['admin', 'professor', 'secretaria', 'assistente_social']), 
  getChamadas
);

module.exports = router;
