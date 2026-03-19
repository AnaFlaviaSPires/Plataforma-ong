/**
 * Sistema de Backup Automático - Banco MySQL (TiDB Cloud)
 * 
 * Execução: Render Scheduled Job (cron: 0 12,18 * * *)
 * Armazenamento: Amazon S3
 * 
 * SOMENTE LEITURA - Não executa nenhum comando de escrita no banco.
 * Usa apenas mysqldump para exportação segura.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// ============================================================
// Variáveis de ambiente (obrigatórias)
// ============================================================
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_NAME = process.env.DB_NAME;
const DB_PORT = process.env.DB_PORT || '4000';

const AWS_REGION = process.env.AWS_REGION;
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

// ============================================================
// Validação de variáveis
// ============================================================
function validarVariaveis() {
  const required = {
    DB_HOST, DB_USER, DB_PASS, DB_NAME,
    AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET_NAME
  };

  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Variáveis de ambiente faltando: ${missing.join(', ')}`);
  }
}

// ============================================================
// Gerar nome do arquivo com timestamp
// ============================================================
function gerarNomeArquivo() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const timestamp = [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate())
  ].join('-') + '_' + [
    pad(now.getHours()),
    pad(now.getMinutes())
  ].join('-');

  return `backup-${timestamp}.sql.gz`;
}

// ============================================================
// Executar mysqldump (SOMENTE LEITURA)
// ============================================================
function executarDump(outputPath) {
  console.log('[BACKUP] Iniciando mysqldump (somente leitura)...');

  // Flags de segurança:
  // --single-transaction: Não bloqueia tabelas (leitura consistente)
  // --no-tablespaces: Não requer privilégio PROCESS
  // --skip-lock-tables: Não trava tabelas
  // --set-gtid-purged=OFF: Compatibilidade com TiDB
  // --ssl-mode=REQUIRED: Conexão segura obrigatória (TiDB Cloud)
  // --column-statistics=0: Evita erro em versões novas do mysqldump
  const dumpCmd = [
    'mysqldump',
    `--host=${DB_HOST}`,
    `--port=${DB_PORT}`,
    `--user=${DB_USER}`,
    `--password=${DB_PASS}`,
    '--single-transaction',
    '--no-tablespaces',
    '--skip-lock-tables',
    '--set-gtid-purged=OFF',
    '--ssl-mode=REQUIRED',
    '--column-statistics=0',
    DB_NAME
  ].join(' ');

  // Arquivo SQL temporário (sem compressão ainda)
  const sqlPath = outputPath.replace('.gz', '');

  try {
    execSync(`${dumpCmd} > "${sqlPath}"`, {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 120000 // 2 minutos de timeout
    });
  } catch (error) {
    // Capturar stderr para diagnóstico
    const stderr = error.stderr ? error.stderr.toString() : '';
    throw new Error(`mysqldump falhou: ${stderr || error.message}`);
  }

  // Verificar se o arquivo foi criado e tem conteúdo
  const stats = fs.statSync(sqlPath);
  if (stats.size === 0) {
    fs.unlinkSync(sqlPath);
    throw new Error('mysqldump gerou arquivo vazio');
  }

  console.log(`[BACKUP] Dump concluído: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

  // Comprimir com gzip
  console.log('[BACKUP] Comprimindo arquivo...');
  const sqlData = fs.readFileSync(sqlPath);
  const compressed = zlib.gzipSync(sqlData, { level: 9 });
  fs.writeFileSync(outputPath, compressed);
  fs.unlinkSync(sqlPath); // Remover SQL não comprimido

  const compressedStats = fs.statSync(outputPath);
  console.log(`[BACKUP] Comprimido: ${(compressedStats.size / 1024 / 1024).toFixed(2)} MB`);

  return outputPath;
}

// ============================================================
// Upload para Amazon S3
// ============================================================
async function uploadParaS3(filePath, fileName) {
  console.log(`[BACKUP] Enviando para S3: s3://${S3_BUCKET_NAME}/backups/${fileName}`);

  const s3Client = new S3Client({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY
    }
  });

  const fileContent = fs.readFileSync(filePath);

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: `backups/${fileName}`,
    Body: fileContent,
    ContentType: 'application/gzip',
    ContentEncoding: 'gzip'
  });

  await s3Client.send(command);
  console.log('[BACKUP] Upload para S3 concluído com sucesso.');
}

// ============================================================
// Função principal
// ============================================================
async function executarBackup() {
  const inicio = Date.now();
  console.log('='.repeat(60));
  console.log(`[BACKUP] Início: ${new Date().toISOString()}`);
  console.log(`[BACKUP] Banco: ${DB_NAME}@${DB_HOST}:${DB_PORT}`);
  console.log('='.repeat(60));

  // 1. Validar variáveis de ambiente
  validarVariaveis();

  // 2. Criar diretório temporário
  const tmpDir = '/tmp/backups';
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  const fileName = gerarNomeArquivo();
  const filePath = path.join(tmpDir, fileName);

  try {
    // 3. Executar mysqldump (SOMENTE LEITURA)
    executarDump(filePath);

    // 4. Upload para S3
    await uploadParaS3(filePath, fileName);

    // 5. Remover arquivo local
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('[BACKUP] Arquivo local removido.');
    }

    const duracao = ((Date.now() - inicio) / 1000).toFixed(1);
    console.log('='.repeat(60));
    console.log(`[BACKUP] SUCESSO - Duração: ${duracao}s`);
    console.log(`[BACKUP] Arquivo: backups/${fileName}`);
    console.log('='.repeat(60));

    process.exit(0);

  } catch (error) {
    // Limpar arquivo local em caso de erro
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    const sqlPath = filePath.replace('.gz', '');
    if (fs.existsSync(sqlPath)) {
      fs.unlinkSync(sqlPath);
    }

    console.error('='.repeat(60));
    console.error(`[BACKUP] ERRO: ${error.message}`);
    console.error('='.repeat(60));

    process.exit(1);
  }
}

// Executar
executarBackup();
