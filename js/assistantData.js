// Base de conhecimento do Assistente — módulo expansível
// Cada entrada: keywords (array), response (texto), action (URL opcional), actionLabel (texto do botão)
// Para evolução futura com IA, basta substituir a busca por keywords por chamada de API.

const assistantData = [
  // === NAVEGAÇÃO GERAL ===
  {
    keywords: ["menu", "inicio", "home", "principal", "voltar"],
    response: "O menu principal reúne todos os módulos da plataforma.",
    action: "menu.html",
    actionLabel: "Ir ao Menu"
  },
  {
    keywords: ["dashboard", "painel", "estatisticas", "resumo", "graficos", "visao geral"],
    response: "O Dashboard mostra estatísticas gerais: alunos, doações, frequência e mais.",
    action: "dashboard.html",
    actionLabel: "Abrir Dashboard"
  },

  // === ALUNOS ===
  {
    keywords: ["aluno", "cadastrar aluno", "matricula", "novo aluno", "lista alunos", "estudante"],
    response: "No módulo de Alunos você pode cadastrar, editar e visualizar todos os alunos.",
    action: "alunos.html",
    actionLabel: "Ir para Alunos"
  },
  {
    keywords: ["turma", "turmas", "classe"],
    response: "As turmas são gerenciadas dentro do módulo de Alunos e Salas.",
    action: "alunos.html",
    actionLabel: "Ver Alunos"
  },

  // === PROFESSORES ===
  {
    keywords: ["professor", "professores", "docente", "educador"],
    response: "O módulo de Professores permite gerenciar dados dos educadores cadastrados.",
    action: "professores.html",
    actionLabel: "Ir para Professores"
  },

  // === CHAMADA / FREQUÊNCIA ===
  {
    keywords: ["chamada", "presenca", "frequencia", "falta", "registro presenca", "lista presenca"],
    response: "Para registrar presença, acesse o módulo de Chamada. Selecione a sala e marque a presença dos alunos.",
    action: "chamada.html",
    actionLabel: "Abrir Chamada"
  },

  // === DOAÇÕES ===
  {
    keywords: ["doacao", "doacoes", "doador", "doar", "contribuicao", "dinheiro", "pix"],
    response: "No módulo de Doações você registra e acompanha todas as contribuições recebidas.",
    action: "doacoes.html",
    actionLabel: "Ir para Doações"
  },

  // === ACOMPANHAMENTO SOCIAL ===
  {
    keywords: ["prontuario", "social", "acompanhamento", "assistencia", "familia", "visita"],
    response: "O Acompanhamento Social permite registrar prontuários e atendimentos das famílias.",
    action: "acompanhamento-social.html",
    actionLabel: "Abrir Acompanhamento"
  },

  // === CURSOS ===
  {
    keywords: ["curso", "cursos", "oficina", "atividade", "aula"],
    response: "O módulo de Cursos permite cadastrar e gerenciar cursos e oficinas oferecidos.",
    action: "cursos.html",
    actionLabel: "Ver Cursos"
  },

  // === CALENDÁRIO / EVENTOS ===
  {
    keywords: ["calendario", "evento", "eventos", "agenda", "data", "programacao"],
    response: "O Calendário mostra todos os eventos e datas importantes da ONG.",
    action: "calendario.html",
    actionLabel: "Abrir Calendário"
  },

  // === DOCUMENTOS ===
  {
    keywords: ["documento", "documentos", "arquivo", "relatorio", "pdf", "imprimir"],
    response: "No módulo de Documentos você pode gerar e gerenciar relatórios e arquivos.",
    action: "documentos.html",
    actionLabel: "Ver Documentos"
  },

  // === PONTO ===
  {
    keywords: ["ponto", "horario", "jornada", "entrada", "saida", "registro ponto"],
    response: "O módulo de Ponto permite registrar e acompanhar a jornada de trabalho.",
    action: "ponto.html",
    actionLabel: "Abrir Ponto"
  },

  // === PERFIL ===
  {
    keywords: ["perfil", "meu perfil", "minha conta", "dados pessoais", "foto", "avatar"],
    response: "No seu Perfil você pode atualizar seus dados pessoais e foto.",
    action: "perfil.html",
    actionLabel: "Ir ao Perfil"
  },

  // === CONFIGURAÇÕES ===
  {
    keywords: ["configuracao", "configuracoes", "config", "tema", "idioma", "preferencias"],
    response: "Nas Configurações você ajusta tema, idioma e preferências do sistema.",
    action: "configuracoes.html",
    actionLabel: "Abrir Configurações"
  },

  // === ADMINISTRAÇÃO ===
  {
    keywords: ["usuario", "usuarios", "admin", "administracao", "gerenciar usuarios", "aprovar"],
    response: "A área de Administração permite gerenciar usuários, aprovar cadastros e definir cargos.",
    action: "admin-usuarios.html",
    actionLabel: "Gerenciar Usuários"
  },
  {
    keywords: ["auditoria", "log", "logs", "historico", "registro atividades"],
    response: "O módulo de Auditoria registra todas as ações realizadas no sistema.",
    action: "auditoria.html",
    actionLabel: "Ver Auditoria"
  },

  // === AJUDA / GUIA ===
  {
    keywords: ["ajuda", "guia", "tutorial", "como usar", "manual", "instrucao", "suporte"],
    response: "O Guia da Plataforma explica cada módulo e funcionalidade do sistema.",
    action: "guia.html",
    actionLabel: "Abrir Guia"
  },

  // === AÇÕES COMUNS ===
  {
    keywords: ["senha", "trocar senha", "alterar senha", "esqueci senha", "redefinir"],
    response: "Você pode alterar sua senha no seu Perfil, na seção de segurança.",
    action: "perfil.html",
    actionLabel: "Ir ao Perfil"
  },
  {
    keywords: ["sair", "logout", "deslogar", "encerrar sessao"],
    response: "Para sair, clique no botão de Logout no menu lateral ou na navbar.",
    action: null,
    actionLabel: null
  },
  {
    keywords: ["sala", "salas", "ambiente", "espaco"],
    response: "As salas são gerenciadas no módulo de Chamada, onde você seleciona a sala para registrar presença.",
    action: "chamada.html",
    actionLabel: "Ver Salas"
  },

  // === CUMPRIMENTOS ===
  {
    keywords: ["oi", "ola", "bom dia", "boa tarde", "boa noite", "hey", "eai", "e ai"],
    response: "Olá! 👋 Sou o assistente da plataforma. Como posso te ajudar hoje?",
    action: null,
    actionLabel: null
  },
  {
    keywords: ["obrigado", "obrigada", "valeu", "thanks", "brigado"],
    response: "De nada! 😊 Se precisar de mais alguma coisa, é só perguntar.",
    action: null,
    actionLabel: null
  },
  {
    keywords: ["quem e voce", "o que voce faz", "assistente", "bot", "chatbot"],
    response: "Sou o assistente da plataforma! Posso te ajudar a navegar pelo sistema, encontrar módulos e tirar dúvidas sobre funcionalidades.",
    action: null,
    actionLabel: null
  }
];

// Sugestões rápidas exibidas ao abrir o chat
const assistantSuggestions = [
  { label: "📊 Dashboard", query: "dashboard" },
  { label: "👦 Alunos", query: "cadastrar aluno" },
  { label: "📋 Chamada", query: "chamada" },
  { label: "💰 Doações", query: "doações" },
  { label: "❓ Ajuda", query: "como usar" }
];
