const jwt = require('jsonwebtoken');
const axios = require('axios');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-ong-novo-amanha';
const API_URL = 'http://localhost:3003/api';

async function testSecurity() {
    console.log('🔐 TESTE DE INTRUSÃO SIMULADO: TIAGO (PROFESSOR) 🔐');

    // 1. Gerar Token Falso para o Tiago (ID 7, Cargo Professor)
    // Assumindo que a secret seja a padrão de dev. Se for prod, este teste falhará na validação do token.
    const token = jwt.sign({ id: 7, email: 'tiagowrecados@hotmail.com', cargo: 'professor' }, JWT_SECRET, { expiresIn: '1h' });
    
    console.log('Token gerado para Tiago.');

    // 2. Tentar Criar um Aluno
    try {
        console.log('Tentando criar aluno com credenciais de Professor...');
        const res = await axios.post(`${API_URL}/alunos`, {
            nome: 'Aluno Invasor',
            data_nasc: '2010-01-01',
            sexo: 'M',
            status: 'matriculado'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('❌ FALHA NA SEGURANÇA! O professor conseguiu cadastrar um aluno.');
        console.log('Resposta:', res.data);
    } catch (error) {
        if (error.response) {
            if (error.response.status === 403) {
                console.log('✅ SUCESSO! O sistema bloqueou com erro 403 (Forbidden).');
                console.log('Mensagem:', error.response.data);
            } else {
                console.log(`⚠️ Erro inesperado: ${error.response.status}`);
                console.log(error.response.data);
            }
        } else {
            console.log('Erro de conexão:', error.message);
        }
    }
}

testSecurity();
