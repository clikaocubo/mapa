// Dados das salas
let currentRoom = null;
let isMenuOpen = false;
let socket = null;

// Inicialização segura quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Inicializa a conexão com o servidor Socket.IO
    initSocketConnection();
});

// Inicializa a conexão com o servidor Socket.IO
function initSocketConnection() {
    try {
        // Verifica se o Socket.IO já foi carregado
        if (typeof io === 'undefined') {
            console.warn('Socket.IO não está disponível. Atualizações em tempo real desativadas.');
            return;
        }
        
        // Conecta ao servidor Socket.IO (se ainda não estiver conectado)
        if (!window.socket) {
            window.socket = io();
            console.log('Conectado ao servidor Socket.IO');
        }
        
        socket = window.socket;
        
        // Configura os eventos
        socket.on('connect', () => {
            console.log('Conectado ao servidor com sucesso');
            // Sincroniza os dados locais com o servidor
            syncWithServer();
        });
        
        // Configura os eventos do Socket.IO
        setupSocketEvents();
        
    } catch (error) {
        console.error('Erro ao conectar ao servidor Socket.IO:', error);
    }
}

// Sincroniza os dados locais com o servidor
function syncWithServer() {
    if (!socket) return;
    
    try {
        const localData = localStorage.getItem('roomsData');
        if (localData) {
            const rooms = JSON.parse(localData);
            console.log('Sincronizando dados locais com o servidor...');
            socket.emit('sync_local_storage', { rooms });
        }
    } catch (error) {
        console.error('Erro ao sincronizar dados com o servidor:', error);
    }
}

// Inicializa roomsData se não existir
if (!window.roomsData) {
    window.roomsData = [];
}
const roomsData = window.roomsData;

// Elementos da interface
let hamburgerMenu, sidebar, closeSidebar, roomView, roomTitle, roomStatus, roomSchedule, roomTeacher, roomSubject, roomClass, roomStudents, backButton, statusModal, closeStatusModal, helpModal, closeHelpModal, notificationsModal, closeNotificationsModal, settingsModal, closeSettingsModal;

/**
 * Inicializa as referências aos elementos DOM
 */
function initDOMElements() {
    // Elementos do menu e interface
    hamburgerMenu = document.querySelector('.hamburger-menu');
    sidebar = document.querySelector('.sidebar');
    closeSidebar = document.querySelector('.close-sidebar');
    
    // Elementos da visualização da sala
    roomView = document.querySelector('.room-view');
    roomTitle = document.getElementById('room-title');
    roomStatus = document.getElementById('room-status');
    roomSchedule = document.getElementById('room-schedule');
    roomTeacher = document.getElementById('room-teacher');
    roomSubject = document.getElementById('room-subject');
    roomClass = document.getElementById('room-class');
    roomStudents = document.getElementById('room-students');
    backButton = document.querySelector('.back-btn');
    
    // Modais
    statusModal = document.getElementById('status-modal');
    closeStatusModal = document.querySelector('.close-status');
    helpModal = document.getElementById('help-modal');
    closeHelpModal = document.querySelector('.close-help');
    notificationsModal = document.getElementById('notifications-modal');
    closeNotificationsModal = document.querySelector('.close-notifications');
    settingsModal = document.getElementById('settings-modal');
    closeSettingsModal = document.querySelector('.close-settings');
    
    // O mapContainer é gerenciado pelo script principal em index.html
    // Não é necessário declará-lo aqui para evitar duplicação
}

// Configura os ouvintes de eventos
function setupEventListeners() {
    // Menu hambúrguer
    if (hamburgerMenu) {
        hamburgerMenu.addEventListener('click', toggleSidebar);
    }
    
    // Botão de fechar o menu lateral
    if (closeSidebar) {
        closeSidebar.addEventListener('click', toggleSidebar);
    }
    
    // Botão de voltar
    if (backButton) {
        backButton.addEventListener('click', hideRoomDetails);
    }
    
    // Fechar modais ao clicar fora deles
    window.addEventListener('click', (e) => {
        if (e.target === statusModal) hideModal('status');
        if (e.target === helpModal) hideModal('help');
        if (e.target === notificationsModal) hideModal('notifications');
        if (e.target === settingsModal) hideModal('settings');
    });
    
    // Botões de fechar dos modais
    if (closeStatusModal) closeStatusModal.addEventListener('click', () => hideModal('status'));
    if (closeHelpModal) closeHelpModal.addEventListener('click', () => hideModal('help'));
    if (closeNotificationsModal) closeNotificationsModal.addEventListener('click', () => hideModal('notifications'));
    if (closeSettingsModal) closeSettingsModal.addEventListener('click', () => hideModal('settings'));
    
    // Ouvinte para mensagens do painel de administração
    window.addEventListener('message', (event) => {
        console.log('Mensagem recebida:', event.data);
        
        // Verifica se a mensagem é para forçar a atualização do mapa
        if (event.data && event.data.type === 'forceUpdateMap') {
            console.log('Atualização do mapa solicitada pelo painel de administração');
            
            // Tenta carregar os dados atualizados do localStorage
            try {
                const savedData = localStorage.getItem('roomsData');
                if (savedData) {
                    const parsedData = JSON.parse(savedData);
                    if (Array.isArray(parsedData)) {
                        window.roomsData = parsedData;
                        console.log('Dados das salas atualizados a partir do localStorage');
                    } else if (parsedData && Array.isArray(parsedData.rooms)) {
                        window.roomsData = parsedData.rooms;
                        console.log('Dados das salas atualizados a partir do localStorage (formato antigo)');
                    }
                }
                
                // Atualiza o mapa
                if (typeof updateMap === 'function') {
                    updateMap();
                    console.log('Mapa atualizado com sucesso');
                }
            } catch (error) {
                console.error('Erro ao atualizar o mapa a partir da mensagem:', error);
            }
        }
    });
    
    // Verifica por alterações no localStorage
    window.addEventListener('storage', (event) => {
        if (event.key === 'roomsData') {
            console.log('Alteração detectada no localStorage para roomsData');
            
            try {
                const savedData = event.newValue ? JSON.parse(event.newValue) : null;
                if (savedData) {
                    if (Array.isArray(savedData)) {
                        window.roomsData = savedData;
                    } else if (savedData.rooms && Array.isArray(savedData.rooms)) {
                        window.roomsData = savedData.rooms;
                    }
                    
                    if (typeof updateMap === 'function') {
                        updateMap();
                        console.log('Mapa atualizado após alteração no localStorage');
                    }
                }
            } catch (error) {
                console.error('Erro ao processar alteração no localStorage:', error);
            }
        }
    });
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Inicializa as referências aos elementos DOM
    initDOMElements();
    
    // Configura os ouvintes de eventos
    setupEventListeners();
    
    // Carrega os dados iniciais
    loadRoomsData();
    
    // Inicializa o mapa
    initMap();
    
    // Inicia a conexão com o servidor Socket.IO
    initSocketConnection();
});

// Carrega os dados das salas
async function loadRoomsData() {
    console.log('Iniciando carregamento dos dados das salas...');
    
    try {
        // Tenta carregar os dados da API
        console.log('Buscando dados da API em /api/rooms...');
        const response = await fetch('/api/rooms');
        
        if (response.ok) {
            console.log('Dados recebidos com sucesso da API');
            const data = await response.json();
            
            if (data && Array.isArray(data.rooms)) {
                console.log(`Dados de ${data.rooms.length} salas recebidos`);
                
                // Atualiza o array existente para manter as referências
                window.roomsData = []; // Limpa o array
                window.roomsData.push(...data.rooms);
                
                // Armazena os dados no localStorage para uso offline
                try {
                    localStorage.setItem('roomsData', JSON.stringify(data.rooms));
                    console.log('Dados das salas salvos no localStorage');
                } catch (storageError) {
                    console.warn('Não foi possível salvar os dados no localStorage:', storageError);
                }
                
                // Atualiza a interface
                if (typeof updateMap === 'function') {
                    console.log('Atualizando o mapa...');
                    updateMap();
                }
                
                if (typeof updateAllCircleColors === 'function') {
                    console.log('Atualizando cores dos círculos...');
                    updateAllCircleColors();
                }
                
                console.log('Dados das salas carregados com sucesso');
                return true;
            } else {
                console.warn('Resposta da API não contém um array de salas válido:', data);
            }
        } else {
            console.error(`Erro na resposta da API: ${response.status} ${response.statusText}`);
            
            // Tenta carregar do localStorage em caso de falha na API
            console.log('Tentando carregar dados do localStorage...');
            try {
                const cachedData = localStorage.getItem('roomsData');
                if (cachedData) {
                    const parsedData = JSON.parse(cachedData);
                    if (Array.isArray(parsedData) && parsedData.length > 0) {
                        console.log(`Carregados ${parsedData.length} salas do cache`);
                        window.roomsData = parsedData;
                        
                        if (typeof updateMap === 'function') updateMap();
                        if (typeof updateAllCircleColors === 'function') updateAllCircleColors();
                        
                        return true;
                    }
                }
            } catch (cacheError) {
                console.error('Erro ao carregar do cache:', cacheError);
            }
        }
        
        // Se chegou aqui, houve um erro
        console.error('Não foi possível carregar os dados das salas');
        return false;
        
    } catch (error) {
        console.error('Erro ao carregar dados das salas:', error);
        
        // Tenta carregar do localStorage em caso de erro de rede
        try {
            console.log('Tentando carregar dados do localStorage após erro de rede...');
            const cachedData = localStorage.getItem('roomsData');
            if (cachedData) {
                const parsedData = JSON.parse(cachedData);
                if (Array.isArray(parsedData) && parsedData.length > 0) {
                    console.log(`Carregados ${parsedData.length} salas do cache após erro de rede`);
                    window.roomsData = parsedData;
                    
                    if (typeof updateMap === 'function') updateMap();
                    if (typeof updateAllCircleColors === 'function') updateAllCircleColors();
                    
                    return true;
                }
            }
        } catch (cacheError) {
            console.error('Erro ao carregar do cache após erro de rede:', cacheError);
        }
        
        return false;
    } finally {
        console.log('Finalizado carregamento dos dados das salas');
        
        // Dispara um evento personalizado quando os dados são carregados
        const event = new CustomEvent('roomsDataLoaded', { 
            detail: { 
                success: window.roomsData && window.roomsData.length > 0,
                count: window.roomsData ? window.roomsData.length : 0
            } 
        });
        document.dispatchEvent(event);
    }
}

// Atualiza o mapa com base nos dados das salas
function updateMap() {
    console.log('=== INICIANDO ATUALIZAÇÃO DO MAPA ===');
    
    // Tenta carregar os dados mais recentes do localStorage
    try {
        const savedData = localStorage.getItem('roomsData');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            if (Array.isArray(parsedData)) {
                window.roomsData = parsedData;
                console.log('Dados das salas carregados do localStorage:', parsedData);
            } else if (parsedData && Array.isArray(parsedData.rooms)) {
                window.roomsData = parsedData.rooms;
                console.log('Dados das salas carregados do localStorage (formato antigo):', parsedData.rooms);
            }
        }
    } catch (error) {
        console.error('Erro ao carregar dados do localStorage:', error);
    }
    
    // Verifica se existem dados de salas
    if (!window.roomsData || !Array.isArray(window.roomsData)) {
        console.warn('Nenhum dado de salas disponível para atualizar o mapa');
        return;
    }
    
    console.log('Dados atuais das salas:', window.roomsData);
    
    // Itera sobre cada sala nos dados
    window.roomsData.forEach(room => {
        if (!room || !room.id) {
            console.warn('Sala inválida encontrada:', room);
            return;
        }
        
        // Normaliza o ID da sala
        const roomId = room.id.toString().replace(/\D/g, '');
        console.log(`Processando sala ${roomId}...`);
        
        // Tenta encontrar o elemento da sala no DOM
        const selectors = [
            `#room-${roomId}`,
            `#sala-${roomId}`,
            `#sala${roomId}`,
            `[data-room-id="${roomId}"]`,
            `[data-sala-id="${roomId}"]`
        ];
        
        let circle = null;
        for (const selector of selectors) {
            circle = document.querySelector(selector);
            if (circle) break;
        }
        
        if (circle) {
            // Verifica se a sala está ativa ou inativa
            const isActive = room.status === 'ativo' || room.status === 'active';
            
            console.log(`Atualizando sala ${roomId} para status:`, { 
                status: room.status, 
                isActive,
                element: circle
            });
            
            // Remove todas as classes de status
            circle.classList.remove('active', 'inactive', 'pulse');
            
            // Atualiza as classes CSS com base no status
            if (isActive) {
                circle.classList.add('active', 'pulse');
                circle.style.opacity = '1';
                circle.style.pointerEvents = 'auto';
                circle.style.cursor = 'pointer';
            } else {
                circle.classList.add('inactive');
                circle.style.opacity = '0.5';
                circle.style.pointerEvents = 'none';
                circle.style.cursor = 'not-allowed';
            }
            
            console.log(`Sala ${roomId} atualizada com sucesso`);
        } else {
            console.warn(`Elemento da sala ${roomId} não encontrado no DOM. Selectors tentados:`, selectors);
        }
    });
    
    console.log('=== ATUALIZAÇÃO DO MAPA CONCLUÍDA ===');
}

// Função para verificar se uma sala está inativa
function isRoomInactive(roomId) {
    if (!window.roomsData || !Array.isArray(window.roomsData)) {
        console.warn('Dados das salas não carregados ou em formato inválido');
        return false;
    }
    
    // Normaliza o ID da sala para garantir a correspondência
    const normalizedRoomId = roomId.toString().replace(/\D/g, '');
    
    console.log('Verificando status da sala:', normalizedRoomId, 'em', window.roomsData);
    
    // Tenta encontrar a sala de várias maneiras diferentes
    const room = window.roomsData.find(r => {
        if (!r || !r.id) return false;
        
        // Normaliza o ID da sala no objeto
        const roomIdStr = r.id.toString().toLowerCase();
        const roomIdNum = roomIdStr.replace(/\D/g, '');
        
        return (
            // Verifica correspondência direta
            roomIdStr === normalizedRoomId ||
            roomIdStr === `sala${normalizedRoomId}`.toLowerCase() ||
            roomIdNum === normalizedRoomId ||
            // Verifica se o ID contém o número da sala
            roomIdStr.includes(`sala${normalizedRoomId}`.toLowerCase()) ||
            roomIdNum.includes(normalizedRoomId)
        );
    });
    
    console.log('Sala encontrada:', room ? room.id : 'não encontrada');
    
    if (!room) {
        console.warn(`Sala ${normalizedRoomId} não encontrada nos dados`);
        return false;
    }
    
    if (!room.status) {
        console.warn(`Sala ${room.id} não possui status definido`);
        return false;
    }
    
    const status = String(room.status).toLowerCase().trim();
    const isInactive = [
        'inativo', 'desativado', 'inactive', 'disabled',
        'indisponível', 'indisponivel', 'manutenção', 'manutencao', 'bloqueado',
        'manutencão', 'manutenção', 'maintenance', 'offline', 'fora do ar'
    ].some(inactiveStatus => status.includes(inactiveStatus.toLowerCase()));
    
    console.log(`Status da sala ${room.id}:`, status, isInactive ? '(INATIVA)' : '(ATIVA)');
    return isInactive;
}

// Função para mostrar o modal de aviso de sala inativa
function showWarningModal() {
    console.log('Exibindo modal de aviso de sala inativa');
    
    // Remove qualquer modal de aviso existente
    const existingModal = document.getElementById('warning-modal');
    if (existingModal) {
        console.log('Removendo modal de aviso existente');
        existingModal.remove();
    }
    
    // Cria o modal
    const modal = document.createElement('div');
    modal.id = 'warning-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '9999';
    modal.style.pointerEvents = 'auto';
    modal.style.transition = 'opacity 0.3s ease';
    modal.style.opacity = '0';
    
    // Adiciona animação de entrada
    setTimeout(() => {
        modal.style.opacity = '1';
    }, 10);
    
    // Cria o conteúdo do modal
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = '#1a1a1a';
    modalContent.style.padding = '25px';
    modalContent.style.borderRadius = '10px';
    modalContent.style.maxWidth = '90%';
    modalContent.style.width = '400px';
    modalContent.style.textAlign = 'center';
    modalContent.style.boxShadow = '0 5px 25px rgba(0, 0, 0, 0.5)';
    modalContent.style.color = '#fff';
    
    // Adiciona o título
    const title = document.createElement('h2');
    title.textContent = 'Sala Indisponível';
    title.style.margin = '0 0 15px 0';
    title.style.color = '#e74c3c';
    title.style.fontSize = '24px';
    title.style.fontWeight = '700';
    title.style.letterSpacing = '0.5px';
    title.style.marginBottom = '15px';
    
    // Adiciona a mensagem
    const message = document.createElement('p');
    message.textContent = 'Esta sala está atualmente inativa ou em manutenção. Por favor, selecione outra sala disponível no mapa.';
    message.style.margin = '0 0 25px 0';
    message.style.color = '#555';
    message.style.lineHeight = '1.6';
    message.style.fontSize = '16px';
    
    // Adiciona o botão de fechar
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Fechar';
    closeButton.style.padding = '10px 25px';
    closeButton.style.backgroundColor = '#ff4d4d';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '5px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.fontSize = '16px';
    closeButton.style.transition = 'background-color 0.3s';
    
    closeButton.onmouseover = function() {
        this.style.backgroundColor = '#ff6666';
    };
    
    closeButton.onmouseout = function() {
        this.style.backgroundColor = '#ff4d4d';
    };
    
    // Adiciona o evento de clique para fechar o modal
    closeButton.addEventListener('click', () => {
        closeModal(modal);
    });
    
    // Fecha o modal ao pressionar a tecla ESC
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            closeModal(modal);
            document.removeEventListener('keydown', handleKeyDown);
        }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    // Fecha o modal ao clicar fora do conteúdo
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal);
        }
    });
    
    // Adiciona os elementos ao modal
    modalContent.appendChild(title);
    modalContent.appendChild(message);
    modalContent.appendChild(closeButton);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Adiciona a animação ao CSS
    addModalAnimationStyles();
    
    // Função para fechar o modal com animação
    function closeModal(modalElement) {
        modalElement.style.opacity = '0';
        setTimeout(() => {
            if (modalElement && modalElement.parentNode) {
                modalElement.remove();
            }
        }, 300);
    }
    
    // Adiciona estilos de animação para o modal
    function addModalAnimationStyles() {
        const styleId = 'modal-animation-styles';
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            @keyframes modalFadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            @keyframes pulse {
                0% { transform: scale(1); opacity: 0.8; }
                50% { transform: scale(1.1); opacity: 1; }
                100% { transform: scale(1); opacity: 0.8; }
            }
            
            #warning-modal {
                transition: opacity 0.3s ease-out;
            }
            
            #warning-modal .modal-content {
                animation: modalFadeIn 0.3s ease-out forwards;
            }
        `;
        
        document.head.appendChild(style);
    }
}

// Função para lidar com o clique em um botão de sala
function handleRoomButtonClick(e) {
    e.stopPropagation();
    
    const button = e.currentTarget;
    
    // Feedback visual imediato
    button.style.transform = 'scale(0.95)';
    button.style.transition = 'transform 0.1s ease';
    setTimeout(() => { button.style.transform = ''; }, 100);
    
    // Tenta extrair o ID da sala de várias maneiras
    let roomId = button.id || '';
    
    // Se não encontrou pelo ID, tenta extrair de outros atributos
    if (!roomId || !roomId.match(/\d+/)) {
        // Tenta extrair do atributo data-room
        roomId = button.getAttribute('data-room') || 
                button.getAttribute('data-sala') || 
                button.getAttribute('data-name') || 
                button.getAttribute('title') || 
                '';
        
        // Se ainda não encontrou, tenta extrair do texto
        if (!roomId.match(/\d+/)) {
            const text = button.textContent || '';
            const match = text.match(/(sala|room)\s*(\d+)/i) || text.match(/(\d+)/);
            if (match) {
                roomId = match[2] || match[1];
            }
        }
    }
    
    // Extrai apenas os números do ID
    const roomNumberMatch = roomId.toString().match(/(\d+)/);
    const roomNumber = roomNumberMatch ? parseInt(roomNumberMatch[1], 10) : null;
    
    if (roomNumber === null) {
        console.error('Não foi possível identificar o número da sala a partir do botão:', button);
        return;
    }
    
    console.log('Clique na sala:', roomNumber);
    
    // Processa o clique imediatamente
    processRoomClick(button, roomNumber);
}

// Função separada para processar o clique na sala
function processRoomClick(button, roomNumber) {
    console.log('Processando clique para sala:', roomNumber, {
        'data-name': button.getAttribute('data-name'),
        'data-room': button.getAttribute('data-room')
    });
    
    // Feedback visual
    button.style.transform = 'scale(0.95)';
    button.style.transition = 'transform 0.1s ease';
    setTimeout(() => { button.style.transform = ''; }, 100);
    
    // Remove qualquer caractere não numérico do ID
    let roomId = roomNumber.toString().replace(/\D/g, '');
    
    // Verifica se a sala está inativa
    if (isRoomInactive(roomId)) {
        console.log(`Sala ${roomNumber} está inativa, mostrando modal de aviso`);
        showWarningModal(roomNumber);
        return;
    }
    
    // Se chegou até aqui, a sala está ativa
    console.log(`Sala ${roomNumber} está ativa, mostrando detalhes`);
    showRoomDetails(roomNumber);
}

// Inicializa o mapa
function initMap() {
    console.log('Inicializando mapa...');
    
    // Garante que window.roomsData existe
    window.roomsData = window.roomsData || [];
    
    // Função para configurar os botões das salas
    function setupRoomButtons() {
        console.log('Procurando botões de sala...');
        
        // Seleciona todos os botões de sala de várias maneiras diferentes
        const selectors = [
            // Seletores por classe
            '.circle-button', 
            '.room-button',
            '.sala',
            
            // Seletores por ID
            '[id^="room-"]', // ID começando com "room-"
            '[id^="sala"]',  // ID começando com "sala"
            '[id*="sala"]',  // ID contendo "sala" em qualquer posição
            '[id$="-room"]', // ID terminando com "-room"
            '[id*="sala"]',  // ID contendo "sala"
            
            // Seletores por data-attribute
            '[data-room]',    // Por data-attribute
            '[data-sala]',    // Por data-sala
            
            // Seletores para elementos SVG
            'g[data-name^="sala"]', // SVG com data-name começando com "sala"
            'g[data-name*="sala"]', // SVG com data-name contendo "sala"
            'g[id^="sala"]',        // SVG com ID começando com "sala"
            'g[id*="sala"]',        // SVG com ID contendo "sala"
            'g[class*="sala"]',     // SVG com classe contendo "sala"
            
            // Seletores para elementos de texto que podem representar salas
            'text[id*="sala"]',
            'text[data-room]',
            'text[data-sala]',
            
            // Seletores para elementos de imagem que podem representar salas
            'image[id*="sala"]',
            'image[data-room]',
            'image[data-sala]'
        ];
        
        // Adiciona seletores dinâmicos para salas de 1 a 20
        for (let i = 1; i <= 20; i++) {
            selectors.push(
                `#sala${i}`, 
                `#room-${i}`, 
                `#sala-${i}`, 
                `[data-room="${i}"]`,
                `[data-sala="${i}"]`,
                `[data-name="sala${i}"]`,
                `[data-name="room-${i}"]`
            );
        }
        
        const buttons = [];
        const foundSelectors = new Set();
        
        selectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                console.log(`Seletor "${selector}" encontrou ${elements.length} elementos`);
                
                elements.forEach((el, index) => {
                    // Verifica se o elemento já foi adicionado
                    if (!buttons.some(b => b.element === el)) {
                        const buttonInfo = {
                            element: el,
                            selector: selector,
                            id: el.id || 'sem-id',
                            classList: Array.from(el.classList).join(' '),
                            tagName: el.tagName,
                            innerHTML: el.innerHTML.substring(0, 50) + (el.innerHTML.length > 50 ? '...' : '')
                        };
                        
                        buttons.push(buttonInfo);
                        foundSelectors.add(selector);
                        
                        // Remove event listeners antigos para evitar duplicação
                        const newEl = el.cloneNode(true);
                        el.parentNode.replaceChild(newEl, el);
                        
                        // Adiciona o evento de clique
                        newEl.addEventListener('click', handleRoomButtonClick);
                        newEl.style.cursor = 'pointer';
                        
                        // Adiciona feedback visual ao passar o mouse
                        newEl.addEventListener('mouseenter', () => {
                            newEl.style.filter = 'drop-shadow(0 0 8px rgba(64, 156, 255, 0.9))';
                        });
                        
                        newEl.addEventListener('mouseleave', () => {
                            newEl.style.filter = 'drop-shadow(0 0 5px rgba(64, 156, 255, 0.7))';
                        });
                        
                        console.log(`Botão ${index} adicionado:`, buttonInfo);
                    }
                });
            } catch (error) {
                console.error(`Erro ao processar seletor "${selector}":`, error);
            }
        });
        
        console.log(`Total de ${buttons.length} botões de sala configurados`);
        console.log('Seletores que encontraram elementos:', Array.from(foundSelectors));
        
        // Log detalhado dos botões encontrados
        if (buttons.length > 0) {
            console.log('Detalhes dos botões encontrados:');
            buttons.forEach((btn, i) => {
                console.log(`Botão ${i + 1}:`, {
                    id: btn.id,
                    classList: btn.classList,
                    tagName: btn.tagName,
                    selector: btn.selector,
                    preview: btn.innerHTML
                });
            });
        } else {
            console.warn('Nenhum botão de sala encontrado com os seletores padrão. Procurando manualmente...');
            
            // Tenta encontrar elementos manualmente para depuração
            const allElements = document.querySelectorAll('*');
            const potentialButtons = [];
            
            allElements.forEach(el => {
                const id = el.id || '';
                const text = (el.textContent || '').trim();
                
                // Verifica se parece ser um botão de sala
                if ((/sala\s*\d+/i.test(id) || /sala\s*\d+/i.test(text) || 
                     /room\s*\d+/i.test(id) || /room\s*\d+/i.test(text)) &&
                    !buttons.some(b => b.element === el)) {
                    
                    potentialButtons.push({
                        element: el,
                        id: id,
                        text: text,
                        tagName: el.tagName,
                        classList: Array.from(el.classList).join(' ')
                    });
                }
            });
            
            console.log(`${potentialButtons.length} botões potenciais encontrados manualmente:`, potentialButtons);
            
            // Se encontrou botões manualmente, tenta configurá-los
            if (potentialButtons.length > 0) {
                potentialButtons.forEach(btnInfo => {
                    try {
                        const el = btnInfo.element;
                        const newEl = el.cloneNode(true);
                        el.parentNode.replaceChild(newEl, el);
                        
                        newEl.addEventListener('click', handleRoomButtonClick);
                        newEl.style.cursor = 'pointer';
                        
                        console.log(`Botão manual configurado:`, btnInfo);
                    } catch (error) {
                        console.error('Erro ao configurar botão manual:', error, btnInfo);
                    }
                });
            }
        }
        
        // Tenta novamente após um curto período para garantir que todos os botões foram capturados
        if (buttons.length < 10) { // Se não encontrou todas as 10 salas
            console.warn(`Apenas ${buttons.length} botões encontrados. Tentando novamente em 500ms...`);
            
            // Limpa qualquer timeout anterior para evitar múltiplas tentativas simultâneas
            if (window.roomButtonsSetupTimeout) {
                clearTimeout(window.roomButtonsSetupTimeout);
            }
            
            // Configura uma nova tentativa
            window.roomButtonsSetupTimeout = setTimeout(() => {
                console.log('Tentando novamente configurar os botões...');
                setupRoomButtons();
            }, 500);
        } else {
            console.log(`✅ ${buttons.length} botões de sala configurados com sucesso!`);
            
            // Verifica se as salas 5 a 10 estão configuradas
            const roomIds = buttons.map(btn => {
                const id = btn.element.id || '';
                const roomMatch = id.match(/\d+/);
                return roomMatch ? parseInt(roomMatch[0], 10) : null;
            }).filter(id => id !== null);
            
            console.log('IDs de sala encontrados:', roomIds.sort((a, b) => a - b));
            
            // Verifica se as salas 5 a 10 estão presentes
            const missingRooms = [];
            for (let i = 5; i <= 10; i++) {
                if (!roomIds.includes(i)) {
                    missingRooms.push(i);
                }
            }
            
            if (missingRooms.length > 0) {
                console.warn(`⚠️ Salas não encontradas: ${missingRooms.join(', ')}`);
                
                // Tenta uma última busca mais abrangente
                if (buttons.length < 15) { // Se ainda faltam muitas salas
                    console.log('Realizando busca mais abrangente...');
                    findAndSetupRoomButtons();
                }
            } else {
                console.log('✅ Todas as salas de 5 a 10 foram encontradas e configuradas!');
            }
        }
    }
    
    // Função para encontrar e configurar botões de sala de forma mais abrangente
    function findAndSetupRoomButtons() {
        console.log('Realizando busca abrangente por botões de sala...');
        
        // Seleciona todos os elementos que podem ser botões de sala
        const allElements = document.querySelectorAll('*');
        const potentialButtons = [];
        
        allElements.forEach(el => {
            // Verifica várias propriedades para identificar botões de sala
            const id = el.id || '';
            const text = (el.textContent || '').trim();
            const className = el.className || '';
            const dataRoom = el.getAttribute('data-room') || el.getAttribute('data-sala') || '';
            const dataName = el.getAttribute('data-name') || '';
            const title = el.getAttribute('title') || '';
            
            // Verifica se o elemento parece ser um botão de sala
            const isRoomButton = 
                /sala\s*\d+/i.test(id) || 
                /room\s*\d+/i.test(id) ||
                /sala\s*\d+/i.test(text) || 
                /room\s*\d+/i.test(text) ||
                /sala\s*\d+/i.test(className) ||
                /room\s*\d+/i.test(className) ||
                /sala\s*\d+/i.test(dataRoom) ||
                /room\s*\d+/i.test(dataRoom) ||
                /sala\s*\d+/i.test(dataName) ||
                /room\s*\d+/i.test(dataName) ||
                /sala\s*\d+/i.test(title) ||
                /room\s*\d+/i.test(title);
            
            if (isRoomButton) {
                potentialButtons.push({
                    element: el,
                    id: id,
                    text: text,
                    className: className,
                    dataRoom: dataRoom,
                    dataName: dataName,
                    title: title,
                    tagName: el.tagName
                });
            }
        });
        
        console.log(`Encontrados ${potentialButtons.length} botões potenciais na busca abrangente:`, potentialButtons);
        
        // Configura os botões encontrados
        potentialButtons.forEach(btnInfo => {
            try {
                const el = btnInfo.element;
                
                // Verifica se o elemento já tem um event listener de clique
                if (!el.hasAttribute('data-room-button-configured')) {
                    const newEl = el.cloneNode(true);
                    el.parentNode.replaceChild(newEl, el);
                    
                    newEl.addEventListener('click', handleRoomButtonClick);
                    newEl.style.cursor = 'pointer';
                    newEl.setAttribute('data-room-button-configured', 'true');
                    
                    // Adiciona feedback visual ao passar o mouse
                    newEl.addEventListener('mouseenter', () => {
                        newEl.style.filter = 'drop-shadow(0 0 8px rgba(64, 156, 255, 0.9))';
                    });
                    
                    newEl.addEventListener('mouseleave', () => {
                        newEl.style.filter = 'drop-shadow(0 0 5px rgba(64, 156, 255, 0.7))';
                    });
                    
                    console.log('Botão configurado na busca abrangente:', {
                        id: btnInfo.id,
                        tagName: btnInfo.tagName,
                        text: btnInfo.text,
                        className: btnInfo.className
                    });
                }
            } catch (error) {
                console.error('Erro ao configurar botão na busca abrangente:', error, btnInfo);
            }
        });
    }
    
    // Função para inicializar os botões após o carregamento dos dados
    function initializeButtonsAfterDataLoad() {
        console.log('Dados das salas carregados, configurando botões...');
        
        // Configura os botões das salas
        console.log('Iniciando configuração dos botões de sala...');
        setupRoomButtons();
        
        // Executa uma busca mais abrangente após um curto atraso
        setTimeout(findAndSetupRoomButtons, 500);
    }
    
    // Verifica se já temos dados carregados
    if (window.roomsData && window.roomsData.length > 0) {
        console.log('Dados das salas já carregados, inicializando botões...');
        initializeButtonsAfterDataLoad();
    } else {
        console.log('Aguardando carregamento dos dados das salas...');
        
        // Configura um listener para quando os dados forem carregados
        const onRoomsDataLoaded = (e) => {
            console.log('Evento roomsDataLoaded recebido', e.detail);
            if (e.detail && e.detail.success) {
                document.removeEventListener('roomsDataLoaded', onRoomsDataLoaded);
                initializeButtonsAfterDataLoad();
            }
        };
        
        // Adiciona o listener para o evento personalizado
        document.addEventListener('roomsDataLoaded', onRoomsDataLoaded);
        
        // Configura um timeout como fallback
        setTimeout(() => {
            if (window.roomsData && window.roomsData.length > 0) {
                console.log('Fallback: Dados carregados após timeout, inicializando botões...');
                initializeButtonsAfterDataLoad();
            } else {
                console.warn('Fallback: Nenhum dado de sala carregado após timeout, tentando configurar botões mesmo assim...');
                initializeButtonsAfterDataLoad();
            }
        }, 3000); // Timeout de 3 segundos
    }
    
    // Configura o clique fora do modal para fechá-lo
    if (roomView) {
        roomView.addEventListener('click', (e) => {
            if (e.target === roomView) {
                hideRoomDetails();
            }
        });
    }
    
    // Configura o botão de voltar
    if (backButton) {
        backButton.addEventListener('click', hideRoomDetails);
    }
}

// Mostra os detalhes da sala
function showRoomDetails(roomId) {
    const room = roomsData[roomId];
    if (!room) return;
    
    currentRoom = roomId;
    
    // Atualiza as informações da sala
    roomTitle.textContent = room.name || 'Sala Desconhecida';
    roomStatus.textContent = room.status === 'active' ? 'Ocupada' : 'Livre';
    roomStatus.className = 'room-status ' + (room.status === 'active' ? 'status-active' : 'status-inactive');
    roomSchedule.textContent = room.schedule || 'Horário não disponível';
    roomTeacher.textContent = room.teacher || 'Professor não disponível';
    roomSubject.textContent = room.subject || 'Disciplina não disponível';
    roomClass.textContent = room.class || 'Turma não disponível';
    roomStudents.textContent = room.students || 'N/A';
    
    // Mostra o modal
    roomView.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Rola para o topo
    roomView.scrollTo(0, 0);
}

// Esconde os detalhes da sala
function hideRoomDetails() {
    roomView.classList.remove('active');
    document.body.style.overflow = '';
    // Menu hambúrguer
    hamburgerMenu.addEventListener('click', toggleSidebar);
    
    // Fechar menu ao clicar no botão de fechar
    if (closeSidebar) {
        closeSidebar.addEventListener('click', toggleSidebar);
    }
    
    // Fechar menu ao clicar em um item
    document.querySelectorAll('.sidebar a').forEach(link => {
        link.addEventListener('click', toggleSidebar);
    });
    
    // Modais
    document.getElementById('status-btn').addEventListener('click', () => showModal('status'));
    document.getElementById('help-btn').addEventListener('click', () => showModal('help'));
    document.getElementById('notifications-btn').addEventListener('click', () => showModal('notifications'));
    document.getElementById('settings-btn').addEventListener('click', () => showModal('settings'));
    
    // Fechar modais
    if (closeStatusModal) closeStatusModal.addEventListener('click', () => hideModal('status'));
    if (closeHelpModal) closeHelpModal.addEventListener('click', () => hideModal('help'));
    if (closeNotificationsModal) closeNotificationsModal.addEventListener('click', () => hideModal('notifications'));
    if (closeSettingsModal) closeSettingsModal.addEventListener('click', () => hideModal('settings'));
    
    // Fechar modais ao clicar fora
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            hideModal();
        }
    });
}

// Alterna o menu lateral
function toggleSidebar() {
    isMenuOpen = !isMenuOpen;
    
    if (isMenuOpen) {
        hamburgerMenu.classList.add('active');
        sidebar.classList.add('active');
        document.body.style.overflow = 'hidden';
    } else {
        hamburgerMenu.classList.remove('active');
        sidebar.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Mostra um modal específico
function showModal(modalType) {
    hideAllModals();
    
    const modal = document.getElementById(`${modalType}-modal`);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    // Carrega dados específicos do modal, se necessário
    if (modalType === 'notifications') {
        loadNotifications();
    }
}

// Esconde todos os modais
function hideAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
    document.body.style.overflow = '';
}

// Esconde um modal específico
function hideModal(modalType) {
    if (modalType) {
        const modal = document.getElementById(`${modalType}-modal`);
        if (modal) {
            modal.style.display = 'none';
        }
    } else {
        hideAllModals();
    }
    
    document.body.style.overflow = '';
}

// Carrega as notificações
function loadNotifications() {
    // Implemente a lógica para carregar notificações aqui
    const notificationsList = document.getElementById('notifications-list');
    if (notificationsList) {
        // Exemplo de notificação estática
        notificationsList.innerHTML = `
            <div class="notification-item">
                <p>Nenhuma notificação recente</p>
                <span class="notification-time">Agora mesmo</span>
            </div>
        `;
    }
}

// Atualiza o status de uma sala
function updateRoomStatus(roomId, status) {
    if (roomsData[roomId]) {
        roomsData[roomId].status = status;
        updateMap();
        
        // Se a sala atual estiver aberta, atualiza os detalhes
        if (currentRoom === roomId) {
            showRoomDetails(roomId);
        }
    }
}

// Configura os eventos do Socket.IO
function setupSocketEvents() {
    if (!socket) return;
    
    // Quando receber uma atualização de sala
    socket.on('room_updated', (data) => {
        console.log('Sala atualizada:', data);
        if (data && data.room) {
            const roomIndex = window.roomsData.findIndex(r => r.id === data.room.id);
            if (roomIndex !== -1) {
                window.roomsData[roomIndex] = data.room;
                updateMap();
            }
        }
    });
    
    // Quando receber uma atualização de status
    socket.on('status_updated', (data) => {
        console.log('Status atualizado:', data);
        if (data && data.roomId && data.status) {
            const room = window.roomsData.find(r => r.id === data.roomId);
            if (room) {
                room.status = data.status;
                updateMap();
            }
        }
    });
    
    // Quando receber dados iniciais do servidor
    socket.on('initial_data', (data) => {
        console.log('Dados iniciais recebidos do servidor:', data);
        if (data && data.rooms) {
            window.roomsData = data.rooms;
            updateMap();
        }
    });
    
    // Quando uma sala for atualizada
    socket.on('room_status_updated', (data) => {
        console.log('Status da sala atualizado:', data);
        if (data && data.roomId) {
            // Atualiza o status da sala no localStorage
            const rooms = JSON.parse(localStorage.getItem('roomsData') || '[]');
            const roomIndex = rooms.findIndex(r => r.id === data.roomId);
            
            if (roomIndex !== -1) {
                rooms[roomIndex].status = data.status;
                rooms[roomIndex].ultimaAtualizacao = data.timestamp || new Date().toISOString();
                localStorage.setItem('roomsData', JSON.stringify(rooms));
                
                // Atualiza o mapa
                window.roomsData = rooms;
                updateMap();
            }
        }
    });
    
    // Quando várias salas forem atualizadas
    socket.on('rooms_updated', (data) => {
        console.log('Várias salas atualizadas:', data);
        if (data && data.rooms) {
            localStorage.setItem('roomsData', JSON.stringify(data.rooms));
            window.roomsData = data.rooms;
            updateMap();
        }
    });
    
    // Em caso de erro na conexão
    socket.on('connect_error', (error) => {
        console.error('Erro na conexão com o servidor:', error);
        // Tenta reconectar após 5 segundos
        setTimeout(() => socket.connect(), 5000);
    });
    
    // Quando desconectado
    socket.on('disconnect', (reason) => {
        console.log('Desconectado do servidor:', reason);
    });
}

// Atualiza o mapa quando os dados são carregados
window.addEventListener('rooms_loaded', () => {
    updateMap();
});

// Função auxiliar para animação de clique
function createRipple(event) {
    const button = event.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`;
    circle.style.top = `${event.clientY - button.getBoundingClientRect().top - radius}px`;
    circle.classList.add('ripple');
    
    const ripple = button.getElementsByClassName('ripple')[0];
    if (ripple) {
        ripple.remove();
    }
    
    button.appendChild(circle);
}

// Adiciona efeito de ripple nos botões quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.btn');
    if (buttons.length > 0) {
        buttons.forEach(button => {
            button.addEventListener('click', createRipple);
        });
    }
});
