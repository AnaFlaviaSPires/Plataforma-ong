const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SocialAnexo = sequelize.define('SocialAnexo', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    prontuario_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'social_prontuarios', key: 'id' } },
    nome_arquivo: { type: DataTypes.STRING(255), allowNull: false },
    arquivo_url: { type: DataTypes.TEXT, allowNull: false },
    tipo: { type: DataTypes.STRING(50), allowNull: true },
    tamanho: { type: DataTypes.INTEGER, allowNull: true }
  }, {
    tableName: 'social_anexos',
    timestamps: true,
    createdAt: 'data',
    updatedAt: false
  });

  return SocialAnexo;
};
