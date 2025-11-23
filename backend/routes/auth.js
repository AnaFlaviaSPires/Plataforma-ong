const express = require('express');
const { body } = require('express-validator');
const { authMiddleware } = require('../middleware/authMiddleware');
const { login, register, forgotPassword, resetPassword, verifyToken, logout } = require('../controllers/authController');

const router = express.Router();

// Validações para login
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('senha')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres')
];

// Validações para registro
const registerValidation = [
  body('nome')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('senha')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('cargo')
    .optional()
    .isIn(['admin', 'coordenador', 'professor', 'voluntario'])
    .withMessage('Cargo inválido'),
  body('telefone')
    .optional()
    .isMobilePhone('pt-BR')
    .withMessage('Telefone inválido'),
  body('data_nascimento')
    .optional()
    .isDate()
    .withMessage('Data de nascimento inválida')
];

// Validações para esqueci a senha
const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido')
];

// Validações para redefinição de senha
const resetPasswordValidation = [
  body('token')
    .isLength({ min: 10 })
    .withMessage('Token inválido'),
  body('senha')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres')
];

// Rotas públicas
router.post('/login', loginValidation, login);
router.post('/register', registerValidation, register);
router.post('/forgot-password', forgotPasswordValidation, forgotPassword);
router.post('/reset-password', resetPasswordValidation, resetPassword);

// Rotas protegidas
router.get('/verify', authMiddleware, verifyToken);
router.post('/logout', authMiddleware, logout);

module.exports = router;
