// ============================================================
// Controle de Ponto - Frontend
// ============================================================

(function() {
  'use strict';

  const API = window.API_BASE_URL || 'http://localhost:3003/api';

  // ---- Utilidades ----
  function getToken() {
    return localStorage.getItem('authToken');
  }

  function getHeaders() {
    const h = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) h['Authorization'] = 'Bearer ' + token;
    return h;
  }

  function getUserData() {
    try { return JSON.parse(localStorage.getItem('userData') || '{}'); } catch { return {}; }
  }

  function showToast(msg, type) {
    const toastEl = document.getElementById('pontoToast');
    const toastMsg = document.getElementById('pontoToastMsg');
    if (!toastEl || !toastMsg) return;
    toastEl.className = 'toast align-items-center border-0 text-white bg-' + (type || 'primary');
    toastMsg.textContent = msg;
    const toast = new bootstrap.Toast(toastEl, { delay: 3500 });
    toast.show();
  }

  function formatTime(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  function formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR');
  }

  function tipoLabel(tipo) {
    const labels = {
      'entrada': 'Entrada',
      'inicio_intervalo': 'Início Intervalo',
      'fim_intervalo': 'Fim Intervalo',
      'saida': 'Saída'
    };
    return labels[tipo] || tipo;
  }

  function tipoBadgeClass(tipo) {
    const classes = {
      'entrada': 'bg-success',
      'inicio_intervalo': 'bg-warning text-dark',
      'fim_intervalo': 'bg-primary',
      'saida': 'bg-danger'
    };
    return classes[tipo] || 'bg-secondary';
  }

  // Calcular horas trabalhadas a partir de registros do dia
  function calcularHorasDia(registros) {
    let totalMs = 0;
    let entrada = null;
    let intervaloInicio = null;

    const sorted = [...registros].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    for (const r of sorted) {
      const t = new Date(r.timestamp);
      if (r.tipo === 'entrada') {
        entrada = t;
      } else if (r.tipo === 'inicio_intervalo' && entrada) {
        totalMs += t - entrada;
        intervaloInicio = t;
        entrada = null;
      } else if (r.tipo === 'fim_intervalo') {
        entrada = t;
        intervaloInicio = null;
      } else if (r.tipo === 'saida' && entrada) {
        totalMs += t - entrada;
        entrada = null;
      }
    }

    // Se ainda em expediente (sem saída), calcular até agora
    if (entrada && !intervaloInicio) {
      totalMs += new Date() - entrada;
    }

    const horas = Math.floor(totalMs / 3600000);
    const minutos = Math.floor((totalMs % 3600000) / 60000);
    return { horas, minutos, texto: `${horas}h${String(minutos).padStart(2, '0')}m` };
  }

  // Agrupar registros por data (YYYY-MM-DD)
  function agruparPorData(pontos) {
    const grouped = {};
    pontos.forEach(p => {
      const d = new Date(p.timestamp);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const key = `${year}-${month}-${day}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(p);
    });
    return grouped;
  }

  // Extrair dados de uma linha de dia
  function extrairDadosDia(registros) {
    const sorted = [...registros].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const entrada = sorted.find(r => r.tipo === 'entrada');
    const intervaloInicio = sorted.find(r => r.tipo === 'inicio_intervalo');
    const intervaloFim = sorted.find(r => r.tipo === 'fim_intervalo');
    const saida = sorted.find(r => r.tipo === 'saida');

    let intervaloTexto = '-';
    if (intervaloInicio && intervaloFim) {
      intervaloTexto = formatTime(intervaloInicio.timestamp) + ' - ' + formatTime(intervaloFim.timestamp);
    } else if (intervaloInicio) {
      intervaloTexto = formatTime(intervaloInicio.timestamp) + ' - ...';
    }

    return {
      entrada: entrada ? formatTime(entrada.timestamp) : '-',
      intervalo: intervaloTexto,
      saida: saida ? formatTime(saida.timestamp) : '-',
      total: calcularHorasDia(registros)
    };
  }

  // ---- API Calls ----
  async function apiGetStatus() {
    const resp = await fetch(API + '/ponto/status', { headers: getHeaders() });
    if (!resp.ok) throw new Error((await resp.json().catch(() => ({}))).error || 'Erro ao carregar status');
    return resp.json();
  }

  function obterLocalizacao() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Seu navegador não suporta geolocalização. Use um navegador moderno.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        (err) => {
          switch (err.code) {
            case 1: reject(new Error('Permissão de localização negada. Ative a localização nas configurações do navegador.')); break;
            case 2: reject(new Error('Não foi possível obter sua localização. Verifique se o GPS está ativado.')); break;
            case 3: reject(new Error('Tempo esgotado ao obter localização. Tente novamente.')); break;
            default: reject(new Error('Erro ao obter localização.'));
          }
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    });
  }

  async function apiRegistrar(tipo) {
    // Obter localização antes de registrar
    const coords = await obterLocalizacao();

    const resp = await fetch(API + '/ponto/registrar', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ tipo, latitude: coords.latitude, longitude: coords.longitude })
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) throw new Error(data.error || 'Erro ao registrar ponto');
    return data;
  }

  async function apiMeusPontos(dataInicio, dataFim) {
    const params = new URLSearchParams();
    if (dataInicio) params.append('dataInicio', dataInicio);
    if (dataFim) params.append('dataFim', dataFim);
    params.append('limit', '200');
    const resp = await fetch(API + '/ponto/meus?' + params.toString(), { headers: getHeaders() });
    if (!resp.ok) throw new Error('Erro ao carregar histórico');
    return resp.json();
  }

  async function apiListaAdmin(dataInicio, dataFim) {
    const params = new URLSearchParams();
    if (dataInicio) params.append('dataInicio', dataInicio);
    if (dataFim) params.append('dataFim', dataFim);
    const resp = await fetch(API + '/ponto/lista?' + params.toString(), { headers: getHeaders() });
    if (!resp.ok) throw new Error('Erro ao carregar lista');
    return resp.json();
  }

  async function apiFuncionario(id, dataInicio, dataFim) {
    const params = new URLSearchParams();
    if (dataInicio) params.append('dataInicio', dataInicio);
    if (dataFim) params.append('dataFim', dataFim);
    params.append('limit', '200');
    const resp = await fetch(API + '/ponto/funcionario/' + id + '?' + params.toString(), { headers: getHeaders() });
    if (!resp.ok) throw new Error('Erro ao carregar dados do funcionário');
    return resp.json();
  }

  async function apiCorrigir(pontoId, novoTimestamp, novoTipo, motivo) {
    const resp = await fetch(API + '/ponto/corrigir', {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ pontoId, novoTimestamp, novoTipo, motivo })
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) throw new Error(data.error || 'Erro ao corrigir ponto');
    return data;
  }

  async function apiEditar(id, tipo, timestamp, motivo) {
    const resp = await fetch(API + '/ponto/' + id, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ tipo, timestamp, motivo })
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) throw new Error(data.error || 'Erro ao editar ponto');
    return data;
  }

  async function apiExcluir(id, motivo) {
    const resp = await fetch(API + '/ponto/' + id, {
      method: 'DELETE',
      headers: getHeaders(),
      body: JSON.stringify({ motivo })
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) throw new Error(data.error || 'Erro ao excluir ponto');
    return data;
  }

  // ---- Renderização ----

  function renderTimeline(registros) {
    const container = document.getElementById('timelineHoje');
    if (!container) return;

    if (!registros || registros.length === 0) {
      container.innerHTML = '<div class="text-muted text-center py-3"><i class="bi bi-info-circle me-1"></i> Nenhum registro hoje</div>';
      return;
    }

    const sorted = [...registros].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    let html = '<div class="ponto-timeline">';
    sorted.forEach(r => {
      const alteradoBadge = r.alterado ? ' <span class="badge bg-secondary">Corrigido</span>' : '';
      html += `
        <div class="ponto-timeline-item tipo-${r.tipo}">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <span class="badge ${tipoBadgeClass(r.tipo)} me-2">${tipoLabel(r.tipo)}</span>
              <strong>${formatTime(r.timestamp)}</strong>${alteradoBadge}
            </div>
          </div>
        </div>`;
    });
    html += '</div>';

    // Resumo do dia
    const calc = calcularHorasDia(registros);
    html += `<div class="mt-3 pt-3 border-top text-end"><span class="badge bg-dark horas-badge"><i class="bi bi-stopwatch me-1"></i>Total: ${calc.texto}</span></div>`;

    container.innerHTML = html;
  }

  function renderHistorico(pontos) {
    const tbody = document.getElementById('tabelaHistorico');
    if (!tbody) return;

    if (!pontos || pontos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-3">Nenhum registro encontrado</td></tr>';
      return;
    }

    const grouped = agruparPorData(pontos);
    const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

    let html = '';
    dates.forEach(date => {
      const dados = extrairDadosDia(grouped[date]);
      const d = new Date(date + 'T12:00:00');
      const dateFormatted = d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
      html += `
        <tr>
          <td>${dateFormatted}</td>
          <td>${dados.entrada}</td>
          <td>${dados.intervalo}</td>
          <td>${dados.saida}</td>
          <td><span class="badge bg-dark horas-badge">${dados.total.texto}</span></td>
        </tr>`;
    });

    tbody.innerHTML = html;
  }

  function updateButtons(acoesDisponiveis) {
    const map = {
      'entrada': document.getElementById('btnEntrada'),
      'inicio_intervalo': document.getElementById('btnInicioIntervalo'),
      'fim_intervalo': document.getElementById('btnFimIntervalo'),
      'saida': document.getElementById('btnSaida')
    };

    // Desabilitar todos
    Object.values(map).forEach(b => { if (b) b.disabled = true; });

    if (!acoesDisponiveis || !acoesDisponiveis.length) return;

    // Habilitar apenas as ações disponíveis
    acoesDisponiveis.forEach(acao => {
      if (map[acao]) map[acao].disabled = false;
    });
  }

  function renderListaFuncionarios(lista) {
    const container = document.getElementById('listaFuncionarios');
    if (!container) return;

    if (!lista || lista.length === 0) {
      container.innerHTML = '<div class="text-muted text-center py-3">Nenhum funcionário encontrado</div>';
      return;
    }

    let html = '<div class="row g-3">';
    lista.forEach(item => {
      const func = item.funcionario;
      const totalDias = Object.keys(agruparPorData(item.pontos)).length;
      html += `
        <div class="col-md-6 col-lg-4">
          <div class="card admin-func-card h-100" data-func-id="${func.id}">
            <div class="card-body">
              <h6 class="card-title mb-1">${(func.nome || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</h6>
              <small class="text-muted d-block mb-2">${(func.cargo || '-').replace(/</g, '&lt;').replace(/>/g, '&gt;')} &middot; ${(func.email || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</small>
              <div class="d-flex justify-content-between align-items-center">
                <span class="text-muted">${totalDias} dia(s) registrado(s)</span>
                <span class="badge bg-primary">${item.totalRegistros} registros</span>
              </div>
            </div>
          </div>
        </div>`;
    });
    html += '</div>';
    container.innerHTML = html;

    // Click handlers
    container.querySelectorAll('.admin-func-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-func-id');
        abrirDetalhesFuncionario(id);
      });
    });
  }

  // ID do funcionário aberto no modal (para recarregar após edição/exclusão)
  let _funcAberto = null;

  async function abrirDetalhesFuncionario(id) {
    try {
      _funcAberto = id;
      const dataInicio = document.getElementById('adminDataInicio')?.value || '';
      const dataFim = document.getElementById('adminDataFim')?.value || '';
      const data = await apiFuncionario(id, dataInicio, dataFim);

      document.getElementById('modalFuncNome').textContent = 'Registros - ' + (data.funcionario?.nome || 'Funcionário');

      const tbody = document.getElementById('modalFuncTabela');
      const tbodyReg = document.getElementById('modalFuncRegistros');

      if (!data.pontos || data.pontos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Sem registros</td></tr>';
        tbodyReg.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Sem registros</td></tr>';
      } else {
        // Resumo por dia
        const grouped = agruparPorData(data.pontos);
        const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
        let html = '';
        dates.forEach(date => {
          const dados = extrairDadosDia(grouped[date]);
          const d = new Date(date + 'T12:00:00');
          const dateFormatted = d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
          html += `<tr>
            <td>${dateFormatted}</td>
            <td>${dados.entrada}</td>
            <td>${dados.intervalo}</td>
            <td>${dados.saida}</td>
            <td><span class="badge bg-dark horas-badge">${dados.total.texto}</span></td>
          </tr>`;
        });
        tbody.innerHTML = html;

        // Registros individuais com botões editar/excluir
        const sorted = [...data.pontos].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        let regHtml = '';
        sorted.forEach(r => {
          const dt = new Date(r.timestamp);
          const dataHora = dt.toLocaleDateString('pt-BR') + ' ' + dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          const statusBadge = r.alterado
            ? '<span class="badge bg-warning text-dark" title="' + (r.motivo_alteracao || '') + '"><i class="bi bi-pencil-fill me-1"></i>Editado</span>'
            : '<span class="badge bg-light text-muted">Original</span>';
          regHtml += `<tr>
            <td class="small">${dataHora}</td>
            <td><span class="badge ${tipoBadgeClass(r.tipo)}">${tipoLabel(r.tipo)}</span></td>
            <td>${statusBadge}</td>
            <td class="text-end">
              <button class="btn btn-sm btn-outline-primary btn-editar-ponto me-1" data-id="${r.id}" data-tipo="${r.tipo}" data-timestamp="${r.timestamp}" title="Editar">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger btn-excluir-ponto" data-id="${r.id}" data-info="${tipoLabel(r.tipo)} - ${dataHora}" title="Excluir">
                <i class="bi bi-trash"></i>
              </button>
            </td>
          </tr>`;
        });
        tbodyReg.innerHTML = regHtml;

        // Listeners editar
        tbodyReg.querySelectorAll('.btn-editar-ponto').forEach(btn => {
          btn.addEventListener('click', () => abrirModalEditar(btn.dataset.id, btn.dataset.tipo, btn.dataset.timestamp));
        });
        // Listeners excluir
        tbodyReg.querySelectorAll('.btn-excluir-ponto').forEach(btn => {
          btn.addEventListener('click', () => abrirModalExcluir(btn.dataset.id, btn.dataset.info));
        });
      }

      const modal = new bootstrap.Modal(document.getElementById('modalDetalhesFuncionario'));
      modal.show();
    } catch (e) {
      showToast(e.message, 'danger');
    }
  }

  function abrirModalEditar(id, tipo, timestamp) {
    document.getElementById('editarPontoId').value = id;
    document.getElementById('editarTipo').value = tipo;
    // Converter timestamp ISO para datetime-local
    const dt = new Date(timestamp);
    const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    document.getElementById('editarTimestamp').value = local;
    document.getElementById('editarMotivo').value = '';
    const modal = new bootstrap.Modal(document.getElementById('modalEditarPonto'));
    modal.show();
  }

  function abrirModalExcluir(id, info) {
    document.getElementById('excluirPontoId').value = id;
    document.getElementById('excluirPontoInfo').textContent = info;
    document.getElementById('excluirMotivo').value = '';
    const modal = new bootstrap.Modal(document.getElementById('modalExcluirPonto'));
    modal.show();
  }

  // ---- Ações ----

  async function registrarPonto(tipo) {
    try {
      const data = await apiRegistrar(tipo);
      showToast(data.message || 'Registrado com sucesso!', 'success');
      await carregarMeuPonto();
    } catch (e) {
      showToast(e.message, 'danger');
    }
  }

  async function carregarMeuPonto() {
    try {
      const status = await apiGetStatus();
      document.getElementById('statusTexto').textContent = status.status || 'Sem registro';
      updateButtons(status.acoesDisponiveis || (status.proximaAcao ? [status.proximaAcao] : []));
      renderTimeline(status.registrosDoDia);
    } catch (e) {
      /* erro silencioso */
      document.getElementById('statusTexto').textContent = 'Erro ao carregar';
    }

    // Carregar histórico do mês selecionado
    await carregarHistoricoMes();
  }

  async function carregarHistoricoMes() {
    const filtroMes = document.getElementById('filtroMes');
    let dataInicio, dataFim;

    if (filtroMes && filtroMes.value) {
      const [ano, mes] = filtroMes.value.split('-');
      dataInicio = `${ano}-${mes}-01`;
      const lastDay = new Date(parseInt(ano), parseInt(mes), 0).getDate();
      dataFim = `${ano}-${mes}-${String(lastDay).padStart(2, '0')}`;
    } else {
      // Mês atual
      const now = new Date();
      const ano = now.getFullYear();
      const mes = String(now.getMonth() + 1).padStart(2, '0');
      dataInicio = `${ano}-${mes}-01`;
      const lastDay = new Date(ano, now.getMonth() + 1, 0).getDate();
      dataFim = `${ano}-${mes}-${String(lastDay).padStart(2, '0')}`;
    }

    try {
      const data = await apiMeusPontos(dataInicio, dataFim);
      renderHistorico(data.pontos || []);
    } catch (e) {
      /* erro silencioso */
    }
  }

  async function carregarGestao() {
    try {
      const dataInicio = document.getElementById('adminDataInicio')?.value || '';
      const dataFim = document.getElementById('adminDataFim')?.value || '';
      const data = await apiListaAdmin(dataInicio, dataFim);
      renderListaFuncionarios(data.lista || []);
    } catch (e) {
      showToast(e.message, 'danger');
    }
  }

  // ---- Relógio ----
  function atualizarRelogio() {
    const el = document.getElementById('relogio');
    if (el) {
      const now = new Date();
      el.textContent = now.toLocaleTimeString('pt-BR');
    }
  }

  // ---- Inicialização ----
  document.addEventListener('DOMContentLoaded', async () => {
    // Verificar autenticação
    const token = getToken();
    if (!token) {
      window.location.href = '../index.html';
      return;
    }

    const userData = getUserData();
    const isAdmin = userData.cargo === 'admin';

    // Mostrar aba de gestão para admin
    const btnGestao = document.getElementById('btnTabGestao');
    if (isAdmin && btnGestao) {
      btnGestao.classList.remove('d-none');
    }

    // Relógio
    atualizarRelogio();
    const intervalRelogio = setInterval(atualizarRelogio, 1000);

    // Cleanup quando a página for descarregada
    window.addEventListener('beforeunload', () => {
      clearInterval(intervalRelogio);
    });

    // Setar mês atual no filtro
    const filtroMes = document.getElementById('filtroMes');
    if (filtroMes) {
      const now = new Date();
      filtroMes.value = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
    }

    // Setar datas padrão no filtro admin (mês atual)
    const adminDataInicio = document.getElementById('adminDataInicio');
    const adminDataFim = document.getElementById('adminDataFim');
    if (adminDataInicio && adminDataFim) {
      const now = new Date();
      const ano = now.getFullYear();
      const mes = String(now.getMonth() + 1).padStart(2, '0');
      adminDataInicio.value = `${ano}-${mes}-01`;
      const lastDay = new Date(ano, now.getMonth() + 1, 0).getDate();
      adminDataFim.value = `${ano}-${mes}-${String(lastDay).padStart(2, '0')}`;
    }

    // Botões de registro
    document.getElementById('btnEntrada')?.addEventListener('click', () => registrarPonto('entrada'));
    document.getElementById('btnInicioIntervalo')?.addEventListener('click', () => registrarPonto('inicio_intervalo'));
    document.getElementById('btnFimIntervalo')?.addEventListener('click', () => registrarPonto('fim_intervalo'));
    document.getElementById('btnSaida')?.addEventListener('click', () => registrarPonto('saida'));

    // Tabs
    document.getElementById('btnTabMeuPonto')?.addEventListener('click', () => {
      document.getElementById('secaoMeuPonto').classList.remove('d-none');
      document.getElementById('secaoGestao').classList.add('d-none');
      document.getElementById('btnTabMeuPonto').classList.add('active');
      document.getElementById('btnTabMeuPonto').classList.remove('btn-outline-primary');
      document.getElementById('btnTabMeuPonto').classList.add('btn-primary');
      document.getElementById('btnTabGestao').classList.remove('active');
      document.getElementById('btnTabGestao').classList.remove('btn-primary');
      document.getElementById('btnTabGestao').classList.add('btn-outline-primary');
      carregarMeuPonto();
    });

    document.getElementById('btnTabGestao')?.addEventListener('click', () => {
      document.getElementById('secaoMeuPonto').classList.add('d-none');
      document.getElementById('secaoGestao').classList.remove('d-none');
      document.getElementById('btnTabGestao').classList.add('active');
      document.getElementById('btnTabGestao').classList.remove('btn-outline-primary');
      document.getElementById('btnTabGestao').classList.add('btn-primary');
      document.getElementById('btnTabMeuPonto').classList.remove('active');
      document.getElementById('btnTabMeuPonto').classList.remove('btn-primary');
      document.getElementById('btnTabMeuPonto').classList.add('btn-outline-primary');
      carregarGestao();
    });

    // Filtro mês (histórico pessoal)
    filtroMes?.addEventListener('change', carregarHistoricoMes);

    // Filtro admin
    document.getElementById('btnFiltrarAdmin')?.addEventListener('click', carregarGestao);

    // Edição de ponto
    document.getElementById('btnConfirmarEdicao')?.addEventListener('click', async () => {
      const id = document.getElementById('editarPontoId')?.value;
      const tipo = document.getElementById('editarTipo')?.value;
      const timestamp = document.getElementById('editarTimestamp')?.value;
      const motivo = document.getElementById('editarMotivo')?.value;

      if (!motivo || motivo.trim().length < 5) {
        showToast('Justificativa deve ter pelo menos 5 caracteres', 'warning');
        return;
      }

      try {
        await apiEditar(parseInt(id), tipo, timestamp, motivo);
        showToast('Registro atualizado com sucesso!', 'success');
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalEditarPonto'));
        if (modal) modal.hide();
        // Recarregar detalhes do funcionário aberto
        if (_funcAberto) await abrirDetalhesFuncionario(_funcAberto);
        carregarGestao();
      } catch (e) {
        showToast(e.message, 'danger');
      }
    });

    // Exclusão de ponto
    document.getElementById('btnConfirmarExclusao')?.addEventListener('click', async () => {
      const id = document.getElementById('excluirPontoId')?.value;
      const motivo = document.getElementById('excluirMotivo')?.value;

      if (!motivo || motivo.trim().length < 5) {
        showToast('Justificativa deve ter pelo menos 5 caracteres', 'warning');
        return;
      }

      try {
        await apiExcluir(parseInt(id), motivo);
        showToast('Registro excluído com sucesso!', 'success');
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalExcluirPonto'));
        if (modal) modal.hide();
        if (_funcAberto) await abrirDetalhesFuncionario(_funcAberto);
        carregarGestao();
      } catch (e) {
        showToast(e.message, 'danger');
      }
    });

    // Esconder loading, mostrar conteúdo
    document.getElementById('loadingScreen').classList.add('d-none');
    document.getElementById('conteudoPrincipal').classList.remove('d-none');

    // Carregar dados
    await carregarMeuPonto();
  });

})();
