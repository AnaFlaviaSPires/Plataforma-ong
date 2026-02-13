const express = require('express');
const { body, param, query } = require('express-validator');
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  getDoacoes,
  createDoacao,
  confirmarDoacao,
  cancelarDoacao,
  getLixeira,
  restoreDoacao
} = require('../controllers/doacoesController');

const router = express.Router();

const { requireRole } = require('../middleware/authMiddleware');

// Rotas protegidas
router.use(authMiddleware);

// Rota de lixeira (admin)
router.get('/lixeira', requireRole(['admin']), getLixeira);

// Validações básicas para filtros
const listValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('tipo').optional().isIn(['alimentos', 'materiais_higiene', 'materiais_escolares', 'dinheiro', 'outros']),
  query('status').optional().isIn(['pendente', 'recebida', 'cancelada']),
  query('data').optional().isISO8601()
];

// Validações para criação de doação
const doacaoValidation = [
  body('nome_doador')
    .isLength({ min: 2, max: 150 })
    .withMessage('Nome do doador deve ter entre 2 e 150 caracteres'),
  body('email_doador')
    .optional()
    .isEmail()
    .withMessage('Email do doador inválido'),
  body('tipo')
    .isIn(['alimentos', 'materiais_higiene', 'materiais_escolares', 'dinheiro', 'outros'])
    .withMessage('Tipo de doação inválido'),
  body('valor')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Valor deve ser um número positivo')
];

// Validação para ID
const idValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID deve ser um número inteiro positivo')
];

// Rotas
router.get('/', listValidation, getDoacoes);
router.post('/', doacaoValidation, createDoacao);

router.patch('/:id/confirmar', 
  idValidation, 
  requireRole(['admin']), 
  confirmarDoacao
);

router.patch('/:id/cancelar', 
  idValidation, 
  requireRole(['admin']), 
  cancelarDoacao
);

// Restaurar da lixeira (apenas admin)
router.post('/:id/restore',
  idValidation,
  requireRole(['admin']),
  restoreDoacao
);

module.exports = router;
