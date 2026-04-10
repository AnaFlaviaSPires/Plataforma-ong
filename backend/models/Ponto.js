const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Ponto = sequelize.define('Ponto', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    funcionario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    },
    tipo: {
      type: DataTypes.ENUM('entrada', 'inicio_intervalo', 'fim_intervalo', 'saida'),
      allowNull: false
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    criado_por: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    alterado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    alterado_por: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    motivo_alteracao: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'pontos',
    timestamps: true,
    createdAt: 'criado_em',
    updatedAt: 'atualizado_em'
  });

  return Ponto;
};
