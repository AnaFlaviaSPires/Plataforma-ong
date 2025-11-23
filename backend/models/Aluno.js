const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Aluno = sequelize.define('Aluno', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    // Dados pessoais
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100]
      }
    },
    data_nasc: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    cpf: {
      type: DataTypes.STRING(14),
      allowNull: true,
      unique: true,
      validate: {
        is: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/
      }
    },
    rg: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    sexo: {
      type: DataTypes.ENUM('M', 'F', 'Outro'),
      allowNull: false
    },
    telefone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    
    // Endereço
    endereco: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    numero: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    complemento: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    bairro: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    cidade: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    estado: {
      type: DataTypes.STRING(2),
      allowNull: true
    },
    cep: {
      type: DataTypes.STRING(10),
      allowNull: true,
      validate: {
        is: /^\d{5}-?\d{3}$/
      }
    },
    
    // Dados do responsável
    nome_responsavel: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    cpf_responsavel: {
      type: DataTypes.STRING(14),
      allowNull: true,
      validate: {
        is: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/
      }
    },
    telefone_responsavel: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    email_responsavel: {
      type: DataTypes.STRING(150),
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    parentesco: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    
    // Informações acadêmicas
    turma: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    serie: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    escola: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    
    // Informações médicas/especiais
    restricao_alimentar: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    medicamentos: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    observacoes_medicas: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    
    // Status e controle
    ativo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    data_matricula: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    numero_matricula: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true
    },
    
    // Anexos (URLs ou paths dos arquivos)
    foto: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    documentos: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    }
  }, {
    tableName: 'alunos',
    hooks: {
      beforeCreate: async (aluno) => {
        // Gerar número de matrícula automático se não fornecido
        if (!aluno.numero_matricula) {
          const ano = new Date().getFullYear();
          // Buscar o maior sequencial existente para o ano corrente
          const [results] = await sequelize.query(
            `SELECT MAX(CAST(SUBSTRING(numero_matricula, 5) AS UNSIGNED)) AS maxSeq
             FROM alunos
             WHERE numero_matricula LIKE :prefix`,
            { replacements: { prefix: `${ano}%` } }
          );
          const maxSeq = (results && results[0] && results[0].maxSeq) ? parseInt(results[0].maxSeq, 10) : 0;
          const nextSeq = (isNaN(maxSeq) ? 0 : maxSeq) + 1;
          aluno.numero_matricula = `${ano}${nextSeq.toString().padStart(4, '0')}`;
        }
      }
    }
  });

  // Método para calcular idade
  Aluno.prototype.getIdade = function() {
    const hoje = new Date();
    const nascimento = new Date(this.data_nasc);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    
    return idade;
  };

  // Método para obter nome completo do responsável
  Aluno.prototype.getResponsavelCompleto = function() {
    return this.nome_responsavel ? 
      `${this.nome_responsavel} (${this.parentesco || 'Responsável'})` : 
      'Não informado';
  };

  return Aluno;
};
