/**
 * Settings Module — Módulo único de configurações do usuário
 * Centraliza: Perfil, Segurança, Aparência, Sistema
 * Zero alert(), zero reload, API real, toast feedback
 */
(function() {
  'use strict';

  const API = window.API_BASE_URL || 'http://localhost:3003/api';
  function token() { return localStorage.getItem('authToken'); }
  function headers() { const h = { 'Content-Type': 'application/json' }; if (token()) h['Authorization'] = 'Bearer ' + token(); return h; }

  // ========== TOAST ==========
  function toast(msg, type) {
    let c = document.getElementById('settingsToastContainer');
    if (!c) { c = document.createElement('div'); c.id = 'settingsToastContainer'; c.style.cssText = 'position:fixed;top:80px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:8px;'; document.body.appendChild(c); }
    const colors = { success: '#198754', danger: '#dc3545', warning: '#ffc107', info: '#0dcaf0' };
    const textColor = type === 'warning' ? '#000' : '#fff';
    const id = 'st-' + Date.now();
    c.insertAdjacentHTML('beforeend', `<div id="${id}" style="background:${colors[type]||colors.info};color:${textColor};padding:10px 18px;border-radius:10px;font-size:0.88rem;box-shadow:0 4px 16px rgba(0,0,0,0.15);display:flex;align-items:center;gap:8px;animation:fadeIn 0.3s ease"><i class="bi ${type==='success'?'bi-check-circle':type==='danger'?'bi-x-circle':type==='warning'?'bi-exclamation-triangle':'bi-info-circle'}"></i>${msg}</div>`);
    setTimeout(() => { const el = document.getElementById(id); if (el) { el.style.opacity = '0'; el.style.transition = 'opacity 0.3s'; setTimeout(() => el.remove(), 300); } }, 3500);
  }
  // Export globally for other modules
  window.showSettingsToast = toast;

  // ========== STATE ==========
  let originalData = {};
  let isDirty = false;

  // ========== MODAL HTML ==========
  function getModalHTML() {
    const cargoMap = { admin: 'Administrador', professor: 'Professor(a)', secretaria: 'Secretária', assistente_social: 'Assistente Social' };
    return `
    <div class="modal fade" id="configModal" tabindex="-1" aria-labelledby="configModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header border-0 pb-0">
            <div class="d-flex align-items-center gap-3">
              <div class="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center" style="width:50px;height:50px;font-size:1.4rem" id="cfgAvatar">U</div>
              <div>
                <h5 class="modal-title mb-0" id="cfgHeaderName">Configurações</h5>
                <small class="text-muted" id="cfgHeaderEmail">email@exemplo.com</small>
              </div>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body pt-3">
            <ul class="nav nav-pills nav-fill mb-3 gap-1" id="cfgTabs">
              <li class="nav-item"><button class="nav-link active" data-bs-toggle="pill" data-bs-target="#cfgPerfil"><i class="bi bi-person me-1"></i>Perfil</button></li>
              <li class="nav-item"><button class="nav-link" data-bs-toggle="pill" data-bs-target="#cfgSeg"><i class="bi bi-shield-lock me-1"></i>Segurança</button></li>
              <li class="nav-item"><button class="nav-link" data-bs-toggle="pill" data-bs-target="#cfgApar"><i class="bi bi-palette me-1"></i>Aparência</button></li>
              <li class="nav-item"><button class="nav-link" data-bs-toggle="pill" data-bs-target="#cfgSist"><i class="bi bi-sliders me-1"></i>Sistema</button></li>
            </ul>
            <div class="tab-content">

              <!-- PERFIL -->
              <div class="tab-pane fade show active" id="cfgPerfil">
                <div class="row g-3">
                  <div class="col-12">
                    <h6 class="fw-bold mb-3">Foto de perfil</h6>
                    <div class="d-flex flex-wrap gap-2 mb-2" id="cfgAvatarList">
                      ${['😊','😎','🧑‍💼','👩‍🏫','👨‍💻','🌟','💜','🎓','👩','👨','🐱','🐶'].map(e => `<button type="button" class="btn btn-outline-secondary btn-sm rounded-circle cfg-avatar-btn" data-emoji="${e}" style="width:40px;height:40px;font-size:1.2rem">${e}</button>`).join('')}
                    </div>
                    <div class="d-flex align-items-center gap-2 mt-2">
                      <input type="file" class="form-control form-control-sm" id="cfgAvatarFile" accept="image/*" style="max-width:220px">
                      <div id="cfgAvatarImgPreview" style="display:none"><img id="cfgAvatarImg" src="" class="rounded-circle" style="width:40px;height:40px;object-fit:cover;border:2px solid var(--primary-color,#663399)"><button type="button" class="btn btn-sm btn-outline-danger ms-1" id="cfgRemoveImg"><i class="bi bi-x"></i></button></div>
                    </div>
                  </div>
                  <div class="col-md-6"><label class="form-label fw-medium">Nome</label><input type="text" class="form-control" id="cfgNome" autocomplete="off"></div>
                  <div class="col-md-6"><label class="form-label fw-medium">Email</label><input type="email" class="form-control" id="cfgEmail" autocomplete="off"><div class="invalid-feedback" id="cfgEmailErr"></div></div>
                  <div class="col-md-6"><label class="form-label fw-medium">Telefone</label><input type="text" class="form-control" id="cfgTelefone" placeholder="(00) 00000-0000" autocomplete="off"></div>
                  <div class="col-md-6"><label class="form-label fw-medium">Cargo</label><input type="text" class="form-control" id="cfgCargo" readonly></div>
                  <div class="col-md-6"><label class="form-label fw-medium">Conta criada em</label><input type="text" class="form-control" id="cfgCriadoEm" readonly></div>
                  <div class="col-md-6"><label class="form-label fw-medium">Último login</label><input type="text" class="form-control" id="cfgUltimoLogin" readonly></div>
                </div>
              </div>

              <!-- SEGURANÇA -->
              <div class="tab-pane fade" id="cfgSeg">
                <div class="row g-3" style="max-width:450px">
                  <div class="col-12"><h6 class="fw-bold mb-0">Alterar senha</h6><small class="text-muted">A nova senha deve ter pelo menos 6 caracteres</small></div>
                  <div class="col-12"><label class="form-label">Senha atual</label><input type="password" class="form-control" id="cfgSenhaAtual" autocomplete="new-password"></div>
                  <div class="col-12"><label class="form-label">Nova senha</label><input type="password" class="form-control" id="cfgNovaSenha" autocomplete="new-password"><div class="invalid-feedback" id="cfgSenhaErr"></div></div>
                  <div class="col-12"><label class="form-label">Confirmar nova senha</label><input type="password" class="form-control" id="cfgConfirmaSenha" autocomplete="new-password"><div class="invalid-feedback" id="cfgConfirmaErr"></div></div>
                  <div class="col-12"><button type="button" class="btn btn-primary btn-sm" id="cfgBtnSenha" style="background:#6f42c1;border-color:#6f42c1"><i class="bi bi-key me-1"></i>Alterar Senha</button></div>
                  <div class="col-12 mt-4 pt-3 border-top">
                    <h6 class="fw-bold mb-1">Sessões</h6>
                    <p class="text-muted small mb-2">Encerre todas as sessões ativas em outros dispositivos.</p>
                    <button type="button" class="btn btn-outline-danger btn-sm" id="cfgBtnLogoutAll"><i class="bi bi-box-arrow-right me-1"></i>Encerrar todas as sessões</button>
                  </div>
                </div>
              </div>

              <!-- APARÊNCIA -->
              <div class="tab-pane fade" id="cfgApar">
                <div class="row g-3">
                  <div class="col-md-6">
                    <div class="card h-100"><div class="card-body">
                      <h6 class="fw-bold mb-3"><i class="bi bi-moon me-1"></i>Tema</h6>
                      <div class="form-check form-switch mb-2"><input class="form-check-input cfg-pref" type="checkbox" id="cfgDarkMode" data-key="darkMode"><label class="form-check-label" for="cfgDarkMode">Modo escuro</label></div>
                      <div class="form-check form-switch mb-2"><input class="form-check-input cfg-pref" type="checkbox" id="cfgHighContrast" data-key="highContrast"><label class="form-check-label" for="cfgHighContrast">Alto contraste</label></div>
                    </div></div>
                  </div>
                  <div class="col-md-6">
                    <div class="card h-100"><div class="card-body">
                      <h6 class="fw-bold mb-3"><i class="bi bi-universal-access me-1"></i>Acessibilidade</h6>
                      <div class="form-check form-switch mb-2"><input class="form-check-input cfg-pref" type="checkbox" id="cfgColorblind" data-key="colorblindMode"><label class="form-check-label" for="cfgColorblind">Modo daltônico</label></div>
                      <div class="form-check form-switch mb-2"><input class="form-check-input cfg-pref" type="checkbox" id="cfgDyslexic" data-key="dyslexicMode"><label class="form-check-label" for="cfgDyslexic">Fonte disléxica</label></div>
                      <div class="form-check form-switch mb-2"><input class="form-check-input cfg-pref" type="checkbox" id="cfgReduceMotion" data-key="reducedMotion"><label class="form-check-label" for="cfgReduceMotion">Reduzir animações</label></div>
                    </div></div>
                  </div>
                  <div class="col-12">
                    <div class="card"><div class="card-body">
                      <h6 class="fw-bold mb-3"><i class="bi bi-fonts me-1"></i>Tamanho da fonte</h6>
                      <div class="btn-group" role="group">
                        <button type="button" class="btn btn-outline-secondary btn-sm cfg-font-btn" data-size="small">Pequena</button>
                        <button type="button" class="btn btn-outline-secondary btn-sm cfg-font-btn active" data-size="medium">Padrão</button>
                        <button type="button" class="btn btn-outline-secondary btn-sm cfg-font-btn" data-size="large">Grande</button>
                      </div>
                    </div></div>
                  </div>
                </div>
              </div>

              <!-- SISTEMA -->
              <div class="tab-pane fade" id="cfgSist">
                <div class="card"><div class="card-body">
                  <h6 class="fw-bold mb-3"><i class="bi bi-translate me-1"></i>Idioma do sistema</h6>
                  <select class="form-select" id="cfgIdioma" style="max-width:300px">
                    <option value="pt-BR">🇧🇷 Português (Brasil)</option>
                    <option value="en">🇺🇸 English</option>
                    <option value="es">🇪🇸 Español</option>
                  </select>
                </div></div>
              </div>

            </div>
          </div>
          <div class="modal-footer border-0 pt-0">
            <button type="button" class="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">Fechar</button>
            <button type="button" class="btn btn-primary btn-sm" id="cfgBtnSalvar" style="background:#6f42c1;border-color:#6f42c1" disabled><i class="bi bi-check-lg me-1"></i>Salvar alterações</button>
          </div>
        </div>
      </div>
    </div>`;
  }

  // ========== INJECT MODAL ==========
  function injectModal() {
    const old = document.getElementById('configModal');
    if (old) old.remove();
    document.body.insertAdjacentHTML('beforeend', getModalHTML());
  }

  // ========== LOAD USER DATA ==========
  async function loadUserData() {
    try {
      const resp = await fetch(API + '/auth/verify', { headers: headers() });
      if (!resp.ok) return;
      const data = await resp.json();
      const u = data.user;

      const cargoMap = { admin: 'Administrador', professor: 'Professor(a)', secretaria: 'Secretária', assistente_social: 'Assistente Social' };

      document.getElementById('cfgNome').value = u.nome || '';
      document.getElementById('cfgEmail').value = u.email || '';
      document.getElementById('cfgTelefone').value = u.telefone || '';
      document.getElementById('cfgCargo').value = cargoMap[u.cargo] || u.cargo || '';
      document.getElementById('cfgCriadoEm').value = u.createdAt ? new Date(u.createdAt).toLocaleDateString('pt-BR') : '-';
      document.getElementById('cfgUltimoLogin').value = u.ultimo_login ? new Date(u.ultimo_login).toLocaleString('pt-BR') : '-';

      // Header
      document.getElementById('cfgHeaderName').textContent = u.nome || 'Configurações';
      document.getElementById('cfgHeaderEmail').textContent = u.email || '';

      // Avatar
      const savedImg = localStorage.getItem('userAvatarImage');
      const savedEmoji = localStorage.getItem('userAvatar');
      const av = document.getElementById('cfgAvatar');
      if (savedImg) { av.innerHTML = '<img src="' + savedImg + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%">'; showImgPreview(savedImg); }
      else if (savedEmoji) { av.innerHTML = ''; av.textContent = savedEmoji; }
      else { av.innerHTML = ''; av.textContent = (u.nome || 'U').charAt(0).toUpperCase(); }

      // Mark saved emoji
      const btns = document.querySelectorAll('.cfg-avatar-btn');
      btns.forEach(b => { b.classList.toggle('btn-primary', b.dataset.emoji === savedEmoji && !savedImg); b.classList.toggle('btn-outline-secondary', !(b.dataset.emoji === savedEmoji && !savedImg)); });

      // Store original for dirty check
      originalData = { nome: u.nome || '', email: u.email || '', telefone: u.telefone || '' };
      isDirty = false;
      updateSaveBtn();
    } catch (e) { console.error('Erro ao carregar perfil:', e); }
  }

  // ========== DIRTY TRACKING ==========
  function markDirty() {
    const nome = document.getElementById('cfgNome')?.value || '';
    const email = document.getElementById('cfgEmail')?.value || '';
    const telefone = document.getElementById('cfgTelefone')?.value || '';
    isDirty = nome !== originalData.nome || email !== originalData.email || telefone !== originalData.telefone;
    updateSaveBtn();
  }

  function updateSaveBtn() {
    const btn = document.getElementById('cfgBtnSalvar');
    if (btn) btn.disabled = !isDirty;
  }

  // ========== SAVE PROFILE ==========
  async function saveProfile() {
    const btn = document.getElementById('cfgBtnSalvar');
    const nome = document.getElementById('cfgNome').value.trim();
    const email = document.getElementById('cfgEmail').value.trim();
    const telefone = document.getElementById('cfgTelefone').value.trim();

    if (!nome) { toast('Nome é obrigatório', 'warning'); return; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      document.getElementById('cfgEmail').classList.add('is-invalid');
      document.getElementById('cfgEmailErr').textContent = 'Email inválido';
      return;
    }
    document.getElementById('cfgEmail').classList.remove('is-invalid');

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Salvando...';

    try {
      const resp = await fetch(API + '/auth/profile', { method: 'PATCH', headers: headers(), body: JSON.stringify({ nome, email, telefone }) });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Erro ao salvar');

      // Update localStorage
      localStorage.setItem('userData', JSON.stringify(data.user));
      localStorage.setItem('user', JSON.stringify({ id: data.user.id, email: data.user.email, name: data.user.nome }));

      // Update navbar UI in-place
      const navName = document.getElementById('navUserName');
      const navFullName = document.getElementById('navUserNameFull');
      const navEmail = document.getElementById('navUserEmail');
      if (navName) navName.textContent = data.user.nome.split(' ')[0];
      if (navFullName) navFullName.textContent = data.user.nome;
      if (navEmail) navEmail.textContent = data.user.email;

      // Update header
      document.getElementById('cfgHeaderName').textContent = data.user.nome;
      document.getElementById('cfgHeaderEmail').textContent = data.user.email;

      originalData = { nome: data.user.nome, email: data.user.email, telefone: data.user.telefone || '' };
      isDirty = false;
      toast('Perfil atualizado com sucesso!', 'success');
    } catch (e) { toast(e.message, 'danger'); }

    btn.disabled = false;
    btn.innerHTML = '<i class="bi bi-check-lg me-1"></i>Salvar alterações';
    updateSaveBtn();
  }

  // ========== CHANGE PASSWORD ==========
  async function changePassword() {
    const atual = document.getElementById('cfgSenhaAtual').value;
    const nova = document.getElementById('cfgNovaSenha').value;
    const confirma = document.getElementById('cfgConfirmaSenha').value;

    // Clear errors
    ['cfgNovaSenha', 'cfgConfirmaSenha'].forEach(id => document.getElementById(id).classList.remove('is-invalid'));

    if (!atual) { toast('Informe a senha atual', 'warning'); return; }
    if (nova.length < 6) {
      document.getElementById('cfgNovaSenha').classList.add('is-invalid');
      document.getElementById('cfgSenhaErr').textContent = 'Mínimo 6 caracteres';
      return;
    }
    if (nova !== confirma) {
      document.getElementById('cfgConfirmaSenha').classList.add('is-invalid');
      document.getElementById('cfgConfirmaErr').textContent = 'Senhas não coincidem';
      return;
    }

    const btn = document.getElementById('cfgBtnSenha');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Alterando...';

    try {
      const resp = await fetch(API + '/auth/change-password', { method: 'POST', headers: headers(), body: JSON.stringify({ senhaAtual: atual, novaSenha: nova }) });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Erro ao alterar senha');

      document.getElementById('cfgSenhaAtual').value = '';
      document.getElementById('cfgNovaSenha').value = '';
      document.getElementById('cfgConfirmaSenha').value = '';
      toast('Senha alterada com sucesso!', 'success');
    } catch (e) { toast(e.message, 'danger'); }

    btn.disabled = false;
    btn.innerHTML = '<i class="bi bi-key me-1"></i>Alterar Senha';
  }

  // ========== LOGOUT ALL ==========
  async function logoutAllSessions() {
    try {
      const resp = await fetch(API + '/auth/logout-all', { method: 'POST', headers: headers() });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error);
      toast(data.message, 'success');
      setTimeout(() => { localStorage.clear(); window.location.href = '../index.html'; }, 2000);
    } catch (e) { toast(e.message, 'danger'); }
  }

  // ========== APPEARANCE ==========
  function loadAppearance() {
    document.getElementById('cfgDarkMode').checked = localStorage.getItem('darkMode') === 'true';
    document.getElementById('cfgHighContrast').checked = localStorage.getItem('highContrast') === 'true';
    document.getElementById('cfgColorblind').checked = localStorage.getItem('colorblindMode') === 'true';
    document.getElementById('cfgDyslexic').checked = localStorage.getItem('dyslexicMode') === 'true';
    document.getElementById('cfgReduceMotion').checked = localStorage.getItem('reducedMotion') === 'true';

    const fontSize = localStorage.getItem('fontSize') || 'medium';
    document.querySelectorAll('.cfg-font-btn').forEach(b => { b.classList.toggle('active', b.dataset.size === fontSize); });

    document.getElementById('cfgIdioma').value = localStorage.getItem('language') || 'pt-BR';
  }

  function applyPref(key, val) {
    localStorage.setItem(key, val);
    const classMap = { darkMode: 'dark-mode', highContrast: 'high-contrast', colorblindMode: 'colorblind-mode', dyslexicMode: 'dyslexic-mode', reducedMotion: 'reduced-motion' };
    if (classMap[key]) {
      document.body.classList.toggle(classMap[key], val === true || val === 'true');
      document.documentElement.classList.toggle(classMap[key], val === true || val === 'true');
    }
  }

  // ========== AVATARS ==========
  function setupAvatars() {
    document.querySelectorAll('.cfg-avatar-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const emoji = btn.dataset.emoji;
        localStorage.setItem('userAvatar', emoji);
        localStorage.removeItem('userAvatarImage');
        document.querySelectorAll('.cfg-avatar-btn').forEach(b => { b.classList.remove('btn-primary'); b.classList.add('btn-outline-secondary'); });
        btn.classList.remove('btn-outline-secondary'); btn.classList.add('btn-primary');
        updateAllAvatars(emoji, false);
        hideImgPreview();
        toast('Avatar atualizado!', 'success');
      });
    });

    const fileInput = document.getElementById('cfgAvatarFile');
    if (fileInput) fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) { toast('Selecione uma imagem válida', 'warning'); return; }
      if (file.size > 2 * 1024 * 1024) { toast('Imagem deve ter no máximo 2MB', 'warning'); return; }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const b64 = ev.target.result;
        localStorage.setItem('userAvatarImage', b64);
        localStorage.removeItem('userAvatar');
        document.querySelectorAll('.cfg-avatar-btn').forEach(b => { b.classList.remove('btn-primary'); b.classList.add('btn-outline-secondary'); });
        updateAllAvatars(b64, true);
        showImgPreview(b64);
        toast('Foto atualizada!', 'success');
      };
      reader.readAsDataURL(file);
    });

    document.getElementById('cfgRemoveImg')?.addEventListener('click', () => {
      localStorage.removeItem('userAvatarImage');
      hideImgPreview();
      const ud = JSON.parse(localStorage.getItem('userData') || '{}');
      const init = (ud.nome || 'U').charAt(0).toUpperCase();
      updateAllAvatars(init, false);
      const fi = document.getElementById('cfgAvatarFile'); if (fi) fi.value = '';
      toast('Foto removida', 'info');
    });
  }

  function updateAllAvatars(val, isImg) {
    const targets = ['cfgAvatar', 'navUserAvatar', 'navUserAvatarSmall'];
    targets.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      if (isImg) { el.innerHTML = '<img src="' + val + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%">'; }
      else { el.innerHTML = ''; el.textContent = val; }
    });
  }

  function showImgPreview(b64) {
    const c = document.getElementById('cfgAvatarImgPreview');
    const img = document.getElementById('cfgAvatarImg');
    if (c && img) { img.src = b64; c.style.display = 'flex'; }
  }
  function hideImgPreview() {
    const c = document.getElementById('cfgAvatarImgPreview');
    if (c) c.style.display = 'none';
  }

  // ========== SETUP EVENTS ==========
  function setupEvents() {
    // Dirty tracking
    ['cfgNome', 'cfgEmail', 'cfgTelefone'].forEach(id => {
      document.getElementById(id)?.addEventListener('input', markDirty);
    });

    // Save profile
    document.getElementById('cfgBtnSalvar')?.addEventListener('click', saveProfile);

    // Change password
    document.getElementById('cfgBtnSenha')?.addEventListener('click', changePassword);

    // Logout all
    document.getElementById('cfgBtnLogoutAll')?.addEventListener('click', () => {
      if (confirm('Todas as sessões serão encerradas. Deseja continuar?')) logoutAllSessions();
    });

    // Appearance toggles — apply immediately
    document.querySelectorAll('.cfg-pref').forEach(toggle => {
      toggle.addEventListener('change', () => {
        applyPref(toggle.dataset.key, toggle.checked);
        toast('Preferência aplicada', 'success');
      });
    });

    // Font size
    document.querySelectorAll('.cfg-font-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.cfg-font-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const size = btn.dataset.size;
        document.body.classList.remove('font-small', 'font-medium', 'font-large');
        document.body.classList.add('font-' + size);
        localStorage.setItem('fontSize', size);
        toast('Tamanho da fonte alterado', 'success');
      });
    });

    // Language
    document.getElementById('cfgIdioma')?.addEventListener('change', (e) => {
      const lang = e.target.value;
      localStorage.setItem('language', lang);
      if (typeof applyTranslations === 'function') applyTranslations(lang);
      toast('Idioma alterado', 'success');
    });

    // Avatars
    setupAvatars();

    // Load data when modal opens
    document.getElementById('configModal')?.addEventListener('show.bs.modal', () => {
      loadUserData();
      loadAppearance();
    });
  }

  // ========== INIT ==========
  function init() {
    injectModal();
    setupEvents();
  }

  // ========== APPLY PREFS ON LOAD (before DOM) ==========
  // This runs immediately
  (function applyOnLoad() {
    const prefs = { darkMode: 'dark-mode', highContrast: 'high-contrast', colorblindMode: 'colorblind-mode', dyslexicMode: 'dyslexic-mode', reducedMotion: 'reduced-motion' };
    Object.keys(prefs).forEach(k => {
      if (localStorage.getItem(k) === 'true') {
        document.documentElement.classList.add(prefs[k]);
        document.body?.classList.add(prefs[k]);
      }
    });
    const fs = localStorage.getItem('fontSize') || 'medium';
    document.body?.classList.remove('font-small', 'font-medium', 'font-large');
    document.body?.classList.add('font-' + fs);
  })();

  // Export init for navbar.js to call
  window._settingsInit = init;

  // Also auto-init if DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
