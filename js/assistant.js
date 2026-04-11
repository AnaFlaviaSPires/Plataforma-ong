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
      ? `${greeting}, **${nome}**! 👋 Sou o **Beta**, seu assistente da plataforma.`
      : `${greeting}! 👋 Sou o **Beta**, seu assistente da plataforma.`;

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

  function findResponse(input) {
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

    // Janela de chat
    const win = document.createElement('div');
    win.className = 'assistant-window';
    win.innerHTML = `
      <div class="assistant-header">
        <div class="assistant-header-info">
          <div class="assistant-header-avatar">🐾</div>
          <div class="assistant-header-text">
            <h4>Beta</h4>
            <span>Online • Sempre por aqui</span>
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
    function handleSend(overrideText) {
      const text = overrideText || input.value.trim();
      if (!text) return;

      // Remover sugestões se existirem
      const chips = body.querySelector('.assistant-suggestions');
      if (chips) chips.remove();

      // Msg do usuário
      state.messages.push({ role: 'user', text });
      appendMessageEl('user', text, null, null, true);
      input.value = '';
      scrollToBottom();

      // Typing indicator
      showTyping();

      // Simular delay natural (200-500ms)
      const delay = 200 + Math.random() * 300;
      setTimeout(() => {
        removeTyping();

        const match = findResponse(text);
        let botText, action, actionLabel;

        if (match) {
          botText = match.response;
          action = match.action;
          actionLabel = match.actionLabel;
        } else {
          botText = 'Hmm, não entendi muito bem. 🤔 Tente algo como "como fazer chamada" ou "onde vejo alunos". Posso também te levar ao Guia da plataforma!';
          action = 'guia.html';
          actionLabel = 'Abrir Guia';
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
