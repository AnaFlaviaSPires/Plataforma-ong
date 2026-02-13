const { Doacao, sequelize } = require('./models');

async function diversificar() {
    try {
        const doacoes = await Doacao.findAll();
        console.log(`Encontradas ${doacoes.length} doações para processar.`);

        // Usar meses fixos para garantir espalhamento: Setembro, Outubro, Novembro, Dezembro de 2024
        // Ou relativo ao atual. Vamos usar relativo.
        
        for (const d of doacoes) {
            // Escolher aleatoriamente entre 0, 1, 2, 3 meses atrás
            const mesesAtras = Math.floor(Math.random() * 4);
            
            const data = new Date();
            data.setMonth(data.getMonth() - mesesAtras);
            
            // Dia aleatório entre 1 e 28
            const dia = Math.floor(Math.random() * 28) + 1;
            data.setDate(dia);
            
            // Hora aleatória comercial (8h as 17h)
            data.setHours(Math.floor(Math.random() * (17 - 8) + 8), Math.floor(Math.random() * 60), 0);

            d.data_doacao = data;
            
            // Se status for recebida, atualizar data_recebimento
            if (d.status === 'recebida') {
                d.data_recebimento = data;
            }

            await d.save();
            // console.log(`Doação ${d.id} -> ${data.toLocaleDateString()}`);
        }
        
        console.log('Todas as doações foram redistribuídas em datas aleatórias nos últimos 4 meses.');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

diversificar();
