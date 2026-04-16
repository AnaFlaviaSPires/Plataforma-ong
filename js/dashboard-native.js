// Dashboard Nativo - Estatisticas em Tempo Real
// Usa API_BASE_URL global definida em config.js ou demo-config.js
if (typeof API_BASE_URL === 'undefined') {
    var API_BASE_URL = window.API_BASE_URL || 'http://localhost:3003/api';
}

let chartsInstances = {};

document.addEventListener('DOMContentLoaded', () => {
    /* debug silencioso */
    loadDashboardData();
    loadAlunosLista();
    loadDoacoesStats('mes');

    const intervalDashboard = setInterval(loadDashboardData, 60000);

    // Cleanup quando a página for descarregada
    window.addEventListener('beforeunload', () => {
      clearInterval(intervalDashboard);
    });

    const btnRefresh = document.getElementById('btnRefresh');
    if (btnRefresh) {
        btnRefresh.addEventListener('click', () => {
            btnRefresh.disabled = true;
            btnRefresh.innerHTML = '<i class="bi bi-arrow-clockwise spin me-1"></i>...';
            const periodo = document.getElementById('selectPeriodoDoacoes')?.value || 'mes';
            Promise.all([loadDashboardData(), loadDoacoesStats(periodo)]).finally(() => {
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

    const selectPeriodoDoacoes = document.getElementById('selectPeriodoDoacoes');
    if (selectPeriodoDoacoes) {
        selectPeriodoDoacoes.addEventListener('change', () => {
            loadDoacoesStats(selectPeriodoDoacoes.value);
        });
    }
});

async function loadDashboardData() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        /* debug silencioso */
        window.location.href = '../index.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Erro ao carregar dashboard');
        }

        const data = await response.json();
        
        updateCards(data);
        updateCharts(data);
        
        const lastUpdate = document.getElementById('lastUpdate');
        if (lastUpdate) {
            lastUpdate.textContent = new Date().toLocaleTimeString('pt-BR');
        }

    } catch (error) {
        showToast('Erro ao carregar dados', 'danger');
    }
}

function updateCards(data) {
    const stats = data.estatisticas_gerais || {};
    const doacoes = data.doacoes || {};
    const freq = data.frequencia || {};

    document.getElementById('cardTotalAlunos').textContent = stats.total_alunos || 0;
    document.getElementById('cardTotalProfessores').textContent = stats.total_professores || 0;
    document.getElementById('cardTotalSalas').textContent = stats.total_salas || 0;
    document.getElementById('cardTotalDoacoes').textContent = doacoes.total || 0;

    // Taxa de presença
    const taxaEl = document.getElementById('cardTaxaPresenca');
    if (taxaEl) {
        const taxa = freq.taxa_presenca || 0;
        taxaEl.textContent = taxa + '%';
    }
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
}

// Configuração global de Chart.js
Chart.defaults.font.family = "'Poppins', sans-serif";
Chart.defaults.font.size = 12;
Chart.defaults.color = '#64748b';
Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(30,41,59,0.92)';
Chart.defaults.plugins.tooltip.cornerRadius = 8;
Chart.defaults.plugins.tooltip.padding = 10;
Chart.defaults.plugins.tooltip.titleFont = { weight: '600', size: 13 };
Chart.defaults.plugins.tooltip.bodyFont = { size: 12 };
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.legend.labels.pointStyle = 'circle';
Chart.defaults.plugins.legend.labels.padding = 16;

const CHART_PALETTE = {
    purple:      '#663399',
    purpleDark:  '#4a2570',
    purpleLight: '#8B5CF6',
    lilac:       '#B794F4',
    lilacLight:  '#D6BCFA',
    lavender:    '#E9D5FF',
    gold:        '#F5C842',
    yellow:      '#FFE066',
    amber:       '#FFBF47',
    amberDark:   '#E5A820',
    rose:        '#D946A8',
    mauve:       '#9F7AEA',
    gray:        '#A0AEC0'
};

const GRID_STYLE = { color: 'rgba(0,0,0,0.04)', drawBorder: false };
const TICK_STYLE = { padding: 8, font: { size: 11 } };

function updateCharts(data) {
    // 1. Alunos por Status (Doughnut)
    let statusData = data.alunos?.por_status || [];
    if (!Array.isArray(statusData)) statusData = [statusData];

    const statusCfg = {
        'matriculado':      { label: 'Matriculados',    color: CHART_PALETTE.purple },
        'inativo':          { label: 'Inativos',        color: CHART_PALETTE.gray },
        'cancelado':        { label: 'Cancelados',      color: CHART_PALETTE.rose },
        'formado':          { label: 'Formados',        color: CHART_PALETTE.gold },
        'aguardando_vaga':  { label: 'Aguardando Vaga', color: CHART_PALETTE.amber }
    };
    const allStatuses = Object.keys(statusCfg);
    const statusMap = {};
    statusData.forEach(s => { statusMap[s.status] = parseInt(s.total) || 0; });

    createOrUpdateChart('chartAlunosStatus', {
        type: 'doughnut',
        data: {
            labels: allStatuses.map(s => statusCfg[s].label),
            datasets: [{
                data: allStatuses.map(s => statusMap[s] || 0),
                backgroundColor: allStatuses.map(s => statusCfg[s].color),
                borderWidth: 2,
                borderColor: '#fff',
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: { position: 'bottom', labels: {
                    generateLabels: function(chart) {
                        return chart.data.labels.map((label, i) => ({
                            text: label + ' (' + chart.data.datasets[0].data[i] + ')',
                            fillStyle: chart.data.datasets[0].backgroundColor[i],
                            strokeStyle: 'transparent', hidden: false, index: i
                        }));
                    }
                }},
                tooltip: { callbacks: { label: ctx => ' ' + ctx.label + ': ' + ctx.parsed } }
            }
        }
    });

    // 2. Alunos por Sala (Horizontal Bar)
    let alunosSala = data.alunos?.por_sala || [];
    if (!Array.isArray(alunosSala)) alunosSala = [alunosSala];

    const salaLabels = alunosSala.length > 0 ? alunosSala.map(s => s.sala_nome || 'Sem nome') : ['Nenhuma sala'];
    const salaData = alunosSala.length > 0 ? alunosSala.map(s => parseInt(s.total_alunos) || 0) : [0];

    createOrUpdateChart('chartAlunosSala', {
        type: 'bar',
        data: {
            labels: salaLabels,
            datasets: [{
                label: 'Alunos',
                data: salaData,
                backgroundColor: CHART_PALETTE.lilac,
                borderRadius: 6,
                borderSkipped: false,
                maxBarThickness: 40
            }]
        },
        options: {
            indexAxis: salaLabels.length > 6 ? 'y' : 'x',
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: ctx => ' ' + ctx.parsed.x || ctx.parsed.y || ctx.parsed + ' alunos' } }
            },
            scales: {
                x: { grid: GRID_STYLE, ticks: TICK_STYLE, beginAtZero: true },
                y: { grid: { display: false }, ticks: TICK_STYLE }
            }
        }
    });

    // 3. Frequência por Sala (Grouped Bar)
    let freqSala = data.frequencia?.por_sala || [];
    if (!Array.isArray(freqSala)) freqSala = [freqSala];

    const totalPres = freqSala.reduce((a, s) => a + (parseInt(s.presencas) || 0), 0);
    const totalFalt = freqSala.reduce((a, s) => a + (parseInt(s.faltas) || 0), 0);

    createOrUpdateChart('chartFrequenciaSala', {
        type: 'bar',
        data: {
            labels: freqSala.length > 0 ? freqSala.map(s => s.sala_nome || 'Sem nome') : ['Nenhuma sala'],
            datasets: [
                {
                    label: 'Presencas (' + totalPres + ')',
                    data: freqSala.length > 0 ? freqSala.map(s => parseInt(s.presencas) || 0) : [0],
                    backgroundColor: CHART_PALETTE.purple,
                    borderRadius: 6,
                    borderSkipped: false,
                    maxBarThickness: 36
                },
                {
                    label: 'Faltas (' + totalFalt + ')',
                    data: freqSala.length > 0 ? freqSala.map(s => parseInt(s.faltas) || 0) : [0],
                    backgroundColor: CHART_PALETTE.yellow,
                    borderRadius: 6,
                    borderSkipped: false,
                    maxBarThickness: 36
                }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'top' } },
            scales: {
                x: { grid: { display: false }, ticks: TICK_STYLE },
                y: { grid: GRID_STYLE, ticks: TICK_STYLE, beginAtZero: true }
            }
        }
    });
}

const TIPO_LABELS_DASH = {
    'dinheiro': 'Dinheiro', 'pix': 'Pix', 'alimentos': 'Alimentos',
    'vestuario': 'Vestuario', 'material_higiene': 'Higiene',
    'material_escolar': 'Escolar', 'brindes': 'Brindes', 'outros': 'Outros'
};
const TIPO_COLORS_DASH = [
    CHART_PALETTE.purple, CHART_PALETTE.gold, CHART_PALETTE.lilac,
    CHART_PALETTE.amber, CHART_PALETTE.purpleLight, CHART_PALETTE.mauve,
    CHART_PALETTE.yellow, CHART_PALETTE.gray
];

async function loadDoacoesStats(periodo) {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
        const response = await fetch(`${API_BASE_URL}/doacoes/estatisticas?periodo=${periodo}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Erro');
        const d = await response.json();

        // Cards
        const el = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
        el('doacaoTotalPeriodo', d.total_periodo || 0);
        el('doacaoValorPeriodo', formatCurrency(d.valor_periodo || 0));
        el('doacaoTotalGeral', d.total_geral || 0);
        el('doacaoValorGeral', formatCurrency(d.valor_geral || 0));

        // Chart serie temporal
        const serie = d.serie || [];
        const totalQtd = serie.reduce((a, s) => a + (s.total || 0), 0);
        const totalVal = serie.reduce((a, s) => a + (s.valor || 0), 0);
        createOrUpdateChart('chartDoacoesSerie', {
            type: 'bar',
            data: {
                labels: serie.map(s => s.label),
                datasets: [
                    {
                        label: 'Quantidade (' + totalQtd + ')',
                        data: serie.map(s => s.total || 0),
                        backgroundColor: CHART_PALETTE.lilac,
                        borderRadius: 6,
                        borderSkipped: false,
                        maxBarThickness: 32,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Valor (' + formatCurrency(totalVal) + ')',
                        data: serie.map(s => s.valor || 0),
                        type: 'line',
                        borderColor: CHART_PALETTE.gold,
                        backgroundColor: 'rgba(245,200,66,0.10)',
                        pointBackgroundColor: CHART_PALETTE.gold,
                        pointRadius: 3,
                        pointHoverRadius: 5,
                        fill: true,
                        tension: 0.35,
                        borderWidth: 2,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top' },
                    tooltip: {
                        callbacks: {
                            label: ctx => {
                                if (ctx.datasetIndex === 1) return ' ' + formatCurrency(ctx.parsed.y);
                                return ' ' + ctx.parsed.y + ' doacoes';
                            }
                        }
                    }
                },
                scales: {
                    y:  { type: 'linear', position: 'left', beginAtZero: true, grid: GRID_STYLE, ticks: { ...TICK_STYLE, stepSize: 1 }, title: { display: true, text: 'Qtd', font: { size: 11 } } },
                    y1: { type: 'linear', position: 'right', beginAtZero: true, grid: { drawOnChartArea: false }, ticks: TICK_STYLE, title: { display: true, text: 'R$', font: { size: 11 } } },
                    x:  { grid: { display: false }, ticks: TICK_STYLE }
                }
            }
        });

        // Chart por tipo (doughnut)
        const porTipo = d.por_tipo || [];
        createOrUpdateChart('chartDoacoesTipo', {
            type: 'doughnut',
            data: {
                labels: porTipo.map(t => TIPO_LABELS_DASH[t.tipo] || t.tipo),
                datasets: [{
                    data: porTipo.map(t => parseInt(t.total) || 0),
                    backgroundColor: TIPO_COLORS_DASH.slice(0, porTipo.length),
                    borderWidth: 2,
                    borderColor: '#fff',
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: { position: 'bottom', labels: {
                        generateLabels: function(chart) {
                            return chart.data.labels.map((label, i) => ({
                                text: label + ' (' + chart.data.datasets[0].data[i] + ')',
                                fillStyle: chart.data.datasets[0].backgroundColor[i],
                                strokeStyle: 'transparent', hidden: false, index: i
                            }));
                        }
                    }},
                    tooltip: { callbacks: { label: ctx => ' ' + ctx.label + ': ' + ctx.parsed } }
                }
            }
        });
    } catch (error) {
        /* erro silencioso */
    }
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
        /* erro silencioso */
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
                    backgroundColor: CHART_PALETTE.purple,
                    borderRadius: 6,
                    borderSkipped: false
                },
                {
                    label: 'Falta',
                    data: historico.length > 0 ? historico.map(h => h.falta || 0) : [0],
                    backgroundColor: CHART_PALETTE.yellow,
                    borderRadius: 6,
                    borderSkipped: false
                }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'top' } },
            scales: {
                x: { stacked: true, grid: { display: false }, ticks: TICK_STYLE },
                y: { stacked: true, beginAtZero: true, grid: GRID_STYLE, ticks: TICK_STYLE }
            }
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
