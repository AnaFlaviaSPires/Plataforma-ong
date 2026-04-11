const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SocialResponsavel = sequelize.define('SocialResponsavel', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    prontuario_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'social_prontuarios', key: 'id' } },
    nome: { type: DataTypes.STRING(200), allowNull: false },
    relacao: { type: DataTypes.STRING(50), allowNull: true },
    telefone: { type: DataTypes.STRING(20), allowNull: true }
  }, {
    tableName: 'social_responsaveis',
    timestamps: true,
    createdAt: 'criado_em',
    updatedAt: 'atualizado_em'
  });

  return SocialResponsavel;
};
