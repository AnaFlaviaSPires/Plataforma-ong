const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const EventoParticipante = sequelize.define('EventoParticipante', {
    evento_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'eventos',
        key: 'id'
      }
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    }
  }, {
    tableName: 'evento_participantes',
    timestamps: false
  });

  return EventoParticipante;
};
