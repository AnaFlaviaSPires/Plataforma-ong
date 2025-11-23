// Servidor simples para testar se o problema é do MySQL ou do código
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware básico
app.use(cors());
app.use(express.json());

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Servidor funcionando sem MySQL'
  });
});

// Array para armazenar alunos em memória
let alunos = [
  {
    id: 1,
    nome: 'João Silva',
    nome_responsavel: 'Maria Silva',
    telefone: '(11) 99999-9999',
    email: 'joao@email.com',
    data_nascimento: '2010-05-15',
    endereco: 'Rua A, 123',
    observacoes: 'Aluno dedicado',
    ativo: true
  },
  {
    id: 2,
    nome: 'Ana Santos',
    nome_responsavel: 'José Santos',
    telefone: '(11) 88888-8888',
    email: 'ana@email.com',
    data_nascimento: '2011-03-20',
    endereco: 'Rua B, 456',
    observacoes: 'Muito participativa',
    ativo: true
  }
];

// Rota GET para listar alunos
app.get('/api/alunos', (req, res) => {
  res.json(alunos);
});

// Rota POST para criar aluno
app.post('/api/alunos', (req, res) => {
  console.log('Dados recebidos para criar aluno:', req.body);
  
  const novoAluno = {
    id: Date.now(),
    ...req.body,
    ativo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  // Adicionar o novo aluno ao array
  alunos.push(novoAluno);
  
  console.log(`✅ Aluno adicionado! Total de alunos: ${alunos.length}`);
  
  res.status(201).json({
    success: true,
    message: 'Aluno criado com sucesso',
    data: novoAluno
  });
});

// Rota PUT para atualizar aluno
app.put('/api/alunos/:id', (req, res) => {
  const { id } = req.params;
  console.log(`Atualizando aluno ID ${id}:`, req.body);
  
  res.json({
    success: true,
    message: `Aluno ${id} atualizado com sucesso (simulação)`,
    data: { id: parseInt(id), ...req.body, updated_at: new Date().toISOString() }
  });
});

// Rota DELETE para excluir aluno
app.delete('/api/alunos/:id', (req, res) => {
  const { id } = req.params;
  console.log(`Excluindo aluno ID ${id}`);
  
  res.json({
    success: true,
    message: `Aluno ${id} excluído com sucesso (simulação)`
  });
});

// Middleware de erro
app.use((err, req, res, next) => {
  console.error('Erro no servidor:', err);
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    error: err.message
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor simples rodando na porta ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`👥 Alunos: http://localhost:${PORT}/api/alunos`);
  console.log('✅ Pronto para testar o cadastro!');
});

module.exports = app;
