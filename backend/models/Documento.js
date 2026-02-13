const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Documento = sequelize.define('Documento', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    titulo: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    categoria: {
      type: DataTypes.ENUM('atas', 'financeiro', 'pedagogico', 'legal', 'outros'),
      allowNull: false,
      defaultValue: 'outros'
    },
    url_arquivo: {
      type: DataTypes.TEXT, // TEXT para suportar links longos
      allowNull: false,
      validate: {
        isUrl: true,
        notEmpty: true
      }
    },
    data_referencia: {
      type: DataTypes.DATEONLY, // Apenas a data importa
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    criado_por: {
      type: DataTypes.INTEGER,
      allowNull: true, // Pode ser null se usuário for deletado
      references: {
        model: 'usuarios',
        key: 'id'
      }
    }
  }, {
    tableName: 'documentos',
    underscored: true,
    timestamps: true // created_at, updated_at
  });

  return Documento;
};
