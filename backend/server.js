// ============================================================
// PATCH SSL - Deve ser o PRIMEIRO código executado
// Força SSL em TODA conexão MySQL do Sequelize
// ============================================================
const mysql2SSL = require('mysql2');
const origCreateConn = mysql2SSL.createConnection;
mysql2SSL.createConnection = function(opts) {
  opts.ssl = { minVersion: 'TLSv1.2', rejectUnauthorized: false };
  console.log('*** SSL FORCADO NA CONEXAO ***');
  return origCreateConn.call(this, opts);
};
// ============================================================

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
const pontoRoutes = require('./routes/ponto');

// Importar configuração do banco
const { sequelize, User } = require('./models');

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

// CORS - Permitir origens do frontend
const allowedOrigins = [
  'http://localhost:3003',
  'http://localhost:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'https://plataforma-ong.vercel.app'
];

// Adicionar FRONTEND_URL do env se definida
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    // Aceitar preview deploys do Vercel (subdomínios *.vercel.app)
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(new Error('CORS not allowed'), false);
  },
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
app.use('/api/ponto', pontoRoutes);

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
    
    // Sincronizar models com o banco (só cria tabelas que não existem)
    try {
      console.log('🔄 Verificando tabelas no banco de dados...');
      await sequelize.sync();
      console.log('✅ Tabelas verificadas/criadas com sucesso!');
    } catch (syncError) {
      console.error('⚠️ Erro ao sincronizar tabelas (servidor vai iniciar mesmo assim):', syncError.message);
    }

    // Migração da tabela doacoes (executar uma vez com ALLOW_DB_SYNC=true)
    if (process.env.ALLOW_DB_SYNC === 'true') {
      try {
        console.log('🔓 ALLOW_DB_SYNC ativo — executando migração da tabela doacoes...');
        const qi = sequelize.getQueryInterface();

        // Verificar colunas existentes
        const cols = await qi.describeTable('doacoes').catch(() => null);
        if (cols) {
          // Adicionar coluna quantidade se não existir
          if (!cols.quantidade) {
            await sequelize.query("ALTER TABLE doacoes ADD COLUMN quantidade INT NULL");
            console.log('  ✅ Coluna quantidade adicionada');
          }
          // Adicionar coluna alterado_por se não existir
          if (!cols.alterado_por) {
            await sequelize.query("ALTER TABLE doacoes ADD COLUMN alterado_por INT NULL");
            console.log('  ✅ Coluna alterado_por adicionada');
          }
          // Expandir ENUM tipo
          try {
            await sequelize.query("ALTER TABLE doacoes MODIFY COLUMN tipo ENUM('dinheiro','pix','alimentos','vestuario','material_higiene','material_escolar','brindes','outros') NOT NULL");
            console.log('  ✅ ENUM tipo expandido');
          } catch (e) { console.log('  ⚠️ ENUM tipo:', e.message); }
          // Tornar nome_doador nullable
          try {
            await sequelize.query("ALTER TABLE doacoes MODIFY COLUMN nome_doador VARCHAR(150) NULL");
            console.log('  ✅ nome_doador agora aceita NULL');
          } catch (e) { console.log('  ⚠️ nome_doador:', e.message); }
          // Alterar default status para recebida
          try {
            await sequelize.query("ALTER TABLE doacoes MODIFY COLUMN status ENUM('pendente','recebida','cancelada') NOT NULL DEFAULT 'recebida'");
            console.log('  ✅ Status default alterado para recebida');
          } catch (e) { console.log('  ⚠️ status:', e.message); }

          console.log('✅ Migração da tabela doacoes concluída!');
        } else {
          console.log('  ℹ️ Tabela doacoes não encontrada (será criada pelo sync)');
        }
      } catch (migErr) {
        console.error('⚠️ Erro na migração doacoes:', migErr.message);
      }
    }

    // Criar admin padrão se não existir nenhum usuário
    try {
      const userCount = await User.count();
      if (userCount === 0) {
        await User.create({
          nome: 'Administrador',
          email: 'ongnovoamanha@hotmail.com',
          senha: 'admin123',
          cargo: 'admin',
          ativo: true
        });
        console.log('👤 Usuário admin padrão criado: admin@ongnovoamanha.org / admin123');
      }
    } catch (seedError) {
      console.error('⚠️ Erro ao criar admin padrão:', seedError.message);
    }

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
