const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Importar rotas
const authRoutes = require('./routes/auth');
const alunosRoutes = require('./routes/alunos');
const professoresRoutes = require('./routes/professores');
const dashboardRoutes = require('./routes/dashboard');
const salasRoutes = require('./routes/salas');
const chamadasRoutes = require('./routes/chamadas');
const doacoesRoutes = require('./routes/doacoes');
const logsRoutes = require('./routes/logs');
const eventosRoutes = require('./routes/eventos');
const documentosRoutes = require('./routes/documentos');

// Importar configuração do banco
const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware de segurança
app.use(helmet());

// Rate limiting (apenas em produção)
if (process.env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // máximo 100 requests por IP
    message: {
      error: 'Muitas tentativas. Tente novamente em alguns minutos.'
    }
  });
  app.use('/api/', limiter);
}

// CORS - Permitir todas as origens em desenvolvimento
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://seudominio.com'] 
    : true, // Permitir todas as origens em desenvolvimento
  credentials: true
}));

// Middleware para parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/alunos', alunosRoutes);
app.use('/api/professores', professoresRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/salas', salasRoutes);
app.use('/api/chamadas', chamadasRoutes);
app.use('/api/doacoes', doacoesRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/eventos', eventosRoutes);
app.use('/api/documentos', documentosRoutes);

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: err.errors
    });
  }
  
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token inválido'
    });
  }
  
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
  });
});

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada'
  });
});

// Inicializar servidor
async function startServer() {
  try {
    // Testar conexão com banco
    await sequelize.authenticate();
    console.log('✅ Conexão com MySQL estabelecida com sucesso!');
    
    // Pular sincronização automática - usar apenas o script SQL
    console.log('⚠️  Sincronização automática desabilitada - use o script setup.sql');
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao inicializar servidor:', error);
    console.log('💡 Dica: Execute o script setup.sql no MySQL Workbench primeiro');
    process.exit(1);
  }
}

startServer();

module.exports = app;
