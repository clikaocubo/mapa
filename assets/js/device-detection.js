// Detecção de dispositivo e navegador
document.addEventListener('DOMContentLoaded', function() {
    // Adiciona classes ao body baseado no dispositivo/navegador
    const body = document.body;
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Detecção de dispositivo
    if (/android/.test(userAgent)) {
        body.classList.add('is-android');
        
        // Detecção de fabricante
        if (/samsung/.test(userAgent)) {
            body.classList.add('is-samsung');
        } else if (/xiaomi|redmi|poco/.test(userAgent)) {
            body.classList.add('is-xiaomi');
        } else if (/moto|xt\d{4}/i.test(userAgent)) {
            body.classList.add('is-motorola');
        }
        
    } else if (/iphone|ipad|ipod/.test(userAgent)) {
        body.classList.add('is-ios');
        
        // Detecção de modelo específico do iPhone
        if (/iphone/.test(userAgent)) {
            body.classList.add('is-iphone');
            
            // Detecção de iPhone com notch (X e superiores)
            const isIphoneX = /iPhone (X|1[1-9]|2[0-9]|3[0-9])/i.test(navigator.userAgent);
            const isIpad = /iPad|Macintosh/i.test(navigator.userAgent) && 'ontouchend' in document;
            
            if ((isIphoneX || isIpad) && !window.MSStream) {
                body.classList.add('has-notch');
            }
        }
    }
    
    // Detecção de navegador
    if (/safari/.test(userAgent) && !/chrome/.test(userAgent)) {
        body.classList.add('is-safari');
    } else if (/chrome/.test(userAgent)) {
        body.classList.add('is-chrome');
    } else if (/firefox/.test(userAgent)) {
        body.classList.add('is-firefox');
    }
    
    // Detecção de tela pequena
    if (window.innerWidth <= 480) {
        body.classList.add('is-small-screen');
    }
    
    // Detecção de orientação
    function updateOrientation() {
        if (window.innerHeight > window.innerWidth) {
            body.classList.add('is-portrait');
            body.classList.remove('is-landscape');
        } else {
            body.classList.add('is-landscape');
            body.classList.remove('is-portrait');
        }
    }
    
    // Atualiza a orientação inicial e adiciona listener para mudanças
    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);
    
    // Corrige o viewport em dispositivos iOS após mudança de orientação
    window.addEventListener('orientationchange', function() {
        const viewport = document.querySelector('meta[name=viewport]');
        if (viewport) {
            viewport.content = viewport.content;
            setTimeout(() => {
                window.scrollTo(0, 0);
                document.activeElement.blur();
            }, 100);
        }
    });
    
    // Corrige o comportamento de 100vh em dispositivos móveis
    function fixVH() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    fixVH();
    window.addEventListener('resize', fixVH);
    window.addEventListener('orientationchange', fixVH);
});
