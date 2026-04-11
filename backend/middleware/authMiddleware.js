const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { logAction } = require('./auditMiddleware');

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('🛑 SEGURANÇA: JWT_SECRET não definido em produção! Defina a variável de ambiente.');
  process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-ong-novo-amanha';

// Cache de usuários em memória (evita query no banco a cada request)
const USER_CACHE_TTL = 2 * 60 * 1000; // 2 minutos
const userCache = new Map();

function getCachedUser(id) {
  const entry = userCache.get(id);
  if (entry && Date.now() - entry.ts < USER_CACHE_TTL) return entry.user;
  if (entry) userCache.delete(id);
  return null;
}

function setCachedUser(user) {
  userCache.set(user.id, { user, ts: Date.now() });
  // Limpar cache se ficar grande demais
  if (userCache.size > 200) {
    const now = Date.now();
    for (const [k, v] of userCache) { if (now - v.ts > USER_CACHE_TTL) userCache.delete(k); }
  }
}

// Invalidar cache de um usuário específico (chamar após update)
function invalidateUserCache(id) { userCache.delete(id); }

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: 'Token de acesso requerido'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Tentar cache primeiro
    let user = getCachedUser(decoded.id);
    if (!user) {
      user = await User.findByPk(decoded.id);
      if (user) setCachedUser(user);
    }
    
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
  requireRole,
  invalidateUserCache
};
