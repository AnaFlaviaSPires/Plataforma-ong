// Professores - Integração com Backend MySQL
const API_BASE_URL = 'http://localhost:3003/api';

// Variáveis globais
let tabelaProfessores;
let professores = [];

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    loadProfessores();
});

function initializePage() {
    // Inicializar DataTable
    tabelaProfessores = $('#tabelaProfessores').DataTable({
        language: {
            url: 'https://cdn.datatables.net/plug-ins/1.13.6/i18n/pt-BR.json'
        },
        responsive: true,
        pageLength: 10,
        order: [[1, 'asc']], // Ordenar por nome
        columnDefs: [
            { targets: [6], orderable: false } // Coluna de ações não ordenável
        ]
    });

    // Event listeners
    document.getElementById('formProfessor').addEventListener('submit', function(e) {
        e.preventDefault();
        salvarProfessor();
    });

    // Limpar formulário ao fechar modal
    document.getElementById('modalProfessor').addEventListener('hidden.bs.modal', function() {
        limparFormulario();
    });
}

async function loadProfessores() {
    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE_URL}/professores`);
        if (!response.ok) throw new Error('Erro ao carregar professores');
        
        professores = await response.json();
        
        // Atualizar tabela
        updateTable();
        
        // Atualizar estatísticas
        updateStatistics();
        
        console.log('Professores carregados:', professores.length);
    } catch (error) {
        console.error('Erro ao carregar professores:', error);
        showToast('Erro ao carregar professores', 'error');
    } finally {
        showLoading(false);
    }
}

function updateTable() {
    // Limpar tabela
    tabelaProfessores.clear();
    
    // Adicionar dados
    professores.forEach(professor => {
        const statusBadge = getStatusBadge(professor.status);
        const acoes = getAcoesButtons(professor.id);
        
        tabelaProfessores.row.add([
            professor.id,
            professor.nome,
            professor.email || '-',
            professor.telefone || '-',
            professor.especialidade || '-',
            statusBadge,
            acoes
        ]);
    });
    
    // Redesenhar tabela
    tabelaProfessores.draw();
}

function getStatusBadge(status) {
    const badges = {
        'ativo': '<span class="badge bg-success">Ativo</span>',
        'inativo': '<span class="badge bg-danger">Inativo</span>',
        'licenca': '<span class="badge bg-warning">Em Licença</span>'
    };
    return badges[status] || '<span class="badge bg-secondary">Indefinido</span>';
}

function getAcoesButtons(id) {
    return `
        <div class="btn-group btn-group-sm" role="group">
            <button type="button" class="btn btn-outline-info" onclick="visualizarProfessor(${id})" title="Visualizar">
                <i class="bi bi-eye"></i>
            </button>
            <button type="button" class="btn btn-outline-primary" onclick="editarProfessor(${id})" title="Editar">
                <i class="bi bi-pencil"></i>
            </button>
            <button type="button" class="btn btn-outline-danger" onclick="excluirProfessor(${id})" title="Excluir">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    `;
}

function updateStatistics() {
    const total = professores.length;
    const ativos = professores.filter(p => p.status === 'ativo').length;
    const especialidades = [...new Set(professores.map(p => p.especialidade).filter(e => e))].length;
    
    // Professores novos este mês
    const agora = new Date();
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
    const novosMes = professores.filter(p => {
        if (!p.data_contratacao) return false;
        const dataContratacao = new Date(p.data_contratacao);
        return dataContratacao >= inicioMes;
    }).length;

    // Atualizar elementos
    document.getElementById('totalProfessores').textContent = total;
    document.getElementById('professoresAtivos').textContent = ativos;
    document.getElementById('totalEspecialidades').textContent = especialidades;
    document.getElementById('professorMes').textContent = novosMes;
}

async function salvarProfessor() {
    try {
        const formData = getFormData();
        
        // Validar dados
        if (!validateForm(formData)) return;
        
        showLoading(true);
        
        const professorId = document.getElementById('professorId').value;
        const isEdit = professorId && professorId !== '';
        
        const url = isEdit ? 
            `${API_BASE_URL}/professores/${professorId}` : 
            `${API_BASE_URL}/professores`;
        
        const method = isEdit ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao salvar professor');
        }
        
        const result = await response.json();
        
        // Fechar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalProfessor'));
        modal.hide();
        
        // Recarregar dados
        await loadProfessores();
        
        showToast(
            isEdit ? 'Professor atualizado com sucesso!' : 'Professor cadastrado com sucesso!',
            'success'
        );
        
    } catch (error) {
        console.error('Erro ao salvar professor:', error);
        showToast('Erro ao salvar professor: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

function getFormData() {
    return {
        nome: document.getElementById('nome').value.trim(),
        email: document.getElementById('email').value.trim(),
        telefone: document.getElementById('telefone').value.trim(),
        data_nasc: document.getElementById('data_nasc').value,
        especialidade: document.getElementById('especialidade').value,
        data_contratacao: document.getElementById('data_contratacao').value,
        endereco: document.getElementById('endereco').value.trim(),
        salario: document.getElementById('salario').value ? parseFloat(document.getElementById('salario').value) : null,
        status: document.getElementById('status').value
    };
}

function validateForm(data) {
    if (!data.nome) {
        showToast('Nome é obrigatório', 'error');
        document.getElementById('nome').focus();
        return false;
    }
    
    if (!data.email) {
        showToast('Email é obrigatório', 'error');
        document.getElementById('email').focus();
        return false;
    }
    
    if (!data.especialidade) {
        showToast('Especialidade é obrigatória', 'error');
        document.getElementById('especialidade').focus();
        return false;
    }
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showToast('Email inválido', 'error');
        document.getElementById('email').focus();
        return false;
    }
    
    return true;
}

async function editarProfessor(id) {
    try {
        const professor = professores.find(p => p.id === id);
        if (!professor) {
            showToast('Professor não encontrado', 'error');
            return;
        }
        
        // Preencher formulário
        document.getElementById('professorId').value = professor.id;
        document.getElementById('nome').value = professor.nome || '';
        document.getElementById('email').value = professor.email || '';
        document.getElementById('telefone').value = professor.telefone || '';
        document.getElementById('data_nasc').value = professor.data_nasc || '';
        document.getElementById('especialidade').value = professor.especialidade || '';
        document.getElementById('data_contratacao').value = professor.data_contratacao || '';
        document.getElementById('endereco').value = professor.endereco || '';
        document.getElementById('salario').value = professor.salario || '';
        document.getElementById('status').value = professor.status || 'ativo';
        
        // Alterar título do modal
        document.getElementById('modalProfessorTitle').textContent = 'Editar Professor';
        
        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('modalProfessor'));
        modal.show();
        
    } catch (error) {
        console.error('Erro ao editar professor:', error);
        showToast('Erro ao carregar dados do professor', 'error');
    }
}

async function visualizarProfessor(id) {
    try {
        const professor = professores.find(p => p.id === id);
        if (!professor) {
            showToast('Professor não encontrado', 'error');
            return;
        }
        
        const detalhes = `
            <div class="row">
                <div class="col-md-6">
                    <h6>Informações Pessoais</h6>
                    <p><strong>Nome:</strong> ${professor.nome || '-'}</p>
                    <p><strong>Email:</strong> ${professor.email || '-'}</p>
                    <p><strong>Telefone:</strong> ${professor.telefone || '-'}</p>
                    <p><strong>Data de Nascimento:</strong> ${formatDate(professor.data_nasc) || '-'}</p>
                    <p><strong>Endereço:</strong> ${professor.endereco || '-'}</p>
                </div>
                <div class="col-md-6">
                    <h6>Informações Profissionais</h6>
                    <p><strong>Especialidade:</strong> ${professor.especialidade || '-'}</p>
                    <p><strong>Data de Contratação:</strong> ${formatDate(professor.data_contratacao) || '-'}</p>
                    <p><strong>Salário:</strong> ${professor.salario ? 'R$ ' + parseFloat(professor.salario).toFixed(2) : '-'}</p>
                    <p><strong>Status:</strong> ${getStatusText(professor.status)}</p>
                </div>
            </div>
        `;
        
        document.getElementById('detalheProfessor').innerHTML = detalhes;
        
        const modal = new bootstrap.Modal(document.getElementById('modalVisualizarProfessor'));
        modal.show();
        
    } catch (error) {
        console.error('Erro ao visualizar professor:', error);
        showToast('Erro ao carregar detalhes do professor', 'error');
    }
}

async function excluirProfessor(id) {
    const professor = professores.find(p => p.id === id);
    if (!professor) {
        showToast('Professor não encontrado', 'error');
        return;
    }
    
    if (!confirm(`Tem certeza que deseja excluir o professor "${professor.nome}"?`)) {
        return;
    }
    
    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE_URL}/professores/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao excluir professor');
        }
        
        await loadProfessores();
        showToast('Professor excluído com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao excluir professor:', error);
        showToast('Erro ao excluir professor: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

function limparFormulario() {
    document.getElementById('formProfessor').reset();
    document.getElementById('professorId').value = '';
    document.getElementById('modalProfessorTitle').textContent = 'Novo Professor';
}

// Funções utilitárias
function formatDate(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

function getStatusText(status) {
    const statusMap = {
        'ativo': 'Ativo',
        'inativo': 'Inativo',
        'licenca': 'Em Licença'
    };
    return statusMap[status] || 'Indefinido';
}

function showLoading(show) {
    const loadingElements = document.querySelectorAll('.btn-primary');
    loadingElements.forEach(btn => {
        if (show) {
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Carregando...';
        } else {
            btn.disabled = false;
            btn.innerHTML = btn.getAttribute('data-original-text') || 'Salvar';
        }
    });
}

function showToast(message, type = 'info') {
    const toastContainer = document.querySelector('.toast-container');
    const toastId = 'toast-' + Date.now();
    
    const bgClass = {
        'success': 'bg-success',
        'error': 'bg-danger',
        'warning': 'bg-warning',
        'info': 'bg-info'
    }[type] || 'bg-info';
    
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `toast align-items-center text-white ${bgClass} border-0`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    // Remover após 5 segundos
    setTimeout(() => {
        toast.remove();
    }, 5000);
}
