const express = require('express');
const { body, param } = require('express-validator');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const {
  getProfessores,
  getProfessor,
  createProfessor,
  updateProfessor,
  deleteProfessor,
  reactivateProfessor,
  getProfessoresPorStatus,
  getEstatisticas
} = require('../controllers/professoresController');

const router = express.Router();

// Validações para criação/atualização de professor
const professorValidation = [
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
  body('rg')
    .optional()
    .isLength({ min: 5, max: 20 })
    .withMessage('RG deve ter entre 5 e 20 caracteres'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('telefone')
    .optional()
    .matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)
    .withMessage('Telefone deve estar no formato (XX) XXXXX-XXXX'),
  body('cep')
    .optional()
    .matches(/^\d{5}-?\d{3}$/)
    .withMessage('CEP deve estar no formato XXXXX-XXX'),
  body('formacao')
    .isLength({ min: 2, max: 200 })
    .withMessage('Formação deve ter entre 2 e 200 caracteres'),
  body('experiencia_anos')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Experiência deve ser um número entre 0 e 50 anos'),
  body('salario')
    .optional()
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('Salário deve ser um valor decimal válido'),
  body('data_admissao')
    .isDate()
    .withMessage('Data de admissão inválida'),
  body('data_demissao')
    .optional()
    .isDate()
    .withMessage('Data de demissão inválida'),
  body('status')
    .optional()
    .isIn(['ativo', 'inativo', 'licenca', 'ferias'])
    .withMessage('Status deve ser: ativo, inativo, licenca ou ferias'),
  body('carga_horaria_semanal')
    .optional()
    .isInt({ min: 1, max: 60 })
    .withMessage('Carga horária semanal deve ser entre 1 e 60 horas'),
  body('endereco')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Endereço deve ter no máximo 200 caracteres'),
  body('numero')
    .optional()
    .isLength({ max: 10 })
    .withMessage('Número deve ter no máximo 10 caracteres'),
  body('complemento')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Complemento deve ter no máximo 50 caracteres'),
  body('bairro')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Bairro deve ter no máximo 100 caracteres'),
  body('cidade')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Cidade deve ter no máximo 100 caracteres'),
  body('estado')
    .optional()
    .isLength({ min: 2, max: 2 })
    .withMessage('Estado deve ter 2 caracteres (UF)'),
  body('especializacao')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Especialização deve ter no máximo 1000 caracteres'),
  body('registro_profissional')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Registro profissional deve ter no máximo 50 caracteres'),
  body('observacoes')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Observações devem ter no máximo 2000 caracteres'),
  body('foto_url')
    .optional()
    .isURL()
    .withMessage('URL da foto inválida')
];

// Validação para parâmetros de ID
const idValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID deve ser um número inteiro positivo')
];

// Validação para status
const statusValidation = [
  param('status')
    .isIn(['ativo', 'inativo', 'licenca', 'ferias'])
    .withMessage('Status deve ser: ativo, inativo, licenca ou ferias')
];

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Rotas GET (leitura) - todos os usuários autenticados podem acessar
router.get('/', getProfessores);
router.get('/estatisticas', getEstatisticas);
router.get('/status/:status', statusValidation, getProfessoresPorStatus);
router.get('/:id', idValidation, getProfessor);

// Rotas POST/PUT/DELETE - requerem permissões específicas
router.post('/', 
  requireRole(['admin', 'coordenador']), 
  professorValidation, 
  createProfessor
);

router.put('/:id', 
  idValidation,
  requireRole(['admin', 'coordenador']), 
  professorValidation, 
  updateProfessor
);

router.delete('/:id', 
  idValidation,
  requireRole(['admin', 'coordenador']), 
  deleteProfessor
);

router.patch('/:id/reativar', 
  idValidation,
  requireRole(['admin', 'coordenador']), 
  reactivateProfessor
);

module.exports = router;
