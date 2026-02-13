const express = require('express');
const { body, param } = require('express-validator');
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  getSalas,
  getSala,
  createSala,
  updateSala,
  deleteSala,
  getLixeira,
  restoreSala
} = require('../controllers/salasController');

const { requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Validações básicas para criação/atualização de sala
const salaValidation = [
  body('nome')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('professor')
    .isLength({ min: 2, max: 100 })
    .withMessage('Professor deve ter entre 2 e 100 caracteres'),
  body('dia_semana')
    .isLength({ min: 3, max: 20 })
    .withMessage('Dia da semana inválido'),
  body('horario')
    .matches(/^\d{2}:\d{2}/)
    .withMessage('Horário deve estar no formato HH:MM'),
  body('alunosIds')
    .optional()
    .isArray()
    .withMessage('alunosIds deve ser uma lista de IDs de alunos')
];

const idValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID deve ser um número inteiro positivo')
];

router.use(authMiddleware);

// Lixeira (Admin)
router.get('/lixeira', requireRole(['admin']), getLixeira);

// Rotas públicas básicas (agora protegidas)
router.get('/', getSalas);
router.get('/:id', idValidation, getSala);

// Secretaria pode criar e editar salas
router.post('/', 
  requireRole(['admin', 'secretaria']), 
  salaValidation, 
  createSala
);

router.put('/:id', 
  idValidation, 
  requireRole(['admin', 'secretaria']), 
  salaValidation, 
  updateSala
);

// Apenas Admin pode excluir
router.delete('/:id', 
  idValidation, 
  requireRole(['admin']), 
  deleteSala
);

// Restaurar (apenas Admin)
router.post('/:id/restore',
  idValidation,
  requireRole(['admin']),
  restoreSala
);

module.exports = router;
