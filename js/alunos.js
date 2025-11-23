let dataTable;
let currentUser;

// Funções de manipulação de dados locais
async function getAlunos() {
  try {
    const alunos = JSON.parse(localStorage.getItem('alunos')) || [];
    return alunos;
  } catch (error) {
    console.error('Erro ao carregar alunos:', error);
    return [];
  }
}

async function getAluno(id) {
  try {
    const alunos = await getAlunos();
    return alunos.find(aluno => aluno.id === id) || null;
  } catch (error) {
    console.error('Erro ao buscar aluno:', error);
    return null;
  }
}

async function addAluno(aluno) {
  try {
    const alunos = await getAlunos();
    const novoAluno = {
      ...aluno,
      id: 'aluno-' + Date.now(),
      data_cadastro: new Date().toISOString()
    };
    alunos.push(novoAluno);
    localStorage.setItem('alunos', JSON.stringify(alunos));
    return novoAluno;
  } catch (error) {
    console.error('Erro ao adicionar aluno:', error);
    throw error;
  }
}

async function updateAluno(id, dadosAtualizados) {
  try {
    const alunos = await getAlunos();
    const index = alunos.findIndex(a => a.id === id);
    if (index !== -1) {
      alunos[index] = { ...alunos[index], ...dadosAtualizados };
      localStorage.setItem('alunos', JSON.stringify(alunos));
      return alunos[index];
    }
    return null;
  } catch (error) {
    console.error('Erro ao atualizar aluno:', error);
    throw error;
  }
}

async function deleteAlunoFirebase(id) {
  try {
    const alunos = await getAlunos();
    const alunosAtualizados = alunos.filter(aluno => aluno.id !== id);
    localStorage.setItem('alunos', JSON.stringify(alunosAtualizados));
    return true;
  } catch (error) {
    console.error('Erro ao excluir aluno:', error);
    throw error;
  }
}

// Inicializar a aplicação
function initializeApp() {
  // Verificar se há usuário logado
  const user = JSON.parse(localStorage.getItem('user'));
  if (user) {
    currentUser = user;
    initializeUI(user);
    loadAlunos();
  } else {
    window.location.href = 'login.html';
  }

  // Configurar event listeners
  setupEventListeners();
}

// Inicializar interface do usuário
function initializeUI(user) {
  const displayName = user.name || user.email || 'Usuário';
  const email = user.email || '';
  
  if (document.getElementById('userName')) {
    document.getElementById('userName').textContent = displayName.split(' ')[0];
  }
  
  if (document.getElementById('userEmail')) {
    document.getElementById('userEmail').textContent = email;
  }
  
  const initials = displayName.split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
  
  const userAvatar = document.getElementById('userAvatar');
  const userAvatarSmall = document.getElementById('userAvatarSmall');
  
  if (userAvatar) userAvatar.textContent = initials;
  if (userAvatarSmall) userAvatarSmall.textContent = initials;
}

// Carregar alunos
async function loadAlunos() {
  try {
    const alunos = await getAlunos();
    if (dataTable) {
      dataTable.destroy();
    }
    
    dataTable = new DataTable('#alunosTable', {
      data: alunos,
      columns: [
        { data: 'nome' },
        { 
          data: 'data_nasc',
          render: (data) => calculateAge(data) + ' anos'
        },
        { data: 'status' },
        {
          data: null,
          render: (data, type, row) => `
            <div class="btn-group">
              <button class="btn btn-sm btn-info" onclick="viewAluno('${row.id}')">
                <i class="bi bi-eye"></i>
              </button>
              <button class="btn btn-sm btn-primary" onclick="editAluno('${row.id}')">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-sm btn-danger" onclick="deleteAluno('${row.id}')">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          `
        }
      ],
      language: {
        url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/pt-BR.json'
      },
      searching: false
    });
    
    const searchInput = document.getElementById('searchAluno');
    searchInput.addEventListener('keyup', () => {
      dataTable.search(searchInput.value).draw();
    });
  } catch (error) {
    console.error('Erro ao carregar alunos:', error);
    alert('Erro ao carregar alunos. Por favor, tente novamente.');
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

  const formData = new FormData(form);
  const alunoData = Object.fromEntries(formData.entries());
  
  try {
    const alunoId = form.dataset.alunoId;
    if (alunoId) {
      await updateAluno(alunoId, alunoData);
    } else {
      await addAluno(alunoData);
    }
    
    bootstrap.Modal.getInstance(document.getElementById('modalAluno')).hide();
    loadAlunos();
    form.reset();
    form.classList.remove('was-validated');
  } catch (error) {
    console.error('Erro ao salvar aluno:', error);
    alert('Erro ao salvar aluno. Por favor, tente novamente.');
  }
}

// Visualizar aluno
async function viewAluno(id) {
  try {
    const aluno = await getAluno(id);
    if (aluno) {
      const modal = new bootstrap.Modal(document.getElementById('viewModal'));
      
      // Preencher dados do aluno no modal
      Object.entries(aluno).forEach(([key, value]) => {
        const element = document.getElementById(`view_${key}`);
        if (element) {
          if (key === 'data_nasc') {
            element.textContent = new Date(value).toLocaleDateString();
          } else {
            element.textContent = value;
          }
        }
      });
      
      modal.show();
    }
  } catch (error) {
    console.error('Erro ao visualizar aluno:', error);
    alert('Erro ao carregar dados do aluno. Por favor, tente novamente.');
  }
}

// Editar aluno
async function editAluno(id) {
  try {
    const aluno = await getAluno(id);
    if (aluno) {
      const form = document.getElementById('alunoForm');
      form.dataset.alunoId = id;
      
      // Preencher formulário com dados do aluno
      Object.entries(aluno).forEach(([key, value]) => {
        const input = form.elements[key];
        if (input) {
          input.value = value;
        }
      });
      
      const modal = new bootstrap.Modal(document.getElementById('modalAluno'));
      modal.show();
    }
  } catch (error) {
    console.error('Erro ao editar aluno:', error);
    alert('Erro ao carregar dados do aluno. Por favor, tente novamente.');
  }
}

// Excluir aluno com confirmação de senha e motivo
async function deleteAluno(id) {
  try {
    const alunoDoc = await getAluno(id);
    if (!alunoDoc) {
      alert('Aluno não encontrado!');
      return;
    }
    
    // Mostrar modal de confirmação
    document.getElementById('deleteAlunoNome').textContent = alunoDoc.nome || 'este aluno';
    document.getElementById('senhaConfirmacao').value = '';
    document.getElementById('motivoExclusao').value = '';
    
    const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    logs.push(exclusaoLog);
    localStorage.setItem('logsExclusao', JSON.stringify(logs));
    
    // Executar a exclusão
    const alunos = await getAlunos();
    const alunosAtualizados = alunos.filter(aluno => aluno.id !== id);
    localStorage.setItem('alunos', JSON.stringify(alunosAtualizados));
    
    // Fechar modal e recarregar a lista
    loadAlunos();
    alert('Aluno excluído com sucesso!');
  } catch (error) {
    console.error('Erro ao excluir aluno:', error);
    alert('Erro ao excluir aluno. Por favor, tente novamente.');
  }
}

// Filtro DataTables para restrição alimentar
function setupRestricaoAlimentarFilter() {
  if (window.jQuery && window.$ && $.fn.dataTable) {
    $.fn.dataTable.ext.search.push(
      function(settings, data, dataIndex) {
        const restricaoFilter = document.getElementById('filterRestricao')?.value || '';
        const aluno = dataTable.row(dataIndex).data();
        if (!aluno) return true;
        if (restricaoFilter === '') return true;
        const hasRestricao = aluno.restricaoAlimentar && aluno.restricaoAlimentar.trim() !== '';
        return (restricaoFilter === 'sim' && hasRestricao) || (restricaoFilter === 'nao' && !hasRestricao);
      }
    );
    // Atualizar tabela ao mudar filtro
    const filterElem = document.getElementById('filterRestricao');
    if (filterElem) {
      filterElem.addEventListener('change', () => {
        dataTable.draw();
      });
    }
  }
}


// Configurar event listeners
function setupEventListeners() {
  document.getElementById('btnNovoAluno').addEventListener('click', () => {
    const form = document.getElementById('alunoForm');
    form.reset();
    form.classList.remove('was-validated');
    delete form.dataset.alunoId;
    
    const modal = new bootstrap.Modal(document.getElementById('modalAluno'));
    modal.show();
  });

  document.getElementById('btnSalvarAluno').addEventListener('click', saveAluno);
  
  document.getElementById('btnLogout').addEventListener('click', async () => {
    try {
      await auth.signOut();
      window.location.href = 'login.html';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  });

  // Buscar endereço automático pelo CEP
  const cepInput = document.getElementById('cep');
  if (cepInput) {
    cepInput.addEventListener('blur', async () => {
      let cep = cepInput.value.replace(/\D/g, '');
      if (cep.length !== 8) return;
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        if (!response.ok) throw new Error('Erro ao buscar CEP');
        const data = await response.json();
        if (data.erro) throw new Error('CEP não encontrado');
        document.getElementById('endereco').value = data.logradouro || '';
        document.getElementById('bairro').value = data.bairro || '';
        document.getElementById('cidade').value = data.localidade || '';
        document.getElementById('estado').value = data.uf || '';
      } catch (e) {
        // Limpa campos se erro
        document.getElementById('endereco').value = '';
        document.getElementById('bairro').value = '';
        document.getElementById('cidade').value = '';
        document.getElementById('estado').value = '';
        // Opcional: alert('CEP inválido ou não encontrado.');
      }
    });
  }
}


// Calcular idade
function calculateAge(birthDate) {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

// Inicializar aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  // Verificar se o DataTables está disponível
  if (window.jQuery && window.$.fn.DataTable) {
    initializeApp();
  } else {
    // Carregar DataTables dinamicamente se não estiver disponível
    const script = document.createElement('script');
    script.src = 'https://cdn.datatables.net/1.11.5/js/jquery.dataTables.min.js';
    script.onload = function() {
      // Carregar CSS do DataTables
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.datatables.net/1.11.5/css/jquery.dataTables.min.css';
      document.head.appendChild(link);
      
      // Inicializar aplicação após carregar DataTables
      initializeApp();
    };
    document.head.appendChild(script);
  }
});
