// Inicializa os dados das salas
window.roomsData = [];

// Configuração dos botões
let helpButtonConfig = {
    url: '#',
    enabled: true,
    text: 'Ajuda',
    target: '_blank'
};

let mapButtonConfig = {
    enabled: true,
    title: 'Título do Mapa',
    message: 'Mensagem personalizada do mapa',
    image: 'assets/images/mapa.jpg',
    buttonText: 'Fechar'
};

let centerButtonConfig = {
    url: '#',
    enabled: true,
    text: '+',
    target: '_self'
};

// Função para carregar os dados das salas do servidor
async function loadRoomsData() {
    try {
        console.log('Carregando dados das salas...');
        const response = await fetch('/api/rooms');
        if (!response.ok) {
            throw new Error(`Erro ao carregar dados: ${response.status}`);
        }
        const rooms = await response.json();
        console.log('Dados das salas carregados:', rooms);
        
        // Atualiza os dados das salas
        window.roomsData = Array.isArray(rooms) ? rooms : [];
        console.log('Dados das salas atualizados:', window.roomsData);
        
        // Atualiza a interface do usuário
        if (typeof updateAllCircleColors === 'function') {
            updateAllCircleColors();
        }
        
        return window.roomsData;
    } catch (error) {
        console.error('Erro ao carregar dados das salas:', error);
        window.roomsData = [];
        return [];
    }
}

// Carrega as configurações dos botões
async function loadButtonConfigs() {
    try {
        console.log('Iniciando carregamento do config.json...');
        const response = await fetch('config.json?t=' + new Date().getTime()); // Adiciona timestamp para evitar cache
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Erro na resposta do config.json:', response.status, errorText);
            throw new Error('Erro ao carregar configurações: ' + response.status);
        }
        
        const config = await response.json().catch(error => {
            console.error('Erro ao fazer parse do JSON:', error);
            throw new Error('Erro ao processar o arquivo de configuração');
        });
        
        console.log('Configurações carregadas com sucesso:', config);
        
        // Força a configuração do centerButton se não existir
        if (!config.centerButton) {
            console.warn('A configuração centerButton não foi encontrada no config.json. Usando valores padrão.');
            config.centerButton = {
                url: 'https://www.mercadolivre.com.br',
                enabled: true,
                text: '+',
                target: '_blank'
            };
        } else {
            console.log('Configuração do centerButton encontrada:', config.centerButton);
            
            // Garante que a URL esteja correta
            if (config.centerButton.url === '#' || !config.centerButton.url) {
                console.warn('URL inválida no centerButton, usando URL padrão');
                config.centerButton.url = 'https://www.mercadolivre.com.br';
            }
        }
        
        // Atualiza configuração do botão de ajuda
        if (config.helpButton) {
            helpButtonConfig = { ...helpButtonConfig, ...config.helpButton };
            updateHelpButton();
        }
        
        // Atualiza configuração do botão central
        if (config.centerButton) {
            centerButtonConfig = { ...centerButtonConfig, ...config.centerButton };
            updateCenterButton();
        }
        
        // Atualiza configuração do botão do mapa
        if (config.mapButton) {
            mapButtonConfig = { ...mapButtonConfig, ...config.mapButton };
            updateMapButton();
        }
    } catch (error) {
        console.error('Erro ao carregar configurações:', error);
    }
}

// Atualiza o botão de ajuda com as configurações carregadas
function updateHelpButton() {
    const helpButton = document.getElementById('customButton');
    
    if (!helpButton) {
        console.error('Botão de ajuda não encontrado no DOM');
        return;
    }
    
    console.log('Atualizando botão de ajuda com configuração:', helpButtonConfig);
    
    if (helpButtonConfig.enabled) {
        helpButton.textContent = helpButtonConfig.text;
        helpButton.style.display = 'block';
        
        // Remove event listeners antigos
        const newButton = helpButton.cloneNode(true);
        helpButton.parentNode.replaceChild(newButton, helpButton);
        
        // Configura o link diretamente no HTML
        newButton.onclick = function(e) {
            e.preventDefault();
            console.log('Botão de ajuda clicado, abrindo URL:', helpButtonConfig.url);
            if (helpButtonConfig.url && helpButtonConfig.url !== '#') {
                console.log('Abrindo URL:', helpButtonConfig.url, 'no target:', helpButtonConfig.target);
                window.open(helpButtonConfig.url, helpButtonConfig.target || '_blank');
            } else {
                console.warn('URL do botão de ajuda não definida ou inválida');
            }
        };
        
        console.log('Botão de ajuda configurado:', {
            text: helpButtonConfig.text,
            url: helpButtonConfig.url,
            target: helpButtonConfig.target
        });
    } else {
        helpButton.style.display = 'none';
    }
}

// Função para exibir o modal do mapa
function showMapModal() {
    const modal = document.createElement('div');
    modal.id = 'mapModal';
    modal.className = 'modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.backgroundColor = '#1a1a1a';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '10px';
    modalContent.style.maxWidth = '90%';
    modalContent.style.maxHeight = '90%';
    modalContent.style.overflowY = 'auto';
    modalContent.style.textAlign = 'center';
    modalContent.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    
    // Adiciona a imagem do mapa se configurada
    if (mapButtonConfig.image) {
        const img = document.createElement('img');
        img.src = mapButtonConfig.image;
        img.alt = 'Mapa';
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.borderRadius = '5px';
        img.style.marginBottom = '15px';
        modalContent.appendChild(img);
    }
    
    // Adiciona o título se configurado
    if (mapButtonConfig.title) {
        const title = document.createElement('h3');
        title.textContent = mapButtonConfig.title;
        title.style.color = '#ffffff';
        title.style.marginBottom = '15px';
        modalContent.appendChild(title);
    }
    
    // Adiciona a mensagem se configurada
    if (mapButtonConfig.message) {
        const message = document.createElement('p');
        message.textContent = mapButtonConfig.message;
        message.style.color = '#e0e0e0';
        message.style.marginBottom = '20px';
        message.style.whiteSpace = 'pre-line';
        modalContent.appendChild(message);
    }
    
    // Botão de fechar
    const closeButton = document.createElement('button');
    closeButton.textContent = mapButtonConfig.buttonText || 'Fechar';
    closeButton.style.padding = '8px 20px';
    closeButton.style.backgroundColor = '#1E59D9';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '5px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.transition = 'background-color 0.3s';
    
    closeButton.onmouseover = function() {
        this.style.backgroundColor = '#3a7be0';
    };
    
    closeButton.onmouseout = function() {
        this.style.backgroundColor = '#1E59D9';
    };
    
    closeButton.onclick = function() {
        document.body.removeChild(modal);
    };
    
    modalContent.appendChild(closeButton);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Fechar ao clicar fora do conteúdo
    modal.onclick = function(event) {
        if (event.target === modal) {
            document.body.removeChild(modal);
        }
    };
}

// Atualiza o botão do mapa
function updateMapButton() {
    console.log('Atualizando botão do mapa com configuração:', mapButtonConfig);
    
    if (!mapButtonConfig.enabled) {
        const existingButton = document.getElementById('map-area-button');
        if (existingButton) {
            existingButton.style.display = 'none';
        }
        return;
    }
    
    // O botão já está no HTML, apenas atualizamos o evento de clique
    const mapButton = document.getElementById('map-area-button');
    if (mapButton) {
        // Remove event listeners antigos
        const newButton = mapButton.cloneNode(true);
        mapButton.parentNode.replaceChild(newButton, mapButton);
        
        // Adiciona o novo event listener
        newButton.onclick = function(e) {
            e.preventDefault();
            showMapModal();
        };
        
        console.log('Botão do mapa configurado com sucesso');
    } else {
        console.error('Elemento do botão do mapa não encontrado no DOM');
    }
}

// Atualiza o botão central com as configurações carregadas
function updateCenterButton() {
    // Verifica se o botão existe
    let centerButton = document.getElementById('centerButton');
    if (!centerButton) {
        console.error('Botão central não encontrado no DOM');
        return;
    }
    
    console.log('Configuração atual do botão central:', centerButtonConfig);

    // Atualiza o texto do botão
    if (centerButtonConfig.text) {
        centerButton.textContent = centerButtonConfig.text;
    }

    // Configura a visibilidade
    centerButton.style.display = centerButtonConfig.enabled ? 'flex' : 'none';

    // Remove event listeners antigos
    const newButton = centerButton.cloneNode(true);
    centerButton.parentNode.replaceChild(newButton, centerButton);
    
    // Adiciona o event listener de forma limpa
    newButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const url = centerButtonConfig.url;
        console.log('Botão central clicado, navegando para:', url);
        
        if (url && url !== '#') {
            if (centerButtonConfig.target === '_blank') {
                window.open(url, '_blank');
            } else {
                window.location.href = url;
            }
        }
    });
    
    console.log('Botão central configurado com sucesso');
}

// Manipulador global de clique para o botão central
document.addEventListener('click', function(event) {
    // Verifica se o clique foi no botão central ou em um de seus filhos
    const centerButton = event.target.closest('#centerButton');
    if (centerButton) {
        console.log('=== CLIQUE NO BOTÃO CENTRAL DETECTADO ===');
        console.log('Elemento clicado:', event.target);
        console.log('Configuração atual do botão:', centerButtonConfig);
        
        event.preventDefault();
        event.stopPropagation();
        
        console.log('Tentando navegar para:', centerButtonConfig.url);
        
        if (centerButtonConfig.url && centerButtonConfig.url !== '#') {
            console.log('Iniciando navegação...');
            try {
                if (centerButtonConfig.target === '_blank') {
                    console.log('Abrindo em nova aba...');
                    const newWindow = window.open(centerButtonConfig.url, '_blank');
                    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
                        console.warn('O bloqueador de pop-up pode ter impedido a abertura da nova aba.');
                        window.location.href = centerButtonConfig.url;
                    }
                } else {
                    console.log('Navegando na mesma aba...');
                    window.location.href = centerButtonConfig.url;
                }
            } catch (error) {
                console.error('Erro ao tentar navegar:', error);
                alert('Não foi possível abrir o link. Por favor, tente novamente.');
            }
        } else {
            console.warn('URL não configurada para o botão central');
        }
    }
});

// Carrega as configurações quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    loadButtonConfigs();
    loadRoomsData();
    
    // Inicializa o botão do mapa
    updateMapButton();
});
