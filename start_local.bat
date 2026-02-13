@echo off
REM Script para iniciar o sistema completo localmente (Windows)

echo 🚀 Iniciando Plataforma ONG - Ambiente Local
echo ============================================

REM Verificar MySQL
echo 📊 Verificando MySQL...
mysql -u ong_user -p123456 -e "USE plataforma_ong;" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ MySQL não configurado. Execute o setup primeiro.
    pause
    exit /b 1
)
echo ✅ MySQL OK

REM Iniciar Backend
echo 🔧 Iniciando Backend...
cd backend
start "Backend" cmd /c "npm run dev"
echo ✅ Backend rodando em http://localhost:3003

REM Aguardar backend iniciar
timeout /t 3 /nobreak >nul

REM Iniciar Frontend
echo 🌐 Iniciando Frontend...
cd ..
start "Frontend" cmd /c "python -m http.server 8080"
echo ✅ Frontend rodando em http://localhost:8080

echo.
echo 🎉 Sistema iniciado!
echo ===================
echo Frontend: http://localhost:8080
echo Backend API: http://localhost:3003/api
echo Health Check: http://localhost:3003/api/health
echo.
echo 👤 Login:
echo Email: admin@ongnovoamanha.org
echo Senha: admin123
echo.
echo Pressione qualquer tecla para parar...
pause >nul

REM Parar serviços
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im python.exe >nul 2>&1
