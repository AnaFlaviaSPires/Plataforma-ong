// Dashboard Nativo - Estatisticas em Tempo Real
// Usa API_BASE_URL global definida em config.js ou demo-config.js
if (typeof API_BASE_URL === 'undefined') {
    var API_BASE_URL = window.API_BASE_URL || 'http://localhost:3003/api';
}

let chartsInstances = {};

document.addEventListener('DOMContentLoaded', () => {
    console.log('Dashboard carregando...');
    loadDashboardData();
    loadAlunosLista();
    
    setInterval(loadDashboardData, 60000);
    
    const btnRefresh = document.getElementById('btnRefresh');
    if (btnRefresh) {
        btnRefresh.addEventListener('click', () => {
            btnRefresh.disabled = true;
            btnRefresh.innerHTML = '<i class="bi bi-arrow-clockwise spin me-1"></i>...';
            loadDashboardData().finally(() => {
                btnRefresh.disabled = false;
                btnRefresh.innerHTML = '<i class="bi bi-arrow-clockwise me-1"></i>Atualizar';
            });
        });
    }

    const selectAluno = document.getElementById('selectAluno');
    const selectPeriodo = document.getElementById('selectPeriodo');
    
    if (selectAluno) {
        selectAluno.addEventListener('change', () => {
            if (selectAluno.value) {
                loadFrequenciaAluno(selectAluno.value, selectPeriodo.value);
            } else {
                hideFrequenciaAluno();
            }
        });
    }
    
    if (selectPeriodo) {
        selectPeriodo.addEventListener('change', () => {
            if (selectAluno.value) {
                loadFrequenciaAluno(selectAluno.value, selectPeriodo.value);
            }
        });
    }
});

async function loadDashboardData() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        console.log('Sem token, redirecionando...');
        window.location.href = '../index.html';
        return;
    }

    try {
        console.log('Buscando dados do dashboard...');
        const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            console.error('Erro na resposta:', response.status);
            throw new Error('Erro ao carregar dados');
        }

        const data = await response.json();
        console.log('Dados recebidos:', data);
        
        updateCards(data);
        updateCharts(data);
        
        const lastUpdate = document.getElementById('lastUpdate');
        if (lastUpdate) {
            lastUpdate.textContent = new Date().toLocaleTimeString('pt-BR');
        }

    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        showToast('Erro ao carregar dados', 'danger');
    }
}

function updateCards(data) {
    const stats = data.estatisticas_gerais || {};
    const doacoes = data.doacoes || {};

    document.getElementById('cardTotalAlunos').textContent = stats.total_alunos || 0;
    document.getElementById('cardTotalProfessores').textContent = stats.total_professores || 0;
    document.getElementById('cardTotalSalas').textContent = stats.total_salas || 0;
    document.getElementById('cardTotalDoacoes').textContent = doacoes.total || 0;
    
    const valorEl = document.getElementById('cardValorTotal');
    if (valorEl) {
        valorEl.textContent = formatCurrency(doacoes.valor_total || 0);
    }
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
}

function updateCharts(data) {
    console.log('Atualizando graficos...');
    
    // 1. Alunos por Status
    let statusData = data.alunos?.por_status || [];
    if (!Array.isArray(statusData)) statusData = [statusData];
    
    const statusLabels = {
        'matriculado': 'Matriculados',
        'inativo': 'Inativos',
        'cancelado': 'Cancelados',
        'formado': 'Formados',
        'aguardando_vaga': 'Aguardando Vaga'
    };
    const statusColors = {
        'matriculado': '#9b59b6',
        'inativo': '#95a5a6',
        'cancelado': '#8e44ad',
        'formado': '#3498db',
        'aguardando_vaga': '#f39c12'
    };
    
    // Garantir que todas as 5 categorias apareçam (mesmo com 0)
    const allStatuses = ['matriculado', 'inativo', 'cancelado', 'formado', 'aguardando_vaga'];
    const statusMap = {};
    statusData.forEach(s => { statusMap[s.status] = parseInt(s.total) || 0; });
    const fullStatusData = allStatuses.map(s => statusMap[s] || 0);
    const fullStatusLabelsArr = allStatuses.map(s => statusLabels[s]);
    const fullStatusColorsArr = allStatuses.map(s => statusColors[s]);

    createOrUpdateChart('chartAlunosStatus', {
        type: 'doughnut',
        data: {
            labels: fullStatusLabelsArr,
            datasets: [{
                data: fullStatusData,
                backgroundColor: fullStatusColorsArr
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        generateLabels: function(chart) {
                            const data = chart.data;
                            return data.labels.map((label, i) => ({
                                text: label + ' (' + data.datasets[0].data[i] + ')',
                                fillStyle: data.datasets[0].backgroundColor[i],
                                hidden: false,
                                index: i
                            }));
                        }
                    }
                }
            }
        }
    });

    // 2. Alunos por Sala
    let alunosSala = data.alunos?.por_sala || [];
    if (!Array.isArray(alunosSala)) alunosSala = [alunosSala];
    
    createOrUpdateChart('chartAlunosSala', {
        type: 'bar',
        data: {
            labels: alunosSala.length > 0 ? alunosSala.map(s => s.sala_nome || 'Sem nome') : ['Nenhuma sala'],
            datasets: [{
                label: 'Alunos',
                data: alunosSala.length > 0 ? alunosSala.map(s => parseInt(s.total_alunos) || 0) : [0],
                backgroundColor: '#9b59b6',
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: true, position: 'top' } },
            scales: { y: { beginAtZero: true } }
        }
    });

    // 3. Frequencia por Sala
    let freqSala = data.frequencia?.por_sala || [];
    if (!Array.isArray(freqSala)) freqSala = [freqSala];
    
    const totalPresFreq = freqSala.reduce((acc, s) => acc + (parseInt(s.presencas) || 0), 0);
    const totalFaltFreq = freqSala.reduce((acc, s) => acc + (parseInt(s.faltas) || 0), 0);
    createOrUpdateChart('chartFrequenciaSala', {
        type: 'bar',
        data: {
            labels: freqSala.length > 0 ? freqSala.map(s => s.sala_nome || 'Sem nome') : ['Nenhuma sala'],
            datasets: [
                {
                    label: 'Presencas (' + totalPresFreq + ')',
                    data: freqSala.length > 0 ? freqSala.map(s => parseInt(s.presencas) || 0) : [0],
                    backgroundColor: '#9b59b6',
                    borderRadius: 5
                },
                {
                    label: 'Faltas (' + totalFaltFreq + ')',
                    data: freqSala.length > 0 ? freqSala.map(s => parseInt(s.faltas) || 0) : [0],
                    backgroundColor: '#8e44ad',
                    borderRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: true, position: 'top' } },
            scales: { y: { beginAtZero: true } }
        }
    });

    // 4. Doacoes por Mes
    let doacoesMensal = data.doacoes?.mensal || [];
    if (!Array.isArray(doacoesMensal)) doacoesMensal = [doacoesMensal];
    
    const totalQtdDoacao = doacoesMensal.reduce((acc, m) => acc + (parseInt(m.total) || 0), 0);
    const totalValDoacao = doacoesMensal.reduce((acc, m) => acc + (parseFloat(m.valor) || 0), 0);
    createOrUpdateChart('chartDoacoesMensal', {
        type: 'bar',
        data: {
            labels: doacoesMensal.map(m => m.mes || ''),
            datasets: [
                {
                    label: 'Quantidade (' + totalQtdDoacao + ')',
                    data: doacoesMensal.map(m => parseInt(m.total) || 0),
                    backgroundColor: '#9b59b6',
                    borderRadius: 5,
                    yAxisID: 'y'
                },
                {
                    label: 'Valor (R$ ' + totalValDoacao.toLocaleString('pt-BR', {minimumFractionDigits:2}) + ')',
                    data: doacoesMensal.map(m => parseFloat(m.valor) || 0),
                    type: 'line',
                    borderColor: '#8e44ad',
                    backgroundColor: 'rgba(142, 68, 173, 0.1)',
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: true, position: 'top' } },
            scales: {
                y: { type: 'linear', position: 'left', beginAtZero: true, title: { display: true, text: 'Qtd' } },
                y1: { type: 'linear', position: 'right', beginAtZero: true, title: { display: true, text: 'R$' }, grid: { drawOnChartArea: false } }
            }
        }
    });
}

async function loadAlunosLista() {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/alunos-lista`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Erro ao carregar alunos');

        const data = await response.json();
        const select = document.getElementById('selectAluno');
        
        if (select && data.alunos) {
            select.innerHTML = '<option value="">Selecione um aluno...</option>';
            data.alunos.forEach(aluno => {
                const option = document.createElement('option');
                option.value = aluno.id;
                option.textContent = `${aluno.nome}${aluno.turma ? ` (${aluno.turma})` : ''}`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Erro ao carregar lista de alunos:', error);
    }
}

async function loadFrequenciaAluno(alunoId, periodo) {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/frequencia-aluno/${alunoId}?periodo=${periodo}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Erro ao carregar frequencia');

        const data = await response.json();
        showFrequenciaAluno(data);
    } catch (error) {
        console.error('Erro ao carregar frequencia do aluno:', error);
        showToast('Erro ao carregar frequencia', 'danger');
    }
}

function showFrequenciaAluno(data) {
    const infoDiv = document.getElementById('frequenciaAlunoInfo');
    const placeholder = document.getElementById('frequenciaAlunoPlaceholder');
    const chartContainer = document.getElementById('chartFrequenciaAlunoContainer');
    
    if (infoDiv) {
        infoDiv.classList.remove('d-none');
        document.getElementById('alunoNome').textContent = data.aluno?.nome || '-';
        document.getElementById('alunoTurma').textContent = data.aluno?.turma || 'Nao definida';
        document.getElementById('alunoPresencas').textContent = data.resumo?.total_presencas || 0;
        document.getElementById('alunoFaltas').textContent = data.resumo?.total_faltas || 0;
        document.getElementById('alunoTaxa').textContent = data.resumo?.taxa_presenca || 0;
    }
    
    if (placeholder) placeholder.classList.add('d-none');
    if (chartContainer) chartContainer.classList.remove('d-none');

    const historico = data.historico || [];
    
    createOrUpdateChart('chartFrequenciaAluno', {
        type: 'bar',
        data: {
            labels: historico.length > 0 ? historico.map(h => h.data) : ['Sem registros'],
            datasets: [
                {
                    label: 'Presente',
                    data: historico.length > 0 ? historico.map(h => h.presente || 0) : [0],
                    backgroundColor: '#9b59b6',
                    borderRadius: 5
                },
                {
                    label: 'Falta',
                    data: historico.length > 0 ? historico.map(h => h.falta || 0) : [0],
                    backgroundColor: '#8e44ad',
                    borderRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: true, position: 'top' } },
            scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } }
        }
    });
}

function hideFrequenciaAluno() {
    const infoDiv = document.getElementById('frequenciaAlunoInfo');
    const placeholder = document.getElementById('frequenciaAlunoPlaceholder');
    const chartContainer = document.getElementById('chartFrequenciaAlunoContainer');
    
    if (infoDiv) infoDiv.classList.add('d-none');
    if (placeholder) placeholder.classList.remove('d-none');
    if (chartContainer) chartContainer.classList.add('d-none');
}

function createOrUpdateChart(canvasId, config) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error('Canvas nao encontrado:', canvasId);
        return;
    }

    if (chartsInstances[canvasId]) {
        chartsInstances[canvasId].destroy();
    }

    chartsInstances[canvasId] = new Chart(canvas.getContext('2d'), config);
}

function showToast(message, type) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0 show`;
    toast.innerHTML = `<div class="d-flex"><div class="toast-body">${message}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>`;
    container.appendChild(toast);
    
    setTimeout(() => toast.remove(), 5000);
}
