var API_BASE_URL = window.API_BASE_URL || 'http://localhost:3003/api';

// Estado da aplicação
let currentUser = null;
let documentos = [];

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        window.location.href = 'index.html';
        return;
    }
    
    try {
        currentUser = JSON.parse(localStorage.getItem('userData'));
    } catch (e) {
        console.error('Erro ao ler dados do usuário', e);
    }

    // Setup inicial
    setupUI();
    setupEventListeners();
    await carregarDocumentos();
});

function setupUI() {
    // Verificar tema
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-mode');
    }
}

function setupEventListeners() {
    // Form de novo documento
    const form = document.getElementById('formNovoDocumento');
    if (form) {
        form.addEventListener('submit', handleNovoDocumento);
    }

    // Filtros
    document.getElementById('searchInput')?.addEventListener('input', debounce(filtrarDocumentos, 300));
    document.getElementById('filterCategoria')?.addEventListener('change', filtrarDocumentos);
    
    // Botão Logout
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });
}

async function carregarDocumentos() {
    try {
        toggleLoading(true);
        const token = localStorage.getItem('authToken');
        
        const response = await fetch(`${API_BASE_URL}/documentos`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Erro ao carregar documentos');

        const data = await response.json();
        documentos = data.documentos;
        renderizarDocumentos(documentos);

    } catch (error) {
        console.error(error);
        alert('Erro ao carregar lista de documentos');
    } finally {
        toggleLoading(false);
    }
}

function renderizarDocumentos(lista) {
    const container = document.getElementById('documentsList');
    if (!container) return;

    container.innerHTML = '';

    if (lista.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-folder2-open display-1 text-muted mb-3"></i>
                <h4>Nenhum documento encontrado</h4>
                <p class="text-muted">Utilize o botão "Novo Documento" para adicionar.</p>
            </div>
        `;
        return;
    }

    lista.forEach(doc => {
        const card = criarCardDocumento(doc);
        container.appendChild(card);
    });
}

function criarCardDocumento(doc) {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4 mb-4';
    
    const iconMap = {
        'atas': 'bi-file-earmark-text',
        'financeiro': 'bi-file-earmark-spreadsheet',
        'pedagogico': 'bi-file-earmark-person',
        'legal': 'bi-file-earmark-ruled',
        'outros': 'bi-file-earmark'
    };

    const iconClass = iconMap[doc.categoria] || 'bi-file-earmark';
    const date = new Date(doc.data_referencia).toLocaleDateString('pt-BR');

    // Verificar permissão de exclusão
    const podeExcluir = currentUser && (currentUser.cargo === 'admin' || doc.criado_por === currentUser.id);
    
    const menuDropdown = podeExcluir ? `
        <div class="dropdown">
            <button class="btn btn-link text-muted p-0" data-bs-toggle="dropdown">
                <i class="bi bi-three-dots-vertical"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
                <li><a class="dropdown-item text-danger" href="#" onclick="deletarDocumento(${doc.id})">
                    <i class="bi bi-trash me-2"></i>Excluir
                </a></li>
            </ul>
        </div>
    ` : '';

    col.innerHTML = `
        <div class="card h-100 document-card shadow-sm">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <div class="document-icon-wrapper bg-light rounded p-3">
                        <i class="bi ${iconClass} fs-2 text-primary"></i>
                    </div>
                    ${menuDropdown}
                </div>
                
                <h5 class="card-title text-truncate" title="${doc.titulo}">${doc.titulo}</h5>
                <p class="card-text text-muted small mb-2">${doc.descricao || 'Sem descrição'}</p>
                
                <div class="d-flex justify-content-between align-items-center mt-3">
                    <span class="badge bg-light text-dark border">${doc.categoria.toUpperCase()}</span>
                    <small class="text-muted"><i class="bi bi-calendar3 me-1"></i>${date}</small>
                </div>
            </div>
            <div class="card-footer bg-transparent border-top-0 pb-3">
                <a href="${doc.url_arquivo}" target="_blank" class="btn btn-outline-primary w-100">
                    <i class="bi bi-box-arrow-up-right me-2"></i>Acessar Arquivo
                </a>
            </div>
        </div>
    `;

    return col;
}

async function handleNovoDocumento(e) {
    e.preventDefault();
    
    const formData = {
        titulo: document.getElementById('docTitulo').value,
        categoria: document.getElementById('docCategoria').value,
        url_arquivo: document.getElementById('docUrl').value,
        descricao: document.getElementById('docDescricao').value,
        data_referencia: document.getElementById('docData').value || new Date().toISOString().split('T')[0]
    };

    try {
        toggleLoading(true);
        const token = localStorage.getItem('authToken');

        const response = await fetch(`${API_BASE_URL}/documentos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) throw new Error('Erro ao criar documento');

        // Fechar modal e limpar form
        const modal = bootstrap.Modal.getInstance(document.getElementById('novoDocumentoModal'));
        modal.hide();
        e.target.reset();

        // Recarregar lista
        await carregarDocumentos();
        alert('Documento adicionado com sucesso!');

    } catch (error) {
        console.error(error);
        alert('Erro ao salvar documento: ' + error.message);
    } finally {
        toggleLoading(false);
    }
}

window.deletarDocumento = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este documento?')) return;

    try {
        toggleLoading(true);
        const token = localStorage.getItem('authToken');

        const response = await fetch(`${API_BASE_URL}/documentos/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Erro ao excluir');
        }

        await carregarDocumentos();

    } catch (error) {
        console.error(error);
        alert('Erro ao excluir: ' + error.message);
    } finally {
        toggleLoading(false);
    }
};

function filtrarDocumentos() {
    const termo = document.getElementById('searchInput').value.toLowerCase();
    const categoria = document.getElementById('filterCategoria').value;

    const filtrados = documentos.filter(doc => {
        const matchTermo = doc.titulo.toLowerCase().includes(termo) || 
                          (doc.descricao && doc.descricao.toLowerCase().includes(termo));
        const matchCat = categoria === 'todas' || doc.categoria === categoria;
        
        return matchTermo && matchCat;
    });

    renderizarDocumentos(filtrados);
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function toggleLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = show ? 'flex' : 'none';
    }
}
