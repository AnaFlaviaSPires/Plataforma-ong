// Configuração da API
const API_BASE_URL = 'http://localhost:3003/api';

// Inicializar aplicação de login
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se já está logado
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
        // Verificar se o token ainda é válido
        verifyToken(authToken);
    }

    // Configurar formulário de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Configurar toggle de senha
    const passwordToggle = document.querySelector('.password-toggle');
    if (passwordToggle) {
        passwordToggle.addEventListener('click', togglePassword);
    }
});

// Verificar token
async function verifyToken(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            // Token válido, redirecionar para menu
            window.location.href = 'pages/menu.html';
        } else {
            // Token inválido, remover
            localStorage.removeItem('authToken');
        }
    } catch (error) {
        console.error('Erro ao verificar token:', error);
        localStorage.removeItem('authToken');
    }
}

// Manipular login
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const submitButton = document.querySelector('.btn-entrar');
    const spinner = submitButton.querySelector('.spinner');
    
    // Mostrar loading
    submitButton.disabled = true;
    spinner.style.display = 'block';
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, senha })
        });

        const data = await response.json();

        if (response.ok) {
            // Login bem-sucedido
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userData', JSON.stringify(data.user));
            // Compatibilidade com pages/menu.html (que lê 'user')
            localStorage.setItem('user', JSON.stringify({
                id: data.user.id,
                email: data.user.email,
                name: data.user.nome || data.user.email
            }));
            
            showMessage('Login realizado com sucesso!', 'success');
            
            // Redirecionar após 1 segundo
            setTimeout(() => {
                window.location.href = 'pages/menu.html';
            }, 1000);
            
        } else {
            // Erro no login
            showMessage(data.error || 'Erro ao fazer login', 'error');
        }
        
    } catch (error) {
        console.error('Erro no login:', error);
        showMessage('Erro de conexão. Verifique se o servidor está rodando.', 'error');
    } finally {
        // Esconder loading
        submitButton.disabled = false;
        spinner.style.display = 'none';
    }
}

// Toggle senha
function togglePassword() {
    const passwordInput = document.getElementById('senha');
    const toggleIcon = document.querySelector('.password-toggle i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}

// Mostrar mensagens
function showMessage(message, type) {
    // Remover mensagens existentes
    const existingMessages = document.querySelectorAll('.alert-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Criar nova mensagem
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show alert-message`;
    alertDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Remover automaticamente após 5 segundos
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 5000);
}
