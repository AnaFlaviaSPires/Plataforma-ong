// Configuração global da API
// Este arquivo deve ser carregado ANTES de todos os outros scripts

(function() {
  // ============================================================
  // URL do backend em produção (Render)
  // Após o deploy do backend no Render, substitua pela URL real.
  // Exemplo: 'https://plataforma-ong-backend.onrender.com/api'
  // ============================================================
  var PRODUCTION_API_URL = 'https://plataforma-ong-backend.onrender.com/api';

  // Detecta se estamos em ambiente de produção (Vercel/domínio externo)
  var hostname = window.location.hostname || 'localhost';
  var isLocal = (hostname === 'localhost' || hostname === '127.0.0.1' || window.location.protocol === 'file:');
  
  if (!isLocal && PRODUCTION_API_URL.indexOf('SEU-BACKEND') === -1) {
    // Produção: usa a URL do backend no Render
    window.API_BASE_URL = PRODUCTION_API_URL;
  } else {
    // Desenvolvimento local: detecta automaticamente
    var serverHost = hostname;
    var serverPort = '3003';
    var protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
    
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
    
    window.API_BASE_URL = protocol + '//' + serverHost + ':' + serverPort + '/api';
  }
  
  // Função para configurar servidor manualmente (útil para debug)
  window.setServerConfig = function(ip, port) {
    localStorage.setItem('serverIP', ip);
    if (port) localStorage.setItem('serverPort', port);
    console.log('Servidor configurado para: ' + ip + ':' + (port || '3003'));
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
