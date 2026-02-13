#!/bin/bash
# Script para iniciar o sistema completo localmente

echo "🚀 Iniciando Plataforma ONG - Ambiente Local"
echo "============================================"

# Verificar MySQL
echo "📊 Verificando MySQL..."
if ! mysql -u ong_user -p123456 -e "USE plataforma_ong;" 2>/dev/null; then
    echo "❌ MySQL não configurado. Execute o setup primeiro."
    exit 1
fi
echo "✅ MySQL OK"

# Iniciar Backend
echo "🔧 Iniciando Backend..."
cd backend
npm run dev &
BACKEND_PID=$!
echo "✅ Backend rodando em http://localhost:3003"

# Aguardar backend iniciar
sleep 3

# Iniciar Frontend
echo "🌐 Iniciando Frontend..."
cd ..
python -m http.server 8080 &
FRONTEND_PID=$!
echo "✅ Frontend rodando em http://localhost:8080"

echo ""
echo "🎉 Sistema iniciado!"
echo "==================="
echo "Frontend: http://localhost:8080"
echo "Backend API: http://localhost:3003/api"
echo "Health Check: http://localhost:3003/api/health"
echo ""
echo "👤 Login:"
echo "Email: admin@ongnovoamanha.org"
echo "Senha: admin123"
echo ""
echo "Pressione Ctrl+C para parar"

# Aguardar interrupção
trap "echo 'Parando serviços...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
