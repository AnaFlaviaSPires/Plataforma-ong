// ============================================================
// Módulo Doações - Frontend Completo
// ============================================================
(function() {
  'use strict';

  const API = window.API_BASE_URL || 'http://localhost:3003/api';

  function getToken() { return localStorage.getItem('authToken'); }

  function getHeaders() {
    const h = { 'Content-Type': 'application/json' };
    const t = getToken();
    if (t) h['Authorization'] = 'Bearer ' + t;
    return h;
  }

  function getUserData() {
    try { return JSON.parse(localStorage.getItem('userData') || '{}'); } catch { return {}; }
  }

  function showToast(msg, type) {
    const el = document.getElementById('doacaoToast');
    const m = document.getElementById('doacaoToastMsg');
    if (!el || !m) return;
    el.className = 'toast align-items-center border-0 text-white bg-' + (type || 'primary');
    m.textContent = msg;
    new bootstrap.Toast(el, { delay: 3500 }).show();
  }

  function formatMoeda(v) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
  }

  function formatDate(d) {
    if (!d) return '-';
    const dt = new Date(d);
    return dt.toLocaleDateString('pt-BR');
  }

  function formatDateInput(d) {
    if (!d) return '';
    const dt = new Date(d);
    const year = dt.getFullYear();
    const month = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const TIPO_LABELS = {
    'dinheiro': 'Dinheiro',
    'pix': 'Pix',
    'alimentos': 'Alimentos',
    'vestuario': 'Vestuário',
    'material_higiene': 'Material de Higiene',
    'material_escolar': 'Material Escolar',
    'brindes': 'Brindes',
    'outros': 'Outros'
  };

  const TIPO_BADGES = {
    'dinheiro': 'bg-success',
    'pix': 'bg-info text-dark',
    'alimentos': 'bg-warning text-dark',
    'vestuario': 'bg-primary',
    'material_higiene': 'bg-secondary',
    'material_escolar': 'bg-dark',
    'brindes': 'bg-danger',
    'outros': 'bg-secondary'
  };

  const TIPOS_MONETARIOS = ['dinheiro', 'pix'];

  // ---- Máscara monetária ----
  function aplicarMascaraMonetaria(input) {
    if (!input) return;
    input.addEventListener('input', function(e) {
      let v = e.target.value.replace(/\D/g, '');
      if (!v) { e.target.value = ''; return; }
      while (v.length < 3) v = '0' + v;
      const inteiro = v.slice(0, -2);
      const centavos = v.slice(-2);
      e.target.value = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + centavos;
    });
  }

  function parseMoeda(str) {
    if (!str) return 0;
    return parseFloat(str.replace(/\./g, '').replace(',', '.')) || 0;
  }

  // ---- API ----
  async function apiGet(endpoint) {
    const r = await fetch(API + endpoint, { headers: getHeaders() });
    if (!r.ok) { const d = await r.json().catch(() => ({})); throw new Error(d.error || 'Erro na requisição'); }
    return r.json();
  }

  async function apiPost(endpoint, body) {
    const r = await fetch(API + endpoint, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error || 'Erro ao salvar');
    return d;
  }

  async function apiPut(endpoint, body) {
    const r = await fetch(API + endpoint, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(body) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error || 'Erro ao atualizar');
    return d;
  }

  async function apiDelete(endpoint) {
    const r = await fetch(API + endpoint, { method: 'DELETE', headers: getHeaders() });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error || 'Erro ao excluir');
    return d;
  }

  // ---- Renderização ----
  function renderTabela(doacoes) {
    const tbody = document.getElementById('tabelaDoacoes');
    const empty = document.getElementById('emptyState');
    const tableCard = document.querySelector('.donation-table');
    if (!tbody) return;

    if (!doacoes || !doacoes.length) {
      tbody.innerHTML = '';
      if (tableCard) tableCard.classList.add('d-none');
      if (empty) empty.classList.remove('d-none');
      return;
    }

    if (tableCard) tableCard.classList.remove('d-none');
    if (empty) empty.classList.add('d-none');

    tbody.innerHTML = doacoes.map(d => {
      const valorQtd = TIPOS_MONETARIOS.includes(d.tipo)
        ? formatMoeda(d.valor)
        : (d.quantidade ? d.quantidade + ' un.' : '-');

      return `<tr>
        <td>${formatDate(d.data_doacao)}</td>
        <td>${d.nome_doador || '<span class="text-muted">Anônimo</span>'}</td>
        <td><span class="badge ${TIPO_BADGES[d.tipo] || 'bg-secondary'}">${TIPO_LABELS[d.tipo] || d.tipo}</span></td>
        <td>${valorQtd}</td>
        <td><small>${d.observacoes || d.descricao_itens || '-'}</small></td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-primary me-1 btn-editar" data-id="${d.id}" title="Editar"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-sm btn-outline-danger btn-excluir" data-id="${d.id}" title="Excluir"><i class="bi bi-trash"></i></button>
        </td>
      </tr>`;
    }).join('');

    // Event listeners
    tbody.querySelectorAll('.btn-editar').forEach(btn => {
      btn.addEventListener('click', () => abrirEdicao(doacoes.find(d => d.id == btn.dataset.id)));
    });
    tbody.querySelectorAll('.btn-excluir').forEach(btn => {
      btn.addEventListener('click', () => abrirExclusao(btn.dataset.id));
    });
  }

  function renderStats(stats) {
    if (!stats) return;
    const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
    el('statTotal', stats.total_geral || 0);
    el('statValor', formatMoeda(stats.valor_geral || 0));
    el('statTipos', (stats.por_tipo || []).length);
    el('statMes', stats.total_periodo || 0);
  }

  // ---- Formulário dinâmico ----
  function toggleCamposFormulario(tipo) {
    const campoValor = document.getElementById('campoValor');
    const campoQtd = document.getElementById('campoQuantidade');

    if (!tipo) {
      if (campoValor) campoValor.classList.add('d-none');
      if (campoQtd) campoQtd.classList.add('d-none');
      return;
    }

    if (TIPOS_MONETARIOS.includes(tipo)) {
      if (campoValor) campoValor.classList.remove('d-none');
      if (campoQtd) campoQtd.classList.add('d-none');
    } else {
      if (campoValor) campoValor.classList.add('d-none');
      if (campoQtd) campoQtd.classList.remove('d-none');
    }
  }

  function limparFormulario() {
    document.getElementById('doacaoId').value = '';
    document.getElementById('formDoacao').reset();
    const dt = new Date();
    const year = dt.getFullYear();
    const month = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    document.getElementById('doacaoData').value = `${year}-${month}-${day}`;
    toggleCamposFormulario('');
    document.getElementById('modalDoacaoTitulo').innerHTML = '<i class="bi bi-plus-circle me-2"></i>Cadastrar Doação';
  }

  function abrirEdicao(doacao) {
    if (!doacao) return;
    document.getElementById('modalDoacaoTitulo').innerHTML = '<i class="bi bi-pencil me-2"></i>Editar Doação';
    document.getElementById('doacaoId').value = doacao.id;
    document.getElementById('doacaoData').value = formatDateInput(doacao.data_doacao);
    document.getElementById('doacaoDoador').value = doacao.nome_doador || '';
    document.getElementById('doacaoTipo').value = doacao.tipo;
    toggleCamposFormulario(doacao.tipo);

    if (TIPOS_MONETARIOS.includes(doacao.tipo)) {
      const val = parseFloat(doacao.valor || 0);
      const cents = Math.round(val * 100).toString();
      const inteiro = cents.slice(0, -2) || '0';
      document.getElementById('doacaoValor').value = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + cents.slice(-2).padStart(2, '0');
    } else {
      document.getElementById('doacaoQuantidade').value = doacao.quantidade || '';
    }

    document.getElementById('doacaoObs').value = doacao.observacoes || doacao.descricao_itens || '';
    new bootstrap.Modal(document.getElementById('modalDoacao')).show();
  }

  function abrirExclusao(id) {
    document.getElementById('excluirDoacaoId').value = id;
    new bootstrap.Modal(document.getElementById('modalExcluir')).show();
  }

  // ---- Ações ----
  async function salvarDoacao() {
    const id = document.getElementById('doacaoId').value;
    const tipo = document.getElementById('doacaoTipo').value;
    const data_doacao = document.getElementById('doacaoData').value;
    const nome_doador = document.getElementById('doacaoDoador').value.trim();
    const observacoes = document.getElementById('doacaoObs').value.trim();

    if (!tipo) { showToast('Selecione o tipo de doação.', 'warning'); return; }

    let valor = null, quantidade = null;
    if (TIPOS_MONETARIOS.includes(tipo)) {
      valor = parseMoeda(document.getElementById('doacaoValor').value);
      if (!valor || valor <= 0) { showToast('Informe o valor da doação.', 'warning'); return; }
    } else {
      quantidade = parseInt(document.getElementById('doacaoQuantidade').value) || 0;
      if (quantidade <= 0) { showToast('Informe a quantidade doada.', 'warning'); return; }
    }

    const payload = { tipo, nome_doador, valor, quantidade, observacoes, data_doacao };

    try {
      if (id) {
        await apiPut('/doacoes/' + id, payload);
        showToast('Doação atualizada com sucesso!', 'success');
      } else {
        await apiPost('/doacoes', payload);
        showToast('Doação registrada com sucesso!', 'success');
      }

      bootstrap.Modal.getInstance(document.getElementById('modalDoacao'))?.hide();
      limparFormulario();
      await carregarDados();
    } catch (e) {
      showToast(e.message, 'danger');
    }
  }

  async function excluirDoacao() {
    const id = document.getElementById('excluirDoacaoId').value;
    if (!id) return;

    try {
      await apiDelete('/doacoes/' + id);
      showToast('Doação excluída com sucesso!', 'success');
      bootstrap.Modal.getInstance(document.getElementById('modalExcluir'))?.hide();
      await carregarDados();
    } catch (e) {
      showToast(e.message, 'danger');
    }
  }

  // ---- Carregamento ----
  async function carregarDados() {
    const search = document.getElementById('filtroSearch')?.value || '';
    const tipo = document.getElementById('filtroTipo')?.value || '';
    const dataInicio = document.getElementById('filtroDataInicio')?.value || '';
    const dataFim = document.getElementById('filtroDataFim')?.value || '';

    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (tipo) params.append('tipo', tipo);
    if (dataInicio) params.append('dataInicio', dataInicio);
    if (dataFim) params.append('dataFim', dataFim);
    params.append('limit', '200');

    try {
      const [listData, statsData] = await Promise.all([
        apiGet('/doacoes?' + params.toString()),
        apiGet('/doacoes/estatisticas')
      ]);
      renderTabela(listData.doacoes || []);
      renderStats(statsData);
    } catch (e) {
      console.error('Erro ao carregar doações:', e);
      showToast('Erro ao carregar dados.', 'danger');
    }
  }

  // ---- Inicialização ----
  document.addEventListener('DOMContentLoaded', async () => {
    const token = getToken();
    if (!token) { window.location.href = '../index.html'; return; }

    const userData = getUserData();
    const cargo = (userData.cargo || '').toLowerCase();
    const permitido = ['admin', 'secretaria'].includes(cargo);

    document.getElementById('loadingScreen').classList.add('d-none');

    if (!permitido) {
      document.getElementById('acessoNegado').classList.remove('d-none');
      return;
    }

    document.getElementById('conteudoPrincipal').classList.remove('d-none');

    // Data padrão no formulário
    const dt = new Date();
    const year = dt.getFullYear();
    const month = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    document.getElementById('doacaoData').value = `${year}-${month}-${day}`;

    // Máscara monetária
    aplicarMascaraMonetaria(document.getElementById('doacaoValor'));

    // Toggle campos conforme tipo
    document.getElementById('doacaoTipo')?.addEventListener('change', e => toggleCamposFormulario(e.target.value));

    // Salvar
    document.getElementById('btnSalvarDoacao')?.addEventListener('click', salvarDoacao);

    // Excluir
    document.getElementById('btnConfirmarExcluir')?.addEventListener('click', excluirDoacao);

    // Filtros
    document.getElementById('btnFiltrar')?.addEventListener('click', carregarDados);
    document.getElementById('btnLimparFiltros')?.addEventListener('click', () => {
      ['filtroSearch', 'filtroTipo', 'filtroDataInicio', 'filtroDataFim'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      carregarDados();
    });

    // Limpar form ao abrir modal para novo
    document.getElementById('btnNovaDoacao')?.addEventListener('click', limparFormulario);

    // Limpar form ao fechar modal
    document.getElementById('modalDoacao')?.addEventListener('hidden.bs.modal', limparFormulario);

    // Carregar dados
    await carregarDados();
  });
})();