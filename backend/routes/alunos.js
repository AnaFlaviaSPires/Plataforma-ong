const express = require('express');
const { body, param } = require('express-validator');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const {
  getAlunos,
  getAluno,
  createAluno,
  updateAluno,
  deleteAluno,
  reactivateAluno,
  getAlunosPorTurma,
  getEstatisticas
} = require('../controllers/alunosController');

const router = express.Router();

// Validações para criação/atualização de aluno
const alunoValidation = [
  body('nome')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('data_nasc')
    .isDate()
    .withMessage('Data de nascimento inválida'),
  body('sexo')
    .isIn(['M', 'F', 'Outro'])
    .withMessage('Sexo deve ser M, F ou Outro'),
  body('cpf')
    .optional()
    .matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
    .withMessage('CPF deve estar no formato XXX.XXX.XXX-XX'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('email_responsavel')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Email do responsável inválido'),
  body('cpf_responsavel')
    .optional()
    .matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
    .withMessage('CPF do responsável deve estar no formato XXX.XXX.XXX-XX'),
  body('cep')
    .optional()
    .matches(/^\d{5}-?\d{3}$/)
    .withMessage('CEP deve estar no formato XXXXX-XXX'),
  body('telefone')
    .optional()
    .isMobilePhone('pt-BR')
    .withMessage('Telefone inválido'),
  body('telefone_responsavel')
    .optional()
    .isMobilePhone('pt-BR')
    .withMessage('Telefone do responsável inválido')
];

// Validação para parâmetros de ID
const idValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID deve ser um número inteiro positivo')
];

// Rotas públicas para desenvolvimento (sem autenticação)
router.get('/', getAlunos);
router.get('/:id', idValidation, getAluno);
router.post('/', alunoValidation, createAluno);
router.put('/:id', idValidation, alunoValidation, updateAluno);

// Em desenvolvimento, permitir exclusão sem autenticação para facilitar testes
if ((process.env.NODE_ENV || 'development') !== 'production') {
  router.delete('/:id', idValidation, deleteAluno);
}

// Aplicar middleware de autenticação para rotas protegidas
router.use(authMiddleware);

router.get('/estatisticas', getEstatisticas);
router.get('/turma/:turma', getAlunosPorTurma);

// Em produção, exigir papel para exclusão
if ((process.env.NODE_ENV || 'development') === 'production') {
  router.delete('/:id', 
    idValidation,
    requireRole(['admin', 'coordenador']), 
    deleteAluno
  );
}

router.patch('/:id/reativar', 
  idValidation,
  requireRole(['admin', 'coordenador']), 
  reactivateAluno
);

module.exports = router;
