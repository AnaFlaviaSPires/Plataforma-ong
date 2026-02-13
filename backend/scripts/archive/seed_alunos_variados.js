const { Aluno } = require('./models');

async function seedAlunosVariados() {
  try {
    console.log('🌱 Iniciando seed de alunos com status variados...');

    const alunosData = [
      {
        nome: 'Pedro Henrique Costa',
        data_nasc: '2010-03-15',
        cpf: '123.456.789-10',
        sexo: 'M',
        telefone: '(11) 98765-4321',
        email: 'pedro.costa@email.com',
        endereco: 'Rua das Flores',
        numero: '123',
        bairro: 'Jardim Primavera',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01234-567',
        nome_responsavel: 'Maria Costa',
        telefone_responsavel: '(11) 98765-4322',
        parentesco: 'Mãe',
        turma: 'Turma A',
        serie: '8º ano',
        escola: 'E.E. José de Alencar',
        status: 'inativo',
        data_matricula: '2023-02-10'
      },
      {
        nome: 'Juliana Oliveira Santos',
        data_nasc: '2012-07-22',
        cpf: '234.567.890-11',
        sexo: 'F',
        telefone: '(11) 97654-3210',
        email: 'juliana.santos@email.com',
        endereco: 'Avenida Paulista',
        numero: '456',
        bairro: 'Bela Vista',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01310-100',
        nome_responsavel: 'João Santos',
        telefone_responsavel: '(11) 97654-3211',
        parentesco: 'Pai',
        turma: 'Turma B',
        serie: '6º ano',
        escola: 'E.E. Machado de Assis',
        status: 'aguardando_vaga',
        data_matricula: '2024-01-15'
      },
      {
        nome: 'Rafael Almeida Silva',
        data_nasc: '2008-11-30',
        cpf: '345.678.901-12',
        sexo: 'M',
        telefone: '(11) 96543-2109',
        endereco: 'Rua Augusta',
        numero: '789',
        bairro: 'Consolação',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01305-000',
        nome_responsavel: 'Ana Almeida',
        telefone_responsavel: '(11) 96543-2110',
        parentesco: 'Mãe',
        turma: 'Turma C',
        serie: '9º ano',
        escola: 'E.E. Carlos Drummond',
        status: 'cancelado',
        data_matricula: '2022-03-20'
      },
      {
        nome: 'Beatriz Ferreira Lima',
        data_nasc: '2011-05-18',
        cpf: '456.789.012-13',
        sexo: 'F',
        telefone: '(11) 95432-1098',
        email: 'beatriz.lima@email.com',
        endereco: 'Rua da Consolação',
        numero: '321',
        bairro: 'Higienópolis',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01302-000',
        nome_responsavel: 'Carlos Lima',
        telefone_responsavel: '(11) 95432-1099',
        parentesco: 'Pai',
        turma: 'Turma D',
        serie: '7º ano',
        escola: 'E.E. Cecília Meireles',
        status: 'inativo',
        data_matricula: '2023-08-05'
      },
      {
        nome: 'Lucas Rodrigues Souza',
        data_nasc: '2007-09-12',
        cpf: '567.890.123-14',
        sexo: 'M',
        telefone: '(11) 94321-0987',
        endereco: 'Avenida Rebouças',
        numero: '654',
        bairro: 'Pinheiros',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '05401-000',
        nome_responsavel: 'Paula Souza',
        telefone_responsavel: '(11) 94321-0988',
        parentesco: 'Mãe',
        turma: 'Turma E',
        serie: 'Ensino Médio',
        escola: 'E.E. Vinícius de Moraes',
        status: 'formado',
        data_matricula: '2020-02-01'
      },
      {
        nome: 'Gabriela Martins Pereira',
        data_nasc: '2013-01-25',
        cpf: '678.901.234-15',
        sexo: 'F',
        telefone: '(11) 93210-9876',
        email: 'gabriela.pereira@email.com',
        endereco: 'Rua Haddock Lobo',
        numero: '987',
        bairro: 'Cerqueira César',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01414-000',
        nome_responsavel: 'Roberto Pereira',
        telefone_responsavel: '(11) 93210-9877',
        parentesco: 'Pai',
        turma: 'Turma F',
        serie: '5º ano',
        escola: 'E.E. Monteiro Lobato',
        status: 'aguardando_vaga',
        data_matricula: '2024-06-10'
      },
      {
        nome: 'Thiago Barbosa Nunes',
        data_nasc: '2009-04-08',
        cpf: '789.012.345-16',
        sexo: 'M',
        telefone: '(11) 92109-8765',
        endereco: 'Rua Oscar Freire',
        numero: '147',
        bairro: 'Jardins',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01426-000',
        nome_responsavel: 'Fernanda Nunes',
        telefone_responsavel: '(11) 92109-8766',
        parentesco: 'Mãe',
        turma: 'Turma G',
        serie: '8º ano',
        escola: 'E.E. Clarice Lispector',
        status: 'cancelado',
        data_matricula: '2022-09-15'
      },
      {
        nome: 'Amanda Silva Rocha',
        data_nasc: '2012-12-03',
        cpf: '890.123.456-17',
        sexo: 'F',
        telefone: '(11) 91098-7654',
        email: 'amanda.rocha@email.com',
        endereco: 'Avenida Faria Lima',
        numero: '258',
        bairro: 'Itaim Bibi',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '04538-000',
        nome_responsavel: 'Marcos Rocha',
        telefone_responsavel: '(11) 91098-7655',
        parentesco: 'Pai',
        turma: 'Turma H',
        serie: '6º ano',
        escola: 'E.E. Fernando Pessoa',
        status: 'inativo',
        data_matricula: '2023-04-20'
      },
      {
        nome: 'Felipe Carvalho Dias',
        data_nasc: '2010-08-17',
        cpf: '901.234.567-18',
        sexo: 'M',
        telefone: '(11) 90987-6543',
        endereco: 'Rua Bela Cintra',
        numero: '369',
        bairro: 'Consolação',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01415-000',
        nome_responsavel: 'Juliana Dias',
        telefone_responsavel: '(11) 90987-6544',
        parentesco: 'Mãe',
        turma: 'Turma I',
        serie: '7º ano',
        escola: 'E.E. Paulo Freire',
        status: 'aguardando_vaga',
        data_matricula: '2024-03-12'
      },
      {
        nome: 'Larissa Mendes Araújo',
        data_nasc: '2007-06-29',
        cpf: '012.345.678-19',
        sexo: 'F',
        telefone: '(11) 89876-5432',
        email: 'larissa.araujo@email.com',
        endereco: 'Rua dos Pinheiros',
        numero: '741',
        bairro: 'Pinheiros',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '05422-000',
        nome_responsavel: 'Ricardo Araújo',
        telefone_responsavel: '(11) 89876-5433',
        parentesco: 'Pai',
        turma: 'Turma J',
        serie: 'Ensino Médio',
        escola: 'E.E. Guimarães Rosa',
        status: 'formado',
        data_matricula: '2020-01-20'
      }
    ];

    // Inserir alunos no banco
    for (const alunoData of alunosData) {
      const aluno = await Aluno.create(alunoData);
      console.log(`✅ Aluno criado: ${aluno.nome} - Status: ${aluno.status} (Matrícula: ${aluno.numero_matricula})`);
    }

    console.log('\n🎉 Seed concluído com sucesso!');
    console.log(`📊 Total de alunos adicionados: ${alunosData.length}`);
    console.log('\n📋 Resumo por status:');
    console.log(`   - Inativos: ${alunosData.filter(a => a.status === 'inativo').length}`);
    console.log(`   - Aguardando vaga: ${alunosData.filter(a => a.status === 'aguardando_vaga').length}`);
    console.log(`   - Cancelados: ${alunosData.filter(a => a.status === 'cancelado').length}`);
    console.log(`   - Formados: ${alunosData.filter(a => a.status === 'formado').length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
    process.exit(1);
  }
}

seedAlunosVariados();
