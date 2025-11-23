/**
 * Módulo de Autenticação
 * Gerencia o formulário de login e interações relacionadas
 */

document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const form = document.getElementById('loginForm');
    const senhaInput = document.getElementById('senha');
    const toggleButton = document.querySelector('.password-toggle');
    const mensagemDiv = document.querySelector('.mensagem');
    const emailInput = document.getElementById('email');
    const submitButton = form?.querySelector('.btn-entrar');

    // Verifica se os elementos necessários existem
    if (!form || !senhaInput || !toggleButton || !mensagemDiv || !emailInput || !submitButton) {
        console.error('Elementos do formulário não encontrados');
        return;
    }

    /**
     * Alterna a visibilidade da senha
     */
    function togglePasswordVisibility() {
        const type = senhaInput.type === 'password' ? 'text' : 'password';
        senhaInput.type = type;
        const icon = toggleButton.querySelector('i');
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    }

    /**
     * Exibe uma mensagem de feedback
     * @param {string} message - Mensagem a ser exibida
     * @param {string} type - Tipo de mensagem (sucesso, erro, aviso)
     */
    function showMessage(message, type = 'erro') {
        mensagemDiv.textContent = message;
        mensagemDiv.className = `mensagem ${type}`;
        mensagemDiv.style.display = 'block';
    }

    /**
     * Habilita/desabilita o botão de envio
     * @param {boolean} isLoading - Se true, desabilita o botão e mostra o spinner
     */
    function setLoadingState(isLoading) {
        if (isLoading) {
            submitButton.classList.add('loading');
            submitButton.disabled = true;
        } else {
            submitButton.classList.remove('loading');
            submitButton.disabled = false;
        }
    }

    /**
     * Valida os campos do formulário
     * @returns {boolean} True se os campos forem válidos
     */
    function validateForm() {
        // Limpa mensagens anteriores
        mensagemDiv.className = 'mensagem';
        mensagemDiv.style.display = 'none';

        // Validação de campos vazios
        if (!emailInput.value.trim()) {
            showMessage('Por favor, informe seu e-mail', 'erro');
            emailInput.focus();
            return false;
        }

        if (!senhaInput.value.trim()) {
            showMessage('Por favor, informe sua senha', 'erro');
            senhaInput.focus();
            return false;
        }

        // Validação de formato de e-mail
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value.trim())) {
            showMessage('Por favor, informe um e-mail válido', 'erro');
            emailInput.focus();
            return false;
        }

        return true;
    }

    /**
     * Processa o envio do formulário
     * @param {Event} event - Evento de submit do formulário
     */
    async function handleSubmit(event) {
        event.preventDefault();

        // Valida o formulário
        if (!validateForm()) {
            return;
        }

        try {
            setLoadingState(true);
            
            // Aqui você faria a chamada para a API de autenticação
            // Exemplo com fetch:
            /*
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: emailInput.value.trim(),
                    password: senhaInput.value
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao fazer login');
            }

            // Redireciona após login bem-sucedido
            window.location.href = 'pages/menu.html';
            */

            // Simulação de login (remover em produção)
            setTimeout(() => {
                showMessage('Login realizado com sucesso!', 'sucesso');
                setLoadingState(false);
                
                // Redireciona após mensagem de sucesso
                setTimeout(() => {
                    window.location.href = 'pages/menu.html';
                }, 500);
            }, 1500);
            
        } catch (error) {
            console.error('Erro no login:', error);
            showMessage(error.message || 'Ocorreu um erro ao fazer login. Tente novamente.', 'erro');
            setLoadingState(false);
        }
    }

    // Event Listeners
    toggleButton.addEventListener('click', togglePasswordVisibility);
    form.addEventListener('submit', handleSubmit);
});
