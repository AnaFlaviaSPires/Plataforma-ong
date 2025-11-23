const sequelize = require('../config/database');
const UserModel = require('./User');
const AlunoModel = require('./Aluno');
const ProfessorModel = require('./Professor');
const CursoModel = require('./Curso');
const SalaModel = require('./Sala');
const SalaAlunoModel = require('./SalaAluno');
const ChamadaModel = require('./Chamada');
const ChamadaRegistroModel = require('./ChamadaRegistro');
const DoacaoModel = require('./Doacao');

// Inicializar modelos
const User = UserModel(sequelize);
const Aluno = AlunoModel(sequelize);
const Professor = ProfessorModel(sequelize);
const Curso = CursoModel(sequelize);
const Sala = SalaModel(sequelize);
const SalaAluno = SalaAlunoModel(sequelize);
const Chamada = ChamadaModel(sequelize);
const ChamadaRegistro = ChamadaRegistroModel(sequelize);
const Doacao = DoacaoModel(sequelize);

// Definir associações

// User -> Alunos
User.hasMany(Aluno, {
  foreignKey: 'usuario_id',
  as: 'alunos_cadastrados'
});

Aluno.belongsTo(User, {
  foreignKey: 'usuario_id',
  as: 'usuario_cadastro'
});

// User -> Professores
User.hasMany(Professor, {
  foreignKey: 'usuario_id',
  as: 'professores_cadastrados'
});

Professor.belongsTo(User, {
  foreignKey: 'usuario_id',
  as: 'usuario_cadastro'
});

// User -> Cursos
User.hasMany(Curso, {
  foreignKey: 'usuario_id',
  as: 'cursos_cadastrados'
});

Curso.belongsTo(User, {
  foreignKey: 'usuario_id',
  as: 'usuario_cadastro'
});

// Professor -> Cursos
Professor.hasMany(Curso, {
  foreignKey: 'professor_id',
  as: 'cursos_ministrados'
});

Curso.belongsTo(Professor, {
  foreignKey: 'professor_id',
  as: 'professor'
});

// User -> Salas (quem criou a sala)
User.hasMany(Sala, {
  foreignKey: 'usuario_id',
  as: 'salas_cadastradas'
});

Sala.belongsTo(User, {
  foreignKey: 'usuario_id',
  as: 'usuario_cadastro'
});

// Sala <-> Aluno (via SalaAluno)
Sala.belongsToMany(Aluno, {
  through: SalaAluno,
  foreignKey: 'sala_id',
  otherKey: 'aluno_id',
  as: 'alunos'
});

Aluno.belongsToMany(Sala, {
  through: SalaAluno,
  foreignKey: 'aluno_id',
  otherKey: 'sala_id',
  as: 'salas'
});

// Sala -> Chamadas
Sala.hasMany(Chamada, {
  foreignKey: 'sala_id',
  as: 'chamadas'
});

Chamada.belongsTo(Sala, {
  foreignKey: 'sala_id',
  as: 'sala'
});

// Chamada -> Registros
Chamada.hasMany(ChamadaRegistro, {
  foreignKey: 'chamada_id',
  as: 'registros'
});

ChamadaRegistro.belongsTo(Chamada, {
  foreignKey: 'chamada_id',
  as: 'chamada'
});

// Aluno -> Registros de chamada
Aluno.hasMany(ChamadaRegistro, {
  foreignKey: 'aluno_id',
  as: 'registros_chamada'
});

ChamadaRegistro.belongsTo(Aluno, {
  foreignKey: 'aluno_id',
  as: 'aluno'
});

// User -> Doacoes
User.hasMany(Doacao, {
  foreignKey: 'usuario_id',
  as: 'doacoes_registradas'
});

Doacao.belongsTo(User, {
  foreignKey: 'usuario_id',
  as: 'usuario_registro'
});

// Exportar modelos e conexão
module.exports = {
  sequelize,
  User,
  Aluno,
  Professor,
  Curso,
  Sala,
  SalaAluno,
  Chamada,
  ChamadaRegistro,
  Doacao
};
