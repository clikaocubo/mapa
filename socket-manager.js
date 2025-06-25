// Socket Manager - Gerencia a conexão Socket.IO
export default class SocketManager {
    constructor() {
        this.socket = null;
        this.initialize();
    }

    initialize() {
        try {
            if (typeof io === 'undefined') {
                console.error('Socket.IO não está disponível');
                return;
            }

            console.log('Inicializando Socket.IO...');
            
            // Cria uma nova instância do socket
            this.socket = io({
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                timeout: 20000
            });
            
            // Configura os event listeners do socket
            this.socket.on('connect', () => {
                console.log('Conectado ao servidor Socket.IO');
                if (typeof window.loadRoomsData === 'function') {
                    window.loadRoomsData();
                }
            });
            
            this.socket.on('disconnect', () => {
                console.log('Desconectado do servidor Socket.IO');
            });
            
            this.socket.on('connect_error', (error) => {
                console.error('Erro na conexão Socket.IO:', error);
                setTimeout(() => this.socket.connect(), 5000);
            });
            
            // Expõe o socket globalmente
            window.socket = this.socket;
            
        } catch (error) {
            console.error('Erro ao inicializar o socket:', error);
        }
    }

    // Método para obter a instância do socket
    getSocket() {
        return this.socket;
    }
}

// Inicializa o gerenciador de socket quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa o gerenciador de socket
    const socketManager = new SocketManager();
    
    // Expõe o gerenciador globalmente para acesso em outros arquivos
    window.socketManager = socketManager;
});
