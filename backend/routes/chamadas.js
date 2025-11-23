const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const { createChamada, getChamadas } = require('../controllers/chamadasController');

const router = express.Router();

// Em desenvolvimento podemos deixar sem auth, mas já preparado
// router.use(authMiddleware);

// Criar nova chamada com registros de presença
router.post('/', createChamada);

// Listar chamadas de uma sala (e opcionalmente por data)
router.get('/', getChamadas);

module.exports = router;
