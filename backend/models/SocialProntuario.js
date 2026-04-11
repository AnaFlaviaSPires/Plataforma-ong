const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SocialProntuario = sequelize.define('SocialProntuario', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    aluno_id: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'alunos', key: 'id' } },
    // Identificação
    nome_completo: { type: DataTypes.STRING(200), allowNull: false },
    data_nascimento: { type: DataTypes.DATEONLY, allowNull: true },
    rg: { type: DataTypes.STRING(20), allowNull: true },
    cpf: { type: DataTypes.STRING(14), allowNull: true },
    escola: { type: DataTypes.STRING(200), allowNull: true },
    periodo_escolar: { type: DataTypes.STRING(50), allowNull: true },
    oficina: { type: DataTypes.STRING(100), allowNull: true },
    periodo_oficina: { type: DataTypes.STRING(50), allowNull: true },
    nome_mae: { type: DataTypes.STRING(200), allowNull: true },
    nome_pai: { type: DataTypes.STRING(200), allowNull: true },
    endereco: { type: DataTypes.TEXT, allowNull: true },
    telefones: { type: DataTypes.STRING(200), allowNull: true },
    nis: { type: DataTypes.STRING(20), allowNull: true },
    pode_sair_sozinho: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false },
    quem_busca: { type: DataTypes.STRING(200), allowNull: true },
    tamanho_camiseta: { type: DataTypes.STRING(10), allowNull: true },
    tamanho_short: { type: DataTypes.STRING(10), allowNull: true },
    tamanho_calcado: { type: DataTypes.STRING(10), allowNull: true },
    observacoes: { type: DataTypes.TEXT, allowNull: true },
    // Saúde (JSON)
    saude: { type: DataTypes.JSON, allowNull: true, defaultValue: {} },
    // Moradia (JSON)
    moradia: { type: DataTypes.JSON, allowNull: true, defaultValue: {} },
    // Avaliação Social (JSON)
    avaliacao: { type: DataTypes.JSON, allowNull: true, defaultValue: {} },
    // Controle
    vulnerabilidade: { type: DataTypes.ENUM('baixa', 'media', 'alta'), allowNull: true, defaultValue: 'baixa' },
    status: { type: DataTypes.ENUM('ativo', 'inativo'), allowNull: false, defaultValue: 'ativo' },
    versao: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    declaracao_aceita: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false },
    declaracao_data: { type: DataTypes.DATE, allowNull: true },
    declaracao_responsavel: { type: DataTypes.STRING(200), allowNull: true },
    criado_por: { type: DataTypes.INTEGER, allowNull: true }
  }, {
    tableName: 'social_prontuarios',
    timestamps: true,
    createdAt: 'criado_em',
    updatedAt: 'atualizado_em'
  });

  return SocialProntuario;
};
