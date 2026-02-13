const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Evento = sequelize.define('Evento', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    titulo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    inicio: {
      type: DataTypes.DATE,
      allowNull: false
    },
    fim: {
      type: DataTypes.DATE,
      allowNull: false
    },
    dia_inteiro: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    categoria: {
      type: DataTypes.ENUM('meeting', 'event', 'task', 'reminder'),
      defaultValue: 'event'
    },
    visibilidade: {
      type: DataTypes.ENUM('public', 'private'),
      defaultValue: 'public'
    },
    criado_por: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'eventos',
    timestamps: true,
    paranoid: true, // Soft delete
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  });

  return Evento;
};
