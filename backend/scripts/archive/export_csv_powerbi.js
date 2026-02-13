const { Aluno, Doacao } = require('./models');
const fs = require('fs');

async function exportToCSV() {
    console.log('Iniciando exportação...');

    // 1. ALUNOS
    const alunos = await Aluno.findAll();
    let csvAlunos = "ID,Nome,Sexo,DataNascimento,Status,Bairro\n";
    alunos.forEach(a => {
        csvAlunos += `${a.id},"${a.nome}",${a.sexo},${a.data_nasc},${a.status},"${a.bairro || ''}"\n`;
    });
    fs.writeFileSync('../dados_alunos.csv', csvAlunos);
    console.log('✅ dados_alunos.csv gerado!');

    // 2. DOACOES
    const doacoes = await Doacao.findAll();
    let csvDoacoes = "ID,Doador,Tipo,Valor,Data,Status\n";
    doacoes.forEach(d => {
        // Formatar data para YYYY-MM-DD
        const data = d.data_doacao ? new Date(d.data_doacao).toISOString().split('T')[0] : '';
        csvDoacoes += `${d.id},"${d.nome_doador}",${d.tipo},${d.valor || 0},${data},${d.status}\n`;
    });
    fs.writeFileSync('../dados_doacoes.csv', csvDoacoes);
    console.log('✅ dados_doacoes.csv gerado!');

    process.exit(0);
}

exportToCSV();
