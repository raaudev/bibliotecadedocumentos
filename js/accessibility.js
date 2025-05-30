/* Acessibilidade avançada */

// Leitor de tela integrado
class ScreenReader {
    constructor() {
        this.isReading = false;
        this.currentIndex = 0;
        this.elements = [];
        this.utterance = null;
        this.voiceOptions = [];
        this.currentVoice = null;
        this.rate = 1;
        this.pitch = 1;
        this.volume = 1;
    }

    initialize() {
        // Verificar se a API de síntese de voz está disponível
        if (!('speechSynthesis' in window)) {
            console.warn('API de síntese de voz não suportada neste navegador.');
            return false;
        }

        // Inicializar opções de voz
        this.loadVoices();
        
        // Se as vozes não estiverem disponíveis imediatamente, aguardar o evento voiceschanged
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = this.loadVoices.bind(this);
        }

        // Adicionar controles de leitor de tela à interface
        this.createControls();
        
        return true;
    }

    loadVoices() {
        this.voiceOptions = speechSynthesis.getVoices();
        
        // Tentar encontrar uma voz em português
        this.currentVoice = this.voiceOptions.find(voice => 
            voice.lang.includes('pt') || voice.lang.includes('PT')
        );
        
        // Se não encontrar voz em português, usar a primeira disponível
        if (!this.currentVoice && this.voiceOptions.length > 0) {
            this.currentVoice = this.voiceOptions[0];
        }
        
        // Atualizar seletor de vozes na interface, se existir
        const voiceSelect = document.getElementById('screenReaderVoice');
        if (voiceSelect) {
            voiceSelect.innerHTML = '';
            
            this.voiceOptions.forEach((voice, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = `${voice.name} (${voice.lang})`;
                option.selected = voice === this.currentVoice;
                voiceSelect.appendChild(option);
            });
        }
    }

    createControls() {
        // Criar painel de controle do leitor de tela
        const controlPanel = document.createElement('div');
        controlPanel.className = 'screen-reader-controls';
        controlPanel.setAttribute('aria-label', 'Controles do leitor de tela');
        controlPanel.innerHTML = `
            <button id="screenReaderToggle" class="screen-reader-button" aria-label="Ativar/Desativar leitor de tela">
                <svg class="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <span>Leitor de Tela</span>
            </button>
            <div class="screen-reader-panel">
                <div class="screen-reader-controls-header">
                    <h3>Configurações do Leitor de Tela</h3>
                    <button id="screenReaderClose" aria-label="Fechar configurações">
                        <svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="screen-reader-control-group">
                    <label for="screenReaderVoice">Voz:</label>
                    <select id="screenReaderVoice"></select>
                </div>
                <div class="screen-reader-control-group">
                    <label for="screenReaderRate">Velocidade:</label>
                    <input type="range" id="screenReaderRate" min="0.5" max="2" step="0.1" value="1">
                    <span id="screenReaderRateValue">1.0</span>
                </div>
                <div class="screen-reader-control-group">
                    <label for="screenReaderPitch">Tom:</label>
                    <input type="range" id="screenReaderPitch" min="0.5" max="2" step="0.1" value="1">
                    <span id="screenReaderPitchValue">1.0</span>
                </div>
                <div class="screen-reader-control-group">
                    <label for="screenReaderVolume">Volume:</label>
                    <input type="range" id="screenReaderVolume" min="0" max="1" step="0.1" value="1">
                    <span id="screenReaderVolumeValue">1.0</span>
                </div>
                <div class="screen-reader-buttons">
                    <button id="screenReaderPlay" class="screen-reader-action-button">
                        <svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                        Iniciar Leitura
                    </button>
                    <button id="screenReaderPause" class="screen-reader-action-button">
                        <svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="6" y="4" width="4" height="16"></rect>
                            <rect x="14" y="4" width="4" height="16"></rect>
                        </svg>
                        Pausar
                    </button>
                    <button id="screenReaderStop" class="screen-reader-action-button">
                        <svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
                        </svg>
                        Parar
                    </button>
                </div>
            </div>
        `;

        // Adicionar à página
        document.body.appendChild(controlPanel);

        // Configurar eventos
        document.getElementById('screenReaderToggle').addEventListener('click', () => {
            const panel = document.querySelector('.screen-reader-panel');
            panel.classList.toggle('active');
        });

        document.getElementById('screenReaderClose').addEventListener('click', () => {
            document.querySelector('.screen-reader-panel').classList.remove('active');
        });

        document.getElementById('screenReaderVoice').addEventListener('change', (e) => {
            this.currentVoice = this.voiceOptions[e.target.value];
        });

        document.getElementById('screenReaderRate').addEventListener('input', (e) => {
            this.rate = parseFloat(e.target.value);
            document.getElementById('screenReaderRateValue').textContent = this.rate.toFixed(1);
        });

        document.getElementById('screenReaderPitch').addEventListener('input', (e) => {
            this.pitch = parseFloat(e.target.value);
            document.getElementById('screenReaderPitchValue').textContent = this.pitch.toFixed(1);
        });

        document.getElementById('screenReaderVolume').addEventListener('input', (e) => {
            this.volume = parseFloat(e.target.value);
            document.getElementById('screenReaderVolumeValue').textContent = this.volume.toFixed(1);
        });

        document.getElementById('screenReaderPlay').addEventListener('click', () => {
            this.readCurrentPage();
        });

        document.getElementById('screenReaderPause').addEventListener('click', () => {
            if (speechSynthesis.speaking) {
                if (speechSynthesis.paused) {
                    speechSynthesis.resume();
                } else {
                    speechSynthesis.pause();
                }
            }
        });

        document.getElementById('screenReaderStop').addEventListener('click', () => {
            speechSynthesis.cancel();
            this.isReading = false;
        });
    }

    readCurrentPage() {
        // Cancelar qualquer leitura em andamento
        speechSynthesis.cancel();
        
        // Coletar elementos legíveis da página
        this.collectReadableElements();
        
        // Iniciar leitura
        this.currentIndex = 0;
        this.isReading = true;
        this.readNextElement();
    }

    collectReadableElements() {
        // Coletar elementos que devem ser lidos
        this.elements = [];
        
        // Título da página
        const pageTitle = document.querySelector('h1');
        if (pageTitle) {
            this.elements.push({
                type: 'heading',
                text: `Página: ${pageTitle.textContent.trim()}`,
                element: pageTitle
            });
        }
        
        // Descrição da página
        const pageDescription = document.querySelector('meta[name="description"]');
        if (pageDescription) {
            this.elements.push({
                type: 'description',
                text: pageDescription.getAttribute('content'),
                element: null
            });
        }
        
        // Navegação principal
        const breadcrumb = document.querySelector('.breadcrumb');
        if (breadcrumb) {
            this.elements.push({
                type: 'navigation',
                text: `Navegação: ${breadcrumb.textContent.trim().replace(/\s+/g, ' ')}`,
                element: breadcrumb
            });
        }
        
        // Categorias
        const filterButtons = document.querySelectorAll('.filter-button');
        if (filterButtons.length > 0) {
            let categoriesText = 'Categorias disponíveis: ';
            filterButtons.forEach((button, index) => {
                categoriesText += button.textContent.trim();
                if (index < filterButtons.length - 1) {
                    categoriesText += ', ';
                }
            });
            this.elements.push({
                type: 'categories',
                text: categoriesText,
                element: document.querySelector('.filter-container')
            });
        }
        
        // Documentos
        const documentCards = document.querySelectorAll('.document-card');
        documentCards.forEach((card, index) => {
            const title = card.querySelector('h3').textContent.trim();
            const description = card.querySelector('.document-info p').textContent.trim();
            const meta = card.querySelector('.document-meta').textContent.trim().replace(/\s+/g, ' ');
            
            this.elements.push({
                type: 'document',
                text: `Documento ${index + 1}: ${title}. ${description}. ${meta}`,
                element: card
            });
        });
        
        // Seções adicionais
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            if (section.id === 'favorites' || section.id === 'history') {
                const heading = section.querySelector('h2').textContent.trim();
                const content = section.textContent.trim().replace(/\s+/g, ' ').replace(heading, '');
                
                this.elements.push({
                    type: 'section',
                    text: `Seção: ${heading}. ${content}`,
                    element: section
                });
            }
        });
        
        // Rodapé
        const footer = document.querySelector('footer');
        if (footer) {
            this.elements.push({
                type: 'footer',
                text: `Rodapé: ${footer.textContent.trim().replace(/\s+/g, ' ')}`,
                element: footer
            });
        }
    }

    readNextElement() {
        if (!this.isReading || this.currentIndex >= this.elements.length) {
            this.isReading = false;
            return;
        }
        
        const element = this.elements[this.currentIndex];
        
        // Criar utterance
        this.utterance = new SpeechSynthesisUtterance(element.text);
        
        // Configurar opções
        if (this.currentVoice) {
            this.utterance.voice = this.currentVoice;
        }
        this.utterance.rate = this.rate;
        this.utterance.pitch = this.pitch;
        this.utterance.volume = this.volume;
        
        // Destacar elemento sendo lido
        if (element.element) {
            element.element.classList.add('screen-reader-active');
        }
        
        // Configurar evento de fim da fala
        this.utterance.onend = () => {
            // Remover destaque
            if (element.element) {
                element.element.classList.remove('screen-reader-active');
            }
            
            // Avançar para o próximo elemento
            this.currentIndex++;
            this.readNextElement();
        };
        
        // Iniciar fala
        speechSynthesis.speak(this.utterance);
    }

    readElement(element) {
        if (!element) return;
        
        // Cancelar qualquer leitura em andamento
        speechSynthesis.cancel();
        
        // Obter texto do elemento
        let text = '';
        
        if (element.tagName === 'IMG') {
            text = element.alt || 'Imagem sem descrição';
        } else {
            text = element.textContent.trim();
        }
        
        // Criar e configurar utterance
        const utterance = new SpeechSynthesisUtterance(text);
        
        if (this.currentVoice) {
            utterance.voice = this.currentVoice;
        }
        utterance.rate = this.rate;
        utterance.pitch = this.pitch;
        utterance.volume = this.volume;
        
        // Destacar elemento
        element.classList.add('screen-reader-active');
        
        // Remover destaque ao terminar
        utterance.onend = () => {
            element.classList.remove('screen-reader-active');
        };
        
        // Iniciar fala
        speechSynthesis.speak(utterance);
    }
}

// Ajuste de tamanho de fonte
class FontSizeAdjuster {
    constructor() {
        this.defaultSize = 16; // tamanho base em pixels
        this.currentSize = this.loadSavedSize() || this.defaultSize;
        this.minSize = 12;
        this.maxSize = 24;
        this.step = 1;
    }

    initialize() {
        // Criar controles de ajuste de fonte
        this.createControls();
        
        // Aplicar tamanho salvo
        this.applyFontSize();
        
        return true;
    }

    createControls() {
        // Criar painel de controle de tamanho de fonte
        const controlPanel = document.createElement('div');
        controlPanel.className = 'font-size-controls';
        controlPanel.setAttribute('aria-label', 'Controles de tamanho de fonte');
        controlPanel.innerHTML = `
            <button id="fontSizeToggle" class="font-size-button" aria-label="Ajustar tamanho de fonte">
                <svg class="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <text x="6" y="16" font-size="14" font-family="sans-serif">A</text>
                </svg>
            </button>
            <div class="font-size-panel">
                <div class="font-size-controls-header">
                    <h3>Tamanho da Fonte</h3>
                    <button id="fontSizeClose" aria-label="Fechar ajustes de fonte">
                        <svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="font-size-control-group">
                    <button id="fontSizeDecrease" class="font-size-adjust-button" aria-label="Diminuir tamanho da fonte">
                        <svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <text x="6" y="16" font-size="12" font-family="sans-serif">A</text>
                        </svg>
                    </button>
                    <span id="fontSizeValue">${this.currentSize}px</span>
                    <button id="fontSizeIncrease" class="font-size-adjust-button" aria-label="Aumentar tamanho da fonte">
                        <svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <text x="6" y="16" font-size="16" font-family="sans-serif">A</text>
                        </svg>
                    </button>
                </div>
                <button id="fontSizeReset" class="font-size-reset-button">Restaurar Padrão</button>
            </div>
        `;

        // Adicionar à página
        document.body.appendChild(controlPanel);

        // Configurar eventos
        document.getElementById('fontSizeToggle').addEventListener('click', () => {
            const panel = document.querySelector('.font-size-panel');
            panel.classList.toggle('active');
        });

        document.getElementById('fontSizeClose').addEventListener('click', () => {
            document.querySelector('.font-size-panel').classList.remove('active');
        });

        document.getElementById('fontSizeDecrease').addEventListener('click', () => {
            this.decreaseSize();
        });

        document.getElementById('fontSizeIncrease').addEventListener('click', () => {
            this.increaseSize();
        });

        document.getElementById('fontSizeReset').addEventListener('click', () => {
            this.resetSize();
        });
    }

    increaseSize() {
        if (this.currentSize < this.maxSize) {
            this.currentSize += this.step;
            this.applyFontSize();
            this.saveSize();
        }
    }

    decreaseSize() {
        if (this.currentSize > this.minSize) {
            this.currentSize -= this.step;
            this.applyFontSize();
            this.saveSize();
        }
    }

    resetSize() {
        this.currentSize = this.defaultSize;
        this.applyFontSize();
        this.saveSize();
    }

    applyFontSize() {
        // Atualizar valor exibido
        const fontSizeValue = document.getElementById('fontSizeValue');
        if (fontSizeValue) {
            fontSizeValue.textContent = `${this.currentSize}px`;
        }
        
        // Aplicar tamanho à raiz do documento
        document.documentElement.style.fontSize = `${this.currentSize}px`;
        
        // Disparar evento personalizado
        document.dispatchEvent(new CustomEvent('fontSizeChanged', { 
            detail: { size: this.currentSize } 
        }));
    }

    saveSize() {
        localStorage.setItem('fontSizePreference', this.currentSize);
    }

    loadSavedSize() {
        const savedSize = localStorage.getItem('fontSizePreference');
        return savedSize ? parseInt(savedSize, 10) : null;
    }
}

// Navegação por teclado aprimorada
class KeyboardNavigation {
    constructor() {
        this.focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        this.focusableContent = null;
        this.isNavigationActive = false;
        this.currentFocusIndex = -1;
        this.skipLinkAdded = false;
    }

    initialize() {
        // Adicionar link de pular para o conteúdo
        this.addSkipLink();
        
        // Adicionar indicador de foco
        this.addFocusIndicator();
        
        // Configurar atalhos de teclado
        this.setupKeyboardShortcuts();
        
        // Melhorar navegação por Tab
        this.enhanceTabNavigation();
        
        return true;
    }

    addSkipLink() {
        if (this.skipLinkAdded) return;
        
        const skipLink = document.createElement('a');
        skipLink.href = '#main';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Pular para o conteúdo principal';
        
        document.body.insertBefore(skipLink, document.body.firstChild);
        
        // Adicionar id="main" ao conteúdo principal se não existir
        const main = document.querySelector('main');
        if (main && !main.id) {
            main.id = 'main';
        }
        
        this.skipLinkAdded = true;
    }

    addFocusIndicator() {
        const focusIndicator = document.createElement('div');
        focusIndicator.className = 'focus-indicator';
        document.body.appendChild(focusIndicator);
        
        // Atualizar posição do indicador quando o foco mudar
        document.addEventListener('focusin', (e) => {
            if (!e.target || e.target === document.body) return;
            
            const rect = e.target.getBoundingClientRect();
            
            focusIndicator.style.display = 'block';
            focusIndicator.style.top = `${rect.top + window.scrollY - 4}px`;
            focusIndicator.style.left = `${rect.left + window.scrollX - 4}px`;
            focusIndicator.style.width = `${rect.width + 8}px`;
            focusIndicator.style.height = `${rect.height + 8}px`;
        });
        
        document.addEventListener('focusout', () => {
            focusIndicator.style.display = 'none';
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Alt + teclas numéricas para navegação rápida
            if (e.altKey && !e.ctrlKey && !e.shiftKey) {
                switch (e.key) {
                    case '1': // Ir para o conteúdo principal
                        e.preventDefault();
                        this.focusElement('#main');
                        break;
                    case '2': // Ir para a pesquisa
                        e.preventDefault();
                        this.focusElement('#searchInput');
                        break;
                    case '3': // Ir para a navegação
                        e.preventDefault();
                        this.focusElement('.filter-container');
                        break;
                    case '4': // Ir para os favoritos
                        e.preventDefault();
                        this.focusElement('#favorites');
                        break;
                    case '5': // Ir para o histórico
                        e.preventDefault();
                        this.focusElement('#history');
                        break;
                    case '0': // Ir para o rodapé
                        e.preventDefault();
                        this.focusElement('footer');
                        break;
                }
            }
            
            // Ativar modo de navegação por teclado com F7
            if (e.key === 'F7') {
                e.preventDefault();
                this.toggleKeyboardNavigation();
            }
            
            // Navegação por teclado quando ativada
            if (this.isNavigationActive) {
                switch (e.key) {
                    case 'ArrowRight':
                    case 'ArrowDown':
                        e.preventDefault();
                        this.focusNextElement();
                        break;
                    case 'ArrowLeft':
                    case 'ArrowUp':
                        e.preventDefault();
                        this.focusPreviousElement();
                        break;
                    case 'Home':
                        e.preventDefault();
                        this.focusFirstElement();
                        break;
                    case 'End':
                        e.preventDefault();
                        this.focusLastElement();
                        break;
                    case 'Escape':
                        e.preventDefault();
                        this.toggleKeyboardNavigation();
                        break;
                }
            }
        });
    }

    enhanceTabNavigation() {
        // Adicionar atributos ARIA para melhorar a navegação
        document.querySelectorAll('.document-card').forEach((card, index) => {
            // Adicionar rótulos ARIA
            const title = card.querySelector('h3').textContent;
            card.setAttribute('aria-label', `Documento: ${title}`);
            
            // Garantir que botões tenham rótulos adequados
            const buttons = card.querySelectorAll('button');
            buttons.forEach(button => {
                if (!button.getAttribute('aria-label')) {
                    const buttonText = button.textContent.trim();
                    button.setAttribute('aria-label', `${buttonText} ${title}`);
                }
            });
        });
        
        // Melhorar navegação em formulários
        document.querySelectorAll('form').forEach(form => {
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                // Garantir que cada input tenha um id
                if (!input.id) {
                    input.id = `input-${Math.random().toString(36).substr(2, 9)}`;
                }
                
                // Encontrar ou criar label
                let label = form.querySelector(`label[for="${input.id}"]`);
                if (!label) {
                    const parentLabel = input.closest('label');
                    if (!parentLabel) {
                        // Criar label se não existir
                        label = document.createElement('label');
                        label.setAttribute('for', input.id);
                        label.textContent = input.placeholder || 'Campo de entrada';
                        input.parentNode.insertBefore(label, input);
                    }
                }
            });
        });
    }

    toggleKeyboardNavigation() {
        this.isNavigationActive = !this.isNavigationActive;
        
        if (this.isNavigationActive) {
            // Coletar elementos navegáveis
            this.focusableContent = Array.from(document.querySelectorAll(this.focusableElements))
                .filter(el => {
                    const style = window.getComputedStyle(el);
                    return style.display !== 'none' && 
                           style.visibility !== 'hidden' && 
                           style.opacity !== '0';
                });
            
            // Iniciar navegação com o primeiro elemento
            this.currentFocusIndex = 0;
            if (this.focusableContent.length > 0) {
                this.focusableContent[0].focus();
            }
            
            // Mostrar notificação
            this.showNotification('Navegação por teclado ativada. Use as setas para navegar.');
        } else {
            this.showNotification('Navegação por teclado desativada.');
        }
    }

    focusNextElement() {
        if (!this.focusableContent || this.focusableContent.length === 0) return;
        
        this.currentFocusIndex++;
        if (this.currentFocusIndex >= this.focusableContent.length) {
            this.currentFocusIndex = 0;
        }
        
        this.focusableContent[this.currentFocusIndex].focus();
    }

    focusPreviousElement() {
        if (!this.focusableContent || this.focusableContent.length === 0) return;
        
        this.currentFocusIndex--;
        if (this.currentFocusIndex < 0) {
            this.currentFocusIndex = this.focusableContent.length - 1;
        }
        
        this.focusableContent[this.currentFocusIndex].focus();
    }

    focusFirstElement() {
        if (!this.focusableContent || this.focusableContent.length === 0) return;
        
        this.currentFocusIndex = 0;
        this.focusableContent[0].focus();
    }

    focusLastElement() {
        if (!this.focusableContent || this.focusableContent.length === 0) return;
        
        this.currentFocusIndex = this.focusableContent.length - 1;
        this.focusableContent[this.currentFocusIndex].focus();
    }

    focusElement(selector) {
        const element = document.querySelector(selector);
        if (element) {
            element.focus();
            
            // Rolar para o elemento se necessário
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    showNotification(message) {
        // Usar sistema de notificação existente ou criar um temporário
        if (window.showNotification) {
            window.showNotification(message);
        } else {
            const notification = document.createElement('div');
            notification.className = 'keyboard-navigation-notification';
            notification.setAttribute('role', 'alert');
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.classList.add('show');
            }, 10);
            
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 3000);
        }
    }
}

// Inicializar recursos de acessibilidade
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar leitor de tela
    const screenReader = new ScreenReader();
    screenReader.initialize();
    
    // Inicializar ajuste de tamanho de fonte
    const fontSizeAdjuster = new FontSizeAdjuster();
    fontSizeAdjuster.initialize();
    
    // Inicializar navegação por teclado aprimorada
    const keyboardNavigation = new KeyboardNavigation();
    keyboardNavigation.initialize();
    
    // Expor para uso global
    window.accessibilityTools = {
        screenReader,
        fontSizeAdjuster,
        keyboardNavigation
    };
});
