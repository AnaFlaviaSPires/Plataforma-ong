const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const { getEventos, createEvento, updateEvento, deleteEvento } = require('../controllers/eventosController');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getEventos);
router.post('/', createEvento);
router.put('/:id', updateEvento);
router.delete('/:id', deleteEvento);

module.exports = router;
