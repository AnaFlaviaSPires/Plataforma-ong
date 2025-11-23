
class GuideManager {
    constructor() {
        this.setupAuthListener();
        this.setupEventListeners();
        this.loadContent();
        this.currentSection = 'inicio';
    }

    // Configurar listener de autenticação
    setupAuthListener() {
            if (!user) {
                window.location.href = 'index.html';
            }
        });
    }

    // Configurar event listeners
    setupEventListeners() {
        // Listener para links do menu
        document.querySelectorAll('.guide-nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.closest('.guide-nav-link').dataset.section;
                this.loadSection(section);
            });
        });

        // Listener para busca
        const searchInput = (document.getElementById('guideSearch');
        searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));

        // Listener para navegação por hash
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.slice(1);
            if (hash) {
                this.loadSection(hash);
            }
        });
    }

    // Carregar conteúdo do guia
    async loadContent() {
        try {
            const db = getFirestore();
            const guideRef = collection(db, 'guide_content');
            const snapshot = await getDocs(guideRef);
            
            this.content = {};
            snapshot.forEach(doc => {
                this.content[doc.id] = doc.data();
            });

            // Carregar seção inicial ou da URL
            const hash = window.location.hash.slice(1);
            this.loadSection(hash || 'inicio');

        } catch (error) {
            console.error('Erro ao carregar conteúdo do guia:', error);
            // Se não conseguir carregar do Firestore, usar conteúdo local
            this.loadLocalContent();
        }
    }

    // Carregar conteúdo local (fallback)
    loadLocalContent() {
        this.content = {
            'primeiros-passos': {
                title: 'Primeiros Passos',
                content: `
                    <nav class="guide-breadcrumb">
                        <div class="guide-breadcrumb-item">
                            <a href="#" class="guide-breadcrumb-link">Guia do Usuário</a>
                        </div>
                        <div class="guide-breadcrumb-item">Primeiros Passos</div>
                    </nav>

                    <h1 class="guide-title">Primeiros Passos</h1>

                    <p class="guide-text">
                        Bem-vindo ao Sistema de Gestão da ONG Novo Amanhã! Este guia irá ajudá-lo a começar
                        a usar o sistema de forma eficiente.
                    </p>

                    <div class="guide-card important">
                        <h5><i class="bi bi-exclamation-triangle"></i> Importante</h5>
                        <p>Antes de começar, certifique-se de que você tem as credenciais de acesso fornecidas
                        pelo administrador do sistema.</p>
                    </div>

                    <h3 class="guide-subtitle">Configuração Inicial</h3>

                    <ol class="guide-steps">
                        <li class="guide-step">
                            Acesse a página de login usando suas credenciais
                        </li>
                        <li class="guide-step">
                            Complete seu perfil com todas as informações necessárias
                        </li>
                        <li class="guide-step">
                            Familiarize-se com o menu principal e suas funcionalidades
                        </li>
                        <li class="guide-step">
                            Configure suas preferências no menu de configurações
                        </li>
                    </ol>

                    <h3 class="guide-subtitle">Funções Disponíveis</h3>

                    <div class="guide-table-responsive">
                        <table class="guide-table">
                            <thead>
                                <tr>
                                    <th>Função</th>
                                    <th>Descrição</th>
                                    <th>Permissões</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Administrador</td>
                                    <td>Acesso total ao sistema</td>
                                    <td>Todas as funcionalidades</td>
                                </tr>
                                <tr>
                                    <td>Coordenador</td>
                                    <td>Gestão geral</td>
                                    <td>Maioria das funcionalidades</td>
                                </tr>
                                <tr>
                                    <td>Professor</td>
                                    <td>Gestão de turmas</td>
                                    <td>Chamada e notas</td>
                                </tr>
                                <tr>
                                    <td>Secretaria</td>
                                    <td>Gestão administrativa</td>
                                    <td>Cadastros e relatórios</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                `
            },
            'alunos': {
                title: 'Cadastro de Alunos',
                content: `
                    <nav class="guide-breadcrumb">
                        <div class="guide-breadcrumb-item">
                            <a href="#" class="guide-breadcrumb-link">Guia do Usuário</a>
                        </div>
                        <div class="guide-breadcrumb-item">Cadastro de Alunos</div>
                    </nav>

                    <h1 class="guide-title">Cadastro e Gestão de Alunos</h1>

                    <p class="guide-text">
                        O módulo de Cadastro de Alunos permite gerenciar todas as informações dos estudantes
                        da ONG, incluindo dados pessoais, documentos e histórico.
                    </p>

                    <h3 class="guide-subtitle">Como Cadastrar um Novo Aluno</h3>

                    <ol class="guide-steps">
                        <li class="guide-step">
                            Acesse o menu "Cadastro de Aluno"
                        </li>
                        <li class="guide-step">
                            Clique no botão "Novo Aluno"
                        </li>
                        <li class="guide-step">
                            Preencha todos os campos obrigatórios
                        </li>
                        <li class="guide-step">
                            Adicione documentos se necessário
                        </li>
                        <li class="guide-step">
                            Clique em "Salvar" para confirmar
                        </li>
                    </ol>

                    <div class="guide-card tip">
                        <h5><i class="bi bi-lightbulb"></i> Dica</h5>
                        <p>Mantenha sempre os dados dos alunos atualizados para garantir uma comunicação eficiente
                        com as famílias.</p>
                    </div>
                `
            },
            // Adicionar mais seções conforme necessário
        };
    }

    // Carregar seção específica
    loadSection(section) {
        if (!section || !this.content[section]) {
            section = 'inicio';
        }

        // Atualizar navegação
        document.querySelectorAll('.guide-nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === section) {
                link.classList.add('active');
            }
        });

        // Atualizar URL
        window.location.hash = section;

        // Atualizar conteúdo
        if (section === 'inicio') {
            return; // A página inicial já está no HTML
        }

        const content = this.content[section];
        const guideContent = (document.getElementById('guideContent');
        
        guideContent.innerHTML = `
            <div class="guide-section" id="${section}">
                ${content.content}
            </div>
        `;

        this.currentSection = section;
    }

    // Manipular busca
    handleSearch(query) {
        query = query.toLowerCase();
        
        document.querySelectorAll('.guide-nav-link').forEach(link => {
            const text = link.textContent.toLowerCase();
            const section = link.dataset.section;
            const content = this.content[section]?.content?.toLowerCase() || '';

            if (text.includes(query) || content.includes(query)) {
                link.style.display = '';
            } else {
                link.style.display = 'none';
            }
        });
    }

    // Formatar conteúdo com highlight de código
    formatCode(code) {
        return `<div class="guide-code"><pre><code>${code}</code></pre></div>`;
    }
}

// Inicializar
window.guideManager = new GuideManager();