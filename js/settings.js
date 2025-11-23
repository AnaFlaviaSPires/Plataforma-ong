// Gerenciador de Configurações e Traduções
class SettingsManager {
    // Traduzir texto
    translate(key) {
        const lang = this.settings.language;
        return translations[lang]?.[key] || translations['pt-BR'][key] || key;
    }

    // Traduzir toda a página
    translatePage() {
        // Traduzir elementos com data-i18n
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = this.translate(key);
        });

        // Traduzir placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.translate(key);
        });

        // Traduzir títulos
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            element.title = this.translate(key);
        });

        // Atualizar o título da página
        const pageTitle = document.querySelector('title');
        if (pageTitle && pageTitle.getAttribute('data-i18n')) {
            pageTitle.textContent = this.translate(pageTitle.getAttribute('data-i18n'));
        }
    }
    constructor() {
        this.settings = this.loadSettings();
        this.applySettings();

        // Adicionar listener para mudança de idioma
        document.addEventListener('change', (event) => {
            if (event.target.name === 'language') {
                this.settings.language = event.target.value;
                this.saveSettings();
                this.applySettings();
                this.translatePage(); // Adicionar essa linha para aplicar mudanças de idioma imediatamente
            }
        });
        this.setupEventListeners();
    }

    // Configurações padrão
    defaultSettings = {
        theme: 'classic',
        darkMode: false,
        highContrast: false,
        dyslexicMode: false,
        reducedMotion: false,
        focusMode: false,
        fontSize: 100,
        lineHeight: 1.5,
        cursorSize: 1,
        clickableSize: 1,
        language: 'pt-BR'
    };

    // Carregar configurações do localStorage
    loadSettings() {
        const savedSettings = localStorage.getItem('userSettings');
        return savedSettings ? {...this.defaultSettings, ...JSON.parse(savedSettings)} : this.defaultSettings;
    }

    // Salvar configurações no localStorage
    saveSettings() {
        localStorage.setItem('userSettings', JSON.stringify(this.settings));
    }

    // Aplicar configurações
    applySettings() {
        // Selecionar idioma atual no select (compatível com modal novo)
        let languageSelect = document.querySelector('select[name="language"]');
        if (!languageSelect) {
            // fallback: primeiro select dentro do painel geral de configurações
            const geralPane = document.getElementById('pane-geral');
            if (geralPane) {
                languageSelect = geralPane.querySelector('select');
                if (languageSelect) {
                    languageSelect.name = 'language';
                }
            }
        }
        if (languageSelect) {
            languageSelect.value = this.settings.language;
        }

        // Aplicar traduções
        this.translatePage();

        // Aplicar tema
        document.body.classList.remove('theme-calm', 'theme-vibrant');
        if (this.settings.theme !== 'classic') {
            document.body.classList.add(`theme-${this.settings.theme}`);
        }

        // Aplicar modo escuro
        document.body.classList.toggle('dark-mode', this.settings.darkMode);

        // Aplicar alto contraste
        document.body.classList.toggle('high-contrast', this.settings.highContrast);

        // Aplicar modo disléxico
        document.body.classList.toggle('dyslexic-mode', this.settings.dyslexicMode);

        // Aplicar redução de animações
        document.body.classList.toggle('reduced-motion', this.settings.reducedMotion);

        // Aplicar modo foco
        document.body.classList.toggle('focus-mode', this.settings.focusMode);

        // Aplicar tamanho da fonte
        document.documentElement.style.setProperty('--font-size', `${this.settings.fontSize}%`);

        // Aplicar altura da linha
        document.documentElement.style.setProperty('--line-height', this.settings.lineHeight);

        // Aplicar tamanho do cursor
        document.documentElement.style.setProperty('--cursor-size', this.settings.cursorSize);

        // Aplicar tamanho dos elementos clicáveis
        document.documentElement.style.setProperty('--clickable-size', this.settings.clickableSize);

        // Salvar configurações
        this.saveSettings();
    }

    // Configurar event listeners
    setupEventListeners() {
        // Temas
        const themeOptions = document.querySelectorAll('.theme-option');
        themeOptions.forEach(option => {
            option.addEventListener('click', () => {
                const theme = option.getAttribute('data-theme') || 'classic';
                this.settings.theme = theme;
                this.applySettings();
            });
        });

        // Modo escuro (compatível com controles antigos e novos)
        const darkModeInputs = [
            document.getElementById('darkMode'),
            document.getElementById('accDarkMode')
        ].filter(Boolean);
        darkModeInputs.forEach(input => {
            input.checked = this.settings.darkMode;
            input.addEventListener('change', (e) => {
                this.settings.darkMode = e.target.checked;
                // manter todos os controles sincronizados
                darkModeInputs.forEach(other => {
                    if (other !== e.target) other.checked = this.settings.darkMode;
                });
                this.applySettings();
            });
        });

        // Alto contraste / modo daltônico (reutilizando highContrast)
        const highContrastInputs = [
            document.getElementById('highContrast'),
            document.getElementById('accColorblind')
        ].filter(Boolean);
        highContrastInputs.forEach(input => {
            input.checked = this.settings.highContrast;
            input.addEventListener('change', (e) => {
                this.settings.highContrast = e.target.checked;
                highContrastInputs.forEach(other => {
                    if (other !== e.target) other.checked = this.settings.highContrast;
                });
                this.applySettings();
            });
        });

        // Modo disléxico
        const dyslexicMode = document.getElementById('dyslexicMode');
        if (dyslexicMode) {
            dyslexicMode.checked = this.settings.dyslexicMode;
            dyslexicMode.addEventListener('change', (e) => {
                this.settings.dyslexicMode = e.target.checked;
                this.applySettings();
            });
        }

        // Reduzir animações
        const reducedMotion = document.getElementById('reducedMotion');
        if (reducedMotion) {
            reducedMotion.checked = this.settings.reducedMotion;
            reducedMotion.addEventListener('change', (e) => {
                this.settings.reducedMotion = e.target.checked;
                this.applySettings();
            });
        }

        // Modo foco
        const focusMode = document.getElementById('focusMode');
        if (focusMode) {
            focusMode.checked = this.settings.focusMode;
            focusMode.addEventListener('change', (e) => {
                this.settings.focusMode = e.target.checked;
                this.applySettings();
            });
        }

        // Tamanho da fonte
        const fontSizeRange = document.getElementById('fontSizeRange');
        if (fontSizeRange) {
            fontSizeRange.value = this.settings.fontSize;
            fontSizeRange.addEventListener('input', (e) => {
                this.settings.fontSize = parseInt(e.target.value);
                this.applySettings();
            });
        }

        // Altura da linha
        const lineHeightRange = document.getElementById('lineHeightRange');
        if (lineHeightRange) {
            lineHeightRange.value = this.settings.lineHeight;
            lineHeightRange.addEventListener('input', (e) => {
                this.settings.lineHeight = parseFloat(e.target.value);
                this.applySettings();
            });
        }

        // Tamanho do cursor
        const cursorSizeRange = document.getElementById('cursorSizeRange');
        if (cursorSizeRange) {
            cursorSizeRange.value = this.settings.cursorSize;
            cursorSizeRange.addEventListener('input', (e) => {
                this.settings.cursorSize = parseFloat(e.target.value);
                this.applySettings();
            });
        }

        // Tamanho dos elementos clicáveis
        const clickableSizeRange = document.getElementById('clickableSizeRange');
        if (clickableSizeRange) {
            clickableSizeRange.value = this.settings.clickableSize;
            clickableSizeRange.addEventListener('input', (e) => {
                this.settings.clickableSize = parseFloat(e.target.value);
                this.applySettings();
            });
        }

        // Idioma (compatível com modal novo)
        let languageSelect = document.querySelector('select[name="language"]');
        if (!languageSelect) {
            const geralPane = document.getElementById('pane-geral');
            if (geralPane) {
                languageSelect = geralPane.querySelector('select');
                if (languageSelect) {
                    languageSelect.name = 'language';
                }
            }
        }
        if (languageSelect) {
            languageSelect.value = this.settings.language;
            languageSelect.addEventListener('change', (e) => {
                this.settings.language = e.target.value;
                this.applySettings();
                this.translatePage();
            });
        }
    }
}

// Inicializar o gerenciador de configurações
document.addEventListener('DOMContentLoaded', () => {
    window.settingsManager = new SettingsManager();
});
