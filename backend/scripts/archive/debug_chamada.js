const { Chamada, ChamadaRegistro, Sala, Aluno, sequelize } = require('./models');

async function teste() {
    try {
        const alunos = await Aluno.findAll({ limit: 2 });
        if (alunos.length < 2) { console.log('Precisa de 2 alunos'); process.exit(0); }
        const sala = await Sala.findOne();
        if (!sala) { console.log('Precisa de 1 sala'); process.exit(0); }

        console.log('--- INICIO TESTE ---');
        const chamada = await Chamada.create({
            sala_id: sala.id,
            data: new Date(),
            hora: '12:00',
            criado_por: 1
        });

        const registros = [
            { chamada_id: chamada.id, aluno_id: alunos[0].id, presente: true },
            { chamada_id: chamada.id, aluno_id: alunos[1].id, presente: false }
        ];

        await ChamadaRegistro.bulkCreate(registros);

        const criados = await ChamadaRegistro.findAll({ where: { chamada_id: chamada.id } });
        
        console.log(`Total registros criados: ${criados.length}`);
        criados.forEach(r => {
            console.log(`Aluno ${r.aluno_id}: Presente=${r.presente} (Raw: ${JSON.stringify(r.presente)})`);
        });
        console.log('--- FIM TESTE ---');
        process.exit(0);

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
teste();
