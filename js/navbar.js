// Componente de Navbar Centralizado
document.addEventListener('DOMContentLoaded', function() {
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
                            <span class="d-none d-md-inline">Início</span>
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
                                        <span>Configurações</span>
                                    </button>
                                    <button class="btn btn-danger w-100 d-flex align-items-center justify-content-center gap-2" id="navBtnLogout" type="button">
                                        <i class="bi bi-box-arrow-right"></i>
                                        <span>Sair</span>
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
        if (els.avatar) els.avatar.textContent = initials;
        if (els.avatarSmall) els.avatarSmall.textContent = initials;

        // Botão Configurações (abre modal se existir na página)
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

    // Executar
    injectNavbar();
});
