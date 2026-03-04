# Guia de Deploy - Plataforma ONG

Arquitetura de produção:

```
Usuário
  ↓
Frontend (Vercel)
  ↓ requisições HTTP
Backend Node.js (Render)
  ↓ consultas SQL
Banco MySQL (PlanetScale)
```

---

## 1. Banco de Dados — PlanetScale

1. Acesse [planetscale.com](https://planetscale.com) e crie uma conta.
2. Crie um novo banco de dados MySQL.
3. No painel do PlanetScale, abra o **Console SQL** e execute o script:
   - Arquivo: `backend/database/setup.sql`
4. Vá em **Settings > Passwords** e crie uma nova senha.
5. Copie a **connection string** (formato `mysql://...`).

### Variáveis obtidas:

| Variável | Exemplo |
|---|---|
| `DATABASE_URL` | `mysql://usuario:senha@host:3306/banco?ssl={"rejectUnauthorized":false}` |

Ou, alternativamente, variáveis individuais:

| Variável | Exemplo |
|---|---|
| `DB_HOST` | `aws.connect.psdb.cloud` |
| `DB_PORT` | `3306` |
| `DB_NAME` | `plataforma_ong` |
| `DB_USER` | `seu_usuario` |
| `DB_PASSWORD` | `sua_senha` |

---

## 2. Backend — Render

1. Suba o código para um repositório GitHub (se ainda não estiver).
2. Acesse [render.com](https://render.com) e crie uma conta.
3. Crie um novo **Web Service** e conecte ao repositório GitHub.
4. Configure:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Adicione as **variáveis de ambiente** no painel do Render:

| Variável | Valor |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `3003` (ou deixe o Render atribuir) |
| `DATABASE_URL` | *(string do PlanetScale)* |
| `FRONTEND_URL` | *(URL do Vercel — preencher após deploy do frontend)* |
| `JWT_SECRET` | *(gere uma string aleatória forte)* |
| `JWT_EXPIRES_IN` | `7d` |
| `BCRYPT_ROUNDS` | `12` |
| `RATE_LIMIT_WINDOW_MS` | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | `100` |
| `SMTP_HOST` | *(seu servidor SMTP)* |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | *(seu e-mail)* |
| `SMTP_PASS` | *(sua senha SMTP)* |
| `SMTP_SECURE` | `false` |
| `SMTP_FROM` | `"Plataforma ONG <no-reply@ong.com>"` |

6. Clique em **Deploy**.
7. Após o deploy, o Render gerará uma URL pública (ex: `https://plataforma-ong-backend.onrender.com`).
8. Teste acessando: `https://SUA-URL.onrender.com/api/health`

---

## 3. Frontend — Vercel

### 3.1 Configurar a URL do backend

Antes do deploy, edite o arquivo `js/config.js` e substitua o placeholder pela URL real do Render:

```javascript
var PRODUCTION_API_URL = 'https://plataforma-ong-backend.onrender.com/api';
```

> Substitua `plataforma-ong-backend` pelo nome real do seu serviço no Render.

### 3.2 Deploy no Vercel

1. Acesse [vercel.com](https://vercel.com) e crie uma conta.
2. Crie um novo projeto e conecte ao repositório GitHub.
3. Configure:
   - **Framework Preset**: `Other`
   - **Root Directory**: `.` (raiz do projeto)
   - **Build Command**: *(deixe vazio — site estático)*
   - **Output Directory**: `.`
4. Clique em **Deploy**.
5. Após o deploy, o Vercel fornecerá uma URL pública (ex: `https://plataforma-ong.vercel.app`).

### 3.3 Atualizar CORS no Render

Volte ao painel do Render e atualize a variável:

```
FRONTEND_URL=https://plataforma-ong.vercel.app
```

> Se tiver múltiplas URLs (ex: com domínio customizado), separe por vírgula:
> `https://plataforma-ong.vercel.app,https://meudominio.com`

---

## 4. Verificação Final

- [ ] Frontend carrega corretamente no Vercel
- [ ] Backend responde em `https://SUA-URL.onrender.com/api/health`
- [ ] Backend conecta ao banco PlanetScale (health check retorna `status: OK`)
- [ ] Frontend consegue fazer login (autenticação funciona)
- [ ] Dados de alunos, professores, salas, etc. são carregados corretamente

---

## Observações Importantes

- **Primeiro deploy no Render** pode demorar alguns minutos. O plano gratuito "adormece" após 15 min sem requisições — a primeira requisição após inatividade demora ~30s.
- **PlanetScale** tem plano gratuito com limites de armazenamento e leituras.
- **Nunca** versione o arquivo `.env` — ele contém credenciais sensíveis.
- O arquivo `backend/.env.example` serve como referência para as variáveis necessárias.
- Em produção, use um `JWT_SECRET` forte (pelo menos 32 caracteres aleatórios).
