const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { logAction } = require('./auditMiddleware');

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('🛑 SEGURANÇA: JWT_SECRET não definido em produção! Defina a variável de ambiente.');
  process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-ong-novo-amanha';

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: 'Token de acesso requerido'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    
    if (!user || !user.ativo) {
      return res.status(401).json({
        error: 'Usuário não encontrado ou inativo'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(401).json({
      error: 'Token inválido'
    });
  }
};

// Middleware para verificar permissões específicas
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Usuário não autenticado'
      });
    }

    if (!roles.includes(req.user.cargo)) {
      logAction(req, {
        acao: 'FORBIDDEN',
        tabela: 'system',
        registroId: req.user.id,
        novos: { 
            required: roles, 
            actual: req.user.cargo,
            path: req.originalUrl
        }
      }).catch(console.error);

      return res.status(403).json({
        error: 'Permissão insuficiente'
      });
    }

    next();
  };
};

module.exports = {
  authMiddleware,
  requireRole
};
