'use strict';

// Lógica base (comentada) para futura implementação
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
//
// async function login(email, senha, userRepo) {
//   const user = await userRepo.findByEmail(email.toLowerCase());
//   if (!user || !user.ativo) return null;
//   const ok = await bcrypt.compare(senha, user.senha);
//   if (!ok) return null;
//   const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '8h' });
//   return { token, user: { id: user.id, nome: user.nome, email: user.email } };
// }

module.exports = {
  listar: async () => {
    // Auth não lista recursos; manter stub para consistência
    return [];
  },

  criar: async (data) => {
    // Ex.: criar usuário/credencial (não implementado)
    return { id: null, ...data };
  },

  atualizar: async (id, data) => {
    // Ex.: atualizar credenciais/perfis
    return { id, ...data };
  },

  remover: async (id) => {
    // Ex.: desativar/remover credencial
    return { id, removed: true };
  }
};
