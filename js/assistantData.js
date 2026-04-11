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
    response: "Oi! 🐾 Sou o Beta! Como posso te ajudar hoje?",
    action: null,
    actionLabel: null
  },
  {
    keywords: ["obrigado", "obrigada", "valeu", "thanks", "brigado"],
    response: "De nada! 😊 Estou sempre por aqui se precisar.",
    action: null,
    actionLabel: null
  },
  {
    keywords: ["quem e voce", "o que voce faz", "assistente", "bot", "chatbot", "beta"],
    response: "Sou o **Beta**! 🐾 Seu assistente da plataforma. Posso te ajudar a navegar pelo sistema, encontrar módulos e tirar dúvidas. É só perguntar!",
    action: null,
    actionLabel: null
  }
];

// Sugestões padrão (fallback)
const assistantSuggestions = [
  { label: "📊 Dashboard", query: "dashboard" },
  { label: "👦 Alunos", query: "cadastrar aluno" },
  { label: "📋 Chamada", query: "chamada" },
  { label: "💰 Doações", query: "doações" },
  { label: "❓ Ajuda", query: "como usar" }
];

// Sugestões dinâmicas por página (baseado no nome do arquivo HTML)
const assistantPageSuggestions = {
  'dashboard': [
    { label: "� O que mostra o dashboard?", query: "dashboard" },
    { label: "👦 Ver alunos", query: "alunos" },
    { label: "💰 Ver doações", query: "doações" },
    { label: "📋 Fazer chamada", query: "chamada" }
  ],
  'alunos': [
    { label: "➕ Como cadastrar aluno?", query: "como cadastrar aluno" },
    { label: "🔍 Buscar aluno", query: "buscar aluno" },
    { label: "📋 Fazer chamada", query: "chamada" },
    { label: "📊 Ver dashboard", query: "dashboard" }
  ],
  'chamada': [
    { label: "✅ Como registrar presença?", query: "como fazer chamada" },
    { label: "🏫 Selecionar sala", query: "salas" },
    { label: "👦 Ver alunos", query: "alunos" },
    { label: "📊 Ver frequência", query: "frequencia" }
  ],
  'doacoes': [
    { label: "➕ Como registrar doação?", query: "como registrar doação" },
    { label: "� Doações em dinheiro", query: "dinheiro" },
    { label: "📊 Ver dashboard", query: "dashboard" },
    { label: "❓ Ajuda", query: "ajuda" }
  ],
  'professores': [
    { label: "👨‍🏫 Gerenciar professores", query: "professores" },
    { label: "📋 Fazer chamada", query: "chamada" },
    { label: "🏫 Ver salas", query: "salas" },
    { label: "📊 Dashboard", query: "dashboard" }
  ],
  'acompanhamento-social': [
    { label: "📝 O que é o prontuário?", query: "prontuario" },
    { label: "👦 Ver alunos", query: "alunos" },
    { label: "📊 Dashboard", query: "dashboard" },
    { label: "❓ Ajuda", query: "ajuda" }
  ],
  'calendario': [
    { label: "📅 Como criar evento?", query: "evento" },
    { label: "📊 Dashboard", query: "dashboard" },
    { label: "👦 Alunos", query: "alunos" },
    { label: "❓ Ajuda", query: "ajuda" }
  ],
  'perfil': [
    { label: "🔑 Trocar senha", query: "trocar senha" },
    { label: "📷 Alterar foto", query: "avatar" },
    { label: "📊 Dashboard", query: "dashboard" },
    { label: "❓ Ajuda", query: "ajuda" }
  ],
  'admin-usuarios': [
    { label: "👥 Gerenciar usuários", query: "usuarios" },
    { label: "✅ Aprovar cadastros", query: "aprovar" },
    { label: "📋 Auditoria", query: "auditoria" },
    { label: "📊 Dashboard", query: "dashboard" }
  ],
  'cursos': [
    { label: "📚 Gerenciar cursos", query: "cursos" },
    { label: "👨‍🏫 Ver professores", query: "professores" },
    { label: "👦 Ver alunos", query: "alunos" },
    { label: "📊 Dashboard", query: "dashboard" }
  ],
  'menu': [
    { label: "📊 Abrir Dashboard", query: "dashboard" },
    { label: "👦 Módulo Alunos", query: "alunos" },
    { label: "📋 Fazer Chamada", query: "chamada" },
    { label: "❓ Como usar a plataforma?", query: "como usar" }
  ]
};

// Dica contextual por página (exibida no boas-vindas quando o usuário abre o chat naquela tela)
const assistantPageTips = {
  'dashboard': '📊 Você está no Dashboard! Aqui vê um resumo geral de alunos, doações e frequência.',
  'alunos': '👦 Você está na tela de Alunos. Use o botão "Novo Aluno" para cadastrar, ou a busca para encontrar.',
  'chamada': '📋 Você está na Chamada. Selecione uma sala e clique nos alunos para marcar presença.',
  'doacoes': '💰 Aqui você gerencia as doações. Clique em "Nova Doação" para registrar uma contribuição.',
  'professores': '👨‍🏫 Módulo de Professores — gerencie dados e visualize os educadores cadastrados.',
  'acompanhamento-social': '📝 Acompanhamento Social — registre prontuários e atendimentos das famílias.',
  'calendario': '📅 Calendário de Eventos — visualize e crie eventos importantes da ONG.',
  'perfil': '👤 Seu Perfil — atualize nome, email, foto e altere sua senha.',
  'configuracoes': '⚙️ Configurações — ajuste tema, idioma e preferências do sistema.',
  'admin-usuarios': '👥 Administração de Usuários — aprove cadastros, altere cargos e gerencie acessos.',
  'cursos': '📚 Módulo de Cursos — cadastre e gerencie cursos e oficinas.',
  'documentos': '📄 Documentos — gere relatórios e gerencie arquivos da plataforma.',
  'ponto': '⏰ Registro de Ponto — acompanhe a jornada de trabalho.',
  'menu': '🏠 Menu Principal — escolha um módulo para começar.',
  'auditoria': '🔍 Auditoria — veja o histórico de ações realizadas no sistema.'
};

// Dicas extras baseadas no cargo do usuário
const assistantRoleTips = {
  'admin': 'Como admin, você tem acesso total. Pode gerenciar usuários, aprovar cadastros e ver auditoria.',
  'professor': 'Como professor, você pode registrar chamadas, ver alunos das suas turmas e acompanhar frequência.',
  'secretaria': 'Como secretária, você pode cadastrar alunos, registrar doações e gerenciar documentos.',
  'assistente_social': 'Como assistente social, você pode gerenciar prontuários e acompanhamento das famílias.'
};
