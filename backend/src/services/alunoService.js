'use strict';

// Modelos de queries SQL (exemplos) - ajustar conforme seu schema
// const sqlListar = "SELECT * FROM alunos WHERE ativo = 1 ORDER BY nome ASC";
// const sqlObterPorId = "SELECT * FROM alunos WHERE id = ?";
// const sqlCriar = "INSERT INTO alunos (nome, cpf, data_nascimento, telefone, email, ativo) VALUES (?, ?, ?, ?, ?, 1)";
// const sqlAtualizar = "UPDATE alunos SET nome = ?, telefone = ?, email = ? WHERE id = ?";
// const sqlRemover = "DELETE FROM alunos WHERE id = ?";

module.exports = {
  listar: async () => {
    // TODO: implementar listagem de alunos
    return [];
  },

  criar: async (data) => {
    // TODO: implementar criação de aluno
    // data: { nome, cpf, ... }
    return { id: null, ...data };
  },

  atualizar: async (id, data) => {
    // TODO: implementar atualização de aluno
    return { id, ...data };
  },

  remover: async (id) => {
    // TODO: implementar remoção de aluno
    return { id, removed: true };
  }
};
