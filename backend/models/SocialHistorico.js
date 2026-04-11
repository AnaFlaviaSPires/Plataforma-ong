const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SocialHistorico = sequelize.define('SocialHistorico', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    prontuario_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'social_prontuarios', key: 'id' } },
    tipo_evento: { type: DataTypes.STRING(50), allowNull: false },
    descricao: { type: DataTypes.TEXT, allowNull: true },
    usuario_id: { type: DataTypes.INTEGER, allowNull: true },
    usuario_nome: { type: DataTypes.STRING(200), allowNull: true }
  }, {
    tableName: 'social_historico',
    timestamps: true,
    createdAt: 'data',
    updatedAt: false
  });

  return SocialHistorico;
};
