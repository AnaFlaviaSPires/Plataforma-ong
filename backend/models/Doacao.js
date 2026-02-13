const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Doacao = sequelize.define('Doacao', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    // Dados do doador
    nome_doador: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 150]
      }
    },
    email_doador: {
      type: DataTypes.STRING(150),
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    telefone_doador: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    documento_doador: {
      type: DataTypes.STRING(30),
      allowNull: true
    },

    // Informações da doação
    tipo: {
      type: DataTypes.ENUM('alimentos', 'materiais_higiene', 'materiais_escolares', 'dinheiro', 'outros'),
      allowNull: false
    },
    valor: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    descricao_itens: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    // Status e datas
    status: {
      type: DataTypes.ENUM('pendente', 'recebida', 'cancelada'),
      allowNull: false,
      defaultValue: 'pendente'
    },
    data_doacao: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    data_recebimento: {
      type: DataTypes.DATE,
      allowNull: true
    },
    data_cancelamento: {
      type: DataTypes.DATE,
      allowNull: true
    },

    // Auditoria
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    }
  }, {
    tableName: 'doacoes',
    paranoid: true // Habilita soft delete (deletedAt)
  });

  return Doacao;
};
