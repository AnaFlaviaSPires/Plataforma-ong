# Sistema de Backup Automático - Plataforma ONG Novo Amanhã

## 1. Descrição

Backup automático do banco de dados MySQL (TiDB Cloud) da Plataforma ONG.

O sistema exporta todos os dados do banco via `mysqldump` (somente leitura), comprime o arquivo e envia para armazenamento externo no Google Drive.

**O sistema NÃO altera, modifica ou apaga dados do banco em nenhuma hipótese.** Apenas leitura via `mysqldump` é permitida.

---

## 2. Frequência

- **2 vezes ao dia:**
  - 12:00 (meio-dia)
  - 18:00

- **Cron:** `0 12,18 * * *`

---

## 3. Retenção

- Backups são mantidos por **7 dias** no Google Drive.
- Após 7 dias, os arquivos são **automaticamente deletados** pelo próprio script de backup.

---

## 4. Local dos Backups

- **Serviço:** Google Drive
- **Pasta:** Definida pela variável de ambiente `GOOGLE_FOLDER_ID`
- **Formato:** `backup-YYYY-MM-DD_HH-mm.sql.gz`

Exemplo de arquivo:
```
backup-2026-03-19_12-00.sql.gz
```

---

## 5. Acesso aos Backups

- Via Google Drive: https://drive.google.com/
- Acessar a pasta compartilhada de backups
- Credenciais de acesso fornecidas ao cliente/equipe responsável
- A pasta deve estar compartilhada com o email da Service Account

---

## 6. Como Restaurar um Backup

### Passo 1 — Baixar o arquivo

Acesse a pasta de backups no Google Drive e baixe o arquivo `.sql.gz` desejado.

### Passo 2 — Descompactar

```bash
gunzip backup-2026-03-19_12-00.sql.gz
```

Isso gera o arquivo `backup-2026-03-19_12-00.sql`.

### Passo 3 — Restaurar no banco

```bash
mysql -h HOST -P PORTA -u USUARIO -p NOME_DO_BANCO < backup-2026-03-19_12-00.sql
```

Substitua:
- `HOST` → Endereço do servidor de banco (ex: gateway01.us-east-1.prod.aws.tidbcloud.com)
- `PORTA` → Porta do banco (padrão TiDB: 4000)
- `USUARIO` → Usuário do banco
- `NOME_DO_BANCO` → Nome do banco de dados

Será solicitada a senha do banco.

---

## 7. Arquitetura

```
┌─────────────────┐     mysqldump      ┌──────────────┐
│  Render          │ ──────────────────▶│  TiDB Cloud   │
│  (Scheduled Job) │    (somente        │  (MySQL)      │
│  backup.js       │     leitura)       └──────────────┘
│                  │
│  Comprime .gz    │
│                  │     upload          ┌──────────────┐
│                  │ ──────────────────▶│ Google Drive  │
└─────────────────┘                     │  /backups/    │
                                        └──────────────┘
```

---

## 8. Variáveis de Ambiente (Render Scheduled Job)

| Variável | Descrição |
|---|---|
| `DB_HOST` | Endereço do servidor MySQL/TiDB |
| `DB_USER` | Usuário do banco |
| `DB_PASS` | Senha do banco |
| `DB_NAME` | Nome do banco de dados |
| `DB_PORT` | Porta (padrão: 4000) |
| `GOOGLE_CLIENT_EMAIL` | Email da Service Account do Google |
| `GOOGLE_PRIVATE_KEY` | Chave privada da Service Account |
| `GOOGLE_FOLDER_ID` | ID da pasta no Google Drive |

---

## 9. Configuração no Render

1. Acesse o dashboard do Render
2. Crie um novo **Cron Job** (Scheduled Job)
3. Conecte ao repositório do projeto
4. Configure:
   - **Nome:** `backup-banco-ong`
   - **Comando:** `node backup.js`
   - **Diretório raiz:** `backend`
   - **Cron:** `0 12,18 * * *`
5. Defina todas as variáveis de ambiente listadas acima

---

## 10. Configuração do Google Drive

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um projeto (ou use um existente)
3. Ative a **Google Drive API** no projeto
4. Crie uma **Service Account**:
   - Vá em "IAM & Admin" > "Service Accounts"
   - Clique em "Create Service Account"
   - Dê um nome (ex: `backup-ong`)
   - Crie uma chave JSON ("Keys" > "Add Key" > "Create new key" > JSON)
5. Da chave JSON baixada, extraia:
   - `client_email` → variável `GOOGLE_CLIENT_EMAIL`
   - `private_key` → variável `GOOGLE_PRIVATE_KEY`
6. No Google Drive:
   - Crie uma pasta para os backups (ex: "Backups ONG")
   - Copie o ID da pasta (parte final da URL: `drive.google.com/drive/folders/ID_AQUI`)
   - **Compartilhe a pasta** com o email da Service Account (`client_email`) com permissão de **Editor**
7. Use o ID da pasta como `GOOGLE_FOLDER_ID`

> **Importante:** A retenção de 7 dias é gerenciada automaticamente pelo próprio script.
> Backups com mais de 7 dias são deletados a cada execução.

---

## 11. Observações

- O sistema é **totalmente automático** após configuração
- **NÃO altera dados** do banco (somente leitura via `mysqldump`)
- **Seguro para produção** — usa `--single-transaction` para leitura consistente
- Arquivo local é removido imediatamente após o upload
- Em caso de falha, o erro é registrado nos logs do Render
- Não depende de intervenção manual
