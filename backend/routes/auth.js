const express = require('express');
const { body } = require('express-validator');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const { 
  login, 
  register, 
  forgotPassword, 
  resetPassword, 
  verifyToken, 
  logout, 
  approveUser,
  getUsers,
  getUsersList,
  updateProfile,
  changePassword
} = require('../controllers/authController');

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
    .isIn(['admin', 'professor', 'secretaria', 'assistente_social'])
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

// Validações para redefinição de senha (via body)
const resetPasswordValidation = [
  body('token')
    .isLength({ min: 10 })
    .withMessage('Token inválido'),
  body('senha')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres')
];

// Validações para redefinição de senha (via URL param)
const resetPasswordParamValidation = [
  body('senha')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres')
];

// Rotas públicas
router.post('/login', loginValidation, login);
router.post('/register', registerValidation, register);
router.post('/forgot-password', forgotPasswordValidation, forgotPassword);
router.post('/reset-password', resetPasswordValidation, resetPassword);
router.post('/reset-password/:token', resetPasswordParamValidation, resetPassword);

// Rotas protegidas
router.get('/verify', authMiddleware, verifyToken);
router.post('/logout', authMiddleware, logout);
router.patch('/users/:id/approve', authMiddleware, requireRole(['admin']), approveUser);
router.get('/users', authMiddleware, requireRole(['admin']), getUsers);
router.get('/users-list', authMiddleware, getUsersList);
router.get('/professores', authMiddleware, async (req, res) => {
  try {
    const { User } = require('../models');
    const professores = await User.findAll({
      where: { cargo: 'professor', ativo: true },
      attributes: ['id', 'nome', 'email'],
      order: [['nome', 'ASC']]
    });
    res.json({ professores });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar professores' });
  }
});
router.patch('/profile', authMiddleware, updateProfile);
router.post('/change-password', authMiddleware, changePassword);

module.exports = router;
