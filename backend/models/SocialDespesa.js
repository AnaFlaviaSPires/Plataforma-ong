const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SocialDespesa = sequelize.define('SocialDespesa', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    prontuario_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'social_prontuarios', key: 'id' } },
    tipo: { type: DataTypes.STRING(100), allowNull: false },
    valor: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 }
  }, {
    tableName: 'social_despesas',
    timestamps: true,
    createdAt: 'criado_em',
    updatedAt: 'atualizado_em'
  });

  return SocialDespesa;
};
