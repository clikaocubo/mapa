const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const session = require('express-session');
const fs = require('fs');
const cors = require('cors');

// Configuração do servidor
const HOST = '0.0.0.0'; // Permite acesso de qualquer IP na rede local
const PORT = process.env.PORT || 3000; // Usa a porta definida nas variáveis de ambiente ou 3000

const app = express();
const server = http.createServer(app);

// Middleware para servir arquivos estáticos
app.use(express.static(__dirname));

// Configuração do CORS
app.use(cors({
    origin: '*', // Em produção, substitua pelo domínio correto
    methods: ['GET', 'POST'],
    credentials: true
}));

// Configuração do Socket.IO com CORS
const io = socketIo(server, {
    cors: {
        origin: '*', // Em produção, substitua pelo domínio correto
        methods: ['GET', 'POST']
    },
    pingTimeout: 60000,
    pingInterval: 25000
});



// Configuração do middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use(session({
  secret: 'mapa-interativo-admin-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 3600000 } // 1 hora
}));

// Arquivo de dados das salas (simulando um banco de dados)
const DATA_FILE = path.join(__dirname, 'rooms_data.json');

// Função para inicializar o arquivo de dados se não existir
function initDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
      rooms: [
        {
          id: 'sala1',
          nome: 'Sala 1',
          status: 'ativo',
          palestrante: 'Allan',
          statusTempo: 'No horário',
          horarioInicio: '09:00',
          horarioFim: '10:00',
          capacidade: 30,
          ocupacao: 15,
          temperatura: 22,
          descricao: 'Sala de reuniões principal',
          responsavel: 'João Silva',
          ultimaAtualizacao: new Date().toISOString()
        },
        {
          id: 'sala2',
          nome: 'Sala 2',
          status: 'ativo',
          palestrante: 'Allan',
          statusTempo: 'No horário',
          horarioInicio: '11:00',
          horarioFim: '12:00',
          capacidade: 20,
          ocupacao: 0,
          temperatura: 21,
          descricao: 'Sala de treinamento',
          responsavel: 'Maria Oliveira',
          ultimaAtualizacao: new Date().toISOString()
        }
      ]
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
  }
}

// Inicializa o arquivo de dados
initDataFile();

// Função para ler dados das salas
function getRoomsData() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao ler dados das salas:', error);
    return { rooms: [] };
  }
}

// Função para salvar dados das salas
function saveRoomsData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Erro ao salvar dados das salas:', error);
    return false;
  }
}

// Middleware para verificar autenticação do admin
function isAuthenticated(req, res, next) {
  if (req.session.isAdmin) {
    return next();
  }
  res.redirect('/admin/login');
}

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota para obter dados das salas
app.get('/api/rooms', (req, res) => {
  try {
    const data = getRoomsData();
    console.log('Dados das salas enviados:', data.rooms.length, 'salas encontradas');
    res.json(data.rooms);
  } catch (error) {
    console.error('Erro ao buscar dados das salas:', error);
    res.status(500).json({ error: 'Erro ao carregar dados das salas' });
  }
});

// Rota para login do admin
app.get('/admin/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin_login.html'));
});

// Rota para processar login
app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  // Credenciais simples para demonstração (em produção, use um sistema mais seguro)
  if (username === 'admin' && password === 'admin123') {
    req.session.isAdmin = true;
    res.redirect('/admin');
  } else {
    res.redirect('/admin/login?error=1');
  }
});

// Rota para painel de admin
app.get('/admin', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Rota para logout
app.get('/admin/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

// API para obter dados das salas (admin)
app.get('/api/admin/rooms', isAuthenticated, (req, res) => {
  const data = getRoomsData();
  res.json(data.rooms);
});

// API para atualizar uma sala em tempo real
app.put('/api/admin/rooms/:id', isAuthenticated, (req, res) => {
  const roomId = req.params.id;
  const updatedRoom = req.body;
  
  const data = getRoomsData();
  const roomIndex = data.rooms.findIndex(room => room.id === roomId);
  
  if (roomIndex === -1) {
    return res.status(404).json({ error: 'Sala não encontrada' });
  }
  
  // Atualiza os dados da sala
  data.rooms[roomIndex] = { ...data.rooms[roomIndex], ...updatedRoom };
  
  if (saveRoomsData(data)) {
    // Atualiza o timestamp da última atualização
    data.rooms[roomIndex].ultimaAtualizacao = new Date().toISOString();
            
    // Salva as alterações
    saveRoomsData(data);
            
    // Emite evento para todos os clientes conectados em tempo real
    io.emit('roomUpdated', data.rooms[roomIndex]);
    // Emite evento específico para edição em tempo real
    io.emit('roomDataUpdated', data.rooms[roomIndex]);
    res.json(data.rooms[roomIndex]);
  } else {
    res.status(500).json({ error: 'Erro ao salvar dados' });
  }
});

// API para adicionar uma nova sala - Funcionalidade removida conforme solicitado
app.post('/api/admin/rooms', isAuthenticated, (req, res) => {
  res.status(403).json({ error: 'Funcionalidade de adicionar salas foi desativada' });
});

// API para excluir uma sala
app.delete('/api/admin/rooms/:id', isAuthenticated, (req, res) => {
  const roomId = req.params.id;
  
  const data = getRoomsData();
  const roomIndex = data.rooms.findIndex(room => room.id === roomId);
  
  if (roomIndex === -1) {
    return res.status(404).json({ error: 'Sala não encontrada' });
  }
  
  // Remove a sala
  const deletedRoom = data.rooms.splice(roomIndex, 1)[0];
  
  if (saveRoomsData(data)) {
    // Emite evento para todos os clientes conectados
    io.emit('roomDeleted', { id: roomId });
    res.json({ success: true, id: roomId });
  } else {
    res.status(500).json({ error: 'Erro ao salvar dados' });
  }
});

// Configuração do Socket.IO
io.on('connection', (socket) => {
    const clientId = socket.id;
    console.log(`Novo cliente conectado: ${clientId}`);
    
    // Envia dados atualizados quando um cliente se conecta
    try {
        const data = getRoomsData();
        console.log(`Enviando dados iniciais para o cliente ${clientId}`, data.rooms);
        socket.emit('initialData', data.rooms);
    } catch (error) {
        console.error('Erro ao enviar dados iniciais:', error);
        socket.emit('error', { message: 'Erro ao carregar dados iniciais' });
    }
    
    // Evento quando um cliente se desconecta
    socket.on('disconnect', (reason) => {
        console.log(`Cliente ${clientId} desconectado:`, reason);
    });
    
    // Tratamento de erros
    socket.on('error', (error) => {
        console.error(`Erro no socket ${clientId}:`, error);
    });
    
    // Notificar todos os clientes sobre atualizações
    const notifyClients = () => {
        try {
            const updatedData = getRoomsData();
            io.emit('roomsUpdate', updatedData.rooms);
            console.log('Dados das salas atualizados para todos os clientes');
        } catch (error) {
            console.error('Erro ao notificar clientes sobre atualização:', error);
        }
    };
    
    // Exemplo de como notificar clientes quando os dados forem atualizados
    // Você deve chamar notifyClients() sempre que os dados das salas forem atualizados
});

// Iniciar o servidor
server.listen(PORT, HOST, () => {
  console.log(`Servidor rodando em http://${HOST}:${PORT}`);
});
