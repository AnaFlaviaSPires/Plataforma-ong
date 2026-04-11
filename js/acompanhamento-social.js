(function () {
  'use strict';

  const API = window.API_BASE_URL || 'http://localhost:3003/api';
  function token() { return localStorage.getItem('authToken'); }
  function headers() { const h = { 'Content-Type': 'application/json' }; if (token()) h['Authorization'] = 'Bearer ' + token(); return h; }
  function userData() { try { return JSON.parse(localStorage.getItem('userData') || '{}'); } catch { return {}; } }

  // ---- Verificação de acesso ----
  function verificarAcesso() {
    const u = userData();
    if (!token() || !u.cargo) { window.location.href = '../index.html'; return false; }
    if (u.cargo !== 'assistente_social' && u.cargo !== 'admin') {
      document.getElementById('appSocial').innerHTML = '<div class="text-center py-5"><h4 class="text-danger"><i class="bi bi-shield-x me-2"></i>Acesso Negado</h4><p>Este módulo é exclusivo para Assistentes Sociais.</p><a href="menu.html" class="btn btn-primary btn-sm mt-2">Voltar ao Menu</a></div>';
      return false;
    }
    return true;
  }

  // ---- Toast ----
  function showToast(msg, type) {
    const t = document.getElementById('socialToast');
    const m = document.getElementById('socialToastMsg');
    if (!t || !m) return;
    t.className = 'toast align-items-center border-0 text-white bg-' + (type || 'primary');
    m.textContent = msg;
    new bootstrap.Toast(t, { delay: 3500 }).show();
  }

  // ---- Helpers ----
  function calcIdade(dataNasc) {
    if (!dataNasc) return '-';
    const h = new Date(), n = new Date(dataNasc);
    let a = h.getFullYear() - n.getFullYear();
    if (h.getMonth() < n.getMonth() || (h.getMonth() === n.getMonth() && h.getDate() < n.getDate())) a--;
    return a >= 0 ? a + ' anos' : '-';
  }

  function fmtMoeda(v) { return parseFloat(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
  function fmtData(d) { if (!d) return '-'; return new Date(d).toLocaleDateString('pt-BR'); }
  function fmtDataHora(d) { if (!d) return '-'; const dt = new Date(d); return dt.toLocaleDateString('pt-BR') + ' ' + dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); }

  // ---- State ----
  let currentId = null;
  let alunosList = [];
  let familiaRows = [];
  let despesaRows = [];
  let respRows = [];

  // ---- API ----
  async function apiGet(url) {
    const r = await fetch(API + url, { headers: headers() });
    if (r.status === 403) { showToast('Acesso negado', 'danger'); throw new Error('403'); }
    if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || 'Erro na requisição');
    return r.json();
  }
  async function apiPost(url, body) {
    const r = await fetch(API + url, { method: 'POST', headers: headers(), body: JSON.stringify(body) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error || 'Erro ao salvar');
    return d;
  }
  async function apiPut(url, body) {
    const r = await fetch(API + url, { method: 'PUT', headers: headers(), body: JSON.stringify(body) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error || 'Erro ao atualizar');
    return d;
  }
  async function apiDelete(url) {
    const r = await fetch(API + url, { method: 'DELETE', headers: headers() });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error || 'Erro ao excluir');
    return d;
  }

  // ---- LISTA ----
  async function carregarLista(page) {
    const busca = document.getElementById('filtroBusca')?.value || '';
    const oficina = document.getElementById('filtroOficina')?.value || '';
    const vuln = document.getElementById('filtroVuln')?.value || '';
    const status = document.getElementById('filtroStatus')?.value || '';
    const params = new URLSearchParams();
    if (busca) params.set('busca', busca);
    if (oficina) params.set('oficina', oficina);
    if (vuln) params.set('vulnerabilidade', vuln);
    if (status) params.set('status', status);
    params.set('page', page || 1);

    try {
      const data = await apiGet('/social?' + params.toString());
      renderLista(data.prontuarios || [], data.pagination);
    } catch (e) {
      showToast(e.message, 'danger');
    }
  }

  function renderLista(prontuarios, pag) {
    const tbody = document.getElementById('tabelaProntuarios');
    if (!prontuarios.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">Nenhum prontuário encontrado</td></tr>';
      document.getElementById('paginacao').innerHTML = '';
      return;
    }

    let html = '';
    prontuarios.forEach(p => {
      const idade = calcIdade(p.data_nascimento);
      const vulnClass = 'badge-vuln-' + (p.vulnerabilidade || 'baixa');
      const statusClass = 'badge-status-' + (p.status || 'ativo');
      const rowClass = p.vulnerabilidade === 'alta' ? 'row-alta-vulnerabilidade' : '';
      const doencaClass = p.saude && (p.saude.doencas || '').trim() ? 'row-doenca-cronica' : '';
      html += `<tr class="${rowClass} ${doencaClass}" style="cursor:pointer" data-id="${p.id}">
        <td class="fw-medium">${p.nome_completo}</td>
        <td>${idade}</td>
        <td>${p.oficina || '-'}</td>
        <td><span class="badge ${statusClass}">${p.status}</span></td>
        <td><span class="badge ${vulnClass}">${p.vulnerabilidade || 'baixa'}</span></td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-primary btn-abrir" data-id="${p.id}" title="Abrir"><i class="bi bi-eye"></i></button>
        </td>
      </tr>`;
    });
    tbody.innerHTML = html;

    tbody.querySelectorAll('tr[data-id]').forEach(tr => {
      tr.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        abrirProntuario(tr.dataset.id);
      });
    });
    tbody.querySelectorAll('.btn-abrir').forEach(btn => {
      btn.addEventListener('click', () => abrirProntuario(btn.dataset.id));
    });

    // Paginação
    if (pag && pag.totalPages > 1) {
      let ph = '<nav><ul class="pagination pagination-sm justify-content-center">';
      for (let i = 1; i <= pag.totalPages; i++) {
        ph += `<li class="page-item ${i === pag.page ? 'active' : ''}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
      }
      ph += '</ul></nav>';
      const nav = document.getElementById('paginacao');
      nav.innerHTML = ph;
      nav.querySelectorAll('.page-link').forEach(a => {
        a.addEventListener('click', (e) => { e.preventDefault(); carregarLista(a.dataset.page); });
      });
    } else {
      document.getElementById('paginacao').innerHTML = '';
    }

    // Extrair oficinas únicas para filtro
    const oficinas = [...new Set(prontuarios.map(p => p.oficina).filter(Boolean))].sort();
    const sel = document.getElementById('filtroOficina');
    const current = sel.value;
    sel.innerHTML = '<option value="">Todas as oficinas</option>';
    oficinas.forEach(o => { sel.innerHTML += `<option value="${o}" ${o === current ? 'selected' : ''}>${o}</option>`; });
  }

  // ---- PRONTUÁRIO ----
  function mostrarTela(nome) {
    document.getElementById('telaLista').style.display = nome === 'lista' ? '' : 'none';
    document.getElementById('telaProntuario').style.display = nome === 'prontuario' ? '' : 'none';
    document.getElementById('btnVoltar').style.display = nome === 'prontuario' ? '' : 'none';
    document.getElementById('btnNovo').style.display = nome === 'lista' ? '' : 'none';
  }

  async function abrirProntuario(id) {
    try {
      const data = await apiGet('/social/' + id);
      currentId = id;
      preencherForm(data.prontuario, data.calculados);
      document.getElementById('btnExcluir').style.display = '';
      document.getElementById('btnRenovar').style.display = '';
      mostrarTela('prontuario');
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) { showToast(e.message, 'danger'); }
  }

  function novoProntuario() {
    currentId = null;
    limparForm();
    document.getElementById('btnExcluir').style.display = 'none';
    document.getElementById('btnRenovar').style.display = 'none';
    mostrarTela('prontuario');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function preencherForm(p, calc) {
    document.getElementById('prontuarioId').value = p.id;
    document.getElementById('pNome').value = p.nome_completo || '';
    document.getElementById('pDataNasc').value = p.data_nascimento || '';
    document.getElementById('pIdade').value = calcIdade(p.data_nascimento);
    document.getElementById('pRg').value = p.rg || '';
    document.getElementById('pCpf').value = p.cpf || '';
    document.getElementById('pNis').value = p.nis || '';
    document.getElementById('pAlunoId').value = p.aluno_id || '';
    document.getElementById('pEscola').value = p.escola || '';
    document.getElementById('pPeriodoEscolar').value = p.periodo_escolar || '';
    document.getElementById('pOficina').value = p.oficina || '';
    document.getElementById('pPeriodoOficina').value = p.periodo_oficina || '';
    document.getElementById('pNomeMae').value = p.nome_mae || '';
    document.getElementById('pNomePai').value = p.nome_pai || '';
    document.getElementById('pEndereco').value = p.endereco || '';
    document.getElementById('pTelefones').value = p.telefones || '';
    document.getElementById('pSairSozinho').value = p.pode_sair_sozinho ? 'true' : 'false';
    document.getElementById('pQuemBusca').value = p.quem_busca || '';
    document.getElementById('pCamiseta').value = p.tamanho_camiseta || '';
    document.getElementById('pShort').value = p.tamanho_short || '';
    document.getElementById('pCalcado').value = p.tamanho_calcado || '';
    document.getElementById('pObs').value = p.observacoes || '';

    // Saúde
    const s = p.saude || {};
    document.getElementById('pAlergias').value = s.alergias || '';
    document.getElementById('pDoencas').value = s.doencas || '';
    document.getElementById('pMedicacao').value = s.medicacao || '';
    document.getElementById('pTratamentos').value = s.tratamentos || '';
    document.getElementById('pVacinacao').value = s.vacinacao || '';

    // Moradia
    const m = p.moradia || {};
    document.getElementById('pTipoMoradia').value = m.tipo || '';
    document.getElementById('pComodos').value = m.comodos || '';
    document.getElementById('pZona').value = m.zona || '';
    document.getElementById('infraAgua').checked = !!m.agua;
    document.getElementById('infraLuz').checked = !!m.luz;
    document.getElementById('infraEsgoto').checked = !!m.esgoto;
    document.getElementById('infraLixo').checked = !!m.lixo;
    document.getElementById('infraInternet').checked = !!m.internet;

    // Avaliação
    const av = p.avaliacao || {};
    document.getElementById('pParecer').value = av.parecer || '';
    document.getElementById('pVulnerabilidade').value = p.vulnerabilidade || 'baixa';
    document.querySelectorAll('.chk-necessidade').forEach(c => { c.checked = (av.necessidades || []).includes(c.value); });

    // Família
    familiaRows = (p.familia || []).map(f => ({ nome: f.nome, parentesco: f.parentesco, nascimento: f.nascimento, escolaridade: f.escolaridade, profissao: f.profissao, situacao: f.situacao, renda: f.renda }));
    renderFamilia();

    // Despesas
    despesaRows = (p.despesas || []).map(d => ({ tipo: d.tipo, valor: d.valor }));
    renderDespesas();

    // Responsáveis
    respRows = (p.responsaveis || []).map(r => ({ nome: r.nome, relacao: r.relacao, telefone: r.telefone }));
    renderResponsaveis();

    // Histórico
    renderHistorico(p.historico || []);

    // Anexos
    renderAnexos(p.anexos || []);

    // Declaração
    document.getElementById('pDeclaracaoAceita').checked = !!p.declaracao_aceita;
    document.getElementById('pDeclaracaoResp').value = p.declaracao_responsavel || '';
    document.getElementById('pDeclaracaoData').value = p.declaracao_data ? p.declaracao_data.split('T')[0] : '';

    // Totais
    if (calc) {
      document.getElementById('rendaTotal').textContent = fmtMoeda(calc.renda_total);
      document.getElementById('rendaPerCapita').textContent = fmtMoeda(calc.renda_per_capita);
      document.getElementById('despesaTotal').textContent = fmtMoeda(calc.despesa_total);
    }
  }

  function limparForm() {
    document.getElementById('formProntuario').reset();
    document.getElementById('prontuarioId').value = '';
    document.getElementById('pIdade').value = '';
    familiaRows = []; renderFamilia();
    despesaRows = []; renderDespesas();
    respRows = []; renderResponsaveis();
    document.getElementById('tabelaHistorico').innerHTML = '<tr><td colspan="4" class="text-center text-muted py-3">Salve o prontuário para ver o histórico</td></tr>';
    document.getElementById('tabelaAnexos').innerHTML = '<tr><td colspan="4" class="text-center text-muted py-3">Nenhum anexo</td></tr>';
    document.getElementById('rendaTotal').textContent = 'R$ 0,00';
    document.getElementById('rendaPerCapita').textContent = 'R$ 0,00';
    document.getElementById('despesaTotal').textContent = 'R$ 0,00';
    // Reset first tab
    const firstTab = document.querySelector('#prontuarioTabs .nav-link');
    if (firstTab) new bootstrap.Tab(firstTab).show();
  }

  function coletarDados() {
    const necessidades = [];
    document.querySelectorAll('.chk-necessidade:checked').forEach(c => necessidades.push(c.value));

    return {
      nome_completo: document.getElementById('pNome').value.trim(),
      data_nascimento: document.getElementById('pDataNasc').value || null,
      rg: document.getElementById('pRg').value.trim() || null,
      cpf: document.getElementById('pCpf').value.trim() || null,
      nis: document.getElementById('pNis').value.trim() || null,
      aluno_id: document.getElementById('pAlunoId').value || null,
      escola: document.getElementById('pEscola').value.trim() || null,
      periodo_escolar: document.getElementById('pPeriodoEscolar').value || null,
      oficina: document.getElementById('pOficina').value.trim() || null,
      periodo_oficina: document.getElementById('pPeriodoOficina').value || null,
      nome_mae: document.getElementById('pNomeMae').value.trim() || null,
      nome_pai: document.getElementById('pNomePai').value.trim() || null,
      endereco: document.getElementById('pEndereco').value.trim() || null,
      telefones: document.getElementById('pTelefones').value.trim() || null,
      pode_sair_sozinho: document.getElementById('pSairSozinho').value === 'true',
      quem_busca: document.getElementById('pQuemBusca').value.trim() || null,
      tamanho_camiseta: document.getElementById('pCamiseta').value.trim() || null,
      tamanho_short: document.getElementById('pShort').value.trim() || null,
      tamanho_calcado: document.getElementById('pCalcado').value.trim() || null,
      observacoes: document.getElementById('pObs').value.trim() || null,
      saude: {
        alergias: document.getElementById('pAlergias').value.trim(),
        doencas: document.getElementById('pDoencas').value.trim(),
        medicacao: document.getElementById('pMedicacao').value.trim(),
        tratamentos: document.getElementById('pTratamentos').value.trim(),
        vacinacao: document.getElementById('pVacinacao').value.trim()
      },
      moradia: {
        tipo: document.getElementById('pTipoMoradia').value,
        comodos: document.getElementById('pComodos').value,
        zona: document.getElementById('pZona').value,
        agua: document.getElementById('infraAgua').checked,
        luz: document.getElementById('infraLuz').checked,
        esgoto: document.getElementById('infraEsgoto').checked,
        lixo: document.getElementById('infraLixo').checked,
        internet: document.getElementById('infraInternet').checked
      },
      avaliacao: {
        parecer: document.getElementById('pParecer').value.trim(),
        necessidades
      },
      vulnerabilidade: document.getElementById('pVulnerabilidade').value,
      declaracao_aceita: document.getElementById('pDeclaracaoAceita').checked,
      declaracao_responsavel: document.getElementById('pDeclaracaoResp').value.trim() || null,
      declaracao_data: document.getElementById('pDeclaracaoData').value || null,
      familia: familiaRows,
      despesas: despesaRows,
      responsaveis: respRows
    };
  }

  async function salvar() {
    const dados = coletarDados();
    if (!dados.nome_completo) { showToast('Nome completo é obrigatório', 'warning'); return; }

    try {
      if (currentId) {
        await apiPut('/social/' + currentId, dados);
        showToast('Prontuário atualizado!', 'success');
        await abrirProntuario(currentId);
      } else {
        const res = await apiPost('/social', dados);
        currentId = res.prontuario.id;
        showToast('Prontuário criado!', 'success');
        document.getElementById('btnExcluir').style.display = '';
        document.getElementById('btnRenovar').style.display = '';
        await abrirProntuario(currentId);
      }
    } catch (e) { showToast(e.message, 'danger'); }
  }

  // ---- TABELAS DINÂMICAS ----
  // Família
  function renderFamilia() {
    const tbody = document.getElementById('tabelaFamilia');
    if (!familiaRows.length) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">Nenhum membro adicionado</td></tr>';
      calcRendas();
      return;
    }
    let html = '';
    familiaRows.forEach((f, i) => {
      html += `<tr>
        <td><input type="text" class="form-control form-control-sm" value="${f.nome || ''}" data-fam="${i}" data-field="nome"></td>
        <td><input type="text" class="form-control form-control-sm" value="${f.parentesco || ''}" data-fam="${i}" data-field="parentesco"></td>
        <td><input type="date" class="form-control form-control-sm" value="${f.nascimento || ''}" data-fam="${i}" data-field="nascimento"></td>
        <td><input type="text" class="form-control form-control-sm" value="${f.escolaridade || ''}" data-fam="${i}" data-field="escolaridade"></td>
        <td><input type="text" class="form-control form-control-sm" value="${f.profissao || ''}" data-fam="${i}" data-field="profissao"></td>
        <td><input type="text" class="form-control form-control-sm" value="${f.situacao || ''}" data-fam="${i}" data-field="situacao"></td>
        <td><input type="number" class="form-control form-control-sm fam-renda" value="${f.renda || 0}" step="0.01" min="0" data-fam="${i}" data-field="renda"></td>
        <td><button type="button" class="btn btn-sm btn-outline-danger btn-rm-fam" data-idx="${i}"><i class="bi bi-x"></i></button></td>
      </tr>`;
    });
    tbody.innerHTML = html;

    // Bind events
    tbody.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('change', () => {
        const idx = parseInt(inp.dataset.fam);
        familiaRows[idx][inp.dataset.field] = inp.value;
        if (inp.dataset.field === 'renda') calcRendas();
      });
    });
    tbody.querySelectorAll('.btn-rm-fam').forEach(btn => {
      btn.addEventListener('click', () => { familiaRows.splice(parseInt(btn.dataset.idx), 1); renderFamilia(); });
    });
    calcRendas();
  }

  function calcRendas() {
    const total = familiaRows.reduce((s, f) => s + (parseFloat(f.renda) || 0), 0);
    const membros = familiaRows.length + 1;
    document.getElementById('rendaTotal').textContent = fmtMoeda(total);
    document.getElementById('rendaPerCapita').textContent = fmtMoeda(total / membros);
  }

  // Despesas
  function renderDespesas() {
    const tbody = document.getElementById('tabelaDespesas');
    if (!despesaRows.length) {
      tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">Nenhuma despesa adicionada</td></tr>';
      calcDespesas();
      return;
    }
    let html = '';
    despesaRows.forEach((d, i) => {
      html += `<tr>
        <td><input type="text" class="form-control form-control-sm" value="${d.tipo || ''}" data-desp="${i}" data-field="tipo"></td>
        <td><input type="number" class="form-control form-control-sm desp-valor" value="${d.valor || 0}" step="0.01" min="0" data-desp="${i}" data-field="valor"></td>
        <td><button type="button" class="btn btn-sm btn-outline-danger btn-rm-desp" data-idx="${i}"><i class="bi bi-x"></i></button></td>
      </tr>`;
    });
    tbody.innerHTML = html;
    tbody.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('change', () => {
        despesaRows[parseInt(inp.dataset.desp)][inp.dataset.field] = inp.value;
        if (inp.dataset.field === 'valor') calcDespesas();
      });
    });
    tbody.querySelectorAll('.btn-rm-desp').forEach(btn => {
      btn.addEventListener('click', () => { despesaRows.splice(parseInt(btn.dataset.idx), 1); renderDespesas(); });
    });
    calcDespesas();
  }

  function calcDespesas() {
    const total = despesaRows.reduce((s, d) => s + (parseFloat(d.valor) || 0), 0);
    document.getElementById('despesaTotal').textContent = fmtMoeda(total);
  }

  // Responsáveis
  function renderResponsaveis() {
    const tbody = document.getElementById('tabelaResponsaveis');
    if (!respRows.length) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Nenhum responsável adicionado</td></tr>';
      return;
    }
    let html = '';
    respRows.forEach((r, i) => {
      html += `<tr>
        <td><input type="text" class="form-control form-control-sm" value="${r.nome || ''}" data-resp="${i}" data-field="nome"></td>
        <td><input type="text" class="form-control form-control-sm" value="${r.relacao || ''}" data-resp="${i}" data-field="relacao"></td>
        <td><input type="text" class="form-control form-control-sm" value="${r.telefone || ''}" data-resp="${i}" data-field="telefone"></td>
        <td><button type="button" class="btn btn-sm btn-outline-danger btn-rm-resp" data-idx="${i}"><i class="bi bi-x"></i></button></td>
      </tr>`;
    });
    tbody.innerHTML = html;
    tbody.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('change', () => { respRows[parseInt(inp.dataset.resp)][inp.dataset.field] = inp.value; });
    });
    tbody.querySelectorAll('.btn-rm-resp').forEach(btn => {
      btn.addEventListener('click', () => { respRows.splice(parseInt(btn.dataset.idx), 1); renderResponsaveis(); });
    });
  }

  // Histórico
  function renderHistorico(hist) {
    const tbody = document.getElementById('tabelaHistorico');
    if (!hist.length) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-3">Nenhum evento registrado</td></tr>';
      return;
    }
    let html = '';
    hist.forEach(h => {
      html += `<tr><td class="small">${fmtDataHora(h.data)}</td><td><span class="badge bg-secondary">${h.tipo_evento}</span></td><td class="small">${h.descricao || '-'}</td><td class="small">${h.usuario_nome || '-'}</td></tr>`;
    });
    tbody.innerHTML = html;
  }

  // Anexos
  function renderAnexos(anexos) {
    const tbody = document.getElementById('tabelaAnexos');
    if (!anexos.length) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-3">Nenhum anexo</td></tr>';
      return;
    }
    let html = '';
    anexos.forEach(a => {
      html += `<tr><td><a href="${a.arquivo_url}" target="_blank">${a.nome_arquivo}</a></td><td>${a.tipo || '-'}</td><td class="small">${fmtDataHora(a.data)}</td><td><button class="btn btn-sm btn-outline-danger" title="Funcionalidade futura"><i class="bi bi-trash"></i></button></td></tr>`;
    });
    tbody.innerHTML = html;
  }

  // ---- Carregar alunos para select ----
  async function carregarAlunos() {
    try {
      const data = await apiGet('/social/alunos');
      alunosList = data.alunos || [];
      const sel = document.getElementById('pAlunoId');
      sel.innerHTML = '<option value="">Nenhum</option>';
      alunosList.forEach(a => { sel.innerHTML += `<option value="${a.id}">${a.nome}</option>`; });
    } catch (e) { console.error('Erro ao carregar alunos:', e); }
  }

  // ---- INIT ----
  document.addEventListener('DOMContentLoaded', async () => {
    if (!verificarAcesso()) return;

    await carregarAlunos();
    await carregarLista(1);

    // Auto-calc idade
    document.getElementById('pDataNasc')?.addEventListener('change', function () {
      document.getElementById('pIdade').value = calcIdade(this.value);
    });

    // Navegação
    document.getElementById('btnNovo')?.addEventListener('click', novoProntuario);
    document.getElementById('btnVoltar')?.addEventListener('click', () => { mostrarTela('lista'); carregarLista(1); });
    document.getElementById('btnCancelar')?.addEventListener('click', () => { mostrarTela('lista'); carregarLista(1); });
    document.getElementById('btnFiltrar')?.addEventListener('click', () => carregarLista(1));
    document.getElementById('filtroBusca')?.addEventListener('keyup', (e) => { if (e.key === 'Enter') carregarLista(1); });

    // Tabelas dinâmicas - adicionar linha
    document.getElementById('btnAddFamilia')?.addEventListener('click', () => { familiaRows.push({ nome: '', parentesco: '', nascimento: '', escolaridade: '', profissao: '', situacao: '', renda: 0 }); renderFamilia(); });
    document.getElementById('btnAddDespesa')?.addEventListener('click', () => { despesaRows.push({ tipo: '', valor: 0 }); renderDespesas(); });
    document.getElementById('btnAddResp')?.addEventListener('click', () => { respRows.push({ nome: '', relacao: '', telefone: '' }); renderResponsaveis(); });

    // Salvar
    document.getElementById('formProntuario')?.addEventListener('submit', (e) => { e.preventDefault(); salvar(); });

    // Excluir
    document.getElementById('btnExcluir')?.addEventListener('click', () => {
      document.getElementById('excluirNome').textContent = document.getElementById('pNome').value;
      new bootstrap.Modal(document.getElementById('modalExcluir')).show();
    });
    document.getElementById('btnConfirmarExcluir')?.addEventListener('click', async () => {
      try {
        await apiDelete('/social/' + currentId);
        showToast('Prontuário excluído!', 'success');
        bootstrap.Modal.getInstance(document.getElementById('modalExcluir'))?.hide();
        mostrarTela('lista');
        carregarLista(1);
      } catch (e) { showToast(e.message, 'danger'); }
    });

    // Renovar
    document.getElementById('btnRenovar')?.addEventListener('click', () => {
      new bootstrap.Modal(document.getElementById('modalRenovar')).show();
    });
    document.getElementById('btnConfirmarRenovar')?.addEventListener('click', async () => {
      try {
        const res = await apiPost('/social/' + currentId + '/renovar', {});
        showToast('Matrícula renovada! Nova versão criada.', 'success');
        bootstrap.Modal.getInstance(document.getElementById('modalRenovar'))?.hide();
        currentId = res.prontuario.id;
        await abrirProntuario(currentId);
      } catch (e) { showToast(e.message, 'danger'); }
    });
  });
})();
