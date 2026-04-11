const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Notificacao = sequelize.define('Notificacao', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    usuario_id: { type: DataTypes.INTEGER, allowNull: true },
    tipo: { type: DataTypes.STRING(50), allowNull: false },
    titulo: { type: DataTypes.STRING(200), allowNull: false },
    mensagem: { type: DataTypes.TEXT, allowNull: true },
    link: { type: DataTypes.STRING(500), allowNull: true },
    lida: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    dados: { type: DataTypes.JSON, allowNull: true }
  }, {
    tableName: 'notificacoes',
    timestamps: true,
    createdAt: 'criado_em',
    updatedAt: false
  });

  return Notificacao;
};
