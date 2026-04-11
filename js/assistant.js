// ============================================
// ASSISTENTE INTELIGENTE — Chatbot Interno
// Módulo isolado, preparado para evolução com IA
// ============================================

(function () {
  'use strict';

  // Evitar dupla inicialização
  if (window._assistantInitialized) return;
  window._assistantInitialized = true;

  // --- Estado ---
  const state = {
    open: false,
    messages: [],
    firstOpen: true
  };

  // Restaurar histórico do localStorage
  try {
    const saved = JSON.parse(localStorage.getItem('assistant_history') || '[]');
    if (Array.isArray(saved) && saved.length > 0) {
      state.messages = saved;
      state.firstOpen = false;
    }
  } catch (_) { /* ignora */ }

  // --- Contexto do usuário e página ---
  function getUserData() {
    try {
      return JSON.parse(localStorage.getItem('user') || localStorage.getItem('userData') || 'null');
    } catch (_) { return null; }
  }

  function getUserName() {
    const user = getUserData();
    if (!user) return null;
    const nome = user.nome || user.name || '';
    return nome.split(' ')[0] || null; // Primeiro nome
  }

  function getUserRole() {
    const user = getUserData();
    return user?.cargo || user?.role || null;
  }

  function getCurrentPage() {
    const path = window.location.pathname;
    const match = path.match(/([^/]+)\.html$/);
    if (match) return match[1]; // ex: 'dashboard', 'alunos'
    return null;
  }

  function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  }

  function getContextSuggestions() {
    const page = getCurrentPage();
    if (page && typeof assistantPageSuggestions !== 'undefined' && assistantPageSuggestions[page]) {
      return assistantPageSuggestions[page];
    }
    return (typeof assistantSuggestions !== 'undefined') ? assistantSuggestions : [];
  }

  function buildWelcomeMessage() {
    const nome = getUserName();
    const cargo = getUserRole();
    const page = getCurrentPage();
    const greeting = getGreeting();

    let msg = nome
      ? `${greeting}, **${nome}**! 👋 Sou o **Beta**, seu guia de funcionalidades da plataforma.`
      : `${greeting}! 👋 Sou o **Beta**, seu guia de funcionalidades da plataforma.`;

    // Dica contextual da página
    if (page && typeof assistantPageTips !== 'undefined' && assistantPageTips[page]) {
      msg += `\n\n${assistantPageTips[page]}`;
    }

    // Dica do cargo (só na primeira vez)
    if (cargo && typeof assistantRoleTips !== 'undefined' && assistantRoleTips[cargo]) {
      msg += `\n\n💡 ${assistantRoleTips[cargo]}`;
    }

    msg += '\n\nComo posso te ajudar?';
    return msg;
  }

  // --- Utilitários ---
  function normalize(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .trim();
  }

  function getApiBase() {
    return (typeof API_BASE_URL !== 'undefined') ? API_BASE_URL : 'http://localhost:3003/api';
  }

  function getToken() {
    return localStorage.getItem('authToken') || '';
  }

  // --- Respostas dinâmicas (data, hora, eventos, stats) ---
  const dynamicHandlers = [
    {
      keywords: ['que dia', 'que data', 'dia de hoje', 'data de hoje', 'hoje e que dia', 'qual a data'],
      handler: () => {
        const hoje = new Date();
        const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
        const dia = diasSemana[hoje.getDay()];
        const dataFormatada = hoje.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
        return { response: `Hoje é **${dia}**, ${dataFormatada}. 📅`, action: null, actionLabel: null };
      }
    },
    {
      keywords: ['que horas', 'hora agora', 'que hora', 'horario atual'],
      handler: () => {
        const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        return { response: `Agora são **${hora}**. ⏰`, action: null, actionLabel: null };
      }
    },
    {
      keywords: ['evento essa semana', 'eventos essa semana', 'eventos da semana', 'evento semana', 'tem evento', 'proximos eventos', 'proximo evento', 'eventos proximos'],
      handler: async () => {
        try {
          const res = await fetch(`${getApiBase()}/eventos`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
          if (!res.ok) throw new Error();
          const eventos = await res.json();

          const hoje = new Date();
          hoje.setHours(0, 0, 0, 0);
          const fimSemana = new Date(hoje);
          fimSemana.setDate(fimSemana.getDate() + 7);

          const proximos = (Array.isArray(eventos) ? eventos : eventos.data || [])
            .filter(e => {
              const d = new Date(e.inicio || e.data_inicio || e.data);
              return d >= hoje && d <= fimSemana;
            })
            .sort((a, b) => new Date(a.inicio || a.data_inicio || a.data) - new Date(b.inicio || b.data_inicio || b.data))
            .slice(0, 5);

          if (proximos.length === 0) {
            return { response: 'Não encontrei nenhum evento programado para essa semana. 📅', action: 'calendario.html', actionLabel: 'Ver Calendário' };
          }

          let msg = `Encontrei **${proximos.length} evento(s)** nos próximos 7 dias:\n\n`;
          proximos.forEach(e => {
            const data = new Date(e.inicio || e.data_inicio || e.data).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
            msg += `📌 **${e.titulo || e.nome}** — ${data}\n`;
          });
          return { response: msg, action: 'calendario.html', actionLabel: 'Ver Calendário' };
        } catch (_) {
          return { response: 'Não consegui acessar os eventos agora. Tente pelo Calendário! 📅', action: 'calendario.html', actionLabel: 'Abrir Calendário' };
        }
      }
    },
    {
      keywords: ['quantos alunos', 'total alunos', 'numero de alunos', 'alunos cadastrados', 'quantas criancas'],
      handler: async () => {
        try {
          const res = await fetch(`${getApiBase()}/dashboard/stats`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
          if (!res.ok) throw new Error();
          const data = await res.json();
          const total = data.estatisticas_gerais?.total_alunos || 0;
          const inativos = data.estatisticas_gerais?.alunos_inativos || 0;
          const ativos = total - inativos;
          return { response: `Temos **${total} alunos** cadastrados no total, sendo **${ativos} ativos** e ${inativos} inativos. 👦`, action: 'alunos.html', actionLabel: 'Ver Alunos' };
        } catch (_) {
          return { response: 'Não consegui buscar os dados agora. Tente pelo Dashboard! 📊', action: 'dashboard.html', actionLabel: 'Abrir Dashboard' };
        }
      }
    },
    {
      keywords: ['quantas doacoes', 'total doacoes', 'valor doacoes', 'doacoes recebidas', 'quanto arrecadou', 'arrecadacao'],
      handler: async () => {
        try {
          const res = await fetch(`${getApiBase()}/dashboard/stats`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
          if (!res.ok) throw new Error();
          const data = await res.json();
          const d = data.doacoes || {};
          const valor = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(d.valor_total || 0);
          return { response: `Temos **${d.total || 0} doações** registradas, com um valor total de **${valor}**. 💰\n\n✅ Confirmadas: ${d.confirmadas || 0}\n⏳ Pendentes: ${d.pendentes || 0}`, action: 'doacoes.html', actionLabel: 'Ver Doações' };
        } catch (_) {
          return { response: 'Não consegui buscar as doações agora. Tente pelo módulo de Doações! 💰', action: 'doacoes.html', actionLabel: 'Ver Doações' };
        }
      }
    },
    {
      keywords: ['taxa presenca', 'frequencia geral', 'presenca geral', 'como esta a frequencia', 'porcentagem presenca'],
      handler: async () => {
        try {
          const res = await fetch(`${getApiBase()}/dashboard/stats`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
          if (!res.ok) throw new Error();
          const data = await res.json();
          const f = data.frequencia || {};
          return { response: `A taxa de presença geral está em **${f.taxa_presenca || 0}%**. 📋\n\n✅ Presenças: ${f.total_presencas || 0}\n❌ Faltas: ${f.total_faltas || 0}\n📝 Chamadas registradas: ${f.total_chamadas || 0}`, action: 'chamada.html', actionLabel: 'Ver Chamada' };
        } catch (_) {
          return { response: 'Não consegui buscar a frequência agora. Tente pelo módulo de Chamada! 📋', action: 'chamada.html', actionLabel: 'Ver Chamada' };
        }
      }
    },
    {
      keywords: ['quantos professores', 'total professores', 'professores ativos'],
      handler: async () => {
        try {
          const res = await fetch(`${getApiBase()}/dashboard/stats`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
          if (!res.ok) throw new Error();
          const data = await res.json();
          const total = data.estatisticas_gerais?.total_professores || 0;
          return { response: `Temos **${total} professor(es)** ativo(s) cadastrado(s). 👨‍🏫`, action: 'professores.html', actionLabel: 'Ver Professores' };
        } catch (_) {
          return { response: 'Não consegui buscar os dados agora.', action: null, actionLabel: null };
        }
      }
    },
    {
      keywords: ['quantas salas', 'total salas', 'salas ativas'],
      handler: async () => {
        try {
          const res = await fetch(`${getApiBase()}/dashboard/stats`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
          if (!res.ok) throw new Error();
          const data = await res.json();
          const total = data.estatisticas_gerais?.total_salas || 0;
          return { response: `Temos **${total} sala(s)** ativa(s) no sistema. 🏫`, action: 'chamada.html', actionLabel: 'Ver Salas' };
        } catch (_) {
          return { response: 'Não consegui buscar os dados agora.', action: null, actionLabel: null };
        }
      }
    }
  ];

  // Verificar se input casa com handler dinâmico
  function findDynamicHandler(input) {
    const normalized = normalize(input);
    if (!normalized) return null;
    for (const dh of dynamicHandlers) {
      for (const kw of dh.keywords) {
        const kwNorm = normalize(kw);
        if (normalized.includes(kwNorm) || kwNorm.includes(normalized)) {
          return dh.handler;
        }
      }
    }
    return null;
  }

  // Busca estática na base de conhecimento
  function findStaticResponse(input) {
    const normalized = normalize(input);
    if (!normalized) return null;

    let bestMatch = null;
    let bestScore = 0;

    for (const entry of assistantData) {
      for (const kw of entry.keywords) {
        const kwNorm = normalize(kw);
        if (normalized.includes(kwNorm) || kwNorm.includes(normalized)) {
          const score = kwNorm.split(' ').filter(w => normalized.includes(w)).length;
          if (score > bestScore) {
            bestScore = score;
            bestMatch = entry;
          }
        }
      }
    }

    return bestMatch;
  }

  // Busca combinada: dinâmica primeiro, depois estática
  async function findResponse(input) {
    const dynamicHandler = findDynamicHandler(input);
    if (dynamicHandler) {
      const result = await dynamicHandler();
      return result;
    }
    return findStaticResponse(input);
  }

  function resolveAction(action) {
    if (!action) return null;
    if (action.startsWith('http') || action.startsWith('/')) return action;
    const currentPath = window.location.pathname;
    if (currentPath.includes('/pages/')) return action;
    return 'pages/' + action;
  }

  function saveHistory() {
    try {
      const toSave = state.messages.slice(-50);
      localStorage.setItem('assistant_history', JSON.stringify(toSave));
    } catch (_) { /* ignora */ }
  }

  // Formatar texto com markdown simples (**bold** e \n)
  function formatText(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  // --- Som sutil (Web Audio API) ---
  let audioCtx = null;
  function playSound(type) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'open') {
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } else if (type === 'close') {
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } else if (type === 'message') {
        osc.frequency.setValueAtTime(500, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
      }
    } catch (_) { /* ignora se não suportado */ }
  }

  // --- Emoji dinâmico baseado na página ---
  function getContextEmoji() {
    const page = getCurrentPage();
    const emojiMap = {
      'dashboard': '📊',
      'alunos': '👦',
      'chamada': '📋',
      'doacoes': '💰',
      'professores': '👨‍🏫',
      'calendario': '📅',
      'cursos': '📚',
      'acompanhamento-social': '📝',
      'documentos': '📄',
      'ponto': '⏰',
      'perfil': '👤',
      'configuracoes': '⚙️',
      'admin-usuarios': '👥',
      'auditoria': '🔍',
      'menu': '🏠'
    };
    return emojiMap[page] || '🐾';
  }

  // --- Criar UI ---
  function createUI() {
    // CSS
    if (!document.querySelector('link[href*="assistant.css"]')) {
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      const base = (document.querySelector('link[href*="global.css"]')?.href || '').replace('global.css', 'assistant.css') || '../css/assistant.css';
      css.href = base;
      document.head.appendChild(css);
    }

    // FAB (botão flutuante)
    const fab = document.createElement('button');
    fab.className = 'assistant-fab';
    fab.setAttribute('aria-label', 'Abrir Beta');
    fab.setAttribute('title', 'Beta — Assistente');
    fab.innerHTML = `
      <i class="bi bi-chat-dots-fill"></i>
      <span class="assistant-fab-badge${state.firstOpen ? ' show' : ''}"></span>
    `;
    document.body.appendChild(fab);

    // Emoji dinâmico
    const contextEmoji = getContextEmoji();

    // Janela de chat
    const win = document.createElement('div');
    win.className = 'assistant-window';
    win.innerHTML = `
      <div class="assistant-header">
        <div class="assistant-header-info">
          <div class="assistant-header-avatar">${contextEmoji}</div>
          <div class="assistant-header-text">
            <h4>Beta</h4>
            <span class="assistant-header-status">Online • Sempre por aqui</span>
          </div>
        </div>
        <div class="assistant-header-actions">
          <button class="assistant-header-clear" aria-label="Limpar conversa" title="Limpar conversa">
            <i class="bi bi-trash3"></i>
          </button>
          <button class="assistant-header-close" aria-label="Fechar">&times;</button>
        </div>
      </div>
      <div class="assistant-body" id="assistantBody"></div>
      <div class="assistant-input-area">
        <input class="assistant-input" id="assistantInput" type="text"
               placeholder="Digite sua dúvida..." autocomplete="off" />
        <button class="assistant-send-btn" id="assistantSend" aria-label="Enviar">
          <i class="bi bi-send-fill"></i>
        </button>
      </div>
    `;
    document.body.appendChild(win);

    // Refs
    const body = win.querySelector('#assistantBody');
    const input = win.querySelector('#assistantInput');
    const sendBtn = win.querySelector('#assistantSend');
    const closeBtn = win.querySelector('.assistant-header-close');
    const clearBtn = win.querySelector('.assistant-header-clear');
    const badge = fab.querySelector('.assistant-fab-badge');
    const avatar = win.querySelector('.assistant-header-avatar');
    const statusSpan = win.querySelector('.assistant-header-status');

    // --- Renderizar mensagens ---
    function renderMessages() {
      body.innerHTML = '';
      state.messages.forEach(msg => {
        appendMessageEl(msg.role, msg.text, msg.action, msg.actionLabel, false);
      });
      scrollToBottom();
    }

    function appendMessageEl(role, text, action, actionLabel, animate) {
      const el = document.createElement('div');
      el.className = `assistant-msg ${role}`;
      if (!animate) el.style.animation = 'none';

      let html = formatText(text);
      if (role === 'bot' && action) {
        const resolvedAction = resolveAction(action);
        html += `<br><button class="assistant-action-btn" data-action="${resolvedAction}">
          ${actionLabel || 'Ir para página'} <i class="bi bi-arrow-right"></i>
        </button>`;
      }
      el.innerHTML = html;

      const actionBtn = el.querySelector('.assistant-action-btn');
      if (actionBtn) {
        actionBtn.addEventListener('click', () => {
          window.location.href = actionBtn.dataset.action;
        });
      }

      body.appendChild(el);
      return el;
    }

    function showTyping() {
      const el = document.createElement('div');
      el.className = 'assistant-typing';
      el.id = 'assistantTyping';
      el.innerHTML = '<span></span><span></span><span></span>';
      body.appendChild(el);
      scrollToBottom();
      return el;
    }

    function removeTyping() {
      const el = body.querySelector('#assistantTyping');
      if (el) el.remove();
    }

    function scrollToBottom() {
      requestAnimationFrame(() => {
        body.scrollTop = body.scrollHeight;
      });
    }

    function showSuggestions() {
      const suggestions = getContextSuggestions();
      if (!suggestions || suggestions.length === 0) return;

      const container = document.createElement('div');
      container.className = 'assistant-suggestions';
      suggestions.forEach(s => {
        const chip = document.createElement('button');
        chip.className = 'assistant-suggestion-chip';
        chip.textContent = s.label;
        chip.addEventListener('click', () => {
          container.remove();
          handleSend(s.query);
        });
        container.appendChild(chip);
      });
      body.appendChild(container);
      scrollToBottom();
    }

    function clearConversation() {
      state.messages = [];
      state.firstOpen = true;
      localStorage.removeItem('assistant_history');
      body.innerHTML = '';

      // Nova mensagem de boas-vindas
      const welcomeText = buildWelcomeMessage();
      state.messages.push({ role: 'bot', text: welcomeText, action: null, actionLabel: null });
      state.firstOpen = false;
      renderMessages();
      showSuggestions();
      saveHistory();
    }

    // --- Enviar mensagem ---
    async function handleSend(overrideText) {
      const text = overrideText || input.value.trim();
      if (!text) return;

      // Remover sugestões se existirem
      const chips = body.querySelector('.assistant-suggestions');
      if (chips) chips.remove();

      // Resetar status
      statusSpan.textContent = 'Online • Sempre por aqui';
      statusSpan.style.opacity = '0.8';

      // Msg do usuário
      state.messages.push({ role: 'user', text });
      appendMessageEl('user', text, null, null, true);
      input.value = '';
      scrollToBottom();

      // Typing indicator
      showTyping();

      // Simular delay natural (200-500ms)
      const delay = 200 + Math.random() * 300;
      setTimeout(async () => {
        removeTyping();

        const match = await findResponse(text);
        let botText, action, actionLabel;

        if (match) {
          botText = match.response;
          action = match.action;
          actionLabel = match.actionLabel;
        } else {
          botText = 'Hmm, não entendi muito bem. 🤔 Tente perguntar de outra forma, como "como fazer chamada" ou "onde vejo alunos". Estou aqui pra te ajudar!';
          action = null;
          actionLabel = null;
        }

        state.messages.push({ role: 'bot', text: botText, action, actionLabel });
        appendMessageEl('bot', botText, action, actionLabel, true);
        scrollToBottom();
        saveHistory();
      }, delay);
    }

    // --- Eventos ---
    fab.addEventListener('click', () => {
      state.open = !state.open;
      win.classList.toggle('open', state.open);
      fab.classList.toggle('open', state.open);

      if (state.open) {
        playSound('open');
        badge.classList.remove('show');
        if (state.firstOpen) {
          state.firstOpen = false;
          if (state.messages.length === 0) {
            const welcomeText = buildWelcomeMessage();
            state.messages.push({ role: 'bot', text: welcomeText, action: null, actionLabel: null });
          }
          renderMessages();
          showSuggestions();
          saveHistory();
        } else {
          renderMessages();
        }
        setTimeout(() => input.focus(), 100);
      }
    });

    closeBtn.addEventListener('click', () => {
      playSound('close');
      state.open = false;
      win.classList.remove('open');
      fab.classList.remove('open');
    });

    clearBtn.addEventListener('click', () => {
      clearConversation();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });

    // Indicador de "digitando"
    input.addEventListener('input', () => {
      if (input.value.trim().length > 0) {
        statusSpan.textContent = 'Digitando...';
        statusSpan.style.opacity = '0.9';
      } else {
        statusSpan.textContent = 'Online • Sempre por aqui';
        statusSpan.style.opacity = '0.8';
      }
    });

    sendBtn.addEventListener('click', () => handleSend());

    // Fechar com Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.open) {
        state.open = false;
        win.classList.remove('open');
        fab.classList.remove('open');
      }
    });
  }

  // --- Inicializar ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createUI);
  } else {
    createUI();
  }

})();
