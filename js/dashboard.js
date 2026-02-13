// Dashboard integrado com Power BI via iframe

// URLs de exemplo para relatórios do Power BI.
// Quando você publicar seus relatórios, substitua essas URLs pelas reais.
const POWERBI_RELATORIOS = {
  alunos: 'https://app.powerbi.com/view?r=eyJrIjoiYjEyMGIzMzktM2FjNi00ZTY2LWIyMmMtZjY4MzIxNjYxZGQxIiwidCI6ImNmNzJlMmJkLTdhMmItNDc4My1iZGViLTM5ZDU3YjA3Zjc2ZiIsImMiOjR9',
  doacoes: 'https://app.powerbi.com/view?r=eyJrIjoiYjEyMGIzMzktM2FjNi00ZTY2LWIyMmMtZjY4MzIxNjYxZGQxIiwidCI6ImNmNzJlMmJkLTdhMmItNDc4My1iZGViLTM5ZDU3YjA3Zjc2ZiIsImMiOjR9'
};

document.addEventListener('DOMContentLoaded', () => {
  const selectRelatorio = document.getElementById('relatorioSelect');
  const iframe = document.getElementById('powerbiFrame');
  const btnAbrirPowerBI = document.getElementById('btnAbrirPowerBI');
  const btnExportarPDF = document.getElementById('btnExportarPDF');
  const btnExportarImagem = document.getElementById('btnExportarImagem');

  // Define relatório inicial
  if (iframe && POWERBI_RELATORIOS.alunos) {
    iframe.src = POWERBI_RELATORIOS.alunos;
  }

  // Trocar relatório ao mudar o select
  if (selectRelatorio && iframe) {
    selectRelatorio.addEventListener('change', () => {
      const key = selectRelatorio.value;
      const url = POWERBI_RELATORIOS[key];
      if (url) {
        iframe.src = url;
      }
    });
  }

  const openCurrentReport = () => {
    if (iframe && iframe.src) {
      window.open(iframe.src, '_blank');
    }
  };

  // Abrir o relatório atual diretamente no Power BI (nova aba)
  if (btnAbrirPowerBI) {
    btnAbrirPowerBI.addEventListener('click', openCurrentReport);
  }

  // Botões de exportação (abrem o mesmo relatório; exportação é feita no Power BI)
  if (btnExportarPDF) {
    btnExportarPDF.addEventListener('click', openCurrentReport);
  }

  if (btnExportarImagem) {
    btnExportarImagem.addEventListener('click', openCurrentReport);
  }
});