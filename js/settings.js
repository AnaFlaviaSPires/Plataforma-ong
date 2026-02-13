var API_BASE_URL = API_BASE_URL || 'http://localhost:3003/api';

document.addEventListener('DOMContentLoaded', () => {
    initSettings();
});

function initSettings() {
    // Botão de abrir modal (se houver link direto)
    const btnConfig = document.querySelector('a[href="#configModal"]');
    if (btnConfig) {
        btnConfig.addEventListener('click', loadUserData);
    }

    // Botão Salvar Geral
    const btnSalvar = document.getElementById('btnSalvarConfig');
    if (btnSalvar) {
        btnSalvar.addEventListener('click', saveSettings);
    }

    // Botão Alterar Senha
    const btnSenha = document.getElementById('btnAlterarSenha');
    if (btnSenha) {
        btnSenha.addEventListener('click', showChangePasswordModal);
    }

    // Toggles de Acessibilidade
    setupAccessibility();

    // Setup de Idioma
    setupLanguage();

    // Setup de Avatares
    setupAvatars();

    // Carregar dados ao abrir o modal (usando evento do Bootstrap)
    const configModal = document.getElementById('configModal');
    if (configModal) {
        configModal.addEventListener('show.bs.modal', loadUserData);
    }
}

async function loadUserData() {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            const user = data.user;

            // Preencher campos
            if (document.getElementById('inputNome')) document.getElementById('inputNome').value = user.nome || '';
            if (document.getElementById('inputEmail')) document.getElementById('inputEmail').value = user.email || '';
            if (document.getElementById('inputTelefone')) document.getElementById('inputTelefone').value = user.telefone || '';

            // Preencher header do modal
            if (document.getElementById('configUserName')) document.getElementById('configUserName').textContent = user.nome || 'Usuário';
            if (document.getElementById('configUserEmail')) document.getElementById('configUserEmail').textContent = user.email || '';
            
            const avatar = (user.nome || 'U').charAt(0).toUpperCase();
            if (document.getElementById('configAvatarPreview')) document.getElementById('configAvatarPreview').textContent = avatar;
        }
    } catch (error) {
        console.error('Erro ao carregar perfil:', error);
    }
}

async function saveSettings() {
    try {
        const token = localStorage.getItem('authToken');
        const nome = document.getElementById('inputNome').value;
        const email = document.getElementById('inputEmail').value;
        const telefone = document.getElementById('inputTelefone').value;

        const payload = { nome, email, telefone };

        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const data = await response.json();
            alert('Perfil atualizado com sucesso!');
            
            // Atualizar LocalStorage
            localStorage.setItem('userData', JSON.stringify(data.user));
            localStorage.setItem('user', JSON.stringify({
                id: data.user.id,
                email: data.user.email,
                name: data.user.nome
            }));

            // Atualizar UI
            location.reload(); 
        } else {
            const err = await response.json();
            alert('Erro ao atualizar perfil: ' + (err.error || 'Erro desconhecido'));
        }
    } catch (error) {
        console.error(error);
        alert('Erro de conexão ao salvar perfil.');
    }
}

function setupAccessibility() {
    // Modo Escuro
    const darkModeToggle = document.getElementById('accDarkMode');
    if (localStorage.getItem('darkMode') === 'true') {
        if (darkModeToggle) darkModeToggle.checked = true;
        document.body.classList.add('dark-mode');
    }
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', (e) => {
            const isDark = e.target.checked;
            document.body.classList.toggle('dark-mode', isDark);
            document.documentElement.classList.toggle('dark-mode', isDark);
            localStorage.setItem('darkMode', isDark);
        });
    }

    // Modo Daltônico
    const colorblindToggle = document.getElementById('accColorblind');
    if (localStorage.getItem('colorblindMode') === 'true') {
        if (colorblindToggle) colorblindToggle.checked = true;
        document.body.classList.add('colorblind-mode');
    }
    if (colorblindToggle) {
        colorblindToggle.addEventListener('change', (e) => {
            const isColorblind = e.target.checked;
            document.body.classList.toggle('colorblind-mode', isColorblind);
            document.documentElement.classList.toggle('colorblind-mode', isColorblind);
            localStorage.setItem('colorblindMode', isColorblind);
        });
    }

    // Tamanho da Fonte
    const fontButtons = document.querySelectorAll('.btn-group[role="group"] .btn');
    const currentSize = localStorage.getItem('fontSize') || 'medium';
    
    fontButtons.forEach(btn => {
        const text = btn.textContent.trim().toLowerCase();
        let size = 'medium';
        if (text.includes('pequena')) size = 'small';
        if (text.includes('grande')) size = 'large';
        if (text.includes('padrão')) size = 'medium';
        
        if (size === currentSize) {
            btn.classList.add('active');
        }
        
        btn.addEventListener('click', () => {
            fontButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            document.body.classList.remove('font-small', 'font-medium', 'font-large');
            document.body.classList.add(`font-${size}`);
            localStorage.setItem('fontSize', size);
        });
    });
}

function showChangePasswordModal() {
    // Criar modal dinamicamente para trocar senha
    const modalHtml = `
        <div class="modal fade" id="modalTrocaSenha" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Alterar Senha</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label">Senha Atual</label>
                            <input type="password" class="form-control" id="senhaAtual">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Nova Senha</label>
                            <input type="password" class="form-control" id="novaSenha">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Confirmar Nova Senha</label>
                            <input type="password" class="form-control" id="confirmaSenha">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" onclick="submitChangePassword()">Salvar</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remover anterior se existir
    const oldModal = document.getElementById('modalTrocaSenha');
    if (oldModal) oldModal.remove();

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('modalTrocaSenha'));
    modal.show();
}

window.submitChangePassword = async function() {
    const atual = document.getElementById('senhaAtual').value;
    const nova = document.getElementById('novaSenha').value;
    const confirma = document.getElementById('confirmaSenha').value;

    if (nova !== confirma) {
        alert('As senhas não coincidem.');
        return;
    }

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ senhaAtual: atual, novaSenha: nova })
        });

        if (response.ok) {
            alert('Senha alterada com sucesso!');
            const modalEl = document.getElementById('modalTrocaSenha');
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal.hide();
        } else {
            const err = await response.json();
            alert('Erro ao alterar senha: ' + (err.error || 'Verifique sua senha atual'));
        }
    } catch (error) {
        console.error(error);
        alert('Erro de conexão.');
    }
};

// Função para configurar o seletor de idioma
function setupLanguage() {
    // Buscar selects de idioma específicos
    const languageSelects = document.querySelectorAll('#menuLanguageSelect, #languageSelect');
    
    // Carregar idioma salvo
    const savedLang = localStorage.getItem('language') || 'pt-BR';
    
    languageSelects.forEach(select => {
        if (!select) return;
        
        // Definir valor salvo
        select.value = savedLang;
        
        // Adicionar listener para mudança
        select.addEventListener('change', (e) => {
            const lang = e.target.value;
            localStorage.setItem('language', lang);
            
            // Aplicar traduções se a função existir
            if (typeof applyTranslations === 'function') {
                applyTranslations(lang);
            }
            
            // Mostrar feedback
            showSettingsToast('Idioma alterado com sucesso!');
        });
    });
}

// Função para mostrar toast de feedback
function showSettingsToast(message) {
    // Verificar se já existe um container de toast
    let container = document.getElementById('settingsToastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'settingsToastContainer';
        container.style.cssText = 'position: fixed; top: 80px; right: 20px; z-index: 9999;';
        document.body.appendChild(container);
    }
    
    const toastId = 'toast-' + Date.now();
    const toastHtml = `
        <div id="${toastId}" class="alert alert-success alert-dismissible fade show" role="alert" style="min-width: 250px;">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', toastHtml);
    
    // Auto-remover após 3 segundos
    setTimeout(() => {
        const toast = document.getElementById(toastId);
        if (toast) toast.remove();
    }, 3000);
}

// Função para configurar avatares
function setupAvatars() {
    const avatarButtons = document.querySelectorAll('.avatar-option');
    const savedAvatar = localStorage.getItem('userAvatar');
    const savedAvatarImage = localStorage.getItem('userAvatarImage');
    
    avatarButtons.forEach(btn => {
        // Marcar avatar salvo como ativo (apenas se não for imagem)
        if (savedAvatar && !savedAvatarImage && btn.dataset.avatar === savedAvatar) {
            btn.classList.remove('btn-outline-secondary');
            btn.classList.add('btn-primary');
        }
        
        btn.addEventListener('click', () => {
            const avatar = btn.dataset.avatar;
            
            // Remover seleção anterior
            avatarButtons.forEach(b => {
                b.classList.remove('btn-primary');
                b.classList.add('btn-outline-secondary');
            });
            
            // Marcar como selecionado
            btn.classList.remove('btn-outline-secondary');
            btn.classList.add('btn-primary');
            
            // Limpar imagem se existir
            localStorage.removeItem('userAvatarImage');
            hideAvatarImagePreview();
            
            // Salvar no localStorage
            localStorage.setItem('userAvatar', avatar);
            
            // Atualizar preview no modal
            updateAvatarPreview(avatar, false);
            
            // Atualizar avatar na navbar
            updateNavbarAvatar(avatar, false);
            
            showSettingsToast('Avatar atualizado!');
        });
    });
    
    // Setup de upload de imagem
    setupAvatarUpload();
    
    // Aplicar avatar salvo ao carregar
    if (savedAvatarImage) {
        updateAvatarPreview(savedAvatarImage, true);
        showAvatarImagePreview(savedAvatarImage);
    } else if (savedAvatar) {
        updateAvatarPreview(savedAvatar, false);
    }
}

// Função para configurar upload de avatar
function setupAvatarUpload() {
    const fileInput = document.getElementById('avatarFileInput');
    const removeBtn = document.getElementById('removeAvatarImage');
    
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            // Validar tipo
            if (!file.type.startsWith('image/')) {
                showSettingsToast('Por favor, selecione uma imagem válida.');
                return;
            }
            
            // Validar tamanho (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                showSettingsToast('A imagem deve ter no máximo 2MB.');
                return;
            }
            
            // Converter para base64
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target.result;
                
                // Salvar no localStorage
                localStorage.setItem('userAvatarImage', base64);
                localStorage.removeItem('userAvatar');
                
                // Remover seleção de emojis
                document.querySelectorAll('.avatar-option').forEach(b => {
                    b.classList.remove('btn-primary');
                    b.classList.add('btn-outline-secondary');
                });
                
                // Atualizar previews
                updateAvatarPreview(base64, true);
                showAvatarImagePreview(base64);
                updateNavbarAvatar(base64, true);
                
                showSettingsToast('Foto de perfil atualizada!');
            };
            reader.readAsDataURL(file);
        });
    }
    
    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            localStorage.removeItem('userAvatarImage');
            hideAvatarImagePreview();
            
            // Resetar para inicial do nome
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            const initials = (userData.nome || 'U').charAt(0).toUpperCase();
            
            updateAvatarPreview(initials, false);
            updateNavbarAvatar(initials, false);
            
            // Limpar input
            const fileInput = document.getElementById('avatarFileInput');
            if (fileInput) fileInput.value = '';
            
            showSettingsToast('Foto removida!');
        });
    }
}

// Funções auxiliares para avatar
function updateAvatarPreview(value, isImage) {
    const preview = document.getElementById('configAvatarPreview');
    if (!preview) return;
    
    if (isImage) {
        preview.innerHTML = `<img src="${value}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
    } else {
        preview.innerHTML = '';
        preview.textContent = value;
        preview.style.fontSize = '1.75rem';
    }
}

function updateNavbarAvatar(value, isImage) {
    const navbarAvatar = document.getElementById('navUserAvatar');
    const navbarAvatarSmall = document.getElementById('navUserAvatarSmall');
    
    if (isImage) {
        if (navbarAvatar) {
            navbarAvatar.innerHTML = `<img src="${value}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        }
        if (navbarAvatarSmall) {
            navbarAvatarSmall.innerHTML = `<img src="${value}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        }
    } else {
        if (navbarAvatar) {
            navbarAvatar.innerHTML = '';
            navbarAvatar.textContent = value;
            navbarAvatar.style.fontSize = '1.2rem';
        }
        if (navbarAvatarSmall) {
            navbarAvatarSmall.innerHTML = '';
            navbarAvatarSmall.textContent = value;
            navbarAvatarSmall.style.fontSize = '1rem';
        }
    }
}

function showAvatarImagePreview(base64) {
    const container = document.getElementById('avatarPreviewContainer');
    const img = document.getElementById('avatarImagePreview');
    if (container && img) {
        img.src = base64;
        container.style.display = 'block';
    }
}

function hideAvatarImagePreview() {
    const container = document.getElementById('avatarPreviewContainer');
    const img = document.getElementById('avatarImagePreview');
    if (container) container.style.display = 'none';
    if (img) img.src = '';
}
