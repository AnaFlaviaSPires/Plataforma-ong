// Validadores customizados para a aplicação

// Validar CPF
const validarCPF = (cpf) => {
  if (!cpf) return true; // CPF é opcional
  
  // Remove formatação
  const cpfLimpo = cpf.replace(/[^\d]/g, '');
  
  if (cpfLimpo.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;
  
  // Validação do primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  let digitoVerificador1 = resto < 2 ? 0 : resto;
  
  if (parseInt(cpfLimpo.charAt(9)) !== digitoVerificador1) return false;
  
  // Validação do segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  let digitoVerificador2 = resto < 2 ? 0 : resto;
  
  return parseInt(cpfLimpo.charAt(10)) === digitoVerificador2;
};

// Validar CEP
const validarCEP = (cep) => {
  if (!cep) return true; // CEP é opcional
  return /^\d{5}-?\d{3}$/.test(cep);
};

// Validar telefone brasileiro
const validarTelefone = (telefone) => {
  if (!telefone) return true; // Telefone é opcional
  
  // Remove formatação
  const telefoneLimpo = telefone.replace(/[^\d]/g, '');
  
  // Aceita formatos: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
  return telefoneLimpo.length === 10 || telefoneLimpo.length === 11;
};

// Validar idade mínima
const validarIdadeMinima = (dataNascimento, idadeMinima = 0) => {
  if (!dataNascimento) return false;
  
  const hoje = new Date();
  const nascimento = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();
  
  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  
  return idade >= idadeMinima;
};

// Sanitizar string (remover caracteres especiais)
const sanitizarString = (str) => {
  if (!str) return '';
  return str.trim().replace(/[<>]/g, '');
};

// Formatar CPF
const formatarCPF = (cpf) => {
  if (!cpf) return '';
  const cpfLimpo = cpf.replace(/[^\d]/g, '');
  return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

// Formatar CEP
const formatarCEP = (cep) => {
  if (!cep) return '';
  const cepLimpo = cep.replace(/[^\d]/g, '');
  return cepLimpo.replace(/(\d{5})(\d{3})/, '$1-$2');
};

// Formatar telefone
const formatarTelefone = (telefone) => {
  if (!telefone) return '';
  const telefoneLimpo = telefone.replace(/[^\d]/g, '');
  
  if (telefoneLimpo.length === 10) {
    return telefoneLimpo.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } else if (telefoneLimpo.length === 11) {
    return telefoneLimpo.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  
  return telefone;
};

module.exports = {
  validarCPF,
  validarCEP,
  validarTelefone,
  validarIdadeMinima,
  sanitizarString,
  formatarCPF,
  formatarCEP,
  formatarTelefone
};
