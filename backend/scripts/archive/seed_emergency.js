const { sequelize, User, Aluno, Professor, Sala, SalaAluno, Chamada, ChamadaRegistro, Doacao } = require('./models');
const bcrypt = require('bcryptjs');

const NOMES = [
  "Miguel Silva", "Arthur Santos", "Gael Oliveira", "Heitor Souza", "Theo Rodrigues",
  "Davi Ferreira", "Gabriel Alves", "Bernardo Pereira", "Samuel Lima", "João Gomes",
  "Helena Costa", "Alice Martins", "Laura Ribeiro", "Maria Araujo", "Valentina Barbosa",
  "Heloísa Ramos", "Sophia Castro", "Maite Monteiro", "Lorena Andrade", "Cecília Vieira",
  "Pedro Henrique", "Lucas Rocha", "Matheus Mendes", "Enzo Nogueira", "Rafael Freitas",
  "Isabella Carvalho", "Manuela Moreira", "Beatriz Cardoso", "Luiza Teixeira", "Livia Nascimento"
];

const OFICINAS = [
  { nome: "Futebol Sub-15", dia: "Segunda-feira", hora: "14:00" },
  { nome: "Dança Contemporânea", dia: "Terça-feira", hora: "09:00" },
  { nome: "Informática Básica", dia: "Quarta-feira", hora: "10:30" },
  { nome: "Música e Violão", dia: "Quinta-feira", hora: "15:00" },
  { nome: "Teatro e Expressão", dia: "Sexta-feira", hora: "16:00" }
];

const DOADORES = ["Supermercado ABC", "Padaria da Esquina", "Sr. José Carlos", "Dona Maria", "Empresa Tech Solutions"];
const TIPOS_DOACAO = ["alimentos", "dinheiro", "roupas", "higiene", "outros"];

async function seed() {
  try {
    console.log('🚨 INICIANDO RESGATE DE DADOS (SEED DE EMERGÊNCIA) 🚨');
    
    // Sincronizar forçado para limpar tudo e começar do zero limpo (já que está quebrado mesmo)
    await sequelize.sync({ force: true }); 
    console.log('✅ Banco limpo e estruturas recriadas.');

    // 1. Criar Usuários (Admin + Professores)
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const admin = await User.create({
      nome: 'Administrador',
      email: 'admin@ong.com',
      senha: hashedPassword,
      cargo: 'admin',
      ativo: true
    });

    const profUsers = [];
    const nomesProfs = ['Ana Clara', 'Carlos Eduardo', 'Beatriz Lima', 'João Pedro'];
    
    for (const nome of nomesProfs) {
      const u = await User.create({
        nome,
        email: `${nome.split(' ')[0].toLowerCase()}@ong.com`,
        senha: hashedPassword,
        cargo: 'professor',
        ativo: true
      });
      
      // Criar Ficha do Professor
      const p = await Professor.create({
        nome: nome,
        email: u.email,
        usuario_id: u.id,
        data_nasc: '1990-01-01',
        sexo: 'Outro',
        formacao: 'Pedagogia',
        status: 'ativo',
        ativo: true
      });
      
      profUsers.push(p); // Guarda o objeto Professor
    }
    console.log('✅ 5 Usuários e 4 Professores criados.');

    // 2. Criar 30 Alunos
    const alunosCriados = [];
    for (let i = 0; i < 30; i++) {
      const aluno = await Aluno.create({
        nome: NOMES[i],
        data_nasc: `20${Math.floor(Math.random() * (16 - 10) + 10)}-0${Math.floor(Math.random() * 9) + 1}-15`, // Entre 2010 e 2016
        sexo: i % 2 === 0 ? 'M' : 'F',
        status: 'matriculado',
        bairro: i % 3 === 0 ? 'Centro' : (i % 2 === 0 ? 'Vila Nova' : 'Jardim Flores'),
        endereco: `Rua Exemplo, ${i * 10}`,
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01000-000',
        nome_responsavel: 'Responsável Legal',
        telefone_responsavel: '(11) 99999-9999',
        ativo: true
      });
      alunosCriados.push(aluno);
    }
    console.log('✅ 30 Alunos criados.');

    // 3. Criar Salas e Matricular Alunos
    const salasCriadas = [];
    for (let i = 0; i < OFICINAS.length; i++) {
      const oficina = OFICINAS[i];
      // Atribui professor rotativo (0, 1, 2, 3, 0...)
      const profResponsavel = profUsers[i % profUsers.length];
      
      const sala = await Sala.create({
        nome: oficina.nome,
        professor: profResponsavel.nome, // Legado
        professor_id: profResponsavel.id,
        dia_semana: oficina.dia,
        horario: oficina.hora,
        ativo: true,
        usuario_id: admin.id
      });
      salasCriadas.push(sala);

      // Matricular 15 alunos aleatórios nesta sala
      // Embaralhar alunos
      const alunosShuffled = [...alunosCriados].sort(() => 0.5 - Math.random());
      const turma = alunosShuffled.slice(0, 15);
      
      for (const al of turma) {
        await SalaAluno.create({
          sala_id: sala.id,
          aluno_id: al.id
        });
      }
    }
    console.log('✅ 5 Oficinas criadas e alunos matriculados.');

    // 4. Gerar Histórico de Chamadas
    for (const sala of salasCriadas) {
        // Buscar alunos da sala
        const matriculas = await SalaAluno.findAll({ where: { sala_id: sala.id } });
        const alunosIds = matriculas.map(m => m.aluno_id);

        // Criar 4 chamadas em datas passadas
        for (let semana = 1; semana <= 4; semana++) {
            const data = new Date();
            data.setDate(data.getDate() - (semana * 7)); // Voltar semanas
            
            const chamada = await Chamada.create({
                sala_id: sala.id,
                data: data,
                hora: sala.horario,
                criado_por: admin.id
            });

            // Criar registros (90% de presença aleatória)
            for (const alunoId of alunosIds) {
                await ChamadaRegistro.create({
                    chamada_id: chamada.id,
                    aluno_id: alunoId,
                    presente: Math.random() > 0.1, // 90% chance de true
                    observacao: ''
                });
            }
        }
    }
    console.log('✅ Histórico de Chamadas gerado.');

    // 5. Doações
    for (let i = 0; i < 10; i++) {
        await Doacao.create({
            tipo: TIPOS_DOACAO[i % TIPOS_DOACAO.length],
            valor: (Math.random() * 500).toFixed(2),
            data_doacao: new Date(),
            nome_doador: DOADORES[i % DOADORES.length],
            status: 'recebido',
            usuario_id: admin.id
        });
    }
    console.log('✅ 10 Doações registradas.');

    console.log('\n🎉 SUCESSO! SEU SISTEMA ESTÁ PRONTO PARA A APRESENTAÇÃO. 🎉');
    console.log('Login Admin: admin@ong.com / 123456');
    process.exit(0);

  } catch (error) {
    console.error('❌ FALHA NO RESGATE:', error);
    process.exit(1);
  }
}

seed();
