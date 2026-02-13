const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-ong-novo-amanha';
const API_URL = 'http://localhost:3003/api';

async function testSecurity() {
    console.log('🔐 TESTE DE INTRUSÃO SIMULADO: TIAGO (PROFESSOR) 🔐');

    // 1. Gerar Token Falso
    const token = jwt.sign({ id: 7, email: 'tiagowrecados@hotmail.com', cargo: 'professor' }, JWT_SECRET, { expiresIn: '1h' });
    
    console.log('Token gerado.');

    // 2. Tentar Criar um Aluno
    try {
        console.log('Tentando criar aluno com credenciais de Professor...');
        const res = await fetch(`${API_URL}/alunos`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nome: 'Aluno Invasor',
                data_nasc: '2010-01-01',
                sexo: 'M',
                status: 'matriculado'
            })
        });

        if (res.status === 403) {
            console.log('✅ SUCESSO! O sistema bloqueou com erro 403 (Forbidden).');
            const json = await res.json();
            console.log('Mensagem:', json);
        } else if (res.status === 201 || res.status === 200) {
            console.log('❌ FALHA NA SEGURANÇA! O professor conseguiu cadastrar um aluno.');
            const json = await res.json();
            console.log('Resposta:', json);
        } else {
            console.log(`⚠️ Erro inesperado: ${res.status}`);
            const txt = await res.text();
            console.log(txt);
        }

    } catch (error) {
        console.log('Erro de conexão:', error.message);
    }
}

testSecurity();
