// Configurações globais do usuário
const userConfig = {
  theme: localStorage.getItem('theme') || 'light',
  readingMode: localStorage.getItem('readingMode') === 'true',
  colorblindMode: localStorage.getItem('colorblindMode') === 'true',
  simpleText: localStorage.getItem('simpleText') === 'true',
  language: localStorage.getItem('language') || 'pt-BR',
  showPronouns: localStorage.getItem('showPronouns') === 'true',
  techVocab: localStorage.getItem('techVocab') || 'basic',
  sounds: localStorage.getItem('sounds') !== 'false',
  popups: localStorage.getItem('popups') !== 'false',
  mascotEnabled: localStorage.getItem('mascotEnabled') !== 'false',
  mascotLevel: localStorage.getItem('mascotLevel') || 'polite'
};

// Aplicar configurações
function applyConfigurations() {
  // Tema
  document.body.classList.toggle('dark-theme', userConfig.theme === 'dark');
  
  // Modo leitura
  document.body.classList.toggle('reading-mode', userConfig.readingMode);
  
  // Modo daltônico
  document.body.classList.toggle('colorblind-mode', userConfig.colorblindMode);
  
  // Texto simplificado
  document.body.classList.toggle('simple-text', userConfig.simpleText);
  
  // Idioma
  document.documentElement.lang = userConfig.language;
  
  // Pronomes
  document.body.classList.toggle('show-pronouns', userConfig.showPronouns);
  
  // Vocabulário técnico
  document.body.classList.toggle('tech-vocab-advanced', userConfig.techVocab === 'advanced');
  
  // Sons
  document.body.classList.toggle('sounds-enabled', userConfig.sounds);
  
  // Pop-ups
  document.body.classList.toggle('popups-enabled', userConfig.popups);
  
  // Mascote
  document.body.classList.toggle('mascot-enabled', userConfig.mascotEnabled);
  document.body.dataset.mascotLevel = userConfig.mascotLevel;
}

// Inicializar configurações
document.addEventListener('DOMContentLoaded', () => {
  applyConfigurations();
  
  // Event listeners para configurações
  (document.getElementById('toggleTheme')?.addEventListener('click', (e) => {
    e.preventDefault();
    userConfig.theme = userConfig.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', userConfig.theme);
    applyConfigurations();
  });

  (document.getElementById('toggleReadingMode')?.addEventListener('click', (e) => {
    e.preventDefault();
    userConfig.readingMode = !userConfig.readingMode;
    localStorage.setItem('readingMode', userConfig.readingMode);
    applyConfigurations();
  });

  // ... outros event listeners seguem o mesmo padrão
});

// Exportar para uso global
window.userConfig = userConfig;
window.applyConfigurations = applyConfigurations;