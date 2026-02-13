// Configuração da API
var API_BASE_URL = API_BASE_URL || 'http://localhost:3003/api';
let authToken = localStorage.getItem('authToken');

let dataTable;
let currentUser;

// Inicializar a aplicação
async function initializeApp() {
  // Configurar event listeners primeiro
  setupEventListeners();

  // Se não há token, criar usuário mock para desenvolvimento
  if (!authToken) {
    console.warn('Sem token de autenticação - usando modo desenvolvimento');
    currentUser = {
      id: 1,
      nome: 'Usuário Desenvolvimento',
      email: 'dev@ongnovoamanha.org'
    };
    initializeUI(currentUser);
    await loadAlunos();
    return;
  }

  try {
    // Verificar se o token é válido
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Token inválido');
    }

    const userData = await response.json();
    currentUser = userData.user;
    
    // Debug para diagnóstico
    console.log('Usuário logado:', currentUser);
    
    initializeUI(userData.user);
    applyPermissions(userData.user); // Aplicar permissões imediatamente
    await loadAlunos();
  } catch (error) {
    console.error('Erro de autenticação:', error);
    // Em caso de erro, usar modo desenvolvimento
    currentUser = {
      id: 1,
      nome: 'Usuário Desenvolvimento',
      email: 'dev@ongnovoamanha.org',
      cargo: 'admin' // Dev é admin
    };
    initializeUI(currentUser);
    applyPermissions(currentUser);
    await loadAlunos();
  }
}

// Aplicar permissões de interface
function applyPermissions(user) {
  const userRole = (user.cargo || 'guest').toLowerCase();
  const isAdmin = userRole === 'admin';
  const canEdit = isAdmin || userRole === 'secretaria';
  
  console.log('Aplicando permissões:', { userRole, canEdit, isAdmin });

  // Botão Novo Aluno
  const btnNovo = document.querySelector('button[data-bs-target="#modalAluno"]');
  if (btnNovo) {
    if (!canEdit) {
        btnNovo.remove(); // Remover do DOM para garantir
        console.log('Botão Novo Aluno removido (Permissão insuficiente)');
    } else {
        btnNovo.style.display = 'inline-block';
    }
  }
}

// Inicializar interface do usuário (tolerante à ausência de elementos no header)
function initializeUI(user) {
  const nameEl = document.getElementById('userName');
  const emailEl = document.getElementById('userEmail');
  const avatarEl = document.getElementById('userAvatar');
  const avatarSmallEl = document.getElementById('userAvatarSmall');

  const displayName = user.nome || user.email || 'Usuário';
  const email = user.email || '';

  if (nameEl) nameEl.textContent = displayName;
  if (emailEl) emailEl.textContent = email;

  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  if (avatarEl) avatarEl.textContent = initials;
  if (avatarSmallEl) avatarSmallEl.textContent = initials;
}

// Carregar alunos da API
async function loadAlunos() {
  console.log('🔄 Carregando alunos...');
  console.log('🔑 Token:', authToken ? 'Presente' : 'Ausente');
  console.log('🌐 API URL:', API_BASE_URL);
  
  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Adicionar token apenas se existir
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const queryParams = new URLSearchParams({
      page: 1,
      limit: 500 // percorre até 500 alunos no DataTable local, evitando ficar preso na primeira página do backend
    });

    const url = `${API_BASE_URL}/alunos?${queryParams.toString()}`;
    console.log('📡 Fazendo requisição para:', url);

    const response = await fetch(url, {
      headers: headers
    });

    console.log('📊 Status response:', response.status);
    console.log('📊 Headers response:', response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na resposta:', errorText);
      throw new Error(`Erro ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Dados recebidos:', data);
    const alunos = data.alunos || data; // Suportar tanto formato {alunos: []} quanto array direto
    
    if (dataTable) {
      dataTable.destroy();
    }
    
    // Limpar tabela
    const tbody = document.querySelector('#alunosTable tbody');
    tbody.innerHTML = '';
    
    // Verificar permissões (usando currentUser global ou localStorage com fallback seguro)
    const userToCheck = currentUser || JSON.parse(localStorage.getItem('userData') || '{}');
    const userRole = (userToCheck.cargo || 'guest').toLowerCase();
    const isAdmin = userRole === 'admin';
    const canEdit = isAdmin || userRole === 'secretaria';
    const canDelete = isAdmin;

    // Reforçar ocultação do botão (redundância de segurança)
    const btnNovo = document.querySelector('button[data-bs-target="#modalAluno"]');
    if (btnNovo && !canEdit) btnNovo.style.display = 'none';

    // Preencher tabela
    alunos.forEach(aluno => {
      const row = tbody.insertRow();
      
      let actionButtons = `
            <button class="btn btn-sm btn-info" onclick="viewAluno(${aluno.id})" title="Visualizar">
              <i class="bi bi-eye"></i>
            </button>`;
      
      if (canEdit) {
          actionButtons += `
            <button class="btn btn-sm btn-primary" onclick="editAluno(${aluno.id})" title="Editar">
              <i class="bi bi-pencil"></i>
            </button>`;
      }
      
      if (canDelete) {
          actionButtons += `
            <button class="btn btn-sm btn-danger" onclick="deleteAluno(${aluno.id})" title="Excluir">
              <i class="bi bi-trash"></i>
            </button>`;
      }

      row.innerHTML = `
        <td>${aluno.nome}</td>
        <td>${aluno.nome_responsavel || 'Não informado'}</td>
        <td>${aluno.telefone || aluno.telefone_responsavel || 'Não informado'}</td>
        <td>
          <span class="badge bg-success">
            ${aluno.ativo ? 'Ativo' : 'Inativo'}
          </span>
        </td>
        <td class="text-end">
          <div class="btn-group">
            ${actionButtons}
          </div>
        </td>
      `;
    });

    // Inicializar DataTable em português, sem a barra de busca nativa
    dataTable = new DataTable('#alunosTable', {
      language: {
        // Força todos os textos para português, independente do arquivo externo
        decimal: ',',
        thousands: '.',
        processing: 'Processando...',
        lengthMenu: 'Mostrar _MENU_ registros',
        zeroRecords: 'Nenhum registro encontrado',
        emptyTable: 'Nenhum registro disponível',
        info: 'Mostrando _START_ até _END_ de _TOTAL_ registros',
        infoEmpty: 'Mostrando 0 até 0 de 0 registros',
        infoFiltered: '(filtrado de _MAX_ registros no total)',
        infoPostFix: '',
        search: 'Buscar:',
        url: '',
        paginate: {
          first: 'Primeiro',
          previous: 'Anterior',
          next: 'Próximo',
          last: 'Último'
        },
        aria: {
          sortAscending: ': ativar para ordenar a coluna em ordem crescente',
          sortDescending: ': ativar para ordenar a coluna em ordem decrescente'
        }
      },
      responsive: true,
      order: [[0, 'asc']],
      // Oculta o seletor de quantidade ("Show entries")
      lengthChange: false,
      // Remove o componente 'f' (search box) do layout
      dom: 'rtip',
      // Desativa a busca nativa, usaremos a barra personalizada
      searching: false
    });

    // Conectar a barra de busca personalizada à tabela
    const searchInput = document.getElementById('searchAluno');
    if (searchInput) {
      searchInput.addEventListener('keyup', () => {
        dataTable.search(searchInput.value).draw();
      });
    }

  } catch (error) {
    console.error('❌ Erro ao carregar alunos:', error);
    console.error('❌ Stack:', error.stack);
    
    // Mostrar erro detalhado para debug
    const errorMsg = error.message || 'Erro desconhecido';
    showAlert(`Erro ao carregar alunos: ${errorMsg}. Verifique o console para mais detalhes.`, 'danger');
    
    // Tentar mostrar mensagem mais específica
    if (error.message.includes('Failed to fetch')) {
      showAlert('Erro de conexão com o servidor. Verifique se o backend está rodando em http://localhost:3003', 'danger');
    } else if (error.message.includes('401')) {
      showAlert('Erro de autenticação. Faça login novamente.', 'danger');
    } else if (error.message.includes('403')) {
      showAlert('Acesso negado. Você não tem permissão para ver alunos.', 'danger');
    } else if (error.message.includes('500')) {
      showAlert('Erro interno do servidor. Verifique os logs do backend.', 'danger');
    }
  }
}

// Salvar aluno
async function saveAluno(event) {
  event.preventDefault();
  
  const form = document.getElementById('alunoForm');
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return;
  }

  // Função auxiliar para obter valor ou null se vazio
  const getValueOrNull = (id) => {
    const element = document.getElementById(id);
    const value = element ? element.value.trim() : '';
    return value === '' ? null : value;
  };

  // Coletar dados do formulário com validação
  const alunoData = {
    nome: document.getElementById('nome').value.trim(),
    data_nasc: document.getElementById('dataNascimento').value,
    sexo: document.getElementById('genero').value === 'masculino' ? 'M' : 
          document.getElementById('genero').value === 'feminino' ? 'F' : 'Outro'
  };

  // Adicionar campos opcionais apenas se preenchidos
  const cpf = getValueOrNull('cpf');
  if (cpf) alunoData.cpf = cpf;

  const rg = getValueOrNull('rg');
  if (rg) alunoData.rg = rg;

  const telefone = getValueOrNull('telefoneResponsavel1');
  if (telefone) alunoData.telefone = telefone;

  // Endereço
  const endereco = getValueOrNull('endereco');
  if (endereco) alunoData.endereco = endereco;

  const numero = getValueOrNull('numero');
  if (numero) alunoData.numero = numero;

  const bairro = getValueOrNull('bairro');
  if (bairro) alunoData.bairro = bairro;

  const cidade = getValueOrNull('cidade');
  if (cidade) alunoData.cidade = cidade;

  const estado = getValueOrNull('estado');
  if (estado) alunoData.estado = estado;

  const cep = getValueOrNull('cep');
  if (cep) alunoData.cep = cep;

  // Responsável
  const nomeResponsavel = getValueOrNull('nomeResponsavel');
  if (nomeResponsavel) alunoData.nome_responsavel = nomeResponsavel;

  const parentescoResponsavel = getValueOrNull('parentescoResponsavel');
  if (parentescoResponsavel) alunoData.parentesco_responsavel = parentescoResponsavel;

  const telefoneResponsavel = getValueOrNull('telefoneResponsavel1');
  if (telefoneResponsavel) alunoData.telefone_responsavel = telefoneResponsavel;

  // Informações acadêmicas
  const escola = getValueOrNull('escola');
  if (escola) alunoData.escola = escola;

  const serie = getValueOrNull('periodo');
  if (serie) alunoData.serie = serie;

  // Informações médicas
  const restricaoAlimentar = getValueOrNull('restricaoAlimentar');
  if (restricaoAlimentar) alunoData.restricao_alimentar = restricaoAlimentar;

  const medicamentos = getValueOrNull('medicacao');
  if (medicamentos) alunoData.medicamentos = medicamentos;

  const observacoesMedicas = getValueOrNull('observacoes');
  if (observacoesMedicas) alunoData.observacoes_medicas = observacoesMedicas;

  // Status
  const statusElement = document.getElementById('status');
  if (statusElement) {
    const statusVal = (statusElement.value || '').toString().trim().toLowerCase();
    if (statusVal === 'matriculado') {
      alunoData.ativo = true;
    } else if (statusVal === 'inativo') {
      alunoData.ativo = false;
    } else {
      // Status não definido claramente: não enviar o campo para preservar valor atual
      delete alunoData.ativo;
    }
  } else {
    // Sem campo de status no formulário: não enviar para que o backend preserve o valor
    delete alunoData.ativo;
  }

  try {
    const alunoId = form.dataset.alunoId;
    const method = alunoId ? 'PUT' : 'POST';
    const url = alunoId ? `${API_BASE_URL}/alunos/${alunoId}` : `${API_BASE_URL}/alunos`;
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Adicionar token apenas se existir
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    // Debug: mostrar dados sendo enviados
    console.log('Dados sendo enviados:', JSON.stringify(alunoData, null, 2));
    console.log('URL:', url);
    console.log('Method:', method);
    console.log('Headers:', headers);

    const response = await fetch(url, {
      method: method,
      headers: headers,
      body: JSON.stringify(alunoData)
    });

    console.log('Status da resposta:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.log('Erro detalhado:', errorData);
      
      // Mostrar detalhes do erro se disponível
      if (errorData.details && Array.isArray(errorData.details)) {
        const errorMessages = errorData.details.map(detail => detail.msg).join(', ');
        throw new Error(`Dados inválidos: ${errorMessages}`);
      }
      
      throw new Error(errorData.error || 'Erro ao salvar aluno');
    }
    
    // Fechar modal e recarregar dados
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalAluno'));
    modal.hide();
    
    form.reset();
    form.classList.remove('was-validated');
    delete form.dataset.alunoId;
    
    await loadAlunos();
    showAlert('Aluno salvo com sucesso!', 'success');
    
  } catch (error) {
    console.error('Erro ao salvar aluno:', error);
    showAlert(`Erro ao salvar aluno: ${error.message}`, 'danger');
  }
}

// Visualizar aluno
async function viewAluno(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/alunos/${id}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao carregar dados do aluno');
    }

    const aluno = await response.json();
    
    // Preencher modal de visualização
    const modalBody = document.getElementById('viewAlunoContent');
    modalBody.innerHTML = `
      <div class="row">
        <div class="col-md-6">
          <h6>Dados Pessoais</h6>
          <p><strong>Nome:</strong> ${aluno.nome}</p>
          <p><strong>Data de Nascimento:</strong> ${new Date(aluno.data_nasc).toLocaleDateString()}</p>
          <p><strong>Sexo:</strong> ${aluno.sexo === 'M' ? 'Masculino' : aluno.sexo === 'F' ? 'Feminino' : 'Outro'}</p>
          <p><strong>CPF:</strong> ${aluno.cpf || 'Não informado'}</p>
          <p><strong>RG:</strong> ${aluno.rg || 'Não informado'}</p>
        </div>
        <div class="col-md-6">
          <h6>Responsável</h6>
          <p><strong>Nome:</strong> ${aluno.nome_responsavel || 'Não informado'}</p>
          <p><strong>Parentesco:</strong> ${aluno.parentesco_responsavel || 'Não informado'}</p>
          <p><strong>Telefone:</strong> ${aluno.telefone_responsavel || 'Não informado'}</p>
        </div>
      </div>
      <div class="row mt-3">
        <div class="col-12">
          <h6>Endereço</h6>
          <p>${aluno.endereco || ''} ${aluno.numero || ''}, ${aluno.bairro || ''}</p>
          <p>${aluno.cidade || ''} - ${aluno.estado || ''} ${aluno.cep || ''}</p>
        </div>
      </div>
      ${aluno.restricao_alimentar ? `
        <div class="row mt-3">
          <div class="col-12">
            <h6>Restrições Alimentares</h6>
            <p>${aluno.restricao_alimentar}</p>
          </div>
        </div>
      ` : ''}
    `;
    
    const modal = new bootstrap.Modal(document.getElementById('viewModal'));
    modal.show();
    
  } catch (error) {
    console.error('Erro ao visualizar aluno:', error);
    showAlert('Erro ao carregar dados do aluno', 'danger');
  }
}

// Editar aluno
async function editAluno(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/alunos/${id}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao carregar dados do aluno');
    }

    const aluno = await response.json();
    const form = document.getElementById('alunoForm');
    
    // Preencher formulário
    form.dataset.alunoId = id;
    document.getElementById('nome').value = aluno.nome || '';
    document.getElementById('dataNascimento').value = aluno.data_nasc || '';
    document.getElementById('genero').value = aluno.sexo === 'M' ? 'masculino' : 
                                            aluno.sexo === 'F' ? 'feminino' : 'outro';
    document.getElementById('cpf').value = aluno.cpf || '';
    document.getElementById('rg').value = aluno.rg || '';
    document.getElementById('endereco').value = aluno.endereco || '';
    document.getElementById('numero').value = aluno.numero || '';
    document.getElementById('bairro').value = aluno.bairro || '';
    document.getElementById('cidade').value = aluno.cidade || '';
    document.getElementById('estado').value = aluno.estado || '';
    document.getElementById('cep').value = aluno.cep || '';
    document.getElementById('nomeResponsavel').value = aluno.nome_responsavel || '';
    if (document.getElementById('parentescoResponsavel')) {
      document.getElementById('parentescoResponsavel').value = aluno.parentesco_responsavel || '';
    }
    document.getElementById('telefoneResponsavel1').value = aluno.telefone_responsavel || '';
    document.getElementById('escola').value = aluno.escola || '';
    document.getElementById('periodo').value = aluno.serie || '';
    document.getElementById('restricaoAlimentar').value = aluno.restricao_alimentar || '';
    document.getElementById('medicacao').value = aluno.medicamentos || '';
    document.getElementById('observacoes').value = aluno.observacoes_medicas || '';
    document.getElementById('status').value = aluno.ativo ? 'matriculado' : 'inativo';
    
    // Alterar título do modal
    document.getElementById('modalTitle').innerHTML = '<i class="bi bi-pencil me-2"></i>Editar Aluno';
    
    const modal = new bootstrap.Modal(document.getElementById('modalAluno'));
    modal.show();
    
  } catch (error) {
    console.error('Erro ao editar aluno:', error);
    showAlert('Erro ao carregar dados do aluno', 'danger');
  }
}

// Excluir aluno
async function deleteAluno(id) {
  if (!confirm('Tem certeza que deseja excluir este aluno?')) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/alunos/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao excluir aluno');
    }

    await loadAlunos();
    showAlert('Aluno excluído com sucesso!', 'success');
    
  } catch (error) {
    console.error('Erro ao excluir aluno:', error);
    showAlert('Erro ao excluir aluno', 'danger');
  }
}

// Configurar event listeners
function setupEventListeners() {
  // Botão novo aluno
  const btnNovoAluno = document.querySelector('[data-bs-target="#modalAluno"]');
  if (btnNovoAluno) {
    btnNovoAluno.addEventListener('click', () => {
      const form = document.getElementById('alunoForm');
      form.reset();
      form.classList.remove('was-validated');
      delete form.dataset.alunoId;
      document.getElementById('modalTitle').innerHTML = '<i class="bi bi-person-plus-fill me-2"></i>Novo Aluno';
    });
  }

  // Botão salvar
  const btnSalvar = document.getElementById('btnSalvarAluno');
  if (btnSalvar) {
    btnSalvar.addEventListener('click', saveAluno);
  }
  
  // Logout
  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      localStorage.removeItem('authToken');
      window.location.href = '../index.html';
    });
  }

  // Buscar endereço pelo CEP
  const cepInput = document.getElementById('cep');
  if (cepInput) {
    // Máscara simples para CEP: 00000-000
    cepInput.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '');
      if (v.length > 8) v = v.slice(0, 8);
      if (v.length > 5) {
        e.target.value = v.slice(0, 5) + '-' + v.slice(5);
      } else {
        e.target.value = v;
      }
    });

    cepInput.addEventListener('blur', async () => {
      let cep = cepInput.value.replace(/\D/g, '');
      if (cep.length !== 8) return;
      
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          document.getElementById('endereco').value = data.logradouro || '';
          document.getElementById('bairro').value = data.bairro || '';
          document.getElementById('cidade').value = data.localidade || '';
          document.getElementById('estado').value = data.uf || '';
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    });
  }

  // Máscara simples para CPF: 000.000.000-00
  const cpfInput = document.getElementById('cpf');
  if (cpfInput) {
    cpfInput.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '');
      if (v.length > 11) v = v.slice(0, 11);
      if (v.length > 9) {
        e.target.value = v.slice(0, 3) + '.' + v.slice(3, 6) + '.' + v.slice(6, 9) + '-' + v.slice(9);
      } else if (v.length > 6) {
        e.target.value = v.slice(0, 3) + '.' + v.slice(3, 6) + '.' + v.slice(6);
      } else if (v.length > 3) {
        e.target.value = v.slice(0, 3) + '.' + v.slice(3);
      } else {
        e.target.value = v;
      }
    });
  }

  // Máscara simples para telefone: (00) 00000-0000
  const applyPhoneMask = (input) => {
    input.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '');
      if (v.length > 11) v = v.slice(0, 11);
      if (v.length > 6) {
        e.target.value = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
      } else if (v.length > 2) {
        e.target.value = `(${v.slice(0, 2)}) ${v.slice(2)}`;
      } else if (v.length > 0) {
        e.target.value = `(${v}`;
      } else {
        e.target.value = '';
      }
    });
  };

  const tel1 = document.getElementById('telefoneResponsavel1');
  if (tel1) applyPhoneMask(tel1);

  const tel2 = document.getElementById('telefoneResponsavel2');
  if (tel2) applyPhoneMask(tel2);
}

// Mostrar alertas
function showAlert(message, type = 'info') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
  alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  
  document.body.appendChild(alertDiv);
  
  setTimeout(() => {
    if (alertDiv.parentNode) {
      alertDiv.parentNode.removeChild(alertDiv);
    }
  }, 5000);
}

// Tornar funções globais
window.viewAluno = viewAluno;
window.editAluno = editAluno;
window.deleteAluno = deleteAluno;

// Inicializar aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initializeApp);
