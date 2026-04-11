const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SocialFamilia = sequelize.define('SocialFamilia', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    prontuario_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'social_prontuarios', key: 'id' } },
    nome: { type: DataTypes.STRING(200), allowNull: false },
    parentesco: { type: DataTypes.STRING(50), allowNull: true },
    nascimento: { type: DataTypes.DATEONLY, allowNull: true },
    escolaridade: { type: DataTypes.STRING(100), allowNull: true },
    profissao: { type: DataTypes.STRING(100), allowNull: true },
    situacao: { type: DataTypes.STRING(100), allowNull: true },
    renda: { type: DataTypes.DECIMAL(10, 2), allowNull: true, defaultValue: 0 }
  }, {
    tableName: 'social_familia',
    timestamps: true,
    createdAt: 'criado_em',
    updatedAt: 'atualizado_em'
  });

  return SocialFamilia;
};
