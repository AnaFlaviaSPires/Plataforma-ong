const { sequelize, Documento } = require('./models');

async function createTable() {
  try {
    console.log('Criando tabela Documentos...');
    await Documento.sync();
    console.log('Tabela Documentos sincronizada com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao criar tabela:', error);
    process.exit(1);
  }
}

createTable();
