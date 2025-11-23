'use strict';

module.exports = {
  listar: async () => {
    // TODO: listar arquivos / metadados
    return [];
  },

  criar: async (data) => {
    // TODO: upload/criação de registro de arquivo
    return { id: null, ...data };
  },

  atualizar: async (id, data) => {
    // TODO: atualizar metadados do arquivo
    return { id, ...data };
  },

  remover: async (id) => {
    // TODO: remover arquivo e/ou metadados
    return { id, removed: true };
  }
};
