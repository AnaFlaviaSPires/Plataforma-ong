const { Doacao } = require('./models');

async function check() {
    try {
        const total = await Doacao.count();
        console.log(`📊 Total de Doações no banco: ${total}`);
        
        const doacoes = await Doacao.findAll({ limit: 5 });
        console.log(JSON.stringify(doacoes, null, 2));
        
    } catch(e) {
        console.error(e);
    }
}
check();
