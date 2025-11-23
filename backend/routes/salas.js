const express = require('express');
const { body, param } = require('express-validator');
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  getSalas,
  getSala,
  createSala,
  updateSala,
  deleteSala
} = require('../controllers/salasController');

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

// Em desenvolvimento, podemos permitir acesso sem autenticação, mas já deixo preparado
// Rotas públicas básicas
router.get('/', getSalas);
router.get('/:id', idValidation, getSala);
router.post('/', salaValidation, createSala);
router.put('/:id', idValidation, salaValidation, updateSala);
router.delete('/:id', idValidation, deleteSala);

// Caso queira proteger com auth, no futuro:
// router.use(authMiddleware);

module.exports = router;
