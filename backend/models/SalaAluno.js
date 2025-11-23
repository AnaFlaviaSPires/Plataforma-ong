const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SalaAluno = sequelize.define('SalaAluno', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    sala_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    aluno_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'sala_alunos',
    underscored: true
  });

  return SalaAluno;
};
