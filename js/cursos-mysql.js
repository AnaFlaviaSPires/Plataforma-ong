// Cursos - Integração com Backend MySQL
const API_BASE_URL = 'http://localhost:3003/api';

// Variáveis globais
let tabelaCursos;
let cursos = [];
let professores = [];

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    loadData();
});

function initializePage() {
    // Inicializar DataTable
    tabelaCursos = $('#tabelaCursos').DataTable({
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
    document.getElementById('formCurso').addEventListener('submit', function(e) {
        e.preventDefault();
        salvarCurso();
    });

    // Limpar formulário ao fechar modal
    document.getElementById('modalCurso').addEventListener('hidden.bs.modal', function() {
        limparFormulario();
    });
}

async function loadData() {
    try {
        showLoading(true);
        
        // Carregar cursos e professores em paralelo
        const [cursosData, professoresData] = await Promise.all([
            fetchCursos(),
            fetchProfessores()
        ]);
        
        cursos = cursosData;
        professores = professoresData;
        
        // Atualizar interface
        updateTable();
        updateStatistics();
        loadProfessoresSelect();
        
        console.log('Dados carregados:', cursos.length, 'cursos,', professores.length, 'professores');
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showToast('Erro ao carregar dados', 'error');
    } finally {
        showLoading(false);
    }
}

async function fetchCursos() {
    try {
        const response = await fetch(`${API_BASE_URL}/cursos`);
        if (!response.ok) throw new Error('Erro ao buscar cursos');
        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar cursos:', error);
        return [];
    }
}

async function fetchProfessores() {
    try {
        const response = await fetch(`${API_BASE_URL}/professores`);
        if (!response.ok) throw new Error('Erro ao buscar professores');
        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar professores:', error);
        return [];
    }
}

function loadProfessoresSelect() {
    const select = document.getElementById('professor_id');
    select.innerHTML = '<option value="">Selecione um professor...</option>';
    
    professores.forEach(professor => {
        if (professor.status === 'ativo') {
            const option = document.createElement('option');
            option.value = professor.id;
            option.textContent = professor.nome;
            select.appendChild(option);
        }
    });
}

function updateTable() {
    // Limpar tabela
    tabelaCursos.clear();
    
    // Adicionar dados
    cursos.forEach(curso => {
        const professorNome = getProfessorNome(curso.professor_id);
        const statusBadge = getStatusBadge(curso.status);
        const acoes = getAcoesButtons(curso.id);
        
        tabelaCursos.row.add([
            curso.id,
            curso.nome,
            professorNome,
            curso.carga_horaria ? curso.carga_horaria + 'h' : '-',
            curso.vagas || '-',
            statusBadge,
            acoes
        ]);
    });
    
    // Redesenhar tabela
    tabelaCursos.draw();
}

function getProfessorNome(professorId) {
    if (!professorId) return '-';
    const professor = professores.find(p => p.id === professorId);
    return professor ? professor.nome : 'Professor não encontrado';
}

function getStatusBadge(status) {
    const badges = {
        'ativo': '<span class="badge bg-success">Ativo</span>',
        'inativo': '<span class="badge bg-danger">Inativo</span>',
        'planejado': '<span class="badge bg-warning">Planejado</span>',
        'concluido': '<span class="badge bg-info">Concluído</span>'
    };
    return badges[status] || '<span class="badge bg-secondary">Indefinido</span>';
}

function getAcoesButtons(id) {
    return `
        <div class="btn-group btn-group-sm" role="group">
            <button type="button" class="btn btn-outline-info" onclick="visualizarCurso(${id})" title="Visualizar">
                <i class="bi bi-eye"></i>
            </button>
            <button type="button" class="btn btn-outline-primary" onclick="editarCurso(${id})" title="Editar">
                <i class="bi bi-pencil"></i>
            </button>
            <button type="button" class="btn btn-outline-danger" onclick="excluirCurso(${id})" title="Excluir">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    `;
}

function updateStatistics() {
    const total = cursos.length;
    const ativos = cursos.filter(c => c.status === 'ativo').length;
    
    // Calcular total de alunos (simulado - seria necessário endpoint específico)
    const totalAlunosMatriculados = cursos.reduce((sum, curso) => {
        return sum + (curso.alunos_matriculados || 0);
    }, 0);
    
    // Professores únicos com cursos
    const professoresComCursos = [...new Set(cursos.map(c => c.professor_id).filter(id => id))].length;

    // Atualizar elementos
    document.getElementById('totalCursos').textContent = total;
    document.getElementById('cursosAtivos').textContent = ativos;
    document.getElementById('totalAlunos').textContent = totalAlunosMatriculados;
    document.getElementById('totalProfessores').textContent = professoresComCursos;
}

async function salvarCurso() {
    try {
        const formData = getFormData();
        
        // Validar dados
        if (!validateForm(formData)) return;
        
        showLoading(true);
        
        const cursoId = document.getElementById('cursoId').value;
        const isEdit = cursoId && cursoId !== '';
        
        const url = isEdit ? 
            `${API_BASE_URL}/cursos/${cursoId}` : 
            `${API_BASE_URL}/cursos`;
        
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
            throw new Error(errorData.message || 'Erro ao salvar curso');
        }
        
        const result = await response.json();
        
        // Fechar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalCurso'));
        modal.hide();
        
        // Recarregar dados
        await loadData();
        
        showToast(
            isEdit ? 'Curso atualizado com sucesso!' : 'Curso cadastrado com sucesso!',
            'success'
        );
        
    } catch (error) {
        console.error('Erro ao salvar curso:', error);
        showToast('Erro ao salvar curso: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

function getFormData() {
    return {
        nome: document.getElementById('nome').value.trim(),
        codigo: document.getElementById('codigo').value.trim(),
        descricao: document.getElementById('descricao').value.trim(),
        professor_id: document.getElementById('professor_id').value || null,
        categoria: document.getElementById('categoria').value,
        carga_horaria: document.getElementById('carga_horaria').value ? parseInt(document.getElementById('carga_horaria').value) : null,
        vagas: document.getElementById('vagas').value ? parseInt(document.getElementById('vagas').value) : null,
        idade_minima: document.getElementById('idade_minima').value ? parseInt(document.getElementById('idade_minima').value) : null,
        data_inicio: document.getElementById('data_inicio').value || null,
        data_fim: document.getElementById('data_fim').value || null,
        horario: document.getElementById('horario').value.trim(),
        status: document.getElementById('status').value,
        requisitos: document.getElementById('requisitos').value.trim()
    };
}

function validateForm(data) {
    if (!data.nome) {
        showToast('Nome do curso é obrigatório', 'error');
        document.getElementById('nome').focus();
        return false;
    }
    
    // Validar datas se ambas estiverem preenchidas
    if (data.data_inicio && data.data_fim) {
        const inicio = new Date(data.data_inicio);
        const fim = new Date(data.data_fim);
        
        if (fim <= inicio) {
            showToast('Data de fim deve ser posterior à data de início', 'error');
            document.getElementById('data_fim').focus();
            return false;
        }
    }
    
    return true;
}

async function editarCurso(id) {
    try {
        const curso = cursos.find(c => c.id === id);
        if (!curso) {
            showToast('Curso não encontrado', 'error');
            return;
        }
        
        // Preencher formulário
        document.getElementById('cursoId').value = curso.id;
        document.getElementById('nome').value = curso.nome || '';
        document.getElementById('codigo').value = curso.codigo || '';
        document.getElementById('descricao').value = curso.descricao || '';
        document.getElementById('professor_id').value = curso.professor_id || '';
        document.getElementById('categoria').value = curso.categoria || '';
        document.getElementById('carga_horaria').value = curso.carga_horaria || '';
        document.getElementById('vagas').value = curso.vagas || '';
        document.getElementById('idade_minima').value = curso.idade_minima || '';
        document.getElementById('data_inicio').value = curso.data_inicio || '';
        document.getElementById('data_fim').value = curso.data_fim || '';
        document.getElementById('horario').value = curso.horario || '';
        document.getElementById('status').value = curso.status || 'ativo';
        document.getElementById('requisitos').value = curso.requisitos || '';
        
        // Alterar título do modal
        document.getElementById('modalCursoTitle').textContent = 'Editar Curso';
        
        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('modalCurso'));
        modal.show();
        
    } catch (error) {
        console.error('Erro ao editar curso:', error);
        showToast('Erro ao carregar dados do curso', 'error');
    }
}

async function visualizarCurso(id) {
    try {
        const curso = cursos.find(c => c.id === id);
        if (!curso) {
            showToast('Curso não encontrado', 'error');
            return;
        }
        
        const professorNome = getProfessorNome(curso.professor_id);
        
        const detalhes = `
            <div class="row">
                <div class="col-md-6">
                    <h6>Informações Básicas</h6>
                    <p><strong>Nome:</strong> ${curso.nome || '-'}</p>
                    <p><strong>Código:</strong> ${curso.codigo || '-'}</p>
                    <p><strong>Categoria:</strong> ${curso.categoria || '-'}</p>
                    <p><strong>Professor:</strong> ${professorNome}</p>
                    <p><strong>Status:</strong> ${getStatusText(curso.status)}</p>
                </div>
                <div class="col-md-6">
                    <h6>Detalhes do Curso</h6>
                    <p><strong>Carga Horária:</strong> ${curso.carga_horaria ? curso.carga_horaria + ' horas' : '-'}</p>
                    <p><strong>Vagas:</strong> ${curso.vagas || '-'}</p>
                    <p><strong>Idade Mínima:</strong> ${curso.idade_minima ? curso.idade_minima + ' anos' : '-'}</p>
                    <p><strong>Horário:</strong> ${curso.horario || '-'}</p>
                </div>
            </div>
            <div class="row">
                <div class="col-12">
                    <h6>Período</h6>
                    <p><strong>Início:</strong> ${formatDate(curso.data_inicio) || '-'}</p>
                    <p><strong>Fim:</strong> ${formatDate(curso.data_fim) || '-'}</p>
                </div>
            </div>
            ${curso.descricao ? `
            <div class="row">
                <div class="col-12">
                    <h6>Descrição</h6>
                    <p>${curso.descricao}</p>
                </div>
            </div>
            ` : ''}
            ${curso.requisitos ? `
            <div class="row">
                <div class="col-12">
                    <h6>Requisitos</h6>
                    <p>${curso.requisitos}</p>
                </div>
            </div>
            ` : ''}
        `;
        
        document.getElementById('detalheCurso').innerHTML = detalhes;
        
        const modal = new bootstrap.Modal(document.getElementById('modalVisualizarCurso'));
        modal.show();
        
    } catch (error) {
        console.error('Erro ao visualizar curso:', error);
        showToast('Erro ao carregar detalhes do curso', 'error');
    }
}

async function excluirCurso(id) {
    const curso = cursos.find(c => c.id === id);
    if (!curso) {
        showToast('Curso não encontrado', 'error');
        return;
    }
    
    if (!confirm(`Tem certeza que deseja excluir o curso "${curso.nome}"?`)) {
        return;
    }
    
    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE_URL}/cursos/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao excluir curso');
        }
        
        await loadData();
        showToast('Curso excluído com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao excluir curso:', error);
        showToast('Erro ao excluir curso: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

function limparFormulario() {
    document.getElementById('formCurso').reset();
    document.getElementById('cursoId').value = '';
    document.getElementById('modalCursoTitle').textContent = 'Novo Curso';
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
        'planejado': 'Planejado',
        'concluido': 'Concluído'
    };
    return statusMap[status] || 'Indefinido';
}

function showLoading(show) {
    const loadingElements = document.querySelectorAll('.btn-primary');
    loadingElements.forEach(btn => {
        if (show) {
            btn.disabled = true;
            const originalText = btn.textContent;
            btn.setAttribute('data-original-text', originalText);
            btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Carregando...';
        } else {
            btn.disabled = false;
            const originalText = btn.getAttribute('data-original-text');
            btn.innerHTML = originalText || 'Salvar';
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
