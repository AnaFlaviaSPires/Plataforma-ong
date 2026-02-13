const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ActionLog = sequelize.define('ActionLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    usuario_nome: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    acao: {
      type: DataTypes.STRING(50), // CREATE, UPDATE, DELETE, LOGIN, APPROVE, RESTORE
      allowNull: false
    },
    tabela_afetada: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    registro_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    dados_antigos: {
      type: DataTypes.JSON,
      allowNull: true
    },
    dados_novos: {
      type: DataTypes.JSON,
      allowNull: true
    },
    ip: DataTypes.STRING(45),
    url_origem: DataTypes.STRING(255),
    user_agent: DataTypes.TEXT
  }, {
    tableName: 'action_logs',
    timestamps: true,
    updatedAt: false,
    createdAt: 'created_at'
  });

  return ActionLog;
};
