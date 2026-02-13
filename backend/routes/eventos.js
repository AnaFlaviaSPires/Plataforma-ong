const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const { getEventos, createEvento, deleteEvento } = require('../controllers/eventosController');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getEventos);
router.post('/', createEvento);
router.delete('/:id', deleteEvento);

module.exports = router;
