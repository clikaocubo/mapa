document.addEventListener('DOMContentLoaded', function() {
    // Função para forçar o botão a ficar visível e posicionado corretamente
    function ensureButtonIsVisible() {
        let button = document.getElementById('customButton');
        
        // Se o botão não existir, tenta criá-lo
        if (!button) {
            button = document.createElement('button');
            button.id = 'customButton';
            button.className = 'custom-button';
            button.textContent = 'Ajuda';
            document.body.appendChild(button);
        }
        
        // Garante que o botão esteja no final do body para evitar problemas de z-index
        if (button.parentNode !== document.body) {
            document.body.appendChild(button);
        }
        
        // Aplica estilos críticos diretamente
        Object.assign(button.style, {
            display: 'block',
            visibility: 'visible',
            opacity: '1',
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: '2147483647',
            margin: '0',
            padding: '12px 20px',
            fontSize: '14px',
            lineHeight: '1.5',
            minWidth: '80px',
            boxSizing: 'border-box',
            transform: 'translateZ(0)',
            WebkitTransform: 'translateZ(0)',
            willChange: 'transform',
            WebkitTapHighlightColor: 'transparent',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            // Remove qualquer estilo inline que possa estar causando problemas
            left: 'auto',
            top: 'auto',
            width: 'auto',
            height: 'auto'
        });
        
        // Adiciona a classe para estilização CSS
        button.classList.add('custom-button');
        
        // Força um reflow para garantir que os estilos sejam aplicados corretamente
        void button.offsetHeight;
        
        // Ajusta para dispositivos com safe-area-inset
        updateSafeAreaInsets(button);
    }
    
    // Função para atualizar as margens seguras em dispositivos com notch
    function updateSafeAreaInsets(button) {
        const safeBottom = getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom') || '0px';
        const safeRight = getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-right') || '0px';
        
        if (safeBottom !== '0px' || safeRight !== '0px') {
            const bottom = parseInt(safeBottom, 10) + 15; // 15px de margem
            const right = parseInt(safeRight, 10) + 15;   // 15px de margem
            
            button.style.bottom = `${bottom}px`;
            button.style.right = `${right}px`;
        } else if (window.visualViewport) {
            // Ajusta para o viewport visual em navegadores móveis
            const visualViewport = window.visualViewport;
            const viewportHeight = visualViewport.height;
            const windowHeight = window.innerHeight;
            const keyboardHeight = Math.max(0, windowHeight - viewportHeight);
            
            if (keyboardHeight > 0) {
                // Teclado visível, ajusta a posição
                button.style.bottom = `${keyboardHeight + 10}px`;
            } else {
                // Teclado oculto, volta para a posição padrão
                button.style.bottom = '20px';
                button.style.right = '20px';
            }
        }
    }
    
    // Executa a verificação inicial
    ensureButtonIsVisible();
    
    // Configura um intervalo para verificar periodicamente se o botão está visível
    const checkInterval = setInterval(ensureButtonIsVisible, 1000);
    
    // Adiciona listeners para eventos que podem afetar a visibilidade do botão
    const events = [
        'resize',
        'orientationchange',
        'visibilitychange',
        'scroll',
        'focusin',
        'focusout',
        'keyboardDidShow',
        'keyboardDidHide',
        'keyboardWillShow',
        'keyboardWillHide'
    ];
    
    events.forEach(event => {
        window.addEventListener(event, ensureButtonIsVisible);
    });
    
    // Para o intervalo quando a página for descarregada
    window.addEventListener('beforeunload', () => {
        clearInterval(checkInterval);
        events.forEach(event => {
            window.removeEventListener(event, ensureButtonIsVisible);
        });
    });
    
    // Ajusta o botão quando o teclado é mostrado/ocultado em dispositivos móveis
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', ensureButtonIsVisible);
        window.visualViewport.addEventListener('scroll', ensureButtonIsVisible);
    }
});
