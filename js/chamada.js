/* chamada.js
   App central para gerenciar Salas/Oficinas / Alunos / Chamadas
   Tudo em localStorage. Estrutura: App = { Storage, Utils, UI, Navigation, init }
*/

/* ===================== CONFIG / KEYS / DEMO ===================== */
var API_BASE_URL = API_BASE_URL || 'http://localhost:3003/api';
const KEYS = {
  SALAS: 'salas',
  ALUNOS: 'alunos',
  CHAMADAS: 'chamadas'
};

// LEGADO: conjunto de alunos de demonstração não utilizado no fluxo atual.
// Mantido apenas para referência histórica do antigo modo 100% localStorage.
// const DEMO_ALUNOS = [
//   { id: 'a1', nome: 'João Silva', matricula: '2023001', status: 'matriculado' },
//   { id: 'a2', nome: 'Maria Santos', matricula: '2023002', status: 'matriculado' },
//   { id: 'a3', nome: 'Pedro Oliveira', matricula: '2023003', status: 'matriculado' },
//   { id: 'a4', nome: 'Ana Souza', matricula: '2023004', status: 'matriculado' },
//   { id: 'a5', nome: 'Carlos Pereira', matricula: '2023005', status: 'matriculado' }
// ];

/* ===================== UTIL ===================== */
const Utils = {
  genId(prefix = '') { return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2,8); },

  formatDateIso(date = new Date()) {
    // Returns YYYY-MM-DD (usando fuso horário local, não UTC)
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  formatDateDisplay(isoDate) {
    if (!isoDate) return '';
    const d = new Date(isoDate);
    return d.toLocaleDateString('pt-BR');
  },

  formatDateTimeDisplay(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString('pt-BR');
  },

  safeParse(json) {
    try { return JSON.parse(json); } catch(e){ return null; }
  },

  showToast(message, type = 'success') {
    // uses existing toast DOM (window.APP_TOAST) if available, otherwise create a simple bootstrap toast
    try {
      if (window.APP_TOAST && document.getElementById('toastMensagem')) {
        document.getElementById('toastMensagem').textContent = message;
        // set background via classes
        const toastEl = document.getElementById('toastNotificacao');
        toastEl.className = `toast align-items-center text-white border-0 bg-${type}`;
        window.APP_TOAST.hide?.();
        window.APP_TOAST = new bootstrap.Toast(toastEl, { autohide: true, delay: 3000 });
        window.APP_TOAST.show();
        return;
      }
    } catch(e) { /* ignore and fallback */ }

    // Fallback: dynamic toast
    const containerId = 'chamada_toast_container';
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
      document.body.appendChild(container);
    }
    const id = Utils.genId('toast-');
    const toastHtml = document.createElement('div');
    toastHtml.className = `toast align-items-center text-white bg-${type} border-0`;
    toastHtml.role = 'alert';
    toastHtml.setAttribute('aria-live','assertive');
    toastHtml.setAttribute('aria-atomic','true');
    toastHtml.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    `;
    container.appendChild(toastHtml);
    const bToast = new bootstrap.Toast(toastHtml, { autohide: true, delay: 3000 });
    bToast.show();
    toastHtml.addEventListener('hidden.bs.toast', () => { toastHtml.remove(); });
  }
};

/* ===================== STORAGE / API ===================== */

// Camada de acesso à API de Salas
const SalaAPI = {
  async listar() {
    const token = localStorage.getItem('authToken');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const resp = await fetch(`${API_BASE_URL}/salas`, { headers });
    if (!resp.ok) {
      throw new Error('Erro ao carregar salas');
    }
    const data = await resp.json();
    return Array.isArray(data.salas) ? data.salas : [];
  },

  async obter(id) {
    const token = localStorage.getItem('authToken');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const resp = await fetch(`${API_BASE_URL}/salas/${id}`, { headers });
    if (!resp.ok) {
      if (resp.status === 404) return null;
      throw new Error('Erro ao carregar sala');
    }
    return await resp.json();
  },

  async salvar(sala) {
    const token = localStorage.getItem('authToken');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const payload = {
      nome: sala.nome,
      professor: sala.professorNome, // Nome para fallback e exibição rápida
      professor_id: sala.professorId, // ID oficial para vínculo
      dia_semana: sala.diaSemana,
      horario: sala.horario,
      alunosIds: Array.isArray(sala.alunos) ? sala.alunos.map(id => parseInt(id, 10)) : []
    };

    const method = sala.id ? 'PUT' : 'POST';
    const url = sala.id
      ? `${API_BASE_URL}/salas/${sala.id}`
      : `${API_BASE_URL}/salas`;

    const resp = await fetch(url, {
      method,
      headers,
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}));
      const msg = errorData.error || 'Erro ao salvar sala';
      throw new Error(msg);
    }

    return await resp.json();
  },

  async excluir(id) {
    const token = localStorage.getItem('authToken');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const resp = await fetch(`${API_BASE_URL}/salas/${id}`, {
      method: 'DELETE',
      headers
    });

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}));
      const msg = errorData.error || 'Erro ao excluir sala';
      throw new Error(msg);
    }

    return true;
  }
};

// Camada de acesso à API de Chamadas (presença)
const ChamadaAPI = {
  async criar(chamadaPayload) {
    const token = localStorage.getItem('authToken');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const resp = await fetch(`${API_BASE_URL}/chamadas`, {
      method: 'POST',
      headers,
      body: JSON.stringify(chamadaPayload)
    });

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}));
      const msg = errorData.error || 'Erro ao salvar chamada';
      throw new Error(msg);
    }

    return await resp.json();
  },

  async excluir(id) {
    const token = localStorage.getItem('authToken');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const resp = await fetch(`${API_BASE_URL}/chamadas/${id}`, {
      method: 'DELETE',
      headers
    });

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}));
      const msg = errorData.error || 'Erro ao excluir chamada';
      throw new Error(msg);
    }

    return true;
  },

  async listarPorSala(salaId, dataISO) {
    const token = localStorage.getItem('authToken');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const params = new URLSearchParams();
    if (salaId) params.append('salaId', salaId);
    if (dataISO) params.append('data', dataISO);

    const resp = await fetch(`${API_BASE_URL}/chamadas?${params.toString()}`, { headers });
    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}));
      const msg = errorData.error || 'Erro ao carregar chamadas';
      throw new Error(msg);
    }

    const data = await resp.json();
    return Array.isArray(data.chamadas) ? data.chamadas : [];
  }
};

// API para buscar professores
const ProfessorAPI = {
  async listar() {
    const token = localStorage.getItem('authToken');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const resp = await fetch(`${API_BASE_URL}/auth/professores`, {
      method: 'GET',
      headers
    });

    if (!resp.ok) {
      throw new Error('Erro ao buscar professores');
    }

    const data = await resp.json();
    return Array.isArray(data.professores) ? data.professores : [];
  }
};

// Storage mantém alunos em cache (memória + localStorage) e usa API para salas
const Storage = {
  _alunosCache: [],
  _get(key) {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    try { return JSON.parse(raw); } catch(e) { console.error('Storage parse error', key, e); return []; }
  },

  _set(key, data) {
    try { localStorage.setItem(key, JSON.stringify(data)); return true; }
    catch(e){ console.error('Storage set error', key, e); return false; }
  },

  initDefaults() {
    // alunos: garantir estrutura básica e cache em memória; App.loadAlunosReais alimenta com dados da API.
    if (!localStorage.getItem(KEYS.ALUNOS)) {
      localStorage.setItem(KEYS.ALUNOS, JSON.stringify([]));
    }
    this._alunosCache = this._get(KEYS.ALUNOS);
    // chamadas: não inicializar mais em localStorage; histórico virá da API
  },

  async getSalas() {
    try {
      return await SalaAPI.listar();
    } catch (e) {
      console.error('Erro ao carregar salas da API', e);
      return [];
    }
  },

  async getSalaById(id) {
    try {
      const sala = await SalaAPI.obter(id);
      if (!sala) return null;

      // Normalizar formato vindo da API para o que o front espera
      return {
        id: sala.id,
        nome: sala.nome,
        professor: sala.professor,
        // usa dia_semana (API) ou diaSemana (lista), dependendo de onde veio
        diaSemana: sala.dia_semana || sala.diaSemana,
        horario: sala.horario,
        // transforma array de alunos (objetos) em array de IDs (strings)
        alunos: Array.isArray(sala.alunos)
          ? sala.alunos.map(a => String(a.id))
          : []
      };
    } catch (e) {
      console.error('Erro ao buscar sala na API', e);
      return null;
    }
  },

  async saveSala(sala) {
    try {
      const saved = await SalaAPI.salvar(sala);
      return {
        id: saved.id,
        nome: saved.nome,
        professor: saved.professor,
        diaSemana: saved.dia_semana,
        horario: saved.horario,
        alunos: Array.isArray(saved.alunos) ? saved.alunos.map(a => String(a.id)) : (sala.alunos || [])
      };
    } catch (e) {
      console.error('Erro ao salvar sala via API', e);
      Utils.showToast(e.message || 'Erro ao salvar sala', 'danger');
      return null;
    }
  },

  async deleteSala(id) {
    try {
      await SalaAPI.excluir(id);
      return true;
    } catch (e) {
      console.error('Erro ao excluir sala via API', e);
      Utils.showToast(e.message || 'Erro ao excluir sala', 'danger');
      return false;
    }
  },

  getAlunos() {
    // Fonte primária: cache em memória alimentado pela API (loadAlunosReais).
    if (Array.isArray(this._alunosCache) && this._alunosCache.length > 0) {
      return this._alunosCache;
    }
    // Fallback: carregar do localStorage se o cache ainda não foi populado.
    const fromLs = this._get(KEYS.ALUNOS);
    this._alunosCache = Array.isArray(fromLs) ? fromLs : [];
    return this._alunosCache;
  },

  getAlunosMatriculados(filterTerm = '') {
    let list = this.getAlunos().filter(a => (a.status || '').toLowerCase() === 'matriculado');
    if (filterTerm) {
      const t = filterTerm.toLowerCase();
      list = list.filter(a => (a.nome || '').toLowerCase().includes(t) || (a.matricula || '').toLowerCase().includes(t));
    }
    return list;
  }
};

const UI = {
  layers: ['camada-lista','camada-cadastro','camada-alunos','camada-chamada','camada-historico'],

  showLayer(id) {
    // hide all
    this.layers.forEach(l => {
      const el = document.getElementById(l);
      if (!el) return;
      el.classList.add('d-none');
      el.classList.remove('active');
    });
    // show requested
    const target = document.getElementById(id);
    if (target) {
      target.classList.remove('d-none');
      target.classList.add('active');
      window.scrollTo(0,0);
    }
  },

  // Loading screen control
  showLoading(show) {
    const loading = document.getElementById('camada-loading');
    const main = document.getElementById('conteudo-principal');
    if (loading) {
      if (show) loading.classList.remove('d-none'); else loading.classList.add('d-none');
    }
    if (main) {
      if (show) main.classList.add('d-none'); else main.classList.remove('d-none');
    }
  },

  // render list of salas on CAMADA 1
  renderSalasList(salas) {
    const container = document.getElementById('listaSalas');
    if (!container) return;
    
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const userRole = userData.cargo || 'secretaria';
    const userName = (userData.nome || '').trim().toLowerCase();
    const canEdit = userRole === 'admin' || userRole === 'secretaria';

    // 1. Visualização irrestrita: Todos veem todas as salas.
    // 2. Ocultar botão "Nova Oficina" para quem não tem permissão de criação
    const btnNova = document.getElementById('btnNovaOficina');
    if (btnNova) {
        if (!canEdit) {
            btnNova.remove(); // Remover do DOM para garantir
        } else {
            btnNova.style.display = 'inline-block';
        }
    }

    if (!salas || !Array.isArray(salas) || salas.length === 0) {
      container.innerHTML = `
        <div class="col-12">
          <div class="alert alert-info">Nenhuma sala cadastrada. Clique em "Nova Sala" para começar.</div>
        </div>`;
      return;
    }

    // sort by day then horario (if provided)
    const order = {'Segunda-feira':1,'Terça-feira':2,'Quarta-feira':3,'Quinta-feira':4,'Sexta-feira':5,'Sábado':6};
    salas.sort((a,b) => {
      const da = order[a.diaSemana]||99;
      const db = order[b.diaSemana]||99;
      if (da !== db) return da - db;
      return (a.horario||'').localeCompare(b.horario||'');
    });

    container.innerHTML = salas.map(sala => {
      const numAlunos = (sala.alunos && sala.alunos.length) || 0;
      const diaBadge = sala.diaSemana ? sala.diaSemana : '—';
      const horario = sala.horario ? sala.horario : '—';
      
      // Lógica de Permissão do Botão Chamada
      // Se for professor, só pode registrar na sala dele (match de nome)
      const profSala = (sala.professor || '').trim().toLowerCase();
      const isOwner = profSala && (profSala.includes(userName) || userName.includes(profSala));
      
      // Regra de Negócio Estrita:
      // Admin: Pode tudo.
      // Professor: Pode SOMENTE se for dono da sala.
      // Secretaria: NÃO PODE registrar chamadas (apenas gerencia salas).
      // Assistente Social: NÃO PODE registrar chamadas.
      
      let canChamada = false;
      if (userRole === 'admin') canChamada = true;
      if (userRole === 'professor' && isOwner) canChamada = true;
      
      // Montar botões
      let buttonsHtml = '';
      
      if (canEdit) {
          buttonsHtml += `
            <button class="btn btn-sm btn-outline-primary btn-acao" data-acao="editar" data-id="${sala.id}">
              <i class="bi bi-pencil"></i> Editar
            </button>`;
      }
      
      // Botão Chamada
      if (userRole !== 'assistente_social') {
          if (canChamada) {
              buttonsHtml += `
                <button class="btn btn-sm btn-outline-success btn-acao" data-acao="chamada" data-id="${sala.id}">
                  <i class="bi bi-clipboard-check"></i> Chamada
                </button>`;
          } else {
              // Desabilitado com feedback visual
              buttonsHtml += `
                <button class="btn btn-sm btn-outline-secondary" disabled title="Você não pode registrar chamada nesta sala. Ela não está vinculada ao seu usuário.">
                  <i class="bi bi-lock"></i> Chamada
                </button>`;
          }
      }
      
      buttonsHtml += `
        <button class="btn btn-sm btn-outline-info btn-acao" data-acao="historico" data-id="${sala.id}">
          <i class="bi bi-clock-history"></i>
        </button>`;
        
      if (canEdit) {
          buttonsHtml += `
            <button class="btn btn-sm btn-outline-danger btn-acao ms-auto" data-acao="excluir" data-id="${sala.id}">
              <i class="bi bi-trash"></i>
            </button>`;
      }

      return `
        <div class="col-md-6 col-lg-4 mb-4" data-id="${sala.id}">
          <div class="card h-100 shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h5 class="card-title mb-0">${sala.nome}</h5>
                  <div class="card-subtitle mb-2 text-muted">${sala.professor || 'Sem professor'}</div>
                </div>
                <span class="badge bg-primary">${diaBadge}</span>
              </div>
              <p class="text-muted mb-2"><i class="bi bi-clock me-2"></i>${horario}</p>
              <p class="text-muted mb-3"><i class="bi bi-people me-2"></i>${numAlunos} aluno${numAlunos===1?'':'s'}</p>

              <div class="d-flex gap-2 flex-wrap">
                ${buttonsHtml}
              </div>
            </div>
          </div>
        </div>`;
    }).join('');

    // attach actions
    container.querySelectorAll('.btn-acao').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const ac = btn.getAttribute('data-acao');
        const id = btn.getAttribute('data-id');
        if (!ac || !id) return;
        switch(ac) {
          case 'editar': App.actions.editSala(id); break;
          case 'chamada': App.actions.openChamada(id); break;
          case 'historico': App.actions.openHistorico(id); break;
          case 'excluir': App.actions.deleteSala(id); break;
        }
      });
    });
  },

  // render form (clear or set)
  resetFormOficina() {
    const form = document.getElementById('formOficina');
    if (!form) return;
    form.reset();
    form.classList.remove('was-validated');
    // clear state stored in App.state.newSala
    App.state.newSala = { alunos: [] };
  },

  fillFormForEdit(sala) {
    const form = document.getElementById('formOficina');
    if (!form || !sala) return;
    document.getElementById('nomeOficina').value = sala.nome || '';
    
    // Tentar setar pelo ID primeiro
    const profSelect = document.getElementById('professorOficina');
    if (sala.professor_id) {
        profSelect.value = sala.professor_id;
    } else {
        // Fallback: tentar pelo texto (para legados)
        // Isso pode falhar se o texto não bater exato com o option, mas é melhor que nada
        for(let i=0; i<profSelect.options.length; i++) {
            if(profSelect.options[i].text === sala.professor) {
                profSelect.selectedIndex = i;
                break;
            }
        }
    }
    
    document.getElementById('diaSemana').value = sala.diaSemana || '';
    document.getElementById('horarioOficina').value = sala.horario || '';
    App.state.newSala = { 
        ...sala,
        professorId: sala.professor_id,
        professorNome: sala.professor
    }; 
  },

  // render students table in CAMADA 3
  renderListaAlunos(filter = '') {
    const tbody = document.getElementById('listaAlunos');
    if (!tbody) return;
    const alunos = Storage.getAlunosMatriculados(filter);
    const selectedIds = new Set(App.state.newSala?.alunos || []);
    if (!alunos || alunos.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" class="text-center py-4 text-muted">Nenhum aluno encontrado</td></tr>`;
      return;
    }
    tbody.innerHTML = alunos.map(a => `
      <tr>
        <td><input type="checkbox" class="form-check-input aluno-checkbox" data-id="${a.id}" ${selectedIds.has(a.id) ? 'checked' : ''}></td>
        <td>${a.nome}</td>
        <td>${a.matricula || '-'}</td>
      </tr>
    `).join('');

    // (re)attach behavior for select all
    const selectAll = document.getElementById('selecionarTodos');
    if (selectAll) {
      selectAll.checked = alunos.length > 0 && alunos.every(al => selectedIds.has(al.id));
      selectAll.onchange = (e) => {
        const checked = e.target.checked;
        tbody.querySelectorAll('.aluno-checkbox').forEach(cb => { cb.checked = checked; });
      };
    }

    tbody.querySelectorAll('.aluno-checkbox').forEach(cb => {
      cb.onchange = () => {
        // update state.newSala.alunos accordingly
        const id = cb.getAttribute('data-id');
        if (!id) return;
        App.state.newSala.alunos = App.state.newSala.alunos || [];
        if (cb.checked) {
          if (!App.state.newSala.alunos.includes(id)) App.state.newSala.alunos.push(id);
        } else {
          App.state.newSala.alunos = App.state.newSala.alunos.filter(x => x !== id);
        }
      };
    });
  },

  // render chamada view (camada-chamada)
  renderChamadaView() {
    const lista = document.getElementById('listaAlunosChamada');
    if (!lista) return;
    const chamada = App.state.currentChamada;
    if (!chamada || !chamada.registros || chamada.registros.length === 0) {
      lista.innerHTML = `<tr><td colspan="3" class="text-center py-4 text-muted">Nenhum aluno vinculado a essa oficina.</td></tr>`;
      return;
    }

    // sort by name
    chamada.registros.sort((a,b) => (a.nome||'').localeCompare(b.nome||''));

    lista.innerHTML = chamada.registros.map((r, idx) => {
      const presChecked = r.presente ? 'checked' : '';
      const obs = r.observacao ? (''+r.observacao).replace(/"/g,'&quot;') : '';
      return `
        <tr data-aluno-id="${r.idAluno}">
          <td>${r.nome}</td>
          <td>
            <div class="form-check form-switch">
              <input class="form-check-input presenca-checkbox" type="checkbox" id="pres_${idx}" data-idx="${idx}" ${presChecked}>
              <label class="form-check-label" for="pres_${idx}">${r.presente ? 'Presente' : 'Ausente'}</label>
            </div>
          </td>
          <td><input type="text" class="form-control form-control-sm observacao-input" id="obs_${idx}" data-idx="${idx}" value="${obs}" placeholder="Observação"></td>
        </tr>`;
    }).join('');

    // attach events
    lista.querySelectorAll('.presenca-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const idx = parseInt(cb.getAttribute('data-idx'));
        const checked = cb.checked;
        const lbl = cb.nextElementSibling;
        if (lbl) lbl.textContent = checked ? 'Presente' : 'Ausente';
        if (App.state.currentChamada && App.state.currentChamada.registros[idx]) {
          App.state.currentChamada.registros[idx].presente = checked;
        }
      });
    });

    lista.querySelectorAll('.observacao-input').forEach(inp => {
      inp.addEventListener('change', (e) => {
        const idx = parseInt(inp.getAttribute('data-idx'));
        if (App.state.currentChamada && App.state.currentChamada.registros[idx]) {
          App.state.currentChamada.registros[idx].observacao = inp.value.trim();
        }
      });
    });
  },

  // render histórico list for a sala (dados vindos da API de chamadas)
  async renderHistoricoList(idSala) {
    const container = document.getElementById('listaHistoricoChamadas');
    if (!container) return;
    let chamadas = [];
    try {
      chamadas = await ChamadaAPI.listarPorSala(idSala);
    } catch (e) {
      console.error('Erro ao carregar histórico de chamadas da API', e);
      Utils.showToast(e.message || 'Erro ao carregar histórico de chamadas', 'danger');
      // LEGADO/FALLBACK (comportamento removido):
      // Em versões anteriores, quando a API falhava, o histórico era carregado de localStorage:
      // chamadas = Storage.getChamadas().filter(c => String(c.idSala) === String(idSala));
    }
    if (!chamadas || chamadas.length === 0) {
      container.innerHTML = `<div class="alert alert-info mb-0"><i class="bi bi-info-circle me-2"></i>Nenhuma chamada registrada para esta oficina.</div>`;
      return;
    }

    // group by date (display)
    const grouped = {};
    chamadas.forEach(c => {
      const d = Utils.formatDateDisplay(c.dataISO || c.data); // fallback
      grouped[d] = grouped[d] || [];
      grouped[d].push(c);
    });

    // Verificar se o usuário pode excluir chamadas (apenas secretaria e admin)
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const userRole = userData.cargo || '';
    const canDeleteChamada = userRole === 'admin' || userRole === 'secretaria';

    let html = '';
    for (const [data, listaChamadas] of Object.entries(grouped)) {
      html += `<div class="card mb-3"><div class="card-header bg-light"><h6 class="mb-0">${data}</h6></div><div class="card-body p-0"><div class="list-group list-group-flush">`;
      html += listaChamadas.map(ch => {
        // Normalizar registros vindo da API (ch.registros com aluno incluso)
        const registros = Array.isArray(ch.registros)
          ? ch.registros.map(r => ({
              idAluno: r.aluno_id || (r.aluno && r.aluno.id) || r.idAluno,
              nome: (r.aluno && r.aluno.nome) || r.nome,
              presente: r.presente,
              observacao: r.observacao
            }))
          : [];

        const total = registros.length;
        const presentes = registros.filter(r => r.presente).length;
        const perc = total ? Math.round((presentes/total)*100) : 0;

        const btnExcluir = canDeleteChamada
          ? `<button class="btn btn-sm btn-outline-danger btn-excluir-chamada ms-2" data-id="${ch.id}" title="Excluir chamada"><i class="bi bi-trash"></i></button>`
          : '';

        return `
          <div class="list-group-item">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="mb-1">Chamada - ${ch.hora || ch.dataHora || ''}</h6>
                <small class="text-muted">${presentes} de ${total} presentes (${perc}%)</small>
              </div>
              <div class="d-flex align-items-center">
                <button class="btn btn-sm btn-outline-primary btn-det-chamada" data-id="${ch.id}"><i class="bi bi-chevron-right"></i></button>
                ${btnExcluir}
              </div>
            </div>
          </div>`;
      }).join('');
      html += `</div></div></div>`;
    }

    container.innerHTML = html;

    // attach detail handlers
    container.querySelectorAll('.btn-det-chamada').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.getAttribute('data-id');
        App.actions.showChamadaDetails(idSala, id);
      });
    });

    // attach delete handlers
    container.querySelectorAll('.btn-excluir-chamada').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.getAttribute('data-id');
        App.actions.deleteChamada(id, idSala);
      });
    });
  },

  // Modal to show chamada details
  showChamadaModal(chamada) {
    if (!chamada) return;
    // create modal HTML
    const idModal = 'modalDetalhesChamada';
    const existing = document.getElementById(idModal);
    if (existing) existing.remove();
    const html = document.createElement('div');
    html.innerHTML = `
      <div class="modal fade" id="${idModal}" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Detalhes da Chamada - ${Utils.formatDateDisplay(chamada.dataISO || chamada.data)}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <strong>Hora:</strong> ${chamada.hora || '-'}
              </div>
              <div class="table-responsive">
                <table class="table table-sm">
                  <thead><tr><th>Aluno</th><th>Presença</th><th>Observação</th></tr></thead>
                  <tbody>
                    ${chamada.registros.map(r => `
                      <tr>
                        <td>${r.nome}</td>
                        <td><span class="badge ${r.presente ? 'bg-success' : 'bg-danger'}">${r.presente ? 'Presente' : 'Ausente'}</span></td>
                        <td>${r.observacao ? r.observacao : '-'}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(html.firstElementChild);
    const modalEl = document.getElementById(idModal);
    const m = new bootstrap.Modal(modalEl);
    m.show();
    modalEl.addEventListener('hidden.bs.modal', () => { modalEl.remove(); });
  }
};

/* ===================== APP STATE & ACTIONS ===================== */
const App = {
  state: {
    newSala: { alunos: [] }, // temp storage while creating or editing
    editingSalaId: null,
    currentChamada: null
  },

  async init() {
    // initialize storage defaults
    Storage.initDefaults();

    // show loading
    UI.showLoading(true);

    // bind events
    this.bindUIEvents();

    // carregar alunos reais da API
    await this.loadAlunosReais();

    // carregar professores reais da API para o select
    await this.loadProfessores();

    // carregar salas da API
    const salas = await Storage.getSalas();

    // render após carregamento
    UI.showLoading(false);
    UI.showLayer('camada-lista');
    UI.renderSalasList(salas);
  },

  async loadProfessores() {
    try {
      const professores = await ProfessorAPI.listar();
      
      this.state.professoresCache = professores;
      
      // Preencher select do formulário de oficina (camada de cadastro)
      const selectOficina = document.getElementById('professorOficina');
      if (selectOficina) {
        selectOficina.innerHTML = '<option value="">Selecione um professor...</option>' + 
          professores.map(p => `<option value="${p.id}">${p.nome}</option>`).join('');
      }
      
      // Preencher select do modal de criar sala
      const selectModal = document.getElementById('professorSala');
      if (selectModal) {
        selectModal.innerHTML = '<option value="">Selecione um professor</option>' + 
          professores.map(p => `<option value="${p.id}">${p.nome}</option>`).join('');
      }
    } catch (e) {
      console.error('Erro ao carregar professores', e);
    }
  },

  async loadAlunosReais() {
    try {
      const token = localStorage.getItem('authToken');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const url = `${API_BASE_URL}/alunos?limit=1000&ativo=true`;
      const resp = await fetch(url, { headers });
      if (!resp.ok) {
        return; // manter vazio se falhar
      }
      const data = await resp.json();
      const lista = Array.isArray(data.alunos) ? data.alunos : (Array.isArray(data) ? data : []);
      const normalizado = lista.map(a => ({
        id: String(a.id),
        nome: a.nome,
        matricula: a.numero_matricula || a.numeroMatricula || a.matricula || '',
        status: a.ativo === false ? 'inativo' : 'matriculado'
      }));
      Storage._set(KEYS.ALUNOS, normalizado);
    } catch (e) {
      // em caso de erro de rede, manter lista atual
      console.error('Falha ao carregar alunos da API', e);
    }
  },

  bindUIEvents() {
    // Nova Oficina button
    document.getElementById('btnNovaOficina')?.addEventListener('click', () => {
      this.startCreateSala();
    });

    // form submission for cadastro (next -> selection)
    document.getElementById('formOficina')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.onFormOficinaNext();
    });

    // cancel form
    document.getElementById('btnCancelarOficina')?.addEventListener('click', async () => {
      UI.resetFormOficina();
      this.state.editingSalaId = null;
      const salas = await Storage.getSalas();
      UI.showLayer('camada-lista');
      UI.renderSalasList(salas);
    });

    // voltar buttons
    document.getElementById('btnVoltarLista')?.addEventListener('click', async () => {
      const salas = await Storage.getSalas();
      UI.showLayer('camada-lista');
      UI.renderSalasList(salas);
    });
    document.getElementById('btnVoltarCadastro')?.addEventListener('click', () => { UI.showLayer('camada-cadastro'); });
    document.getElementById('btnVoltarParaLista')?.addEventListener('click', async () => {
      const salas = await Storage.getSalas();
      UI.showLayer('camada-lista');
      UI.renderSalasList(salas);
    });
    document.getElementById('btnVoltarParaLista2')?.addEventListener('click', async () => {
      const salas = await Storage.getSalas();
      UI.showLayer('camada-lista');
      UI.renderSalasList(salas);
    });

    // busca alunos filter
    document.getElementById('buscaAlunos')?.addEventListener('input', (e) => {
      UI.renderListaAlunos(e.target.value);
    });

    // selecionar todos handled inside renderListaAlunos

    // salvar sala after selecting students
    document.getElementById('btnSalvarOficina')?.addEventListener('click', async () => {
      await this.saveSalaFromState();
    });

    // cancelar selection
    document.getElementById('btnCancelarSelecao')?.addEventListener('click', async () => {
      const salas = await Storage.getSalas();
      UI.showLayer('camada-lista');
      UI.renderSalasList(salas);
    });

    // finalize chamada (save current chamada)
    document.getElementById('btnFinalizarChamada')?.addEventListener('click', () => {
      this.finalizeChamada();
    });

    // search salas (on lista)
    document.getElementById('searchSalas')?.addEventListener('input', (e) => {
      this.filterSalas(e.target.value);
    });

    // modal inserir sala (preserved modal)
    document.getElementById('btnSalvarSalaModal')?.addEventListener('click', async () => {
      // used if user creates via modal
      await this.saveSalaFromModal();
    });

    // tempo: when switching to camada-chamada we will set date
  },

  /* ======= Actions: create / edit / delete / chamada / historico ======= */

  startCreateSala() {
    App.state.editingSalaId = null;
    App.state.newSala = { alunos: [] };
    UI.resetFormOficina();
    UI.showLayer('camada-cadastro');
    // clear selected students table too
    UI.renderListaAlunos('');
    // ensure form title
    const title = document.querySelector('#camada-cadastro h2');
    if (title) title.textContent = 'Nova Oficina';
  },

  onFormOficinaNext() {
    const form = document.getElementById('formOficina');
    if (!form) return;
    // basic validation
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      Utils.showToast('Preencha todos os campos obrigatórios', 'warning');
      return;
    }
    // gather values into state.newSala
    const nome = document.getElementById('nomeOficina')?.value.trim();
    
    // Get selected professor data
    const selectProf = document.getElementById('professorOficina');
    const professorId = selectProf?.value;
    const professorNome = selectProf?.options[selectProf.selectedIndex]?.text || '';

    const diaSemana = document.getElementById('diaSemana')?.value;
    const horario = document.getElementById('horarioOficina')?.value;

    if (!nome || !professorId || !diaSemana || !horario) {
       Utils.showToast('Preencha todos os campos', 'warning');
       return;
    }

    App.state.newSala = { 
      ...App.state.newSala, // keep alunos
      nome, 
      professorId,
      professorNome, 
      diaSemana, 
      horario 
    };

    // move to selection of students
    UI.showLayer('camada-alunos');
    UI.renderListaAlunos('');
  },

  async saveSalaFromState() {
    const s = App.state.newSala || {};
    // validation
    if (!s.nome || (!s.professorId && !s.professorNome) || !s.diaSemana || !s.horario) {
      Utils.showToast('Dados incompletos. Volte e preencha os campos.', 'warning');
      UI.showLayer('camada-cadastro');
      return;
    }

    if (App.state.editingSalaId) {
      s.id = App.state.editingSalaId;
    }

    UI.showLoading(true);
    const result = await Storage.saveSala(s);
    UI.showLoading(false);

    if (result) {
      Utils.showToast('Sala salva com sucesso!');
      App.state.editingSalaId = null;
      App.state.newSala = { alunos: [] };
      UI.resetFormOficina();
      
      const salas = await Storage.getSalas();
      UI.showLayer('camada-lista');
      UI.renderSalasList(salas);
    }
  },

  saveSalaFromModal() {
    // used by preserved modalCriarSala
    const nome = document.getElementById('nomeSala')?.value.trim();
    const professorId = document.getElementById('professorSala')?.value.trim();
    const horario = document.getElementById('horarioSala')?.value;
    const diaSemana = document.getElementById('diaSemanaSala')?.value;
    if (!nome || !professorId || !horario || !diaSemana) {
      Utils.showToast('Preencha todos os campos do modal', 'warning');
      return;
    }
    
    // Buscar nome do professor do cache
    const prof = App.state.professoresCache?.find(p => p.id == professorId);
    const professorNome = prof ? prof.nome : '';
    
    const sala = { 
      nome, 
      professor_id: parseInt(professorId),
      professor: professorNome, // Manter compatibilidade
      horario, 
      diaSemana, 
      alunos: [] 
    };
    (async () => {
      const saved = await Storage.saveSala(sala);
      if (!saved) return;
      // close modal
      const modalEl = document.getElementById('modalCriarSala');
      const inst = bootstrap.Modal.getInstance(modalEl);
      if (inst) inst.hide();
      Utils.showToast('Sala criada (modal) com sucesso!', 'success');
      const salas = await Storage.getSalas();
      UI.renderSalasList(salas);
    })();
  },

  actions: {
    async editSala(id) {
      const sala = await Storage.getSalaById(id);
      if (!sala) { Utils.showToast('Sala não encontrada', 'error'); return; }
      App.state.editingSalaId = id;
      App.state.newSala = { ...sala, alunos: sala.alunos || [] };
      UI.fillFormForEdit(sala);
      UI.showLayer('camada-cadastro');
      const title = document.querySelector('#camada-cadastro h2');
      if (title) title.textContent = 'Editar Oficina';
    },

    async deleteSala(id) {
      if (!confirm('Tem certeza que deseja excluir esta oficina?')) return;
      const ok = await Storage.deleteSala(id);
      if (!ok) return;
      Utils.showToast('Oficina excluída', 'success');
      const salas = await Storage.getSalas();
      UI.renderSalasList(salas);
    },

    async deleteChamada(idChamada, idSala) {
      if (!confirm('Tem certeza que deseja excluir esta chamada? As presenças e faltas registradas serão revertidas.')) return;
      try {
        await ChamadaAPI.excluir(idChamada);
        Utils.showToast('Chamada excluída com sucesso!', 'success');
        // Re-renderizar o histórico da mesma sala
        await UI.renderHistoricoList(idSala);
      } catch (e) {
        console.error('Erro ao excluir chamada', e);
        Utils.showToast(e.message || 'Erro ao excluir chamada', 'danger');
      }
    },

    async openChamada(idSala) {
      const sala = await Storage.getSalaById(idSala);
      if (!sala) { Utils.showToast('Oficina não encontrada', 'error'); return; }

      const todayIso = Utils.formatDateIso();

      // Passo 1: tentar reutilizar chamada do dia via API
      let chamadaExistente = null;
      try {
        const chamadasApi = await ChamadaAPI.listarPorSala(idSala, todayIso);
        if (Array.isArray(chamadasApi) && chamadasApi.length > 0) {
          const ch = chamadasApi[0];
          chamadaExistente = {
            id: ch.id,
            idSala: idSala,
            dataISO: ch.data || ch.dataISO || todayIso,
            hora: ch.hora || (new Date()).toTimeString().substring(0,5),
            registros: Array.isArray(ch.registros)
              ? ch.registros.map(r => ({
                  idAluno: r.aluno_id || (r.aluno && r.aluno.id) || r.idAluno,
                  nome: (r.aluno && r.aluno.nome) || r.nome,
                  presente: !!r.presente,
                  observacao: r.observacao || ''
                }))
              : []
          };
        }
      } catch (e) {
        console.error('Erro ao verificar chamadas existentes na API', e);
        // Em caso de erro, segue o fluxo de criação de nova chamada abaixo.
      }

      // Sempre montar (ou remontar) registros a partir da sala atual e da lista de alunos.
      const alunosVinc = sala.alunos || [];
      const alunosData = Storage.getAlunos().filter(a => alunosVinc.includes(a.id));
      const registros = alunosData.map(a => ({
        idAluno: a.id,
        nome: a.nome,
        presente: true,
        observacao: ''
      }));

      let chamada = chamadaExistente || {
        idSala: idSala,
        dataISO: todayIso,
        hora: (new Date()).toTimeString().substring(0,5),
        registros: []
      };

      // Sobrescreve os registros com a lista atual de alunos vinculados à sala
      chamada.registros = registros;
      App.state.currentChamada = chamada;

      // populate header fields in camada-chamada
      const titulo = document.getElementById('tituloOficinaChamada');
      const profEl = document.getElementById('professorOficinaChamada');
      const diaEl = document.getElementById('diaOficinaChamada');
      const horEl = document.getElementById('horarioOficinaChamada');
      const dataChamadaInput = document.getElementById('dataChamada');

      if (titulo) titulo.textContent = sala.nome;
      if (profEl) profEl.textContent = sala.professor || '-';
      if (diaEl) diaEl.textContent = sala.diaSemana || '-';
      if (horEl) horEl.textContent = sala.horario || '-';
      if (dataChamadaInput) {
        dataChamadaInput.value = chamada.dataISO || chamada.data || todayIso;
      }

      UI.renderChamadaView();
      UI.showLayer('camada-chamada');
    },

    async openHistorico(idSala) {
      const sala = await Storage.getSalaById(idSala);
      if (!sala) { Utils.showToast('Oficina não encontrada', 'error'); return; }
      const titulo = document.getElementById('tituloOficinaHistorico');
      if (titulo) titulo.textContent = `Histórico de Chamadas - ${sala.nome}`;
      await UI.renderHistoricoList(idSala);
      UI.showLayer('camada-historico');
    },

    async showChamadaDetails(idSala, idChamada) {
      let chamadas = [];
      try {
        chamada = await ChamadaAPI.listarPorSala(idSala, null);
        // Aqui assumimos que listarPorSala pode retornar várias; filtramos a desejada
        const chamadas = Array.isArray(chamada) ? chamada : [];
        chamada = chamadas.find(c => String(c.id) === String(idChamada)) || null;
      } catch (e) {
        console.error('Erro ao carregar detalhes da chamada da API', e);
        Utils.showToast(e.message || 'Erro ao carregar detalhes da chamada', 'danger');
        // LEGADO/FALLBACK (comportamento removido):
        // Em versões anteriores, quando a API falhava, os detalhes vinham do localStorage.
        // const chamadas = Storage.getChamadas().filter(c => String(c.idSala) === String(idSala));
        // chamada = chamadas.find(c => String(c.id) === String(idChamada)) || null;
      }

      const chApi = chamada;
      if (!chApi) {
        Utils.showToast('Chamada não encontrada', 'error');
        return;
      }

      const registros = Array.isArray(chApi.registros)
        ? chApi.registros.map(r => ({
            idAluno: r.aluno_id || (r.aluno && r.aluno.id) || r.idAluno,
            nome: (r.aluno && r.aluno.nome) || r.nome,
            presente: r.presente,
            observacao: r.observacao
          }))
        : [];

      const chamadaNormalizada = {
        id: chApi.id,
        idSala,
        dataISO: chApi.data || chApi.dataISO,
        hora: chApi.hora,
        registros
      };

      UI.showChamadaModal(chamadaNormalizada);
    }
  },

  finalizeChamada() {
    const chamada = App.state.currentChamada;
    if (!chamada) { Utils.showToast('Nenhuma chamada ativa', 'warning'); return; }
    // refresh registros already updated on UI events
    chamada.dataAtualizacao = new Date().toISOString();

    // Ler a data escolhida pelo professor no input
    const dataChamadaInput = document.getElementById('dataChamada');
    const dataEscolhida = dataChamadaInput ? dataChamadaInput.value : chamada.dataISO;

    const payload = {
      salaId: chamada.idSala,
      dataISO: dataEscolhida || chamada.dataISO,
      hora: chamada.hora,
      registros: chamada.registros.map(r => ({
        idAluno: r.idAluno,
        presente: !!r.presente,
        observacao: r.observacao || ''
      }))
    };

    (async () => {
      try {
        await ChamadaAPI.criar(payload);
        Utils.showToast('Chamada salva com sucesso!', 'success');
      } catch (e) {
        console.error('Erro ao salvar chamada na API', e);
        Utils.showToast(e.message || 'Erro ao salvar chamada', 'danger');
        return;
      }

      // Após salvar, ir para o histórico da mesma sala
      const idSala = chamada.idSala;
      if (idSala) {
        const sala = await Storage.getSalaById(idSala);
        if (sala && sala.nome) {
          const titulo = document.getElementById('tituloOficinaHistorico');
          if (titulo) titulo.textContent = `Histórico de Chamadas - ${sala.nome}`;
        }
        await UI.renderHistoricoList(idSala);
        UI.showLayer('camada-historico');
      } else {
        // fallback: volta para lista de salas
        const salas = await Storage.getSalas();
        UI.showLayer('camada-lista');
        UI.renderSalasList(salas);
      }
    })();
  },

  filterSalas(term) {
    const list = document.getElementById('listaSalas');
    if (!list) return;
    const t = (term||'').toLowerCase();
    Array.from(list.children).forEach(cardCol => {
      const txt = cardCol.textContent.toLowerCase();
      cardCol.style.display = txt.includes(t) ? '' : 'none';
    });
  }
};

/* ===================== Initialization ===================== */
document.addEventListener('DOMContentLoaded', () => {
  try {
    App.init();

    // small extra: wire up modalSelecionarAlunos save button if present
    document.getElementById('btnSalvarSalaModalAlunos')?.addEventListener('click', () => {
      // if user used modal flow to create sala + select alunos, we can reuse state
      // For safety, just refresh list
      UI.renderSalasList();
      const modalSel = document.getElementById('modalSelecionarAlunos');
      const inst = bootstrap.Modal.getInstance(modalSel);
      if (inst) inst.hide();
      Utils.showToast('Sala e alunos salvos (modal)', 'success');
    });

  } catch (err) {
    console.error('Erro init chamada.js', err);
    Utils.showToast('Erro ao iniciar módulo de chamadas', 'error');
    UI.showLoading(false);
    UI.showLayer('camada-lista');
  }
});
