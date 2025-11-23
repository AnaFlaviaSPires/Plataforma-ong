'use strict';

module.exports = {
  listar: async () => {
    // TODO: implementar listagem de oficinas
    return [];
  },

  criar: async (data) => {
    // TODO: implementar criação de oficina
    return { id: null, ...data };
  },

  atualizar: async (id, data) => {
    // TODO: implementar atualização de oficina
    return { id, ...data };
  },

  remover: async (id) => {
    // TODO: implementar remoção de oficina
    return { id, removed: true };
  }
};
