'use strict';

module.exports = {
  listar: async () => {
    // TODO: implementar listagem de presenças
    return [];
  },

  criar: async (data) => {
    // TODO: registrar presença
    return { id: null, ...data };
  },

  atualizar: async (id, data) => {
    // TODO: atualizar registro de presença
    return { id, ...data };
  },

  remover: async (id) => {
    // TODO: remover registro de presença
    return { id, removed: true };
  }
};
