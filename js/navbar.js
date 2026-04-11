// Componente de Navbar Centralizado
document.addEventListener('DOMContentLoaded', function() {
    // Aplicar configurações de acessibilidade ANTES de qualquer coisa
    applyAccessibilitySettings();
    
    // Função para injetar o modal de configurações
    function injectConfigModal() {
        // Verifica se já existe o modal para não duplicar
        if (document.getElementById('configModal')) return;
        
        const modalHTML = `
        <div class="modal fade" id="configModal" tabindex="-1" aria-labelledby="configModalLabel" aria-hidden="true">
          <div class="modal-dialog modal-xl modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header border-0 pb-0">
                <div>
                  <h5 class="modal-title" id="configModalLabel">
                    <i class="bi bi-gear"></i> <span data-i18n="settings">Configurações</span>
                  </h5>
                  <small class="text-muted" data-i18n="settings_desc">Gerencie sua conta, preferências e acessibilidade</small>
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body pt-3">
                <div class="row g-3">
                  <!-- Menu lateral de abas -->
                  <div class="col-md-3 border-end">
                    <div class="nav flex-column nav-pills gap-2" id="configTabs" role="tablist" aria-orientation="vertical">
                      <button class="nav-link active d-flex align-items-center gap-2" id="tab-pessoal" data-bs-toggle="pill" data-bs-target="#pane-pessoal" type="button" role="tab">
                        <i class="bi bi-person-circle"></i>
                        <span data-i18n="personal">Pessoal</span>
                      </button>
                      <button class="nav-link d-flex align-items-center gap-2" id="tab-geral" data-bs-toggle="pill" data-bs-target="#pane-geral" type="button" role="tab">
                        <i class="bi bi-sliders"></i>
                        <span data-i18n="general">Geral</span>
                      </button>
                      <button class="nav-link d-flex align-items-center gap-2" id="tab-seguranca" data-bs-toggle="pill" data-bs-target="#pane-seguranca" type="button" role="tab">
                        <i class="bi bi-shield-lock"></i>
                        <span data-i18n="security">Segurança</span>
                      </button>
                      <button class="nav-link d-flex align-items-center gap-2" id="tab-acessibilidade" data-bs-toggle="pill" data-bs-target="#pane-acessibilidade" type="button" role="tab">
                        <i class="bi bi-universal-access"></i>
                        <span data-i18n="accessibility">Acessibilidade</span>
                      </button>
                    </div>
                  </div>

                  <!-- Conteúdo das abas -->
                  <div class="col-md-9">
                    <div class="tab-content" id="configTabsContent">
                      <!-- Aba Pessoal -->
                      <div class="tab-pane fade show active" id="pane-pessoal" role="tabpanel">
                        <div class="mb-4 d-flex align-items-center gap-3">
                          <div class="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center" style="width:64px;height:64px;font-size:1.75rem;" id="configAvatarPreview">U</div>
                          <div>
                            <h6 class="mb-1" id="configUserName">Nome do Usuário</h6>
                            <small class="text-muted" id="configUserEmail">email@exemplo.com</small>
                          </div>
                        </div>
                        <div class="row g-3">
                          <div class="col-md-6">
                            <div class="card h-100">
                              <div class="card-body">
                                <h6 class="card-title mb-3" data-i18n="profile_photo">Foto de perfil</h6>
                                <p class="small text-muted" data-i18n="choose_avatar">Escolha um avatar ou envie uma foto do seu computador.</p>
                                <div class="d-flex flex-wrap gap-2 mb-3" id="configAvatarList">
                                  <button type="button" class="btn btn-outline-secondary btn-sm rounded-circle avatar-option" data-avatar="😊" style="width:40px;height:40px;font-size:1.2rem;">😊</button>
                                  <button type="button" class="btn btn-outline-secondary btn-sm rounded-circle avatar-option" data-avatar="😎" style="width:40px;height:40px;font-size:1.2rem;">😎</button>
                                  <button type="button" class="btn btn-outline-secondary btn-sm rounded-circle avatar-option" data-avatar="🧑‍💼" style="width:40px;height:40px;font-size:1.2rem;">🧑‍💼</button>
                                  <button type="button" class="btn btn-outline-secondary btn-sm rounded-circle avatar-option" data-avatar="👩‍🏫" style="width:40px;height:40px;font-size:1.2rem;">👩‍🏫</button>
                                  <button type="button" class="btn btn-outline-secondary btn-sm rounded-circle avatar-option" data-avatar="👨‍💻" style="width:40px;height:40px;font-size:1.2rem;">👨‍💻</button>
                                  <button type="button" class="btn btn-outline-secondary btn-sm rounded-circle avatar-option" data-avatar="🌟" style="width:40px;height:40px;font-size:1.2rem;">🌟</button>
                                  <button type="button" class="btn btn-outline-secondary btn-sm rounded-circle avatar-option" data-avatar="💜" style="width:40px;height:40px;font-size:1.2rem;">💜</button>
                                  <button type="button" class="btn btn-outline-secondary btn-sm rounded-circle avatar-option" data-avatar="🎓" style="width:40px;height:40px;font-size:1.2rem;">🎓</button>
                                  <button type="button" class="btn btn-outline-secondary btn-sm rounded-circle avatar-option" data-avatar="👩" style="width:40px;height:40px;font-size:1.2rem;">👩</button>
                                  <button type="button" class="btn btn-outline-secondary btn-sm rounded-circle avatar-option" data-avatar="👨" style="width:40px;height:40px;font-size:1.2rem;">👨</button>
                                  <button type="button" class="btn btn-outline-secondary btn-sm rounded-circle avatar-option" data-avatar="🐱" style="width:40px;height:40px;font-size:1.2rem;">🐱</button>
                                  <button type="button" class="btn btn-outline-secondary btn-sm rounded-circle avatar-option" data-avatar="🐶" style="width:40px;height:40px;font-size:1.2rem;">🐶</button>
                                </div>
                                <hr class="my-3">
                                <p class="small text-muted mb-2" data-i18n="upload_photo">Ou envie uma foto do seu computador:</p>
                                <input type="file" class="form-control form-control-sm" id="avatarFileInput" accept="image/*" style="max-width: 250px;">
                                <div id="avatarPreviewContainer" class="mt-2" style="display: none;">
                                  <img id="avatarImagePreview" src="" alt="Preview" class="rounded-circle" style="width: 60px; height: 60px; object-fit: cover; border: 2px solid var(--primary-color);">
                                  <button type="button" class="btn btn-sm btn-outline-danger ms-2" id="removeAvatarImage"><i class="bi bi-trash"></i></button>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div class="col-md-6">
                            <div class="card h-100">
                              <div class="card-body">
                                <h6 class="card-title mb-3" data-i18n="personal_data">Dados pessoais</h6>
                                <div class="mb-2">
                                  <label class="form-label" data-i18n="full_name">Nome completo</label>
                                  <input type="text" class="form-control" id="inputNome" placeholder="Seu nome" />
                                </div>
                                <div class="mb-2">
                                  <label class="form-label" data-i18n="phone">Telefone</label>
                                  <input type="text" class="form-control" id="inputTelefone" placeholder="(00) 00000-0000" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Aba Geral -->
                      <div class="tab-pane fade" id="pane-geral" role="tabpanel">
                        <div class="card">
                          <div class="card-body">
                            <h6 class="card-title mb-3" data-i18n="system_language">Idioma do sistema</h6>
                            <p class="small text-muted" data-i18n="choose_language_desc">Escolha o idioma padrão da plataforma.</p>
                            <div class="row g-3 align-items-center">
                              <div class="col-md-6">
                                <select class="form-select" id="modalLanguageSelect">
                                  <option value="pt-BR">🇧🇷 Português (Brasil)</option>
                                  <option value="en">🇺🇸 English</option>
                                  <option value="es">🇪🇸 Español</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Aba Segurança -->
                      <div class="tab-pane fade" id="pane-seguranca" role="tabpanel">
                        <div class="card">
                          <div class="card-body">
                            <h6 class="card-title mb-3" data-i18n="change_password">Alterar senha</h6>
                            <p class="small text-muted" data-i18n="change_password_desc">Altere sua senha de acesso ao sistema.</p>
                            <div class="row g-3" style="max-width: 400px;">
                              <div class="col-12">
                                <label class="form-label" data-i18n="current_password">Senha Atual</label>
                                <input type="password" class="form-control" id="modalCurrentPassword">
                              </div>
                              <div class="col-12">
                                <label class="form-label" data-i18n="new_password">Nova Senha</label>
                                <input type="password" class="form-control" id="modalNewPassword">
                              </div>
                              <div class="col-12">
                                <label class="form-label" data-i18n="confirm_password">Confirmar Nova Senha</label>
                                <input type="password" class="form-control" id="modalConfirmPassword">
                              </div>
                              <div class="col-12">
                                <button type="button" class="btn btn-primary" id="btnModalChangePassword" style="background-color:#6f42c1;border-color:#6f42c1;">
                                  <span data-i18n="change_password">Alterar Senha</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Aba Acessibilidade -->
                      <div class="tab-pane fade" id="pane-acessibilidade" role="tabpanel">
                        <div class="row g-3">
                          <div class="col-md-6">
                            <div class="card h-100">
                              <div class="card-body">
                                <h6 class="card-title mb-3" data-i18n="font_size">Tamanho da fonte</h6>
                                <div class="btn-group" role="group">
                                  <button type="button" class="btn btn-outline-secondary btn-sm modal-font-btn" data-size="small" data-i18n="small">Pequena</button>
                                  <button type="button" class="btn btn-outline-secondary btn-sm modal-font-btn active" data-size="medium" data-i18n="medium">Padrão</button>
                                  <button type="button" class="btn btn-outline-secondary btn-sm modal-font-btn" data-size="large" data-i18n="large">Grande</button>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div class="col-md-6">
                            <div class="card h-100">
                              <div class="card-body">
                                <h6 class="card-title mb-3" data-i18n="display_settings">Modos visuais</h6>
                                <div class="form-check form-switch mb-2">
                                  <input class="form-check-input" type="checkbox" id="modalDarkMode" />
                                  <label class="form-check-label" for="modalDarkMode" data-i18n="dark_mode">Modo escuro</label>
                                </div>
                                <div class="form-check form-switch mb-2">
                                  <input class="form-check-input" type="checkbox" id="modalHighContrast" />
                                  <label class="form-check-label" for="modalHighContrast" data-i18n="high_contrast">Alto Contraste</label>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-footer border-0 pt-0">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal" data-i18n="close">Fechar</button>
                <button type="button" class="btn btn-primary" id="btnSalvarConfigModal" style="background-color:#6f42c1;border-color:#6f42c1;" data-i18n="save_changes">Salvar alterações</button>
              </div>
            </div>
          </div>
        </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        setupConfigModal();
    }
    
    // Configurar funcionalidades do modal de configurações
    function setupConfigModal() {
        // Carregar dados do usuário
        const userData = JSON.parse(localStorage.getItem('userData')) || {};
        const user = JSON.parse(localStorage.getItem('user')) || {};
        
        const displayName = user.name || userData.nome || 'Usuário';
        const email = user.email || userData.email || '';
        
        const configUserName = document.getElementById('configUserName');
        const configUserEmail = document.getElementById('configUserEmail');
        const configAvatarPreview = document.getElementById('configAvatarPreview');
        
        if (configUserName) configUserName.textContent = displayName;
        if (configUserEmail) configUserEmail.textContent = email;
        
        // Carregar avatar
        const savedAvatarImage = localStorage.getItem('userAvatarImage');
        const savedAvatar = localStorage.getItem('userAvatar');
        
        if (configAvatarPreview) {
            if (savedAvatarImage) {
                configAvatarPreview.innerHTML = '<img src="' + savedAvatarImage + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">';
            } else if (savedAvatar) {
                configAvatarPreview.textContent = savedAvatar;
            } else {
                configAvatarPreview.textContent = displayName.charAt(0).toUpperCase();
            }
        }
        
        // Carregar idioma salvo
        const savedLang = localStorage.getItem('language') || 'pt-BR';
        const langSelect = document.getElementById('modalLanguageSelect');
        if (langSelect) langSelect.value = savedLang;
        
        // Carregar configurações de acessibilidade
        const darkMode = localStorage.getItem('darkMode') === 'true';
        const highContrast = localStorage.getItem('highContrast') === 'true';
        const fontSize = localStorage.getItem('fontSize') || 'medium';
        
        const darkModeCheck = document.getElementById('modalDarkMode');
        const highContrastCheck = document.getElementById('modalHighContrast');
        
        if (darkModeCheck) darkModeCheck.checked = darkMode;
        if (highContrastCheck) highContrastCheck.checked = highContrast;
        
        // Marcar botão de fonte ativo
        document.querySelectorAll('.modal-font-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.size === fontSize) btn.classList.add('active');
        });
        
        // Event listeners para avatares
        document.querySelectorAll('#configModal .avatar-option').forEach(btn => {
            btn.addEventListener('click', function() {
                const avatar = this.dataset.avatar;
                localStorage.setItem('userAvatar', avatar);
                localStorage.removeItem('userAvatarImage');
                if (configAvatarPreview) {
                    configAvatarPreview.innerHTML = '';
                    configAvatarPreview.textContent = avatar;
                }
                // Atualizar navbar
                updateNavbarAvatar();
            });
        });
        
        // Event listener para upload de foto
        const avatarFileInput = document.getElementById('avatarFileInput');
        if (avatarFileInput) {
            avatarFileInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        const base64 = event.target.result;
                        localStorage.setItem('userAvatarImage', base64);
                        localStorage.removeItem('userAvatar');
                        if (configAvatarPreview) {
                            configAvatarPreview.innerHTML = '<img src="' + base64 + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">';
                        }
                        updateNavbarAvatar();
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
        
        // Event listener para idioma
        if (langSelect) {
            langSelect.addEventListener('change', function() {
                const lang = this.value;
                localStorage.setItem('language', lang);
                if (typeof applyTranslations === 'function') {
                    applyTranslations(lang);
                }
            });
        }
        
        // Event listeners para acessibilidade
        if (darkModeCheck) {
            darkModeCheck.addEventListener('change', function() {
                localStorage.setItem('darkMode', this.checked);
                applyAccessibilitySettings();
            });
        }
        
        if (highContrastCheck) {
            highContrastCheck.addEventListener('change', function() {
                localStorage.setItem('highContrast', this.checked);
                applyAccessibilitySettings();
            });
        }
        
        // Event listeners para tamanho da fonte
        document.querySelectorAll('.modal-font-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.modal-font-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                localStorage.setItem('fontSize', this.dataset.size);
                applyAccessibilitySettings();
            });
        });
        
        // Botão salvar
        const btnSalvar = document.getElementById('btnSalvarConfigModal');
        if (btnSalvar) {
            btnSalvar.addEventListener('click', function() {
                // Salvar nome se alterado
                const inputNome = document.getElementById('inputNome');
                if (inputNome && inputNome.value) {
                    const userData = JSON.parse(localStorage.getItem('userData')) || {};
                    userData.nome = inputNome.value;
                    localStorage.setItem('userData', JSON.stringify(userData));
                }
                
                // Fechar modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('configModal'));
                if (modal) modal.hide();
                
                // Recarregar para aplicar mudanças
                location.reload();
            });
        }
    }
    
    // Atualizar avatar na navbar
    function updateNavbarAvatar() {
        const savedAvatarImage = localStorage.getItem('userAvatarImage');
        const savedAvatar = localStorage.getItem('userAvatar');
        const navAvatar = document.getElementById('navUserAvatar');
        const navAvatarSmall = document.getElementById('navUserAvatarSmall');
        
        if (savedAvatarImage) {
            if (navAvatar) navAvatar.innerHTML = '<img src="' + savedAvatarImage + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">';
            if (navAvatarSmall) navAvatarSmall.innerHTML = '<img src="' + savedAvatarImage + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">';
        } else if (savedAvatar) {
            if (navAvatar) { navAvatar.innerHTML = ''; navAvatar.textContent = savedAvatar; }
            if (navAvatarSmall) { navAvatarSmall.innerHTML = ''; navAvatarSmall.textContent = savedAvatar; }
        }
    }
    
    // Função para injetar a navbar
    function injectNavbar() {
        // Verifica se já existe navbar para não duplicar (ou substitui se necessário)
        const existingNav = document.querySelector('nav.navbar');
        if (existingNav) existingNav.remove();

        const navbarHTML = `
        <nav class="navbar navbar-expand-lg navbar-dark fixed-top shadow" style="background-color: var(--primary-color, #663399);">
            <div class="container-fluid">
                <a class="navbar-brand" href="menu.html" style="display: flex; align-items: center; gap: 10px;">
                    <i class="bi bi-box-seam"></i>
                    <span class="h5 mb-0" data-i18n="platform_name">Beta - Plataforma de Gestão</span>
                </a>
                
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>

                <div class="collapse navbar-collapse justify-content-end" id="navbarNav">
                    <div class="d-flex align-items-center gap-3">
                        <!-- Botão Início (escondido apenas na página menu.html) -->
                        <a href="menu.html" class="btn btn-outline-light home-btn">
                            <i class="bi bi-house-door"></i>
                            <span class="d-none d-md-inline" data-i18n="home">Início</span>
                        </a>

                        <!-- Dropdown de Usuário -->
                        <div class="dropdown">
                            <div class="user-profile" id="userProfileDropdown" data-bs-toggle="dropdown" aria-expanded="false" style="cursor: pointer; display: flex; align-items: center; gap: 10px; color: white;">
                                <div class="avatar" id="navUserAvatar" style="width: 32px; height: 32px; background-color: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">UT</div>
                                <div class="user-info d-none d-sm-block text-start">
                                    <span class="user-name d-block fw-semibold" id="navUserName">Usuário</span>
                                </div>
                                <i class="bi bi-chevron-down dropdown-arrow ms-1" style="font-size: 0.8em;"></i>
                            </div>
                            <ul class="dropdown-menu dropdown-menu-end shadow rounded-3 p-2" aria-labelledby="userProfileDropdown" style="min-width: 260px;">
                                <li class="px-2 pt-1 pb-2 border-bottom">
                                    <div class="d-flex align-items-center gap-2">
                                        <div class="avatar-small" id="navUserAvatarSmall" style="width: 40px; height: 40px; background-color: #f2f2f2; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #333; font-weight: bold;">UT</div>
                                        <div class="header-info overflow-hidden">
                                            <span class="header-name d-block fw-semibold text-truncate" id="navUserNameFull">Usuário</span>
                                            <span class="header-email d-block text-muted small text-truncate" id="navUserEmail">email@exemplo.com</span>
                                        </div>
                                    </div>
                                </li>
                                <li class="pt-2 pb-1 px-2">
                                    <button class="btn btn-outline-secondary w-100 mb-2 d-flex align-items-center justify-content-center gap-2" id="navBtnOptions" type="button">
                                        <i class="bi bi-sliders"></i>
                                        <span data-i18n="settings">Configurações</span>
                                    </button>
                                    <button class="btn btn-danger w-100 d-flex align-items-center justify-content-center gap-2" id="navBtnLogout" type="button">
                                        <i class="bi bi-box-arrow-right"></i>
                                        <span data-i18n="logout">Sair</span>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
        `;

        // Inserir no início do body
        document.body.insertAdjacentHTML('afterbegin', navbarHTML);

        // Ajustar padding do body para não ficar escondido atrás da navbar fixa
        document.body.style.paddingTop = '70px';

        // Esconder botão Início se estiver na página menu.html
        if (window.location.pathname.includes('menu.html')) {
            const homeBtn = document.querySelector('.home-btn');
            if (homeBtn) homeBtn.style.display = 'none';
        }

        setupUserMenu();
    }

    // Configurar dados do usuário
    function setupUserMenu() {
        const user = JSON.parse(localStorage.getItem('user')) || {};
        const userData = JSON.parse(localStorage.getItem('userData')) || {};
        
        // Prioriza userData (que vem do login) ou user (que pode ser cache antigo)
        const displayName = user.name || userData.nome || 'Usuário';
        const email = user.email || userData.email || '';
        const initials = (displayName.charAt(0) || 'U').toUpperCase();

        // Atualizar elementos
        const els = {
            name: document.getElementById('navUserName'),
            fullName: document.getElementById('navUserNameFull'),
            email: document.getElementById('navUserEmail'),
            emailSmall: document.getElementById('navUserEmailSmall'),
            avatar: document.getElementById('navUserAvatar'),
            avatarSmall: document.getElementById('navUserAvatarSmall')
        };

        const firstName = displayName.split(' ')[0];

        if (els.name) els.name.textContent = firstName;
        if (els.fullName) els.fullName.textContent = displayName;
        if (els.email) els.email.textContent = email;
        if (els.emailSmall) els.emailSmall.textContent = email;
        
        // Verificar se há avatar salvo (imagem ou emoji)
        const savedAvatarImage = localStorage.getItem('userAvatarImage');
        const savedAvatar = localStorage.getItem('userAvatar');
        
        if (savedAvatarImage) {
            // Usar imagem
            if (els.avatar) {
                els.avatar.innerHTML = `<img src="${savedAvatarImage}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
            }
            if (els.avatarSmall) {
                els.avatarSmall.innerHTML = `<img src="${savedAvatarImage}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
            }
        } else if (savedAvatar) {
            // Usar emoji
            if (els.avatar) {
                els.avatar.textContent = savedAvatar;
                els.avatar.style.fontSize = '1.2rem';
            }
            if (els.avatarSmall) {
                els.avatarSmall.textContent = savedAvatar;
                els.avatarSmall.style.fontSize = '1rem';
            }
        } else {
            // Usar iniciais
            if (els.avatar) els.avatar.textContent = initials;
            if (els.avatarSmall) els.avatarSmall.textContent = initials;
        }

        // Botão Configurações (sempre abre o modal global)
        const btnOptions = document.getElementById('navBtnOptions');
        if (btnOptions) {
            btnOptions.addEventListener('click', (e) => {
                e.preventDefault();
                const modalEl = document.getElementById('configModal');
                if (modalEl && window.bootstrap && window.bootstrap.Modal) {
                    const modal = window.bootstrap.Modal.getOrCreateInstance(modalEl);
                    modal.show();
                }
            });
        }

        // Configurar Logout
        const btnLogout = document.getElementById('navBtnLogout');
        if (btnLogout) {
            btnLogout.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.clear(); // Limpa tudo (token, user, userData)
                window.location.href = '../index.html';
            });
        }
    }

    // Injetar CSS responsivo globalmente
    if (!document.querySelector('link[href*="responsive.css"]')) {
        const respCSS = document.createElement('link');
        respCSS.rel = 'stylesheet';
        respCSS.href = (document.querySelector('link[href*="global.css"]')?.href || '').replace('global.css', 'responsive.css') || '../css/responsive.css';
        document.head.appendChild(respCSS);
    }

    // Injetar UX enhancements (notificações, breadcrumbs, busca global)
    if (!document.querySelector('script[src*="ux-enhancements"]')) {
        const uxScript = document.createElement('script');
        uxScript.src = (document.querySelector('script[src*="navbar"]')?.src || '').replace('navbar.js', 'ux-enhancements.js') || '../js/ux-enhancements.js';
        uxScript.defer = true;
        document.body.appendChild(uxScript);
    }

    // Executar
    injectNavbar();
    injectConfigModal();
    
    // Aplicar traduções à navbar e modal após injeção
    setTimeout(() => {
        if (typeof applyTranslations === 'function') {
            const savedLang = localStorage.getItem('language') || 'pt-BR';
            applyTranslations(savedLang);
        }
    }, 100);
});

// Função para aplicar configurações de acessibilidade globalmente
function applyAccessibilitySettings() {
    // Modo Escuro
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-mode');
        document.documentElement.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
        document.documentElement.classList.remove('dark-mode');
    }

    // Alto Contraste
    const highContrast = localStorage.getItem('highContrast') === 'true';
    if (highContrast) {
        document.body.classList.add('high-contrast');
    } else {
        document.body.classList.remove('high-contrast');
    }

    // Reduzir Animações
    const reducedMotion = localStorage.getItem('reducedMotion') === 'true';
    if (reducedMotion) {
        document.body.classList.add('reduced-motion');
    } else {
        document.body.classList.remove('reduced-motion');
    }

    // Modo Disléxico
    const dyslexicMode = localStorage.getItem('dyslexicMode') === 'true';
    if (dyslexicMode) {
        document.body.classList.add('dyslexic-mode');
    } else {
        document.body.classList.remove('dyslexic-mode');
    }

    // Tamanho da Fonte
    const fontSize = localStorage.getItem('fontSize') || 'medium';
    document.body.classList.remove('font-small', 'font-medium', 'font-large');
    document.body.classList.add(`font-${fontSize}`);
}
