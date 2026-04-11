// Componente de Navbar Centralizado
document.addEventListener('DOMContentLoaded', function() {
    // Aplicar configurações de acessibilidade ANTES de qualquer coisa
    applyAccessibilitySettings();
    
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
    // Modal de configurações é gerenciado por settings.js (módulo único)
    if (typeof window._settingsInit === 'function') window._settingsInit();
    
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
    const prefs = {
        darkMode: 'dark-mode',
        highContrast: 'high-contrast',
        colorblindMode: 'colorblind-mode',
        reducedMotion: 'reduced-motion',
        dyslexicMode: 'dyslexic-mode'
    };
    Object.keys(prefs).forEach(key => {
        const active = localStorage.getItem(key) === 'true';
        document.body.classList.toggle(prefs[key], active);
        document.documentElement.classList.toggle(prefs[key], active);
    });

    // Tamanho da Fonte
    const fontSize = localStorage.getItem('fontSize') || 'medium';
    document.body.classList.remove('font-small', 'font-medium', 'font-large');
    document.body.classList.add(`font-${fontSize}`);
}
