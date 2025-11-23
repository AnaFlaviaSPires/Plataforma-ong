'use strict';

const alunoService = require('./alunoService');
const oficinaService = require('./oficinaService');
const presencaService = require('./presencaService');
const authService = require('./authService');
const arquivoService = require('./arquivoService');

module.exports = {
  alunoService,
  oficinaService,
  presencaService,
  authService,
  arquivoService
};
