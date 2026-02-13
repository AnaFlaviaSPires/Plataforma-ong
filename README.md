
# 🏢 Plataforma ONG Novo Amanhã

Sistema completo de gestão para ONGs com backend MySQL e frontend responsivo.

## 🎯 Melhorias Implementadas

### 🔄 Reestruturação do Código
- ✅ Separação clara de responsabilidades (HTML, CSS, JS)
- ✅ Código JavaScript modular e organizado
- ✅ Estilos CSS com variáveis para fácil manutenção
- ✅ Melhor organização de arquivos em pastas lógicas
- ✅ Documentação do código

### 🎨 Melhorias na Interface
- ✅ Design mais limpo e consistente
- ✅ Melhor feedback visual para o usuário
- ✅ Responsividade aprimorada
- ✅ Melhor acessibilidade
- ✅ Animações suaves para melhor experiência do usuário

## 🚀 Funcionalidades Implementadas

### 🔐 Sistema de Autenticação
- ✅ Login seguro
- ✅ Validação de formulários
- ✅ Feedback visual para o usuário
- ✅ Controle de sessão
- ✅ Recuperação de senha

### 👥 Gestão de Alunos
- ✅ Cadastro completo de alunos
- ✅ Edição e atualização de dados
- ✅ Listagem com DataTables
- ✅ Validação de formulários
- ✅ Persistência no banco MySQL

### 🔧 Tecnologias
- **Frontend:** HTML5, CSS3, Bootstrap 5, JavaScript ES6+
- **Backend:** Node.js, Express.js, Sequelize ORM
- **Banco de Dados:** MySQL
- **Autenticação:** Sistema próprio (desenvolvimento)

### 🌟 Outras Funcionalidades
- Dashboard com métricas
- Sistema de presença
- Controle de doações
- Calendário de eventos
- Documentos em nuvem

## 📁 Nova Estrutura do Projeto

```
Plataforma-ong/
├── index.html                 # Página de login
├── assets/                    # Recursos estáticos
│   ├── css/                  # Estilos organizados
│   │   ├── styles.css        # Estilos principais
│   │   └── ...
│   ├── js/                   # Scripts organizados
│   │   ├── auth.js           # Lógica de autenticação
│   │   └── ...
│   ├── img/                  # Imagens
│   └── fonts/                # Fontes personalizadas
├── pages/                    # Páginas da aplicação
│   ├── alunos/              # Gestão de alunos
│   ├── dashboard/           # Dashboard principal
│   └── ...
├── php/                     # Backend PHP (se aplicável)
│   ├── includes/            # Arquivos de inclusão
│   └── ...
└── backend/                 # API Backend (Node.js)
    ├── server.js           # Servidor principal
    ├── controllers/        # Controladores
    ├── models/             # Modelos
    └── routes/             # Rotas da API
│   ├── database/            # Scripts do banco
│   └── config/              # Configurações
└── assets/                   # Recursos estáticos
    └── ong-guia.pdf
```

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js (v14 ou superior)
- MySQL Server
- MySQL Workbench (recomendado)

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/plataforma-ong.git
cd plataforma-ong
```

### 2. Configure o Backend
```bash
cd backend
npm install
```

### 3. Configure o Banco de Dados
1. Abra o MySQL Workbench
2. Execute o script `backend/database/setup.sql`
3. Crie um arquivo `.env` baseado no `.env.example`

### 4. Inicie o Servidor
```bash
npm start
```

### 5. Acesse a Aplicação
- Frontend: Abra `index.html` no navegador
- API: http://localhost:3003/api

## 🔑 Credenciais de Teste
- **Admin:** admin@ongnovoamanha.org / admin123
- **Banco:** ong_user / 123456

## 📋 API Endpoints

### Alunos
- `GET /api/alunos` - Listar alunos
- `GET /api/alunos/:id` - Obter aluno específico
- `POST /api/alunos` - Criar aluno
- `PUT /api/alunos/:id` - Atualizar aluno

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.
├── data/
│   └── simulacoes.js
├── utils/
│   └── default.js
├── assets/
│   └── avatar1.png (e outros avatares/logos)
└── pages/
    ├── menu.html
    ├── alunos.html
    ├── chamada.html
    ├── dashboard.html
    ├── doacoes.html
    ├── documentos.html
    ├── guia.html
    ├── calendario.html
    ├── primeiroacesso.html
    ├── sala-presenca.html
```

## 💻 Como testar localmente

1. Baixe o projeto
2. Extraia o conteúdo
3. Abra o arquivo `index.html` com um navegador moderno (Chrome, Edge, Firefox)
4. Navegue livremente entre as páginas
5. Os dados são salvos no **localStorage** e mantidos entre sessões

## 📦 Simulações

Todos os dados (alunos, doações, documentos, presença etc.) são armazenados localmente usando o navegador.
Eles podem ser acessados via `localStorage` na aba DevTools.

## 🛠️ Requisitos

- Navegador moderno com suporte a ES6+
- Nenhum servidor ou backend necessário

## 🚫 Ainda não implementado

- Sistema de login e permissões
- Logs e auditoria
- Integração com banco de dados real (ex: Firebase)
- Assistente virtual e configurações flutuantes

---

Este projeto é mantido e desenvolvido para fins institucionais e educacionais.
