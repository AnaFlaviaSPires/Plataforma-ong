
// Dados simulados para testes locais

const simulacaoAlunos = [
  { id: "A001", nome: "Ana Beatriz", turma: "1A", status: "ativo" },
  { id: "A002", nome: "Carlos Eduardo", turma: "2B", status: "ativo" },
  { id: "A003", nome: "Fernanda Lima", turma: "1A", status: "inativo" }
];

const simulacaoSalas = [
  { id: "S01", nome: "Sala 1", professor: "Profa. Mariana", disciplina: "Português" },
  { id: "S02", nome: "Sala 2", professor: "Prof. João", disciplina: "Matemática" }
];

const simulacaoDoacoes = [
  { id: "D01", tipo: "Alimento", descricao: "Cesta básica", data: "2024-10-10", valor: 0, status: "recebido" },
  { id: "D02", tipo: "Dinheiro", descricao: "Pix Anônimo", data: "2024-10-12", valor: 150.0, status: "recebido" }
];

const simulacaoPresencas = [
  { alunoId: "A001", salaId: "S01", data: "2024-10-10", presente: true },
  { alunoId: "A002", salaId: "S02", data: "2024-10-10", presente: false }
];

salvarLocal("simulacaoAlunos", simulacaoAlunos);
salvarLocal("simulacaoSalas", simulacaoSalas);
salvarLocal("simulacaoDoacoes", simulacaoDoacoes);
salvarLocal("simulacaoPresencas", simulacaoPresencas);
