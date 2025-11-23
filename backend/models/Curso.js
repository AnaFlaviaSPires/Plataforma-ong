const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Curso = sequelize.define('Curso', {
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
    codigo: {
      type: DataTypes.STRING(20),
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 20]
      }
    },
    descricao: {
      type: DataTypes.TEXT,
      validate: {
        len: [0, 2000]
      }
    },
    categoria: {
      type: DataTypes.ENUM('informatica', 'artesanato', 'culinaria', 'idiomas', 'musica', 'esportes', 'reforco_escolar', 'profissionalizante', 'outros'),
      allowNull: false,
      defaultValue: 'outros'
    },
    nivel: {
      type: DataTypes.ENUM('iniciante', 'intermediario', 'avancado'),
      allowNull: false,
      defaultValue: 'iniciante'
    },
    carga_horaria_total: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 2000
      }
    },
    duracao_meses: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 24
      }
    },
    idade_minima: {
      type: DataTypes.INTEGER,
      validate: {
        min: 5,
        max: 100
      }
    },
    idade_maxima: {
      type: DataTypes.INTEGER,
      validate: {
        min: 5,
        max: 100
      }
    },
    vagas_disponiveis: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 100
      }
    },
    vagas_ocupadas: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    data_inicio: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    data_fim: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    horario_inicio: {
      type: DataTypes.TIME,
      allowNull: false
    },
    horario_fim: {
      type: DataTypes.TIME,
      allowNull: false
    },
    dias_semana: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        isValidDays(value) {
          const validDays = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
          if (!Array.isArray(value) || value.length === 0) {
            throw new Error('Dias da semana deve ser um array não vazio');
          }
          for (const day of value) {
            if (!validDays.includes(day)) {
              throw new Error(`Dia inválido: ${day}`);
            }
          }
        }
      }
    },
    local: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    sala: {
      type: DataTypes.STRING(50)
    },
    material_necessario: {
      type: DataTypes.TEXT
    },
    pre_requisitos: {
      type: DataTypes.TEXT
    },
    objetivos: {
      type: DataTypes.TEXT
    },
    metodologia: {
      type: DataTypes.TEXT
    },
    avaliacao: {
      type: DataTypes.TEXT
    },
    certificado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    valor_curso: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      validate: {
        min: 0
      }
    },
    gratuito: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    status: {
      type: DataTypes.ENUM('planejado', 'inscricoes_abertas', 'em_andamento', 'concluido', 'cancelado', 'suspenso'),
      defaultValue: 'planejado',
      allowNull: false
    },
    professor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'professores',
        key: 'id'
      }
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    },
    observacoes: {
      type: DataTypes.TEXT
    },
    foto_url: {
      type: DataTypes.STRING(500)
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    }
  }, {
    tableName: 'cursos',
    timestamps: true,
    paranoid: true, // Soft delete
    indexes: [
      {
        fields: ['codigo']
      },
      {
        fields: ['categoria']
      },
      {
        fields: ['status']
      },
      {
        fields: ['professor_id']
      },
      {
        fields: ['data_inicio']
      },
      {
        fields: ['ativo']
      }
    ],
    hooks: {
      beforeValidate: (curso) => {
        // Normalizar dados antes da validação
        if (curso.nome) {
          curso.nome = curso.nome.trim();
        }
        if (curso.codigo) {
          curso.codigo = curso.codigo.toUpperCase().trim();
        }
        if (curso.local) {
          curso.local = curso.local.trim();
        }
      },
      beforeSave: (curso) => {
        // Validações customizadas
        if (curso.data_fim <= curso.data_inicio) {
          throw new Error('Data de fim deve ser posterior à data de início');
        }
        if (curso.horario_fim <= curso.horario_inicio) {
          throw new Error('Horário de fim deve ser posterior ao horário de início');
        }
        if (curso.idade_maxima && curso.idade_minima && curso.idade_maxima < curso.idade_minima) {
          throw new Error('Idade máxima deve ser maior que idade mínima');
        }
        if (curso.vagas_ocupadas > curso.vagas_disponiveis) {
          throw new Error('Vagas ocupadas não pode ser maior que vagas disponíveis');
        }
      }
    }
  });

  return Curso;
};
