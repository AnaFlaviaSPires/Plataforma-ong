@echo off
chcp 65001 >nul
title Plataforma ONG - Instalação

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║         PLATAFORMA ONG - INSTALAÇÃO DO SERVIDOR              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo Este script irá configurar o servidor da Plataforma ONG.
echo.
echo PRÉ-REQUISITOS (instale antes de continuar):
echo   1. Node.js 18+ (https://nodejs.org)
echo   2. MySQL 8+ (https://dev.mysql.com/downloads/installer/)
echo   3. Python 3+ (https://python.org) - para servidor web
echo.
echo Pressione qualquer tecla para continuar ou CTRL+C para cancelar...
pause >nul

echo.
echo ══════════════════════════════════════════════════════════════
echo [1/5] Verificando Node.js...
echo ══════════════════════════════════════════════════════════════
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado!
    echo    Baixe em: https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do echo    ✓ Node.js %%i instalado

echo.
echo ══════════════════════════════════════════════════════════════
echo [2/5] Verificando MySQL...
echo ══════════════════════════════════════════════════════════════
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ MySQL não encontrado no PATH!
    echo    Verifique se o MySQL está instalado e no PATH do sistema.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('mysql --version') do echo    ✓ %%i

echo.
echo ══════════════════════════════════════════════════════════════
echo [3/5] Configurando banco de dados MySQL...
echo ══════════════════════════════════════════════════════════════
echo.
echo Digite a senha do usuário ROOT do MySQL:
set /p MYSQL_ROOT_PASS=Senha root: 

echo.
echo Criando banco de dados e usuário...

mysql -u root -p%MYSQL_ROOT_PASS% -e "CREATE DATABASE IF NOT EXISTS plataforma_ong CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>nul
if %errorlevel% neq 0 (
    echo ❌ Erro ao criar banco de dados. Verifique a senha root.
    pause
    exit /b 1
)

mysql -u root -p%MYSQL_ROOT_PASS% -e "CREATE USER IF NOT EXISTS 'ong_user'@'localhost' IDENTIFIED BY '123456';" 2>nul
mysql -u root -p%MYSQL_ROOT_PASS% -e "GRANT ALL PRIVILEGES ON plataforma_ong.* TO 'ong_user'@'localhost';" 2>nul
mysql -u root -p%MYSQL_ROOT_PASS% -e "FLUSH PRIVILEGES;" 2>nul

echo    ✓ Banco de dados 'plataforma_ong' criado
echo    ✓ Usuário 'ong_user' criado

echo.
echo Importando estrutura do banco...
cd backend
mysql -u ong_user -p123456 plataforma_ong < complete_database.sql 2>nul
if %errorlevel% neq 0 (
    mysql -u ong_user -p123456 plataforma_ong < database\setup.sql 2>nul
)
cd ..
echo    ✓ Estrutura do banco importada

echo.
echo ══════════════════════════════════════════════════════════════
echo [4/5] Instalando dependências do Backend...
echo ══════════════════════════════════════════════════════════════
cd backend
call npm install
cd ..
echo    ✓ Dependências instaladas

echo.
echo ══════════════════════════════════════════════════════════════
echo [5/5] Verificando Python (servidor web)...
echo ══════════════════════════════════════════════════════════════
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠ Python não encontrado. O servidor web pode não funcionar.
    echo   Baixe em: https://python.org
) else (
    for /f "tokens=*" %%i in ('python --version') do echo    ✓ %%i instalado
)

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║              INSTALAÇÃO CONCLUÍDA COM SUCESSO!               ║
echo ╠══════════════════════════════════════════════════════════════╣
echo ║                                                              ║
echo ║  Para iniciar o servidor, execute:                           ║
echo ║  → INICIAR_SERVIDOR.bat                                      ║
echo ║                                                              ║
echo ║  LOGIN ADMINISTRADOR:                                        ║
echo ║  Email: admin@ongnovoamanha.org                              ║
echo ║  Senha: admin123                                             ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
pause
