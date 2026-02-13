# 📊 Documentação Técnica - Banco de Dados

## Status: ✅ SISTEMA 100% FUNCIONAL

**Data:** 25/01/2026  
**Versão:** 2.0 (Realinhado)

---

## 🗄️ Diagrama ER (Entidade-Relacionamento)

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    USUARIOS     │       │     ALUNOS      │       │    DOACOES      │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ nome            │       │ nome            │       │ nome_doador     │
│ email (UK)      │       │ data_nasc       │       │ tipo            │
│ senha           │       │ sexo            │       │ valor           │
│ cargo           │       │ status          │       │ descricao_itens │
│ ativo           │       │ nome_responsavel│       │ status          │
│ ultimo_login    │◄──────│ usuario_id (FK) │       │ data_doacao     │
└─────────────────┘       └─────────────────┘       │ usuario_id (FK) │
        │                         │                 └─────────────────┘
        │                         │                         │
        ▼                         ▼                         │
┌─────────────────┐       ┌─────────────────┐               │
│  PROFESSORES    │       │  SALA_ALUNOS    │               │
├─────────────────┤       ├─────────────────┤               │
│ id (PK)         │       │ id (PK)         │               │
│ nome            │       │ sala_id (FK)    │               │
│ formacao        │       │ aluno_id (FK)   │               │
│ status          │       │ ativo           │               │
│ usuario_id (FK) │       └─────────────────┘               │
└─────────────────┘               │                         │
        │                         │                         │
        ▼                         ▼                         │
┌─────────────────┐       ┌─────────────────┐               │
│     SALAS       │       │    CHAMADAS     │               │
├─────────────────┤       ├─────────────────┤               │
│ id (PK)         │       │ id (PK)         │               │
│ nome            │◄──────│ sala_id (FK)    │               │
│ professor_id(FK)│       │ data            │               │
│ dia_semana      │       │ criado_por (FK) │               │
│ horario         │       └─────────────────┘               │
│ ativo           │               │                         │
└─────────────────┘               ▼                         │
                          ┌─────────────────┐               │
                          │CHAMADA_REGISTROS│               │
                          ├─────────────────┤               │
                          │ id (PK)         │               │
                          │ chamada_id (FK) │               │
                          │ aluno_id (FK)   │               │
                          │ presente        │               │
                          └─────────────────┘               │
                                                            │
┌─────────────────┐       ┌─────────────────┐               │
│    EVENTOS      │       │   DOCUMENTOS    │◄──────────────┘
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ titulo          │       │ titulo          │
│ data_evento     │       │ tipo_documento  │
│ criado_por (FK) │       │ arquivo_url     │
└─────────────────┘       │ criado_por (FK) │
                          └─────────────────┘
```

---

## 📋 Schema das Tabelas Principais

### 1. USUARIOS
| Campo | Tipo | Null | Key | Default | Descrição |
|-------|------|------|-----|---------|-----------|
| id | INT | NO | PK | AUTO_INCREMENT | ID único |
| nome | VARCHAR(100) | NO | | | Nome completo |
| email | VARCHAR(150) | NO | UK | | Email único |
| senha | VARCHAR(255) | NO | | | Hash bcrypt |
| cargo | ENUM | NO | | 'secretaria' | admin/professor/secretaria/assistente_social |
| ativo | BOOLEAN | YES | | TRUE | Status ativo |
| ultimo_login | DATETIME | YES | | NULL | Último acesso |

### 2. ALUNOS
| Campo | Tipo | Null | Key | Default | Descrição |
|-------|------|------|-----|---------|-----------|
| id | INT | NO | PK | AUTO_INCREMENT | ID único |
| nome | VARCHAR(100) | NO | | | Nome completo |
| data_nasc | DATE | NO | | | Data nascimento |
| sexo | ENUM('M','F','Outro') | NO | | | Gênero |
| status | ENUM | NO | | 'matriculado' | Status matrícula |
| nome_responsavel | VARCHAR(100) | YES | | NULL | Responsável |
| telefone_responsavel | VARCHAR(20) | YES | | NULL | Telefone |
| endereco | VARCHAR(200) | YES | | NULL | Endereço |
| bairro | VARCHAR(100) | YES | | NULL | Bairro |
| cidade | VARCHAR(100) | YES | | NULL | Cidade |
| estado | VARCHAR(2) | YES | | NULL | UF |
| cep | VARCHAR(10) | YES | | NULL | CEP |
| numero_matricula | VARCHAR(20) | YES | UK | AUTO | Matrícula |
| usuario_id | INT | YES | FK | NULL | Quem cadastrou |

### 3. DOACOES
| Campo | Tipo | Null | Key | Default | Descrição |
|-------|------|------|-----|---------|-----------|
| id | INT | NO | PK | AUTO_INCREMENT | ID único |
| nome_doador | VARCHAR(150) | NO | | 'Anônimo' | Nome doador |
| tipo | ENUM | NO | | 'outros' | Tipo doação |
| valor | DECIMAL(10,2) | YES | | 0 | Valor monetário |
| descricao_itens | TEXT | YES | | NULL | Descrição itens |
| status | ENUM | NO | | 'pendente' | Status |
| data_doacao | DATETIME | NO | | NOW | Data registro |
| usuario_id | INT | YES | FK | NULL | Quem registrou |

### 4. SALAS
| Campo | Tipo | Null | Key | Default | Descrição |
|-------|------|------|-----|---------|-----------|
| id | INT | NO | PK | AUTO_INCREMENT | ID único |
| nome | VARCHAR(100) | NO | | | Nome sala |
| professor_id | INT | NO | FK | | Professor responsável |
| dia_semana | VARCHAR(20) | NO | | | Dia da semana |
| horario | TIME | NO | | | Horário |
| ativo | BOOLEAN | NO | | TRUE | Status |

---

## 🔗 Relacionamentos

| Tabela Origem | Tabela Destino | Tipo | FK |
|---------------|----------------|------|-----|
| alunos | usuarios | N:1 | usuario_id |
| doacoes | usuarios | N:1 | usuario_id |
| salas | professores | N:1 | professor_id |
| sala_alunos | salas | N:1 | sala_id |
| sala_alunos | alunos | N:1 | aluno_id |
| chamadas | salas | N:1 | sala_id |
| chamada_registros | chamadas | N:1 | chamada_id |
| chamada_registros | alunos | N:1 | aluno_id |

---

## 🚀 Endpoints da API

### Autenticação
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | /api/auth/login | Login |
| POST | /api/auth/register | Cadastro |
| GET | /api/auth/verify | Verificar token |

### Alunos
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | /api/alunos | Listar todos |
| GET | /api/alunos/:id | Buscar por ID |
| POST | /api/alunos | Criar |
| PUT | /api/alunos/:id | Atualizar |
| DELETE | /api/alunos/:id | Excluir |

### Doações
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | /api/doacoes | Listar todas |
| POST | /api/doacoes | Criar |
| PATCH | /api/doacoes/:id/confirmar | Confirmar |
| PATCH | /api/doacoes/:id/cancelar | Cancelar |

### Salas
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | /api/salas | Listar todas |
| POST | /api/salas | Criar |
| PUT | /api/salas/:id | Atualizar |
| DELETE | /api/salas/:id | Excluir |

---

## ✅ Checklist de Validação

- [x] Banco alinhado com frontend
- [x] Todos os campos persistem corretamente
- [x] Relacionamentos funcionando
- [x] CRUD completo para todas entidades
- [x] Soft delete implementado
- [x] Auditoria (action_logs) funcionando
- [x] Autenticação JWT operacional
- [x] Dados reais no banco (não mock)

---

## 📁 Arquivos de Migração

- `backend/migrations/001_realign_database.sql` - Migração principal
- `backend/complete_database.sql` - Schema completo
- `backend/database/setup.sql` - Setup inicial

---

## 🔧 Comandos Úteis

```bash
# Iniciar backend
cd backend && npm run dev

# Iniciar frontend
python -m http.server 8080

# Verificar banco
mysql -u ong_user -p123456 plataforma_ong -e "SHOW TABLES;"

# Backup
mysqldump -u root -p plataforma_ong > backup.sql
```

---

## 👤 Credenciais Padrão

- **Email:** admin@ongnovoamanha.org
- **Senha:** admin123
- **Cargo:** admin

---

**Sistema 100% funcional e pronto para produção!**
