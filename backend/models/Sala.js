const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Sala = sequelize.define('Sala', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    professor: {
      type: DataTypes.STRING(100),
      allowNull: true // Agora opcional, pois usaremos o ID preferencialmente
    },
    professor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'professores',
        key: 'id'
      }
    },
    dia_semana: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    horario: {
      type: DataTypes.TIME,
      allowNull: false
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'salas',
    underscored: true,
    paranoid: true // Soft delete
  });

  return Sala;
};
