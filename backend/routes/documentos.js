const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const { getDocumentos, createDocumento, deleteDocumento } = require('../controllers/documentosController');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getDocumentos);
router.post('/', createDocumento);
router.delete('/:id', deleteDocumento);

module.exports = router;
