# Plataforma ONG Novo Amanhã - Guia de Instalação MySQL

## 📋 Pré-requisitos

### Software Necessário:
- **MySQL Server 8.0+** (https://dev.mysql.com/downloads/mysql/)
- **MySQL Workbench** (https://dev.mysql.com/downloads/workbench/)
- **Node.js 16+** (https://nodejs.org/)
- **Git** (https://git-scm.com/)

## 🗄️ Configuração do Banco de Dados

### 1. Instalar MySQL Server
1. Baixe e instale o MySQL Server
2. Durante a instalação, defina uma senha para o usuário `root`
3. Certifique-se de que o serviço MySQL está rodando

### 2. Executar Script de Setup
1. Abra o **MySQL Workbench**
2. Conecte-se ao servidor MySQL usando o usuário `root`
3. Abra o arquivo `backend/database/setup.sql`
4. Execute o script completo (Ctrl+Shift+Enter)

O script irá:
- ✅ Criar o banco de dados `plataforma_ong`
- ✅ Criar o usuário `ong_user` com senha `123456`
- ✅ Criar todas as tabelas necessárias
- ✅ Inserir dados de exemplo
- ✅ Configurar índices e relacionamentos

### 3. Verificar Instalação
Após executar o script, você deve ver:
```
Banco de dados configurado com sucesso!
total_usuarios: 1
total_professores: 1
total_cursos: 1
total_alunos: 1
```

## 🚀 Configuração da Aplicação

### 1. Instalar Dependências do Backend
```bash
cd backend
npm install
```

### 2. Configurar Variáveis de Ambiente
O arquivo `.env` já está configurado com:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=plataforma_ong
DB_USER=ong_user
DB_PASSWORD=123456
```

### 3. Iniciar o Servidor Backend
```bash
cd backend
npm start
```

Se a conexão for bem-sucedida, você verá:
```
✅ Conexão com MySQL estabelecida com sucesso!
✅ Modelos sincronizados com o banco de dados!
🚀 Servidor rodando na porta 3001
```

### 4. Abrir a Aplicação Frontend
1. Abra o arquivo `index.html` em um servidor web local
2. Ou use a extensão Live Server do VS Code
3. Acesse: `http://localhost:8000` (ou porta configurada)

## 👤 Credenciais de Acesso

### Usuário Administrador:
- **Email:** admin@ongnovoamanha.org
- **Senha:** admin123

## 📊 Estrutura do Banco de Dados

### Tabelas Principais:
- **usuarios** - Gerenciamento de usuários do sistema
- **professores** - Cadastro de professores
- **cursos** - Gestão de cursos oferecidos
- **alunos** - Cadastro de alunos

### Relacionamentos:
- Usuários podem cadastrar professores, cursos e alunos
- Professores são responsáveis por cursos
- Cursos têm alunos matriculados

## 🔧 Funcionalidades Implementadas

### Backend (API REST):
- ✅ Autenticação JWT
- ✅ CRUD completo de usuários
- ✅ CRUD completo de professores
- ✅ CRUD completo de cursos
- ✅ CRUD completo de alunos
- ✅ Middleware de segurança
- ✅ Validação de dados
- ✅ Rate limiting

### Frontend:
- ✅ Interface de login
- ✅ Dashboard administrativo
- ✅ Gestão de alunos
- ✅ Interface responsiva (Bootstrap 5)
- ✅ Integração com API backend

## 🧪 Testando a Aplicação

### 1. Testar API Backend:
```bash
# Health check
curl http://localhost:3001/api/health

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ongnovoamanha.org","senha":"admin123"}'
```

### 2. Testar Frontend:
1. Acesse a página de login
2. Use as credenciais do administrador
3. Navegue pelas funcionalidades de gestão

## 📁 Estrutura do Projeto

```
Plataforma-ong/
├── backend/
│   ├── config/database.js      # Configuração Sequelize
│   ├── models/                 # Modelos do banco
│   ├── controllers/            # Lógica de negócio
│   ├── routes/                 # Rotas da API
│   ├── middleware/             # Middlewares
│   ├── database/setup.sql      # Script de setup MySQL
│   ├── server.js              # Servidor principal
│   └── package.json           # Dependências
├── js/                        # Scripts frontend
├── css/                       # Estilos
├── pages/                     # Páginas HTML
└── index.html                 # Página principal
```

## 🔍 Troubleshooting

### Erro de Conexão MySQL:
1. Verifique se o MySQL Server está rodando
2. Confirme as credenciais no arquivo `.env`
3. Execute o script `setup.sql` novamente

### Erro "Table doesn't exist":
1. Execute o script `setup.sql` no MySQL Workbench
2. Reinicie o servidor backend

### Erro de Porta:
1. Verifique se a porta 3001 está livre
2. Altere a porta no arquivo `.env` se necessário

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do servidor backend
2. Consulte a documentação do MySQL
3. Verifique se todas as dependências estão instaladas

---

**Desenvolvido para ONG Novo Amanhã**  
**Versão:** 1.0.0  
**Data:** Janeiro 2024
