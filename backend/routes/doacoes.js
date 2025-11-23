const express = require('express');
const { body, param, query } = require('express-validator');
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  getDoacoes,
  createDoacao,
  confirmarDoacao,
  cancelarDoacao
} = require('../controllers/doacoesController');

const router = express.Router();

// Validações básicas para filtros
const listValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('tipo').optional().isIn(['monetaria', 'material', 'alimentos']),
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
    .isIn(['monetaria', 'material', 'alimentos'])
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

// Rotas públicas para desenvolvimento (sem autenticação)
router.get('/', listValidation, getDoacoes);
router.post('/', doacaoValidation, createDoacao);

// Em desenvolvimento, permitir confirmar/cancelar sem autenticação
if ((process.env.NODE_ENV || 'development') !== 'production') {
  router.patch('/:id/confirmar', idValidation, confirmarDoacao);
  router.patch('/:id/cancelar', idValidation, cancelarDoacao);
}

// Aplicar middleware de autenticação para rotas protegidas em produção
router.use(authMiddleware);

if ((process.env.NODE_ENV || 'development') === 'production') {
  router.patch('/:id/confirmar', idValidation, confirmarDoacao);
  router.patch('/:id/cancelar', idValidation, cancelarDoacao);
}

module.exports = router;
