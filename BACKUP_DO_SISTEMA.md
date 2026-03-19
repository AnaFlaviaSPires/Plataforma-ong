# Sistema de Backup Automático - Plataforma ONG Novo Amanhã

## 1. Descrição

Backup automático do banco de dados MySQL (TiDB Cloud) da Plataforma ONG.

O sistema exporta todos os dados do banco via `mysqldump` (somente leitura), comprime o arquivo e envia para armazenamento externo na Amazon S3.

**O sistema NÃO altera, modifica ou apaga dados do banco em nenhuma hipótese.** Apenas leitura via `mysqldump` é permitida.

---

## 2. Frequência

- **2 vezes ao dia:**
  - 12:00 (meio-dia)
  - 18:00

- **Cron:** `0 12,18 * * *`

---

## 3. Retenção

- Backups são mantidos por **7 dias** no S3.
- Após 7 dias, os arquivos são **automaticamente deletados** pela regra de lifecycle do bucket.

---

## 4. Local dos Backups

- **Serviço:** Amazon S3
- **Bucket:** *(definido na variável de ambiente `S3_BUCKET_NAME`)*
- **Caminho:** `/backups/`
- **Formato:** `backup-YYYY-MM-DD_HH-mm.sql.gz`

Exemplo de arquivo:
```
s3://nome-do-bucket/backups/backup-2026-03-19_12-00.sql.gz
```

---

## 5. Acesso aos Backups

- Via painel AWS S3: https://s3.console.aws.amazon.com/
- Credenciais de acesso fornecidas ao cliente/equipe responsável
- Usuário IAM dedicado com permissões mínimas (apenas `s3:PutObject` e `s3:ListBucket`)

---

## 6. Como Restaurar um Backup

### Passo 1 — Baixar o arquivo

Acesse o bucket S3 pelo painel AWS e baixe o arquivo `.sql.gz` desejado.

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
│                  │ ──────────────────▶│  Amazon S3    │
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
| `AWS_ACCESS_KEY_ID` | Chave de acesso AWS |
| `AWS_SECRET_ACCESS_KEY` | Chave secreta AWS |
| `AWS_REGION` | Região AWS (ex: us-east-1) |
| `S3_BUCKET_NAME` | Nome do bucket S3 |

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

## 10. Configuração no S3

1. **Criar bucket** no console AWS S3
2. **Criar pasta** `backups/` dentro do bucket
3. **Ativar regra de lifecycle:**
   - Nome: `auto-delete-7-days`
   - Prefixo: `backups/`
   - Ação: Expirar objetos após **7 dias**

---

## 11. Permissões AWS (IAM)

Criar usuário IAM dedicado com política mínima:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::NOME_DO_BUCKET",
        "arn:aws:s3:::NOME_DO_BUCKET/*"
      ]
    }
  ]
}
```

**NÃO dar permissões de delete ou admin.**

---

## 12. Observações

- O sistema é **totalmente automático** após configuração
- **NÃO altera dados** do banco (somente leitura via `mysqldump`)
- **Seguro para produção** — usa `--single-transaction` para leitura consistente
- Arquivo local é removido imediatamente após o upload
- Em caso de falha, o erro é registrado nos logs do Render
- Não depende de intervenção manual
