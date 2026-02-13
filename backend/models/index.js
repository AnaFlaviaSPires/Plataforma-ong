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
const ActionLogModel = require('./ActionLog');
const PasswordResetModel = require('./PasswordReset');
const EventoModel = require('./Evento');
const EventoParticipanteModel = require('./EventoParticipante');
const DocumentoModel = require('./Documento');

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
const ActionLog = ActionLogModel(sequelize);
const PasswordReset = PasswordResetModel(sequelize);
const Evento = EventoModel(sequelize);
const EventoParticipante = EventoParticipanteModel(sequelize);
const Documento = DocumentoModel(sequelize);

// Definir associações

// User -> ActionLogs
User.hasMany(ActionLog, {
  foreignKey: 'usuario_id',
  as: 'logs_acoes'
});

ActionLog.belongsTo(User, {
  foreignKey: 'usuario_id',
  as: 'usuario'
});

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

// Sala -> Professor (quem ministra)
Professor.hasMany(Sala, {
  foreignKey: 'professor_id',
  as: 'salas_ministradas'
});

Sala.belongsTo(Professor, {
  foreignKey: 'professor_id',
  as: 'professor_responsavel'
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

// User -> PasswordReset
User.hasMany(PasswordReset, {
  foreignKey: 'usuario_id',
  as: 'resets_senha'
});

PasswordReset.belongsTo(User, {
  foreignKey: 'usuario_id',
  as: 'usuario'
});

// User -> Eventos
User.hasMany(Evento, {
  foreignKey: 'criado_por',
  as: 'eventos_criados'
});

Evento.belongsTo(User, {
  foreignKey: 'criado_por',
  as: 'criador'
});

// Evento <-> Participantes (User)
Evento.belongsToMany(User, {
  through: EventoParticipante,
  foreignKey: 'evento_id',
  otherKey: 'usuario_id',
  as: 'participantes'
});

User.belongsToMany(Evento, {
  through: EventoParticipante,
  foreignKey: 'usuario_id',
  otherKey: 'evento_id',
  as: 'eventos_participando'
});

// User -> Documentos
User.hasMany(Documento, {
  foreignKey: 'criado_por',
  as: 'documentos_criados'
});

Documento.belongsTo(User, {
  foreignKey: 'criado_por',
  as: 'criador'
});

// ============================================================
// 🛑 TRAVA DE SEGURANÇA DE DADOS 🛑
// Sobrescreve o método sync para impedir force:true ou alter:true
// Isso evita que o banco seja apagado acidentalmente.
// ============================================================
const originalSync = sequelize.sync.bind(sequelize);
sequelize.sync = async function(options) {
  if (options && (options.force || options.alter)) {
    const msg = `
    🛑 BLOQUEIO DE SEGURANÇA CRÍTICO ATIVADO 🛑
    -------------------------------------------------------------
    Uma tentativa de DESTRUIR/ALTERAR o banco de dados foi interceptada.
    Comandos sync({ force: true }) ou sync({ alter: true }) são PROIBIDOS.
    
    Seus dados estão salvos. A operação foi cancelada.
    -------------------------------------------------------------
    `;
    console.error(msg);
    throw new Error('SEGURANÇA: Operação destrutiva de banco bloqueada pelo sistema.');
  }
  return originalSync(options);
};

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
  Doacao,
  ActionLog,
  PasswordReset,
  Evento,
  EventoParticipante,
  Documento
};
