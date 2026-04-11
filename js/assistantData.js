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
    response: "O Guia da Plataforma é um guia ético com normas e diretrizes. Para dúvidas sobre funcionalidades, pode perguntar direto pra mim! Sou seu guia de funcionalidades. 🐾",
    action: null,
    actionLabel: null
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
    response: "Sou o **Beta**! 🐾 Seu guia de funcionalidades da plataforma. Posso te ajudar a navegar pelo sistema, encontrar módulos e tirar dúvidas sobre como usar tudo. É só perguntar!",
    action: null,
    actionLabel: null
  },
  {
    keywords: ["tudo bem", "como vai", "como esta", "tudo certo", "como voce esta"],
    response: "Tudo ótimo por aqui! 🐾 E com você? Precisa de alguma ajuda?",
    action: null,
    actionLabel: null
  },
  {
    keywords: ["bom trabalho", "boa", "excelente", "otimo", "parabens", "muito bom"],
    response: "Obrigado! 😊 Fico feliz em ajudar!",
    action: null,
    actionLabel: null
  },

  // === SISTEMA / STATUS ===
  {
    keywords: ["sistema lento", "lento", "travando", "bug", "erro", "problema", "nao funciona", "carregando"],
    response: "Se está com problemas, tente recarregar a página. Se persistir, pode ser conexão ou o servidor. Quer que te leve ao Dashboard para verificar?",
    action: "dashboard.html",
    actionLabel: "Ir ao Dashboard"
  },
  {
    keywords: ["nao consigo entrar", "login", "nao loga", "senha errada", "acesso negado"],
    response: "Para problemas de login, verifique seu email e senha. Se esqueceu a senha, pode pedir redefinição na tela de login.",
    action: null,
    actionLabel: null
  },
  {
    keywords: ["sair", "logout", "deslogar", "encerrar sessao"],
    response: "Para sair, clique no botão de Logout no menu lateral ou na navbar.",
    action: null,
    actionLabel: null
  },

  // === DÚVIDAS COMUNS ===
  {
    keywords: ["como comeco", "por onde comeco", "primeiros passos", "comecar", "iniciar"],
    response: "Para começar, explore o Dashboard para ver um resumo geral. Depois, navegue pelos módulos: Alunos, Chamada, Doações, etc. Se precisar, é só perguntar!",
    action: "dashboard.html",
    actionLabel: "Ir ao Dashboard"
  },
  {
    keywords: ["onde estou", "qual pagina", "onde to", "modulo atual"],
    response: "Você pode ver no título da página ou no menu lateral. Precisa ir para algum lugar específico?",
    action: null,
    actionLabel: null
  },
  {
    keywords: ["como voltar", "voltar", "anterior", "pagina anterior"],
    response: "Use o botão 'Voltar' do navegador ou o menu lateral para navegar.",
    action: null,
    actionLabel: null
  },
  {
    keywords: ["nao acho", "nao encontro", "onde esta", "acho que sumiu"],
    response: "Pode usar a busca global ou o menu lateral. Me diga o que procura e te ajudo!",
    action: null,
    actionLabel: null
  },

  // === ALUNOS — DÚVIDAS ESPECÍFICAS ===
  {
    keywords: ["editar aluno", "alterar aluno", "mudar dados aluno", "atualizar aluno"],
    response: "Para editar um aluno, vá até a lista de Alunos, clique no aluno desejado e use o botão de editar.",
    action: "alunos.html",
    actionLabel: "Ver Alunos"
  },
  {
    keywords: ["excluir aluno", "remover aluno", "deletar aluno", "apagar aluno"],
    response: "Para excluir um aluno, selecione-o na lista e use a opção de exclusão. Cuidado: essa ação não pode ser desfeita.",
    action: "alunos.html",
    actionLabel: "Ver Alunos"
  },
  {
    keywords: ["aluno inativo", "reativacao", "reativado", "inativo"],
    response: "Alunos inativos aparecem na lista com status especial. Você pode reativá-los na edição do cadastro.",
    action: "alunos.html",
    actionLabel: "Ver Alunos"
  },
  {
    keywords: ["turma do aluno", "turmas", "alocar aluno", "mudar turma"],
    response: "As turmas são gerenciadas no módulo de Alunos e Salas. Você pode alocar alunos em turmas específicas.",
    action: "alunos.html",
    actionLabel: "Ver Alunos"
  },

  // === CHAMADA — DÚVIDAS ESPECÍFICAS ===
  {
    keywords: ["como fazer chamada", "registrar presenca", "marcar presenca", "fazer lista"],
    response: "Vá ao módulo de Chamada, selecione a sala e a data. Depois, clique nos alunos para marcar presença/ausência e salve.",
    action: "chamada.html",
    actionLabel: "Abrir Chamada"
  },
  {
    keywords: ["chamada anterior", "ver chamada passada", "historico chamada"],
    response: "O histórico de chamadas fica no módulo de Chamada. Você pode filtrar por data e sala.",
    action: "chamada.html",
    actionLabel: "Ver Chamada"
  },
  {
    keywords: ["editar chamada", "alterar presenca", "corrigir chamada"],
    response: "Você pode editar chamadas anteriores no módulo de Chamada. Clique na chamada desejada e faça as correções.",
    action: "chamada.html",
    actionLabel: "Ver Chamada"
  },
  {
    keywords: ["falta justificada", "justificativa", "abonar falta"],
    response: "Para justificar faltas, edite a chamada e adicione a observação/justificativa no aluno.",
    action: "chamada.html",
    actionLabel: "Ver Chamada"
  },

  // === DOAÇÕES — DÚVIDAS ESPECÍFICAS ===
  {
    keywords: ["como registrar doacao", "nova doacao", "adicionar doacao", "cadastrar doacao"],
    response: "No módulo de Doações, clique em 'Nova Doação' e preencha os dados: doador, valor, data e forma de pagamento.",
    action: "doacoes.html",
    actionLabel: "Nova Doação"
  },
  {
    keywords: ["doacao confirmada", "confirmar doacao", "pendente", "status doacao"],
    response: "Doações podem ter status de pendente ou confirmada. Você pode alterar o status na edição da doação.",
    action: "doacoes.html",
    actionLabel: "Ver Doações"
  },
  {
    keywords: ["pix", "pix doacao", "pagamento pix", "chave pix"],
    response: "Para doações via PIX, registre a doação e anote a chave de transação para controle.",
    action: "doacoes.html",
    actionLabel: "Ver Doações"
  },
  {
    keywords: ["relatorio doacoes", "extrato doacoes", "historico doacoes"],
    response: "O módulo de Doações mostra um resumo e o histórico detalhado de todas as contribuições.",
    action: "doacoes.html",
    actionLabel: "Ver Doações"
  },

  // === CURSOS — DÚVIDAS ===
  {
    keywords: ["criar curso", "novo curso", "cadastrar curso", "adicionar curso"],
    response: "No módulo de Cursos, clique em 'Novo Curso' e preencha nome, descrição, carga horária e outras informações.",
    action: "cursos.html",
    actionLabel: "Ver Cursos"
  },
  {
    keywords: ["inscrever aluno", "matricular", "aluno no curso", "inscricao"],
    response: "A inscrição de alunos em cursos é feita dentro do módulo de Alunos ou Cursos, dependendo da configuração.",
    action: "cursos.html",
    actionLabel: "Ver Cursos"
  },

  // === CALENDÁRIO — DÚVIDAS ===
  {
    keywords: ["criar evento", "novo evento", "adicionar evento", "agendar"],
    response: "No Calendário, clique em 'Novo Evento', defina título, data, hora e descrição.",
    action: "calendario.html",
    actionLabel: "Novo Evento"
  },
  {
    keywords: ["editar evento", "alterar evento", "mudar data evento"],
    response: "Clique no evento no Calendário e use a opção de edição.",
    action: "calendario.html",
    actionLabel: "Ver Calendário"
  },

  // === ACOMPANHAMENTO SOCIAL ===
  {
    keywords: ["novo prontuario", "criar prontuario", "abrir prontuario"],
    response: "No Acompanhamento Social, clique em 'Novo Prontuário' e vincule ao aluno ou família.",
    action: "acompanhamento-social.html",
    actionLabel: "Abrir Acompanhamento"
  },
  {
    keywords: ["visita domiciliar", "visita", "atendimento", "registro visita"],
    response: "Registre visitas e atendimentos dentro do prontuário do aluno/família no Acompanhamento Social.",
    action: "acompanhamento-social.html",
    actionLabel: "Abrir Acompanhamento"
  },

  // === ADMINISTRAÇÃO ===
  {
    keywords: ["aprovar usuario", "aprovar cadastro", "usuario pendente", "liberar acesso"],
    response: "Na Administração de Usuários, veja os cadastros pendentes e aprove ou rejeite.",
    action: "admin-usuarios.html",
    actionLabel: "Gerenciar Usuários"
  },
  {
    keywords: ["alterar cargo", "mudar permissao", "dar admin", "tirar admin"],
    response: "Você pode alterar o cargo de usuários na Administração. Cuidado ao dar permissões de admin.",
    action: "admin-usuarios.html",
    actionLabel: "Gerenciar Usuários"
  },
  {
    keywords: ["auditoria", "log", "logs", "historico", "registro atividades"],
    response: "A Auditoria mostra todas as ações realizadas no sistema, com data, usuário e tipo de ação.",
    action: "auditoria.html",
    actionLabel: "Ver Auditoria"
  },

  // === CONVERSAÇÃO INFORMAL ===
  {
    keywords: ["piada", "conta uma piada", "me conta algo", "entretenimento"],
    response: "Sou focado em ajudar com a plataforma, mas posso te ajudar a encontrar módulos ou tirar dúvidas! 🐾",
    action: null,
    actionLabel: null
  },
  {
    keywords: ["voce e humano", "e um humano", "e pessoa", "e real"],
    response: "Sou um assistente virtual, o Beta! 🐾 Mas estou aqui pra te ajudar como se fosse real!",
    action: null,
    actionLabel: null
  },
  {
    keywords: ["qual seu nome", "seu nome", "como te chama", "teu nome"],
    response: "Sou o Beta! 🐾",
    action: null,
    actionLabel: null
  },
  {
    keywords: ["idade", "anos", "quando nasceu", "quando foi criado"],
    response: "Fui criado para ser seu guia de funcionalidades da plataforma. 🐾",
    action: null,
    actionLabel: null
  },
  {
    keywords: ["gosta de", "preferencia", "o que faz", "hobbies"],
    response: "Gosto muito de ajudar usuários a navegar pela plataforma! 🐾",
    action: null,
    actionLabel: null
  },
  {
    keywords: ["tchau", "adeus", "bye", "ate logo", "ate mais", "falou"],
    response: "Tchau! 👋 Estou sempre por aqui se precisar. Até logo!",
    action: null,
    actionLabel: null
  },
  {
    keywords: ["sim", "nao", "talvez", "pode ser", "claro", "certo"],
    response: "Entendi! Precisa de mais alguma coisa? É só perguntar. 🐾",
    action: null,
    actionLabel: null
  },
  {
    keywords: ["ok", "entendi", "entendido", "beleza", "suave", "tranquilo"],
    response: "Beleza! Se precisar de algo mais, é só chamar. 🐾",
    action: null,
    actionLabel: null
  },
  {
    keywords: ["nao", "errado", "nao e isso", "quero outra coisa"],
    response: "Sem problemas! Me diga o que precisa e tento ajudar de outro jeito. 🐾",
    action: null,
    actionLabel: null
  },
  {
    keywords: ["ajuda rapida", "resumo", "resumao", "o que tem aqui"],
    response: "A plataforma tem: Dashboard, Alunos, Chamada, Doações, Professores, Cursos, Calendário, Documentos, Ponto e Acompanhamento Social. Quer ir para algum?",
    action: "menu.html",
    actionLabel: "Ver Menu"
  },
  {
    keywords: ["onde fica o menu", "abrir menu", "ver menu", "navegacao"],
    response: "O menu principal está na tela inicial, ou você pode usar o menu lateral. Quer ir para o Menu?",
    action: "menu.html",
    actionLabel: "Ir ao Menu"
  },
  {
    keywords: ["configurar", "ajustar", "preferencias", "tema", "idioma"],
    response: "Nas Configurações você pode ajustar tema claro/escuro, idioma e outras preferências.",
    action: "configuracoes.html",
    actionLabel: "Configurações"
  },
  {
    keywords: ["tema escuro", "tema claro", "dark mode", "light mode", "mudar tema"],
    response: "Você pode mudar o tema nas Configurações, escolhendo entre claro e escuro.",
    action: "configuracoes.html",
    actionLabel: "Configurações"
  },
  {
    keywords: ["idioma", "lingua", "ingles", "espanhol", "traducao"],
    response: "A plataforma oferece opções de idioma nas Configurações.",
    action: "configuracoes.html",
    actionLabel: "Configurações"
  },
  {
    keywords: ["notificacao", "alerta", "aviso", "mensagens"],
    response: "As notificações aparecem no ícone de sino na navbar. Você pode gerenciar preferências nas Configurações.",
    action: "configuracoes.html",
    actionLabel: "Configurações"
  },
  {
    keywords: ["relatorio", "pdf", "imprimir", "exportar", "baixar"],
    response: "O módulo de Documentos permite gerar relatórios e exportar dados em PDF.",
    action: "documentos.html",
    actionLabel: "Ver Documentos"
  },
  {
    keywords: ["backup", "salvar dados", "exportar tudo", "copiar dados"],
    response: "Para backup de dados, use o módulo de Documentos para gerar relatórios ou exportações.",
    action: "documentos.html",
    actionLabel: "Ver Documentos"
  },
  {
    keywords: ["suporte", "contato", "falar com alguem", "reportar bug", "erro grave"],
    response: "Para reportar bugs graves ou problemas, entre em contato com a administração pelo canal oficial.",
    action: null,
    actionLabel: null
  },
  {
    keywords: ["tutorial", "aprender", "ensinar", "treinamento"],
    response: "Para aprender a usar a plataforma, explore os módulos e me pergunte! Sou seu guia de funcionalidades. 🐾",
    action: null,
    actionLabel: null
  },
  {
    keywords: ["atualizacao", "novidade", "o que tem novo", "versao"],
    response: "Novidades e atualizações são comunicadas pela administração. Fique atento aos avisos!",
    action: null,
    actionLabel: null
  },
  {
    keywords: ["mobile", "celular", "app", "telefone", "responsivo"],
    response: "A plataforma é responsiva e funciona em celulares e tablets. Ajuste a tela se necessário.",
    action: null,
    actionLabel: null
  },
  {
    keywords: ["internet", "conexao", "offline", "sem internet"],
    response: "A plataforma precisa de conexão com internet para funcionar. Verifique sua conexão se estiver com problemas.",
    action: null,
    actionLabel: null
  },
  {
    keywords: ["navegador", "chrome", "firefox", "edge", "browser"],
    response: "A plataforma funciona nos principais navegadores modernos. Recomendamos usar a versão mais recente.",
    action: null,
    actionLabel: null
  },
  {
    keywords: ["limpar cache", "limpar dados", "cache", "cookies"],
    response: "Se tiver problemas de carregamento, tente limpar o cache do navegador ou recarregar a página (Ctrl+F5).",
    action: null,
    actionLabel: null
  },
  {
    keywords: ["seguranca", "privacidade", "dados", "informacao"],
    response: "Seus dados são protegidos. Use senhas fortes e não compartilhe suas credenciais.",
    action: null,
    actionLabel: null
  },
  {
    keywords: ["esqueci senha", "recuperar senha", "nova senha", "redefinir"],
    response: "Para recuperar a senha, use a opção 'Esqueci minha senha' na tela de login ou peça ajuda ao administrador.",
    action: null,
    actionLabel: null
  },
  {
    keywords: ["conta", "minha conta", "meus dados", "editar perfil"],
    response: "Seus dados pessoais estão no Perfil. Lá você pode editar nome, email, foto e senha.",
    action: "perfil.html",
    actionLabel: "Ver Perfil"
  },
  {
    keywords: ["foto", "avatar", "imagem", "mudar foto"],
    response: "Você pode alterar sua foto de perfil na tela de Perfil.",
    action: "perfil.html",
    actionLabel: "Ver Perfil"
  },
  {
    keywords: ["email", "alterar email", "mudar email", "email errado"],
    response: "Para alterar o email, vá ao seu Perfil. Se não conseguir, peça ajuda ao administrador.",
    action: "perfil.html",
    actionLabel: "Ver Perfil"
  },
  {
    keywords: ["telefone", "celular", "whatsapp", "contato"],
    response: "Seus dados de contato ficam no Perfil. Mantenha-os atualizados!",
    action: "perfil.html",
    actionLabel: "Ver Perfil"
  },
  {
    keywords: ["endereco", "rua", "cidade", "cep"],
    response: "Endereço pode ser atualizado no Perfil ou no cadastro do aluno, dependendo do caso.",
    action: "perfil.html",
    actionLabel: "Ver Perfil"
  },
  {
    keywords: ["ponto", "registro ponto", " bater ponto", "jornada"],
    response: "O módulo de Ponto registra entrada e saída. Use para controlar sua jornada de trabalho.",
    action: "ponto.html",
    actionLabel: "Ver Ponto"
  },
  {
    keywords: ["entrar ponto", "saida ponto", "registrar entrada", "registrar saida"],
    response: "No módulo de Ponto, clique em 'Registrar Entrada' ao chegar e 'Registrar Saída' ao sair.",
    action: "ponto.html",
    actionLabel: "Ver Ponto"
  },
  {
    keywords: ["horas trabalhadas", "total horas", "resumo ponto"],
    response: "O Ponto mostra o resumo de horas trabalhadas e histórico de registros.",
    action: "ponto.html",
    actionLabel: "Ver Ponto"
  }
];

// Sugestões padrão (fallback)
const assistantSuggestions = [
  { label: "📊 Dashboard", query: "dashboard" },
  { label: "� Que dia é hoje?", query: "que dia é hoje" },
  { label: "�️ Eventos essa semana", query: "evento essa semana" },
  { label: "� Alunos", query: "cadastrar aluno" },
  { label: "📋 Chamada", query: "chamada" },
  { label: "💰 Doações", query: "doações" }
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
