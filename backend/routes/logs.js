const express = require('express');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const { getLogs } = require('../controllers/logsController');

const router = express.Router();

router.use(authMiddleware);

// Apenas Admin pode ver logs de auditoria
router.get('/', requireRole(['admin']), getLogs);

module.exports = router;
