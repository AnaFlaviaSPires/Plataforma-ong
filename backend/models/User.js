const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100]
      }
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    senha: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [6, 255]
      }
    },
    cargo: {
      type: DataTypes.ENUM('admin', 'coordenador', 'professor', 'voluntario'),
      allowNull: false,
      defaultValue: 'voluntario'
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    ultimo_login: {
      type: DataTypes.DATE,
      allowNull: true
    },
    avatar: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    telefone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    data_nascimento: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    reset_token: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    reset_token_expires: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'usuarios',
    hooks: {
      beforeCreate: async (user) => {
        if (user.senha) {
          const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
          user.senha = await bcrypt.hash(user.senha, rounds);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('senha')) {
          const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
          user.senha = await bcrypt.hash(user.senha, rounds);
        }
      }
    }
  });

  // Método para verificar senha
  User.prototype.verificarSenha = async function(senha) {
    return await bcrypt.compare(senha, this.senha);
  };

  // Método para obter dados públicos do usuário
  User.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.senha;
    return values;
  };

  return User;
};
