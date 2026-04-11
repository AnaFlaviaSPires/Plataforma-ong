const express = require('express');
const { body, param, query } = require('express-validator');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const {
  getDoacoes,
  createDoacao,
  updateDoacao,
  deleteDoacao,
  getEstatisticas,
  confirmarDoacao,
  cancelarDoacao,
  getLixeira,
  restoreDoacao
} = require('../controllers/doacoesController');

const router = express.Router();

// Rotas protegidas
router.use(authMiddleware);

const tiposValidos = ['dinheiro', 'pix', 'alimentos', 'vestuario', 'material_higiene', 'material_escolar', 'brindes', 'outros'];

// Estatísticas agregadas (todos os cargos — sem dados sensíveis)
router.get('/estatisticas',
  requireRole(['admin', 'secretaria', 'professor', 'assistente_social']),
  getEstatisticas
);

// Lixeira (admin)
router.get('/lixeira', requireRole(['admin']), getLixeira);

// Validações
const doacaoValidation = [
  body('tipo')
    .isIn(tiposValidos)
    .withMessage('Tipo de doação inválido'),
  body('valor')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Valor deve ser um número positivo'),
  body('quantidade')
    .optional({ nullable: true })
    .isInt({ min: 0 })
    .withMessage('Quantidade deve ser um número inteiro positivo')
];

const idValidation = [
  param('id').isInt({ min: 1 }).withMessage('ID inválido')
];

// CRUD — admin e secretaria
router.get('/',
  requireRole(['admin', 'secretaria']),
  getDoacoes
);

router.post('/',
  requireRole(['admin', 'secretaria']),
  doacaoValidation,
  createDoacao
);

router.put('/:id',
  requireRole(['admin', 'secretaria']),
  idValidation,
  doacaoValidation,
  updateDoacao
);

router.delete('/:id',
  requireRole(['admin', 'secretaria']),
  idValidation,
  deleteDoacao
);

// Status (admin)
router.patch('/:id/confirmar', idValidation, requireRole(['admin']), confirmarDoacao);
router.patch('/:id/cancelar', idValidation, requireRole(['admin']), cancelarDoacao);
router.post('/:id/restore', idValidation, requireRole(['admin']), restoreDoacao);

module.exports = router;
