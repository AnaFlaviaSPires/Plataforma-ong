const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const { getDashboardStats, getResumoRapido } = require('../controllers/dashboardController');

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Rotas do dashboard
router.get('/stats', getDashboardStats);
router.get('/resumo', getResumoRapido);

module.exports = router;
