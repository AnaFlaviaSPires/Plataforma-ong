const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ChamadaRegistro = sequelize.define('ChamadaRegistro', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    chamada_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    aluno_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    presente: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    observacao: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    tableName: 'chamada_registros',
    underscored: true
  });

  return ChamadaRegistro;
};
