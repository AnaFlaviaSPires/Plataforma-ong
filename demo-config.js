// Configuração para demonstração online - DESABILITADO PARA USO LOCAL
// Este arquivo substitui a conexão com MySQL por dados mockados para o deploy
// EM AMBIENTE LOCAL, USE O BANCO MYSQL REAL

// Define a URL da API globalmente
window.API_BASE_URL = 'http://localhost:3003/api';

window.DEMO_CONFIG = {
  // MODO DEMO DESABILITADO - usar banco real
  enabled: false,
  alunos: [
    {
      id: 1,
      nome: 'João Silva Santos',
      nome_responsavel: 'Maria Silva Santos',
      telefone: '(11) 99999-9999',
      email: 'joao.silva@email.com',
      data_nascimento: '2010-05-15',
      endereco: 'Rua das Flores, 123 - São Paulo/SP',
      observacoes: 'Aluno dedicado e participativo',
      ativo: true
    },
    {
      id: 2,
      nome: 'Ana Carolina Oliveira',
      nome_responsavel: 'José Oliveira',
      telefone: '(11) 88888-8888',
      email: 'ana.carolina@email.com',
      data_nascimento: '2011-03-20',
      endereco: 'Av. Paulista, 456 - São Paulo/SP',
      observacoes: 'Muito criativa e curiosa',
      ativo: true
    },
    {
      id: 3,
      nome: 'Pedro Henrique Costa',
      nome_responsavel: 'Carla Costa',
      telefone: '(11) 77777-7777',
      email: 'pedro.henrique@email.com',
      data_nascimento: '2009-08-10',
      endereco: 'Rua da Esperança, 789 - São Paulo/SP',
      observacoes: 'Gosta muito de matemática',
      ativo: true
    },
    {
      id: 4,
      nome: 'Beatriz Almeida',
      nome_responsavel: 'Roberto Almeida',
      telefone: '(11) 66666-6666',
      email: 'beatriz.almeida@email.com',
      data_nascimento: '2012-01-25',
      endereco: 'Rua do Futuro, 321 - São Paulo/SP',
      observacoes: 'Adora atividades artísticas',
      ativo: true
    }
  ],
  
  professores: [
    {
      id: 1,
      nome: 'Prof. Carlos Eduardo',
      email: 'carlos.eduardo@ongnovoamanha.org',
      especialidade: 'Matemática',
      telefone: '(11) 55555-5555',
      ativo: true
    },
    {
      id: 2,
      nome: 'Profa. Mariana Santos',
      email: 'mariana.santos@ongnovoamanha.org',
      especialidade: 'Português',
      telefone: '(11) 44444-4444',
      ativo: true
    }
  ],
  
  cursos: [
    {
      id: 1,
      nome: 'Reforço Escolar - Fundamental I',
      descricao: 'Apoio pedagógico para alunos do ensino fundamental I',
      professor_id: 1,
      ativo: true
    },
    {
      id: 2,
      nome: 'Oficina de Leitura',
      descricao: 'Desenvolvimento da leitura e interpretação de textos',
      professor_id: 2,
      ativo: true
    }
  ],
  
  
  // Usuário demo para login
  demoUser: {
    id: 1,
    nome: 'Administrador Demo',
    email: 'admin@ongnovoamanha.org',
    cargo: 'admin',
    ativo: true
  }
};
