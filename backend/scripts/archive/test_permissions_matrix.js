const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-ong-novo-amanha';
const API_URL = 'http://localhost:3003/api';

const TEST_CASES = [
    { email: 'prof_teste@ong.com', role: 'professor', shouldSucceed: false },
    { email: 'social_teste@ong.com', role: 'assistente_social', shouldSucceed: false },
    { email: 'sec_teste@ong.com', role: 'secretaria', shouldSucceed: true }
];

// Pegar IDs reais do banco (hardcoded baseado na saída anterior para ser rápido)
const USERS_DB = {
    'prof_teste@ong.com': 9,
    'sec_teste@ong.com': 10,
    'social_teste@ong.com': 11
};

async function runMatrix() {
    console.log('🛡️ INICIANDO MATRIZ DE TESTE DE PERMISSÕES (CRIAR ALUNO) 🛡️\n');

    for (const test of TEST_CASES) {
        const userId = USERS_DB[test.email];
        
        // Gerar Token
        const token = jwt.sign(
            { id: userId, email: test.email, cargo: test.role }, 
            JWT_SECRET, 
            { expiresIn: '1h' }
        );

        console.log(`Testing: ${test.role.toUpperCase()} (${test.email})...`);

        try {
            const res = await fetch(`${API_URL}/alunos`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nome: `Aluno Teste ${test.role}`,
                    data_nasc: '2010-01-01',
                    sexo: 'M',
                    status: 'matriculado'
                })
            });

            const success = (res.status === 201 || res.status === 200);
            
            if (success === test.shouldSucceed) {
                console.log(`✅ PASSOU! Resultado: ${success ? 'Permitido' : 'Bloqueado'} (Esperado: ${test.shouldSucceed ? 'Permitido' : 'Bloqueado'})`);
            } else {
                console.error(`❌ FALHOU! Resultado: ${success ? 'Permitido' : 'Bloqueado'} (Esperado: ${test.shouldSucceed ? 'Permitido' : 'Bloqueado'})`);
                console.error(`   Status Code: ${res.status}`);
                const txt = await res.text();
                console.error(`   Response: ${txt}`);
            }

        } catch (err) {
            console.error('Erro de conexão:', err.message);
        }
        console.log('---------------------------------------------------');
    }
}

runMatrix();
