// Teste simples do servidor sem Sequelize
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware básico
app.use(cors());
app.use(express.json());

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Servidor funcionando sem Sequelize'
  });
});

// Rota de teste para alunos
app.get('/api/alunos', (req, res) => {
  res.json([
    {
      id: 1,
      nome: 'João Silva',
      nome_responsavel: 'Maria Silva',
      telefone: '(11) 99999-9999',
      ativo: true
    },
    {
      id: 2,
      nome: 'Ana Santos',
      nome_responsavel: 'José Santos',
      telefone: '(11) 88888-8888',
      ativo: true
    }
  ]);
});

// Rota POST para criar aluno
app.post('/api/alunos', (req, res) => {
  console.log('Dados recebidos:', req.body);
  res.json({
    id: Date.now(),
    ...req.body,
    message: 'Aluno criado com sucesso (simulação)'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor de teste rodando na porta ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`👥 Alunos: http://localhost:${PORT}/api/alunos`);
});

module.exports = app;
