const express = require('express');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const { createChamada, getChamadas, deleteChamada, getDeletedChamadas, restoreChamada } = require('../controllers/chamadasController');

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

// Listar chamadas excluídas (dos logs de auditoria)
router.get('/deleted', 
  requireRole(['admin', 'secretaria']), 
  getDeletedChamadas
);

// Restaurar chamada excluída a partir do log
router.post('/restore/:logId', 
  requireRole(['admin', 'secretaria']), 
  restoreChamada
);

// Excluir chamada (apenas admin e secretaria)
router.delete('/:id', 
  requireRole(['admin', 'secretaria']), 
  deleteChamada
);

module.exports = router;
