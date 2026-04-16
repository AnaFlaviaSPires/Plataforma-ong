/**
 * UX Enhancements — Notificações, Breadcrumbs, Busca Global
 * Arquivo isolado, carregado globalmente via navbar.js
 */
(function () {
  'use strict';

  const API = window.API_BASE_URL || 'http://localhost:3003/api';
  function token() { return localStorage.getItem('authToken'); }
  function headers() { const h = { 'Content-Type': 'application/json' }; if (token()) h['Authorization'] = 'Bearer ' + token(); return h; }

  // ========================================================
  // NOTIFICAÇÕES
  // ========================================================
  function injectNotificationBell() {
    const navRight = document.querySelector('#navbarNav .d-flex.align-items-center');
    if (!navRight || document.getElementById('notifBell')) return;

    const bellHTML = `
      <div class="position-relative me-2" id="notifBell" style="cursor:pointer">
        <i class="bi bi-bell-fill text-white" style="font-size:1.2rem"></i>
        <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" id="notifCount" style="font-size:0.65rem;display:none">0</span>
      </div>
      <div class="dropdown-menu dropdown-menu-end shadow p-0" id="notifDropdown" style="min-width:340px;max-height:400px;overflow-y:auto;display:none;position:absolute;right:0;top:45px;z-index:1055;border-radius:12px">
        <div class="p-3 border-bottom d-flex justify-content-between align-items-center" style="background:var(--primary-color,#663399);border-radius:12px 12px 0 0">
          <span class="fw-bold text-white"><i class="bi bi-bell me-1"></i>Notificações</span>
          <button class="btn btn-sm btn-outline-light" id="notifMarcarTodas" style="font-size:0.7rem;padding:2px 8px">Marcar todas</button>
        </div>
        <div id="notifLista" class="p-0"></div>
        <div class="text-center p-2 border-top"><small class="text-muted">Atualizado automaticamente</small></div>
      </div>
    `;

    const container = document.createElement('div');
    container.className = 'position-relative';
    container.innerHTML = bellHTML;

    // Insert before home button
    const homeBtn = navRight.querySelector('.home-btn');
    if (homeBtn) {
      navRight.insertBefore(container, homeBtn);
    } else {
      navRight.prepend(container);
    }

    // Toggle dropdown
    const bell = document.getElementById('notifBell');
    const dropdown = document.getElementById('notifDropdown');
    bell.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
      if (dropdown.style.display === 'block') carregarNotificacoes();
    });

    document.addEventListener('click', (e) => {
      if (!container.contains(e.target)) dropdown.style.display = 'none';
    });

    // Marcar todas
    document.getElementById('notifMarcarTodas')?.addEventListener('click', async () => {
      try {
        await fetch(API + '/notificacoes/marcar-lida', { method: 'POST', headers: headers(), body: JSON.stringify({}) });
        carregarNotificacoes();
      } catch (e) { /* erro silencioso */ }
    });

    // Carregar ao iniciar + polling
    carregarNotificacoes();
    // Gerar automáticas
    gerarNotificacoes();
    const intervalNotif = setInterval(carregarNotificacoes, 60000);
    const intervalGerar = setInterval(gerarNotificacoes, 300000);

    // Cleanup quando a página for descarregada
    window.addEventListener('beforeunload', () => {
      clearInterval(intervalNotif);
      clearInterval(intervalGerar);
    });
  }

  async function gerarNotificacoes() {
    try { await fetch(API + '/notificacoes/gerar', { method: 'POST', headers: headers() }); } catch (e) { /* erro silencioso */ }
  }

  async function carregarNotificacoes() {
    try {
      const resp = await fetch(API + '/notificacoes?limit=15', { headers: headers() });
      if (!resp.ok) return;
      const data = await resp.json();
      const count = data.nao_lidas || 0;
      const badge = document.getElementById('notifCount');
      if (badge) {
        badge.textContent = count > 9 ? '9+' : count;
        badge.style.display = count > 0 ? '' : 'none';
      }
      renderNotificacoes(data.notificacoes || []);
    } catch (e) { console.error('Notif erro:', e); }
  }

  function renderNotificacoes(notifs) {
    const lista = document.getElementById('notifLista');
    if (!lista) return;
    if (!notifs.length) {
      lista.innerHTML = '<div class="text-center text-muted py-4"><i class="bi bi-check-circle me-1"></i>Nenhuma notificação</div>';
      return;
    }
    const tipoIcon = { cadastro_pendente: 'bi-person-plus', faltas_consecutivas: 'bi-calendar-x', alta_vulnerabilidade: 'bi-exclamation-triangle' };
    const tipoColor = { cadastro_pendente: '#0d6efd', faltas_consecutivas: '#dc3545', alta_vulnerabilidade: '#ffc107' };

    lista.innerHTML = notifs.map(n => {
      const icon = tipoIcon[n.tipo] || 'bi-info-circle';
      const color = tipoColor[n.tipo] || '#6c757d';
      const dt = new Date(n.criado_em);
      const tempo = tempoRelativo(dt);
      const bgClass = n.lida ? '' : 'background-color:rgba(102,51,153,0.04);';
      return `<div class="px-3 py-2 border-bottom notif-item" style="cursor:pointer;${bgClass}" data-link="${n.link || ''}" data-id="${n.id}">
        <div class="d-flex gap-2 align-items-start">
          <i class="bi ${icon} mt-1" style="color:${color};font-size:1.1rem"></i>
          <div class="flex-grow-1">
            <div class="small fw-medium" style="${n.lida ? 'opacity:0.7' : ''}">${n.titulo}</div>
            <div class="text-muted" style="font-size:0.72rem">${tempo}</div>
          </div>
          ${n.lida ? '' : '<span class="badge rounded-pill bg-primary" style="font-size:0.55rem;padding:3px 5px">Novo</span>'}
        </div>
      </div>`;
    }).join('');

    lista.querySelectorAll('.notif-item').forEach(item => {
      item.addEventListener('click', async () => {
        const id = item.dataset.id;
        const link = item.dataset.link;
        try { await fetch(API + '/notificacoes/marcar-lida', { method: 'POST', headers: headers(), body: JSON.stringify({ ids: [parseInt(id)] }) }); } catch (e) {}
        if (link) window.location.href = link;
      });
    });
  }

  function tempoRelativo(dt) {
    const diff = Date.now() - dt.getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return 'Agora mesmo';
    if (min < 60) return min + ' min atrás';
    const h = Math.floor(min / 60);
    if (h < 24) return h + 'h atrás';
    const d = Math.floor(h / 24);
    return d === 1 ? 'Ontem' : d + ' dias atrás';
  }

  // ========================================================
  // BREADCRUMBS
  // ========================================================
  const breadcrumbMap = {
    'menu.html': { label: 'Menu', icon: 'bi-house' },
    'alunos.html': { label: 'Alunos', icon: 'bi-person-plus' },
    'chamada.html': { label: 'Chamada', icon: 'bi-calendar-check' },
    'doacoes.html': { label: 'Doações', icon: 'bi-heart' },
    'dashboard.html': { label: 'Dashboard', icon: 'bi-graph-up' },
    'documentos.html': { label: 'Documentos', icon: 'bi-folder2-open' },
    'admin-usuarios.html': { label: 'Gestão de Usuários', icon: 'bi-people' },
    'admin-logs.html': { label: 'Logs de Auditoria', icon: 'bi-shield-check' },
    'ponto.html': { label: 'Controle de Ponto', icon: 'bi-clock-history' },
    'acompanhamento-social.html': { label: 'Acompanhamento Social', icon: 'bi-journal-medical' },
    'calendario.html': { label: 'Calendário', icon: 'bi-calendar3' },
    'guia.html': { label: 'Guia do Usuário', icon: 'bi-book' },
    'configuracoes.html': { label: 'Configurações', icon: 'bi-gear' },
    'perfil.html': { label: 'Perfil', icon: 'bi-person' }
  };

  function injectBreadcrumbs() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'menu.html';

    // Não mostrar breadcrumb no menu principal
    if (page === 'menu.html' || page === '' || page === 'index.html') return;

    const info = breadcrumbMap[page] || { label: page.replace('.html', ''), icon: 'bi-file' };

    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'breadcrumb');
    nav.className = 'container-fluid px-4 pt-2 pb-0 no-print';
    nav.innerHTML = `
      <ol class="breadcrumb mb-0 small" style="background:transparent;padding:0">
        <li class="breadcrumb-item"><a href="menu.html" class="text-decoration-none" style="color:var(--primary-color,#663399)"><i class="bi bi-house-door me-1"></i>Menu</a></li>
        <li class="breadcrumb-item active" aria-current="page"><i class="bi ${info.icon} me-1"></i>${info.label}</li>
      </ol>
    `;

    // Insert after navbar
    const navbar = document.querySelector('nav.navbar');
    if (navbar && navbar.nextSibling) {
      navbar.parentNode.insertBefore(nav, navbar.nextSibling);
    }
  }

  // ========================================================
  // BUSCA GLOBAL
  // ========================================================
  function injectGlobalSearch() {
    const navRight = document.querySelector('#navbarNav .d-flex.align-items-center');
    if (!navRight || document.getElementById('globalSearchWrap')) return;

    const searchHTML = `
      <div class="position-relative me-2 d-none d-md-block" id="globalSearchWrap">
        <input type="search" class="form-control form-control-sm" id="globalSearchInput" placeholder="Buscar..." autocomplete="off" name="globalSearch" style="width:200px;border-radius:20px;padding-left:32px;font-size:0.8rem;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.25);color:#fff">
        <i class="bi bi-search position-absolute" style="left:10px;top:50%;transform:translateY(-50%);color:rgba(255,255,255,0.6);font-size:0.8rem"></i>
        <div id="globalSearchResults" class="dropdown-menu shadow p-0" style="min-width:350px;max-height:400px;overflow-y:auto;display:none;position:absolute;top:38px;right:0;z-index:1055;border-radius:12px"></div>
      </div>
    `;

    const container = document.createElement('div');
    container.innerHTML = searchHTML;
    const wrap = container.firstElementChild;

    // Insert before notification bell
    const notifBell = navRight.querySelector('#notifBell')?.parentElement;
    if (notifBell) {
      navRight.insertBefore(wrap, notifBell);
    } else {
      const homeBtn = navRight.querySelector('.home-btn');
      if (homeBtn) navRight.insertBefore(wrap, homeBtn);
      else navRight.prepend(wrap);
    }

    const input = document.getElementById('globalSearchInput');
    const results = document.getElementById('globalSearchResults');
    let debounce = null;

    input.addEventListener('input', () => {
      clearTimeout(debounce);
      const q = input.value.trim();
      if (q.length < 2) { results.style.display = 'none'; return; }
      debounce = setTimeout(() => buscarGlobal(q), 300);
    });

    input.addEventListener('focus', () => {
      if (input.value.trim().length >= 2) results.style.display = 'block';
    });

    document.addEventListener('click', (e) => {
      if (!wrap.contains(e.target)) results.style.display = 'none';
    });

    // Style placeholder for dark input
    input.addEventListener('focus', function() { this.style.background = 'rgba(255,255,255,0.25)'; });
    input.addEventListener('blur', function() { this.style.background = 'rgba(255,255,255,0.15)'; });
  }

  async function buscarGlobal(q) {
    const results = document.getElementById('globalSearchResults');
    if (!results) return;
    results.innerHTML = '<div class="text-center py-3"><div class="spinner-border spinner-border-sm text-primary"></div></div>';
    results.style.display = 'block';

    try {
      const resp = await fetch(API + '/busca-global?q=' + encodeURIComponent(q), { headers: headers() });
      if (!resp.ok) throw new Error();
      const data = await resp.json();
      renderSearchResults(data, q);
    } catch (e) {
      results.innerHTML = '<div class="text-center text-muted py-3">Erro ao buscar</div>';
    }
  }

  function renderSearchResults(data, q) {
    const results = document.getElementById('globalSearchResults');
    if (!results) return;

    let html = '';
    const categorias = [
      { key: 'alunos', label: 'Alunos', icon: 'bi-person', link: 'alunos.html' },
      { key: 'prontuarios', label: 'Prontuários', icon: 'bi-journal-medical', link: 'acompanhamento-social.html' },
      { key: 'doacoes', label: 'Doações', icon: 'bi-heart', link: 'doacoes.html' }
    ];

    let total = 0;
    categorias.forEach(cat => {
      const items = data[cat.key] || [];
      if (!items.length) return;
      total += items.length;
      html += `<div class="px-3 py-1 bg-light border-bottom"><small class="fw-bold text-muted text-uppercase"><i class="bi ${cat.icon} me-1"></i>${cat.label}</small></div>`;
      items.forEach(item => {
        const nome = highlight(item.nome || item.nome_completo || item.nome_doador || '-', q);
        const sub = item.sub || '';
        html += `<a href="${cat.link}" class="d-block px-3 py-2 text-decoration-none border-bottom search-result-item" style="color:inherit">
          <div class="small fw-medium">${nome}</div>
          ${sub ? '<div class="text-muted" style="font-size:0.72rem">' + sub + '</div>' : ''}
        </a>`;
      });
    });

    if (total === 0) {
      html = '<div class="text-center text-muted py-4"><i class="bi bi-search me-1"></i>Nenhum resultado para "' + escapeHtml(q) + '"</div>';
    }

    results.innerHTML = html;
  }

  function highlight(text, q) {
    if (!q) return escapeHtml(text);
    const regex = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
    return escapeHtml(text).replace(regex, '<mark>$1</mark>');
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ========================================================
  // RESPONSIVE HELPERS
  // ========================================================

  // Injetar data-label nas tabelas para modo card mobile
  function setupTableCards() {
    document.querySelectorAll('.table-responsive').forEach(wrap => {
      const table = wrap.querySelector('table');
      if (!table) return;
      const headers = [];
      table.querySelectorAll('thead th').forEach(th => headers.push(th.textContent.trim()));
      if (headers.length === 0) return;
      table.querySelectorAll('tbody tr').forEach(tr => {
        tr.querySelectorAll('td').forEach((td, i) => {
          if (headers[i] && !td.getAttribute('data-label')) {
            td.setAttribute('data-label', headers[i]);
          }
        });
      });
      // Adicionar classe para ativar CSS card mobile
      wrap.classList.add('table-cards-mobile');
    });
  }

  // Observar tabelas que são preenchidas dinamicamente
  function observeTableCards() {
    const observer = new MutationObserver(() => { setupTableCards(); });
    document.querySelectorAll('.table-responsive tbody').forEach(tbody => {
      observer.observe(tbody, { childList: true, subtree: true });
    });
    // Também observar novos table-responsive adicionados
    const bodyObs = new MutationObserver((muts) => {
      muts.forEach(m => {
        m.addedNodes.forEach(n => {
          if (n.nodeType === 1) {
            const wraps = n.classList?.contains('table-responsive') ? [n] : n.querySelectorAll?.('.table-responsive') || [];
            wraps.forEach(w => {
              w.classList.add('table-cards-mobile');
              const tbody = w.querySelector('tbody');
              if (tbody) observer.observe(tbody, { childList: true, subtree: true });
            });
          }
        });
      });
    });
    bodyObs.observe(document.body, { childList: true, subtree: true });
  }

  // Filtros colapsáveis: envolver filtros em wrapper + botão toggle
  function setupCollapsibleFilters() {
    // Busca wrappers de filtro comuns: rows com inputs/selects antes de tabelas
    const filterCandidates = document.querySelectorAll(
      '.donation-filters, #telaLista .card-body > .row.g-2'
    );
    filterCandidates.forEach((filterRow, idx) => {
      if (filterRow.querySelector('.mobile-filter-toggle')) return;
      const id = 'mobileFilter' + idx;
      filterRow.classList.add('mobile-filter-collapse');
      filterRow.id = id;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-outline-secondary btn-sm mobile-filter-toggle mb-2';
      btn.innerHTML = '<i class="bi bi-funnel me-1"></i>Filtros';
      btn.addEventListener('click', () => {
        filterRow.classList.toggle('show');
        btn.innerHTML = filterRow.classList.contains('show')
          ? '<i class="bi bi-x me-1"></i>Fechar filtros'
          : '<i class="bi bi-funnel me-1"></i>Filtros';
      });
      filterRow.parentNode.insertBefore(btn, filterRow);
    });
  }

  // ========================================================
  // INIT — executa após navbar ser injetada
  // ========================================================
  function init() {
    // Responsive helpers (sempre, mesmo sem login)
    setupTableCards();
    observeTableCards();
    setupCollapsibleFilters();

    if (!token()) return;
    // Aguardar navbar existir
    const check = setInterval(() => {
      if (document.querySelector('#navbarNav .d-flex.align-items-center')) {
        clearInterval(check);
        injectGlobalSearch();
        injectNotificationBell();
        injectBreadcrumbs();
      }
    }, 100);
    // Safety timeout
    setTimeout(() => clearInterval(check), 5000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
