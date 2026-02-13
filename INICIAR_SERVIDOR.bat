@echo off
chcp 65001 >nul
title Plataforma ONG - Servidor

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║         PLATAFORMA ONG - INICIANDO SERVIDOR                  ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM Obter IP local da máquina
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    for /f "tokens=1" %%b in ("%%a") do set LOCAL_IP=%%b
)

echo [1/4] Verificando MySQL...
mysql -u ong_user -p123456 -e "USE plataforma_ong;" >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ╔══════════════════════════════════════════════════════════════╗
    echo ║  ERRO: MySQL não está configurado corretamente!              ║
    echo ║                                                              ║
    echo ║  Verifique se:                                               ║
    echo ║  1. MySQL está instalado e rodando                           ║
    echo ║  2. O banco 'plataforma_ong' foi criado                      ║
    echo ║  3. O usuário 'ong_user' existe com senha '123456'           ║
    echo ║                                                              ║
    echo ║  Execute o script de instalação primeiro!                    ║
    echo ╚══════════════════════════════════════════════════════════════╝
    echo.
    pause
    exit /b 1
)
echo    ✓ MySQL OK

echo [2/4] Iniciando Backend (API)...
cd backend
start "ONG-Backend" /min cmd /c "npm start"
cd ..
echo    ✓ Backend iniciando na porta 3003

REM Aguardar backend iniciar
echo [3/4] Aguardando backend...
timeout /t 5 /nobreak >nul
echo    ✓ Backend pronto

echo [4/4] Iniciando Frontend (Servidor Web)...
start "ONG-Frontend" /min cmd /c "python -m http.server 8080"
echo    ✓ Frontend iniciando na porta 8080

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    SERVIDOR INICIADO!                        ║
echo ╠══════════════════════════════════════════════════════════════╣
echo ║                                                              ║
echo ║  ACESSO LOCAL (neste computador):                            ║
echo ║  → http://localhost:8080                                     ║
echo ║                                                              ║
echo ║  ACESSO EM REDE (outros computadores):                       ║
echo ║  → http://%LOCAL_IP%:8080                              ║
echo ║                                                              ║
echo ╠══════════════════════════════════════════════════════════════╣
echo ║  LOGIN ADMINISTRADOR:                                        ║
echo ║  Email: admin@ongnovoamanha.org                              ║
echo ║  Senha: admin123                                             ║
echo ╠══════════════════════════════════════════════════════════════╣
echo ║                                                              ║
echo ║  Mantenha esta janela aberta enquanto usar o sistema!        ║
echo ║  Pressione qualquer tecla para PARAR o servidor.             ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

pause >nul

echo.
echo Parando serviços...
taskkill /f /fi "WINDOWTITLE eq ONG-Backend*" >nul 2>&1
taskkill /f /fi "WINDOWTITLE eq ONG-Frontend*" >nul 2>&1
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im python.exe >nul 2>&1
echo Servidor parado.
