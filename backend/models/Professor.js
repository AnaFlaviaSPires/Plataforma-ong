const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Professor = sequelize.define('Professor', {
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
    cpf: {
      type: DataTypes.STRING(14),
      unique: true,
      validate: {
        is: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/
      }
    },
    rg: {
      type: DataTypes.STRING(20),
      validate: {
        len: [5, 20]
      }
    },
    data_nasc: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    sexo: {
      type: DataTypes.ENUM('M', 'F', 'Outro'),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      unique: true,
      validate: {
        isEmail: true
      }
    },
    telefone: {
      type: DataTypes.STRING(15),
      validate: {
        is: /^\(\d{2}\)\s\d{4,5}-\d{4}$/
      }
    },
    endereco: {
      type: DataTypes.STRING(200)
    },
    numero: {
      type: DataTypes.STRING(10)
    },
    complemento: {
      type: DataTypes.STRING(50)
    },
    bairro: {
      type: DataTypes.STRING(100)
    },
    cidade: {
      type: DataTypes.STRING(100)
    },
    estado: {
      type: DataTypes.STRING(2)
    },
    cep: {
      type: DataTypes.STRING(9),
      validate: {
        is: /^\d{5}-?\d{3}$/
      }
    },
    formacao: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    especializacao: {
      type: DataTypes.TEXT
    },
    experiencia_anos: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
        max: 50
      }
    },
    registro_profissional: {
      type: DataTypes.STRING(50)
    },
    salario: {
      type: DataTypes.DECIMAL(10, 2),
      validate: {
        min: 0
      }
    },
    data_admissao: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    data_demissao: {
      type: DataTypes.DATEONLY
    },
    status: {
      type: DataTypes.ENUM('ativo', 'inativo', 'licenca', 'ferias'),
      defaultValue: 'ativo',
      allowNull: false
    },
    carga_horaria_semanal: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1,
        max: 60
      }
    },
    observacoes: {
      type: DataTypes.TEXT
    },
    foto_url: {
      type: DataTypes.STRING(500)
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    }
  }, {
    tableName: 'professores',
    timestamps: true,
    paranoid: true, // Soft delete
    indexes: [
      {
        fields: ['cpf']
      },
      {
        fields: ['email']
      },
      {
        fields: ['status']
      },
      {
        fields: ['ativo']
      }
    ],
    hooks: {
      beforeValidate: (professor) => {
        // Normalizar dados antes da validação
        if (professor.email) {
          professor.email = professor.email.toLowerCase().trim();
        }
        if (professor.nome) {
          professor.nome = professor.nome.trim();
        }
        if (professor.cpf) {
          professor.cpf = professor.cpf.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        }
        if (professor.cep) {
          professor.cep = professor.cep.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2');
        }
      }
    }
  });

  return Professor;
};
