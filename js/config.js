// Configuração global da API
// Este arquivo deve ser carregado ANTES de todos os outros scripts

(function() {
  // Detecta automaticamente o IP do servidor baseado na URL atual
  // Isso permite que o frontend funcione em rede local sem configuração manual
  
  var serverHost = window.location.hostname || 'localhost';
  var serverPort = '3003'; // Porta padrão do backend
  var protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
  
  // Se estiver acessando via arquivo local (file://), usa localhost
  if (window.location.protocol === 'file:') {
    serverHost = 'localhost';
    protocol = 'http:';
  }
  
  // Permite sobrescrever via localStorage (para configuração manual)
  var customServerIP = localStorage.getItem('serverIP');
  if (customServerIP) {
    serverHost = customServerIP;
  }
  
  var customServerPort = localStorage.getItem('serverPort');
  if (customServerPort) {
    serverPort = customServerPort;
  }
  
  // Define a URL base da API
  if (typeof API_BASE_URL === 'undefined') {
    window.API_BASE_URL = protocol + '//' + serverHost + ':' + serverPort + '/api';
  }
  
  // Função para configurar servidor manualmente (útil para debug)
  window.setServerConfig = function(ip, port) {
    localStorage.setItem('serverIP', ip);
    if (port) localStorage.setItem('serverPort', port);
    console.log('Servidor configurado para: ' + ip + ':' + (port || serverPort));
    console.log('Recarregue a página para aplicar.');
  };
  
  // Função para resetar configuração
  window.resetServerConfig = function() {
    localStorage.removeItem('serverIP');
    localStorage.removeItem('serverPort');
    console.log('Configuração resetada. Recarregue a página.');
  };
  
  console.log('API configurada para:', window.API_BASE_URL);
})();
