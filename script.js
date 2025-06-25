// Dados iniciais das salas
window.rooms = window.rooms || [];
let selectedRoom = null;
let realTimeUpdates = [];
let unreadCount = 0;

// Estados disponíveis para as salas
const ROOM_STATUS = {
    AVAILABLE: 'Livre',
    OCCUPIED: 'Ocupada',
    MAINTENANCE: 'Manutenção',
    RESERVED: 'Reservada'
};

// Cores para os diferentes status
const STATUS_COLORS = {
    [ROOM_STATUS.AVAILABLE]: '#4CAF50',
    [ROOM_STATUS.OCCUPIED]: '#f44336',
    [ROOM_STATUS.MAINTENANCE]: '#FFA500',
    [ROOM_STATUS.RESERVED]: '#2196F3'
};

// Opções de status disponíveis
const AVAILABLE_STATUSES = Object.values(ROOM_STATUS);

// Inicializa o sistema quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('Sistema de gerenciamento de salas inicializado');
    
    // Inicializa o mapa de salas
    initRoomMap();
    
    // Configura o Socket.IO para atualizações em tempo real
    setupSocketListeners();
});

// Inicializa o mapa de salas
function initRoomMap() {
    const mapGrid = document.querySelector('.map-grid');

    if (!mapGrid) {
        // console.warn('Elemento ".map-grid" não encontrado. Ignorando initRoomMap().');
        return;
    }
    // Limpa o grid
    mapGrid.innerHTML = '';
    
    // Adiciona os botões das salas
    rooms.forEach(room => {
        const button = document.createElement('button');
        button.className = `room-button ${room.status === 'Ocupada' ? 'occupied' : ''}`;
        button.innerHTML = `
            <span class="room-name">${room.name}</span>
            <span class="room-status">${room.status}</span>
        `;
        
        button.addEventListener('click', () => selectRoom(room.id));
        mapGrid.appendChild(button);
    });
}

// Seleciona uma sala para visualizar/editar
function selectRoom(roomId) {
    selectedRoom = rooms.find(r => r.id === roomId);
    updateRoomInfo(selectedRoom);
    
    // Atualiza a classe ativa nos botões
    document.querySelectorAll('.room-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const selectedBtn = document.querySelector(`.room-button:nth-child(${roomId})`);
    if (selectedBtn) {
        selectedBtn.classList.add('active');
    }
}

// Atualiza as informações da sala selecionada
function updateRoomInfo(room) {
    const roomInfo = document.getElementById('roomInfo');
    
    if (!room) {
        roomInfo.innerHTML = '<p>Nenhuma sala selecionada</p>';
        return;
    }
    
    roomInfo.innerHTML = `
        <h3>${room.name}</h3>
        <p><strong>Status:</strong> ${room.status}</p>
        <p><strong>Capacidade:</strong> ${room.capacity} pessoas</p>
        <p><strong>Descrição:</strong> ${room.description}</p>
        
        <div class="room-actions">
            <button class="btn-edit" onclick="editRoom(${room.id})">
                Editar Status
            </button>
        </div>
    `;
}

// Função para editar o status da sala
function editRoom(roomId) {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;
    
    const newStatus = prompt('Novo status da sala (Livre, Ocupada, Manutenção):', room.status);
    
    if (newStatus && newStatus !== room.status) {
        // Atualiza o status da sala
        room.status = newStatus;
        
        // Atualiza a interface
        updateRoomInfo(room);
        
        // Atualiza o botão da sala
        const roomButton = document.querySelector(`.room-button:nth-child(${roomId})`);
        if (roomButton) {
            roomButton.classList.remove('occupied', 'active');
            if (newStatus === 'Ocupada') {
                roomButton.classList.add('occupied');
            }
            
            // Atualiza o texto do status
            const statusElement = roomButton.querySelector('.room-status');
            if (statusElement) {
                statusElement.textContent = newStatus;
            }
        }
        
        // Aqui você pode adicionar o código para enviar a atualização para o servidor
        console.log(`Status da sala ${room.name} atualizado para: ${newStatus}`);
    }
}

// Configura os listeners do Socket.IO
function setupSocketListeners() {
    // Exemplo de como configurar atualizações em tempo real
    // Substitua pelo seu código real de Socket.IO
    console.log('Configurando listeners do Socket.IO...');
    
    // Exemplo de como receber atualizações
    // socket.on('roomUpdated', (updatedRoom) => {
    //     const index = rooms.findIndex(r => r.id === updatedRoom.id);
    //     if (index !== -1) {
    //         rooms[index] = { ...rooms[index], ...updatedRoom };
    //         if (selectedRoom && selectedRoom.id === updatedRoom.id) {
    //             updateRoomInfo(rooms[index]);
    //         }
    //     }
    // });
}

// Torna as funções disponíveis globalmente
window.selectRoom = selectRoom;
window.editRoom = editRoom;

// Inicializa o sistema quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('Sistema de gerenciamento de salas inicializado');
    
    // Inicializa o mapa de salas
    initRoomMap();
    
    // Configura o Socket.IO para atualizações em tempo real
    setupSocketListeners();
});

// Função para criar o modal de notificações
function createNotificationModal() {
        const modalHTML = `
            <div id="notificationModal" class="notification-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Atualizações em Tempo Real</h3>
                        <span class="close-modal">&times;</span>
                    </div>
                    <div class="modal-body" id="updatesContainer">
                        <p class="no-updates">Nenhuma atualização recente.</p>
                    </div>
                    <div class="modal-footer">
                        <button id="closeModalBtn" class="btn-close">Fechar</button>
                    </div>
                </div>
            </div>
            <div class="modal-overlay" id="modalOverlay"></div>`;

        // Adiciona o modal ao corpo do documento
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Configura os event listeners do modal
        setupModalListeners();
    }
    
    // Função para configurar os listeners do modal
    function setupModalListeners() {
        const modal = document.getElementById('notificationModal');
        const closeBtn = document.querySelector('.close-modal');
        const closeBtnFooter = document.getElementById('closeModalBtn');
        const overlay = document.getElementById('modalOverlay');
        
        if (!modal || !closeBtn || !closeBtnFooter || !overlay) return;
        
        // Fechar modal ao clicar no botão de fechar
        closeBtn.addEventListener('click', toggleNotificationModal);
        closeBtnFooter.addEventListener('click', toggleNotificationModal);
        
        // Fechar modal ao clicar no overlay
        overlay.addEventListener('click', toggleNotificationModal);
        
        // Fechar modal ao pressionar ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                toggleNotificationModal();
            }
        });
    }
    
    // Função para tocar som de notificação
    function playNotificationSound() {
        try {
            if (!notificationSound) {
                notificationSound = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU' + 
                    '=='); // Short beep sound
                notificationSound.volume = 0.3;
            }
            notificationSound.currentTime = 0;
            notificationSound.play().catch(e => console.warn('Não foi possível reproduzir som:', e));
        } catch (e) {
            console.warn('Erro ao reproduzir som:', e);
        }
    }

    // Função para adicionar uma nova atualização
    function addUpdate(message, type = 'info') {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        const isModalOpen = document.querySelector('.notification-modal.show') !== null;
        
        const newNotification = {
            id: Date.now(),
            time: timeString,
            message: message,
            type: type,
            read: isModalOpen,
            timestamp: now.getTime()
        };
        
        realTimeUpdates.unshift(newNotification);
        
        // Limita o histórico a 50 itens
        if (realTimeUpdates.length > 50) {
            realTimeUpdates = realTimeUpdates.slice(0, 50);
        }
        
        // Atualiza o contador de não lidas se o modal não estiver aberto
        if (!isModalOpen) {
            unreadCount++;
            updateUnreadBadge();
            playNotificationSound(); // Toca o som apenas para notificações não lidas
        }
        
        updateUpdatesList();
        
        // Dispara evento personalizado para notificar sobre a nova atualização
        document.dispatchEvent(new CustomEvent('notificationAdded', { 
            detail: newNotification 
        }));
        
        return newNotification.id;
    }
    
    // Função para marcar notificação como lida
    function markAsRead(notificationId) {
        const notification = realTimeUpdates.find(n => n.id === notificationId);
        if (notification && !notification.read) {
            notification.read = true;
            unreadCount = Math.max(0, unreadCount - 1);
            updateUnreadBadge();
            return true;
        }
        return false;
    }

    // Função para marcar todas as notificações como lidas
    function markAllAsRead() {
        let hasUnread = false;
        realTimeUpdates.forEach(update => {
            if (!update.read) {
                update.read = true;
                hasUnread = true;
            }
        });
        
        if (hasUnread) {
            unreadCount = 0;
            updateUnreadBadge();
            updateUpdatesList();
        }
        
        return hasUnread;
    }

    // Função para atualizar a lista de atualizações na interface
    function updateUpdatesList() {
        const updatesList = document.getElementById('updatesContainer');
        if (!updatesList) return;
        
        if (realTimeUpdates.length === 0) {
            updatesList.innerHTML = '<p class="no-updates">Nenhuma atualização recente</p>';
            return;
        }
        
        updatesList.innerHTML = realTimeUpdates.map(update => {
            const itemClass = `update-item ${update.type} ${update.read ? '' : 'unread'}`;
            return `
                <div class="${itemClass}" data-id="${update.id}">
                    <div class="update-icon">
                        ${getNotificationIcon(update.type)}
                    </div>
                    <div class="update-content">
                        <span class="update-time">${update.time}</span>
                        <p class="update-message">${update.message}</p>
                    </div>
                </div>
            `;
        }).join('');
        
        // Adiciona listeners para marcar como lido ao clicar
        document.querySelectorAll('.update-item').forEach(item => {
            item.addEventListener('click', function() {
                const notificationId = parseInt(this.getAttribute('data-id'));
                if (markAsRead(notificationId)) {
                    this.classList.remove('unread');
                }
            });
        });
    }
    
    // Função auxiliar para obter o ícone da notificação
    function getNotificationIcon(type) {
        const icons = {
            'info': 'ℹ️',
            'success': '✅',
            'warning': '⚠️',
            'error': '❌'
        };
        return icons[type] || icons['info'];
    }
    
    // Função para atualizar o contador de não lidas no badge
    function updateUnreadBadge() {
        const badge = document.querySelector('.notification-badge');
        if (!badge) return;
        
        if (unreadCount > 0) {
            badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
            badge.style.display = 'flex';
            
            // Adiciona animação de pulso ao botão
            notificationButton.style.animation = 'pulse 0.5s';
            setTimeout(() => {
                notificationButton.style.animation = '';
            }, 500);
        } else {
            badge.style.display = 'none';
        }
    }
    
    // Atualiza a lista de notificações no modal
    function updateNotificationList() {
        const modalBody = document.querySelector('.modal-body');
        if (!modalBody) return;
        
        if (realTimeUpdates.length === 0) {
            modalBody.innerHTML = '<p class="no-updates">Nenhuma atualização recente</p>';
            return;
        }
        
        const updatesHtml = realTimeUpdates.map((update, index) => {
            const itemClass = update.read ? 'update-item' : 'update-item unread';
            return `
                <div class="${itemClass}" data-index="${index}">
                    <span class="update-time">${update.time}</span>
                    <p class="update-message">${update.message}</p>
                </div>
            `;
        }).join('');
        
        modalBody.innerHTML = updatesHtml;
    }
    
// Função para alternar a visibilidade do modal
function toggleNotificationModal() {
    const modal = document.getElementById('notificationModal');
    const overlay = document.getElementById('modalOverlay');
    const body = document.body;
    
    if (!modal || !overlay) {
        createNotificationModal();
        return;
    }
    
    const isOpening = !modal.classList.contains('show');
    
    if (isOpening) {
        // Mostrar modal
        modal.classList.add('show');
        overlay.classList.add('show');
        body.style.overflow = 'hidden';
        
        // Marcar todas como lidas ao abrir
        markAllAsRead();
        
        // Disparar evento personalizado
        document.dispatchEvent(new CustomEvent('notificationModalOpened'));
    } else {
        // Esconder modal
        modal.classList.remove('show');
        overlay.classList.remove('show');
        body.style.overflow = '';
        
        // Disparar evento personalizado
        document.dispatchEvent(new CustomEvent('notificationModalClosed'));
    }
}

// Configura os botões do modal
function setupModalButtons() {
    try {
        const modalFooter = document.querySelector('.modal-footer');
        if (!modalFooter) return;
        
        // Limpar botões existentes
        modalFooter.innerHTML = '';
        
        // Botão para marcar todas como lidas
        const markReadBtn = document.createElement('button');
        markReadBtn.className = 'btn-mark-read';
        markReadBtn.textContent = 'Marcar todas como lidas';
        markReadBtn.addEventListener('click', markAllAsRead);
        
        // Botão para limpar notificações
        const clearButton = document.createElement('button');
        clearButton.className = 'btn-clear';
        clearButton.textContent = 'Limpar todas';
        clearButton.addEventListener('click', () => {
            if (confirm('Tem certeza que deseja limpar todas as notificações?')) {
                realTimeUpdates = [];
                unreadCount = 0;
                updateUnreadBadge();
                updateNotificationList();
                document.dispatchEvent(new CustomEvent('notificationsCleared'));
            }
        });
        
        // Adicionar botões ao rodapé
        modalFooter.appendChild(markReadBtn);
        modalFooter.appendChild(clearButton);
        
        // Configurar fechamento do modal ao clicar fora
        const handleClickOutside = (e) => {
            const modal = document.getElementById('notificationModal');
            const button = document.getElementById('notificationButton');
            
            if (modal?.classList.contains('show') && 
                !modal.contains(e.target) && 
                !button?.contains(e.target)) {
                toggleNotificationModal();
            }
        };
        
        // Configurar fechamento do modal com a tecla ESC
        const handleKeyDown = (e) => {
            const modal = document.getElementById('notificationModal');
            if (e.key === 'Escape' && modal?.classList.contains('show')) {
                toggleNotificationModal();
            }
        };
        
        // Adicionar listeners de eventos
        document.addEventListener('click', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        
        // Retornar função de limpeza
        return () => {
            document.removeEventListener('click', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    } catch (error) {
        console.error('Erro ao configurar botões do modal:', error);
    }
}

// Function to play notification sound
function playNotificationSound() {
    try {
        const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU' + 'A'.repeat(1000));
        audio.volume = 0.3;
        audio.play().catch(e => console.warn('Error playing sound:', e));
    } catch (e) {
        console.warn('Error playing notification sound:', e);
    }
}

// Setup socket listeners
function setupSocketListeners() {
    const socket = window.socketManager ? window.socketManager.getSocket() : window.socket;
    
    if (!socket) {
        console.warn('Socket not available for setting up listeners');
        setTimeout(setupSocketListeners, 1000);
        return;
    }
    
    console.log('Setting up socket listeners...');
    
    // Room updated event
    socket.on('roomUpdated', (room) => {
        console.log('Room updated event received:', room);
        if (room?.name) {
            addUpdate(`Room ${room.name} has been updated`, 'info');
        }
    });
    
    // New reservation event
    socket.on('newReservation', (data) => {
        console.log('New reservation:', data);
        if (data?.room) {
            addUpdate(`New reservation for room ${data.room}`, 'success');
        }
    });
    
    // Reservation cancelled event
    socket.on('reservationCancelled', (data) => {
        console.log('Reservation cancelled:', data);
        if (data?.room) {
            addUpdate(`Reservation cancelled for room ${data.room}`, 'warning');
        }
    });
}

// Setup modal buttons
function setupModalButtons() {
    const modalFooter = document.querySelector('.modal-footer');
    if (!modalFooter) return;
    
    // Clear existing buttons
    modalFooter.innerHTML = '';
    
    // Mark all as read button
    const markReadBtn = document.createElement('button');
    markReadBtn.className = 'btn-mark-read';
    markReadBtn.textContent = 'Mark all as read';
    markReadBtn.addEventListener('click', markAllAsRead);
    
    // Clear notifications button
    const clearButton = document.createElement('button');
    clearButton.className = 'btn-clear';
    clearButton.textContent = 'Clear all';
    clearButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all notifications?')) {
            realTimeUpdates = [];
            unreadCount = 0;
            updateUnreadBadge();
            updateNotificationList();
            document.dispatchEvent(new CustomEvent('notificationsCleared'));
        }
    });
    
    // Add buttons to footer
    modalFooter.appendChild(markReadBtn);
    modalFooter.appendChild(clearButton);
}

// Inicializa o sistema de notificações
function initNotificationSystem() {
    // Cria o modal de notificações se não existir
    if (!document.getElementById('notificationModal')) {
        createNotificationModal();
    }
    
    // Configura os botões do modal
    setupModalButtons();
    
    // Configura os listeners do modal
    setupModalListeners();
    
    // Adiciona um listener para o botão de notificação
    const notificationButton = document.getElementById('notificationButton');
    if (notificationButton) {
        notificationButton.addEventListener('click', toggleNotificationModal);
    }
}

// Configura os listeners do Socket.IO
function setupSocketListeners() {
    // Verifica se o gerenciador de socket está disponível
    if (!window.socketManager) {
        console.warn('Socket manager não disponível');
        return;
    }
    
    const socket = window.socketManager.getSocket();
    if (!socket) {
        console.warn('Socket não disponível');
        return;
    }
    
    // Escuta por atualizações de sala
    socket.on('roomUpdated', (roomData) => {
        console.log('Sala atualizada:', roomData);
        // Atualiza a sala na interface
        const room = rooms.find(r => r.id === roomData.id);
        if (room) {
            Object.assign(room, roomData);
            // Se esta for a sala selecionada, atualiza suas informações
            if (selectedRoom && selectedRoom.id === roomData.id) {
                updateRoomInfo(room);
            }
            // Atualiza o botão da sala
            updateRoomButton(room);
            
            // Adiciona uma notificação
            addUpdate(`Sala ${room.name} atualizada: ${room.status}`, 'info');
        }
    });
    
    // Outros listeners do socket podem ser adicionados aqui
}

// Atualiza o botão de uma sala na interface
function updateRoomButton(room) {
    const button = document.querySelector(`.room-button[data-room-id="${room.id}"]`);
    if (button) {
        // Atualiza as classes do botão com base no status
        button.className = `room-button ${room.status === 'Ocupada' ? 'occupied' : ''}`;
        
        // Atualiza o texto do status
        const statusElement = button.querySelector('.room-status');
        if (statusElement) {
            statusElement.textContent = room.status;
        }
    }
}

// Socket Manager to handle socket connection
class SocketManager {
    constructor() {
        this.socket = null;
        this.initializeSocket();
    }

    initializeSocket() {
        try {
            if (window.io) {
                this.socket = io({
                    reconnection: true,
                    reconnectionAttempts: 5,
                    reconnectionDelay: 1000,
                    timeout: 20000
                });

                this.socket.on('connect', () => {
                    console.log('Socket connected');
                    if (typeof loadRoomsData === 'function') {
                        loadRoomsData();
                    }
                });

                this.socket.on('disconnect', () => {
                    console.log('Socket disconnected');
                });

                this.socket.on('connect_error', (error) => {
                    console.error('Socket connection error:', error);
                    setTimeout(() => this.socket.connect(), 5000);
                });

                window.socket = this.socket;
            }
        } catch (error) {
            console.error('Error initializing socket:', error);
            setTimeout(() => this.initializeSocket(), 5000);
        }
    }

    getSocket() {
        return this.socket;
    }
}

// Initialize socket manager when the script loads
if (!window.socketManager) {
    window.socketManager = new SocketManager();
}

// Start the notification system when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNotificationSystem);
} else {
    initNotificationSystem();
}
