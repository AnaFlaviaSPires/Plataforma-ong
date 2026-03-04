class DoacoesManager {
    constructor() {
        this.API_BASE_URL = window.API_BASE_URL || 'http://localhost:3003/api';
        this.doacoes = [];
        this.ultimoId = 1;
        this.filtroTimeout = null;
        this._filtrando = false;
        this.setupEventListeners();
        this.carregarDoacoesIniciais();
    }

    setupEventListeners() {
        // Controle de Permissões
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const userRole = (userData.cargo || 'guest').toLowerCase();
        const canEdit = ['admin', 'secretaria'].includes(userRole);

        const btnNova = document.getElementById('btnNovaDoacao');
        if (btnNova) {
            if (!canEdit) {
                btnNova.remove();
            }
        }

        const searchInput = document.getElementById('searchInput');
        const tipoFilter = document.getElementById('tipoFilter');
        const dataFilter = document.getElementById('dataFilter');
        const limparFiltros = document.getElementById('limparFiltros');
        const tipoOrdenacao = document.getElementById('ordenacaoSelect');

        const dispararFiltros = () => this.dispararAplicarFiltros();

        if (searchInput) searchInput.addEventListener('input', dispararFiltros);
        if (tipoFilter) tipoFilter.addEventListener('change', dispararFiltros);
        if (dataFilter) dataFilter.addEventListener('change', dispararFiltros);
        if (tipoOrdenacao) tipoOrdenacao.addEventListener('change', dispararFiltros);
        if (limparFiltros) limparFiltros.addEventListener('click', () => {
            this.limparFiltros();
            this.dispararAplicarFiltros();
        });

        const tipoDoacao = document.getElementById('doacaoTipo');
        const valorField = document.getElementById('valorField');
        const descricaoField = document.getElementById('descricaoField');
        const valorInput = document.getElementById('doacaoValor');

        if (tipoDoacao) {
            tipoDoacao.addEventListener('change', (e) => {
                const tipo = e.target.value;
                if (tipo === 'dinheiro') {
                    if (valorField) valorField.style.display = 'block';
                    if (descricaoField) descricaoField.style.display = 'none';
                } else if (tipo) {
                    if (valorField) valorField.style.display = 'none';
                    if (descricaoField) descricaoField.style.display = 'block';
                } else {
                    if (valorField) valorField.style.display = 'none';
                    if (descricaoField) descricaoField.style.display = 'none';
                }
            });
        }

        // Máscara de moeda brasileira para o campo de valor
        if (valorInput) {
            valorInput.addEventListener('input', (e) => {
                let v = e.target.value;
                // mantém apenas dígitos
                v = v.replace(/\D/g, '');
                if (!v) {
                    e.target.value = '';
                    return;
                }
                // garante pelo menos 3 dígitos (centavos)
                while (v.length < 3) {
                    v = '0' + v;
                }
                const inteiro = v.slice(0, -2);
                const centavos = v.slice(-2);
                // formata parte inteira com separador de milhar
                const inteiroFormatado = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                e.target.value = `${inteiroFormatado},${centavos}`;
            });
        }

        const salvarBtn = document.getElementById('salvarDoacao');
        if (salvarBtn) salvarBtn.addEventListener('click', () => this.salvarDoacao());
    }

    async carregarDoacoesIniciais() {
        try {
            const token = localStorage.getItem('authToken');
            const headers = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const resp = await fetch(`${this.API_BASE_URL}/doacoes`, { headers });
            if (!resp.ok) throw new Error('Falha ao carregar doações');
            const data = await resp.json();
            const doacoesList = data.doacoes || data; // Pode vir { doacoes: [] } ou []

            if (Array.isArray(doacoesList)) {
                this.doacoes = doacoesList.map((item, index) => ({
                    id: item.id || index + 1,
                    tipo: this.mapearTipoBackendParaUI(item.tipo),
                    valor: item.valor ?? null,
                    descricao: item.descricao_itens || item.observacoes || '',
                    doador: item.nome_doador || '',
                    dataCadastro: item.data_doacao ? new Date(item.data_doacao) : new Date()
                }));

                const maiorId = this.doacoes.reduce((max, d) => Math.max(max, d.id || 0), 0);
                this.ultimoId = maiorId > 0 ? maiorId + 1 : 1;
            }
        } catch (err) {
            console.warn('Nao foi possivel carregar doacoes do backend.', err);
        } finally {
            this.renderizarDoacoes();
        }
    }

    mapearTipoBackendParaUI(tipoBackend) {
        switch (tipoBackend) {
            case 'dinheiro':
                return 'dinheiro';
            case 'alimentos':
                return 'alimento';
            case 'materiais_escolares':
                return 'material_escolar';
            case 'materiais_higiene':
                return 'higiene';
            default:
                return 'outros';
        }
    }

    mapearTipoUIParaBackend(tipoUI) {
        switch (tipoUI) {
            case 'dinheiro':
                return 'dinheiro';
            case 'alimento':
                return 'alimentos';
            case 'material_escolar':
                return 'materiais_escolares';
            case 'higiene':
                return 'materiais_higiene';
            default:
                return 'outros';
        }
    }

    async salvarDoacao() {
        const tipo = document.getElementById('doacaoTipo').value;
        const valorInput = document.getElementById('doacaoValor');
        const descricaoInput = document.getElementById('doacaoDescricao');
        const doadorInput = document.getElementById('doadorNome');

        if (!tipo) {
            this.mostrarMensagem('Selecione o tipo de doação.', 'danger');
            return;
        }

        let valor = null;
        let descricao = '';

        if (tipo === 'dinheiro') {
            // converter texto formatado (ex: 1.234,56) para número JS
            let bruto = (valorInput?.value || '').toString().trim();
            bruto = bruto.replace(/\./g, '').replace(',', '.');
            valor = parseFloat(bruto || '0');
            if (!valor || valor <= 0) {
                this.mostrarMensagem('Informe um valor em dinheiro válido.', 'danger');
                return;
            }
        } else {
            descricao = (descricaoInput?.value || '').trim();
            if (!descricao) {
                this.mostrarMensagem('Descreva o que foi doado.', 'danger');
                return;
            }
        }

        const doador = (doadorInput?.value || '').trim();

        const tipoBackend = this.mapearTipoUIParaBackend(tipo);

        const payload = {
            nome_doador: doador || 'Anonimo',
            tipo: tipoBackend,
            valor: valor || 0,
            descricao_itens: descricao // Mapeando para o campo correto do backend
        };

        try {
            const token = localStorage.getItem('authToken');
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const resp = await fetch(`${this.API_BASE_URL}/doacoes`, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
            });

            if (!resp.ok) {
                throw new Error('Erro ao salvar doacao');
            }

            const criada = await resp.json();

            const doacao = {
                id: criada.id || this.ultimoId++,
                tipo,
                valor,
                descricao,
                doador,
                dataCadastro: criada.data_doacao ? new Date(criada.data_doacao) : new Date()
            };

            this.doacoes.push(doacao);
            this.limparFormulario();
            this.aplicarFiltros();
            this.mostrarMensagem('Doação registrada com sucesso!', 'success');
        } catch (err) {
            this.mostrarMensagem('Não foi possível salvar a doação. Tente novamente.', 'danger');
        }

        const modalEl = document.getElementById('novaDoacaoModal');
        if (modalEl && window.bootstrap) {
            const modal = window.bootstrap.Modal.getInstance(modalEl) || new window.bootstrap.Modal(modalEl);
            modal.hide();
        }
    }

    limparFormulario() {
        const form = document.getElementById('doacaoForm');
        if (form) form.reset();

        const valorField = document.getElementById('valorField');
        const descricaoField = document.getElementById('descricaoField');
        if (valorField) valorField.style.display = 'none';
        if (descricaoField) descricaoField.style.display = 'none';
    }

    aplicarFiltros() {
        if (this._filtrando) return;
        this._filtrando = true;
        const searchTerm = (document.getElementById('searchInput')?.value || '').toLowerCase();
        const tipoFilter = document.getElementById('tipoFilter')?.value || '';
        const dataFilter = document.getElementById('dataFilter')?.value || '';
        const ordenacao = document.getElementById('ordenacaoSelect')?.value || '';

        let resultado = this.doacoes.filter(d => {
            const texto = `${d.doador || ''} ${d.descricao || ''}`.toLowerCase();

            const matchSearch = !searchTerm || texto.includes(searchTerm);
            const matchTipo = !tipoFilter || d.tipo === tipoFilter;

            let matchData = true;
            if (dataFilter) {
                const dataStr = this.formatarData(d.dataCadastro, true);
                matchData = dataStr === dataFilter;
            }

            return matchSearch && matchTipo && matchData;
        });

        if (ordenacao) {
            resultado = this.ordenar(resultado, ordenacao);
        }

        this.renderizarDoacoes(resultado);
        this._filtrando = false;
    }

    ordenar(lista, criterio) {
        const copia = [...lista];

        switch (criterio) {
            case 'dataRecente':
                copia.sort((a, b) => b.dataCadastro - a.dataCadastro);
                break;
            case 'dataAntiga':
                copia.sort((a, b) => a.dataCadastro - b.dataCadastro);
                break;
            case 'nomeAZ':
                copia.sort((a, b) => (a.doador || '').localeCompare(b.doador || ''));
                break;
            case 'nomeZA':
                copia.sort((a, b) => (b.doador || '').localeCompare(a.doador || ''));
                break;
            case 'valorMaior':
                copia.sort((a, b) => (b.valor || 0) - (a.valor || 0));
                break;
            case 'valorMenor':
                copia.sort((a, b) => (a.valor || 0) - (b.valor || 0));
                break;
        }

        return copia;
    }

    limparFiltros() {
        const searchInput = document.getElementById('searchInput');
        const tipoFilter = document.getElementById('tipoFilter');
        const dataFilter = document.getElementById('dataFilter');
        const ordenacao = document.getElementById('ordenacaoSelect');

        if (searchInput) searchInput.value = '';
        if (tipoFilter) tipoFilter.value = '';
        if (dataFilter) dataFilter.value = '';
        if (ordenacao) ordenacao.value = '';

        this.renderizarDoacoes(this.doacoes);
    }

    renderizarDoacoes(lista = null) {
        const tbody = document.getElementById('doacoesTableBody');
        const emptyState = document.getElementById('emptyState');
        const doacoes = lista || this.doacoes;

        if (!tbody) return;

        tbody.innerHTML = '';

        if (!doacoes.length) {
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        doacoes.forEach(d => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${this.formatarData(d.dataCadastro)}</td>
                <td>${d.doador || '-'}</td>
                <td>${this.formatarTipo(d.tipo)}</td>
                <td>${d.descricao || '-'}</td>
                <td>${d.tipo === 'dinheiro' ? this.formatarMoeda(d.valor) : '-'}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    formatarData(data, formatoInput = false) {
        if (!(data instanceof Date)) return '';

        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const dia = String(data.getDate()).padStart(2, '0');

        if (formatoInput) {
            return `${ano}-${mes}-${dia}`;
        }

        return `${dia}/${mes}/${ano}`;
    }

    formatarTipo(tipo) {
        switch (tipo) {
            case 'dinheiro': return 'Dinheiro';
            case 'alimento': return 'Alimento';
            case 'material_escolar': return 'Material escolar';
            case 'higiene': return 'Produtos de higiene';
            case 'outros': return 'Outros';
            default: return tipo;
        }
    }

    formatarMoeda(valor) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor || 0);
    }

    dispararAplicarFiltros() {
        if (this.filtroTimeout) {
            clearTimeout(this.filtroTimeout);
        }
        this.filtroTimeout = setTimeout(() => {
            this.aplicarFiltros();
        }, 150);
    }

    mostrarMensagem(texto, tipo = 'info') {
        let container = document.querySelector('.doacoes-toast');
        if (!container) {
            container = document.createElement('div');
            container.className = 'doacoes-toast';
            document.body.appendChild(container);
        }

        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${tipo} alert-dismissible fade show mb-2`;
        alertDiv.innerHTML = `
            ${texto}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        container.appendChild(alertDiv);

        setTimeout(() => {
            alertDiv.classList.remove('show');
            alertDiv.classList.add('hide');
            setTimeout(() => alertDiv.remove(), 300);
        }, 4000);
    }
}

if (!window.__doacoesManagerInitialized__) {
	window.__doacoesManagerInitialized__ = true;
	document.addEventListener('DOMContentLoaded', () => {
		window.doacoesManager = new DoacoesManager();
	});
}