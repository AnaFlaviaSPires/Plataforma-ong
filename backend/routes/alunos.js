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
  getEstatisticas,
  getLixeira,
  restoreAluno
} = require('../controllers/alunosController');

const router = express.Router();

// Rota de lixeira deve vir antes de rotas com :id para evitar conflito
// Apenas admin (Coordenador) pode ver a lixeira
router.get('/lixeira', 
  authMiddleware, 
  requireRole(['admin']), 
  getLixeira
);

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

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Rotas de visualização (Todos autenticados podem ver)
router.get('/', getAlunos);
router.get('/estatisticas', getEstatisticas);
router.get('/turma/:turma', getAlunosPorTurma);
router.get('/:id', idValidation, getAluno);

// Criação e Edição (Admin e Secretaria)
router.post('/', 
  requireRole(['admin', 'secretaria']), 
  alunoValidation, 
  createAluno
);

router.put('/:id', 
  idValidation, 
  requireRole(['admin', 'secretaria']), 
  alunoValidation, 
  updateAluno
);

// Exclusão e Reativação (Apenas Admin)
router.delete('/:id', 
  idValidation,
  requireRole(['admin']), 
  deleteAluno
);

router.patch('/:id/reativar', 
  idValidation,
  requireRole(['admin']), 
  reactivateAluno
);

// Rota para restaurar da lixeira (Apenas Admin)
router.post('/:id/restore',
  idValidation,
  requireRole(['admin']),
  restoreAluno
);

module.exports = router;
