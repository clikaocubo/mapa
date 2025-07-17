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
    // Lê o arquivo de forma síncrona
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    const jsonData = JSON.parse(data);
    
    // Garante que o formato do JSON está correto
    if (!jsonData.rooms || !Array.isArray(jsonData.rooms)) {
      console.warn('Formato inválido no arquivo rooms_data.json. Criando estrutura padrão...');
      const defaultData = { rooms: [] };
      fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    
    return jsonData;
  } catch (error) {
    console.error('Erro ao ler dados das salas. Criando arquivo padrão...', error);
    const defaultData = { rooms: [] };
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
}

// Função para salvar dados das salas
function saveRoomsData(data) {
  try {
    // Garante que o diretório existe
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Garante que estamos salvando no formato correto
    const dataToSave = Array.isArray(data) ? { rooms: data } : data;
    
    // Salva o arquivo
    fs.writeFileSync(DATA_FILE, JSON.stringify(dataToSave, null, 2));
    console.log('Dados das salas salvos com sucesso em:', DATA_FILE);
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

// Rota para o arquivo de configuração
app.get('/config.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'config.json'));
});

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota para servir o script.js
app.get('/script.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'script.js'));
});

// Rota para obter dados das salas
app.get('/api/rooms', (req, res) => {
  try {
    const data = getRoomsData();
    console.log(`Enviando dados de ${data.rooms.length} salas`);
    res.json(data.rooms);
  } catch (error) {
    console.error('Erro ao buscar dados das salas:', error);
    res.status(500).json({ error: 'Erro ao carregar dados das salas' });
  }
});

// Rota para recarregar os dados do arquivo (útil após edição manual)
app.get('/api/reload', (req, res) => {
  try {
    // Força a releitura do arquivo
    delete require.cache[require.resolve(DATA_FILE)];
    const data = getRoomsData();
    console.log(`Dados recarregados. ${data.rooms.length} salas disponíveis.`);
    res.json({ success: true, rooms: data.rooms });
  } catch (error) {
    console.error('Erro ao recarregar dados:', error);
    res.status(500).json({ error: 'Erro ao recarregar dados' });
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

// API para atualizar uma sala (simplificada para edição manual)
app.post('/api/rooms/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updatedRoom = req.body;
    
    const data = getRoomsData();
    const roomIndex = data.rooms.findIndex(room => room.id === id);
    
    if (roomIndex === -1) {
      return res.status(404).json({ error: 'Sala não encontrada' });
    }
    
    // Atualiza a sala com os novos dados
    data.rooms[roomIndex] = { 
      ...data.rooms[roomIndex], 
      ...updatedRoom,
      ultimaAtualizacao: new Date().toISOString()
    };
    
    // Salva as alterações no arquivo
    if (saveRoomsData(data)) {
      console.log(`Sala ${id} atualizada com sucesso`);
      res.json({ 
        success: true, 
        room: data.rooms[roomIndex] 
      });
    } else {
      throw new Error('Falha ao salvar as alterações');
    }
  } catch (error) {
    console.error('Erro ao atualizar sala:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao atualizar a sala',
      details: error.message 
    });
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
    // Notifica todos os clientes conectados sobre a atualização
    io.emit('roomDeleted', { id: roomId });
    res.json({ success: true, id: roomId });
  } else {
    res.status(500).json({ error: 'Erro ao salvar dados' });
  }
});

// Configuração do Socket.IO
io.on('connection', (socket) => {
  console.log('Novo cliente conectado:', socket.id);
  
  // Envia os dados iniciais para o cliente
  const initialData = getRoomsData();
  socket.emit('initial_data', initialData);
  
  // Sincroniza o localStorage do cliente com o servidor
  socket.on('sync_local_storage', (clientData) => {
    if (clientData && clientData.rooms) {
      console.log('Sincronizando dados do cliente com o servidor');
      const serverData = getRoomsData();
      
      // Atualiza os dados do servidor com as alterações mais recentes do cliente
      let hasChanges = false;
      clientData.rooms.forEach(clientRoom => {
        const serverRoomIndex = serverData.rooms.findIndex(r => r.id === clientRoom.id);
        if (serverRoomIndex !== -1) {
          const serverUpdate = new Date(serverData.rooms[serverRoomIndex].ultimaAtualizacao || 0);
          const clientUpdate = new Date(clientRoom.ultimaAtualizacao || 0);
          
          if (clientUpdate > serverUpdate) {
            serverData.rooms[serverRoomIndex] = clientRoom;
            hasChanges = true;
          }
        }
      });
      
      // Se houver alterações, salva no arquivo
      if (hasChanges) {
        saveRoomsData(serverData);
        io.emit('rooms_updated', { 
          rooms: serverData.rooms,
          timestamp: new Date().toISOString()
        });
      }
    }
  });
  
  // Atualiza o status de uma sala
  socket.on('update_room_status', (data) => {
    if (data && data.roomId && data.status) {
      const roomsData = getRoomsData();
      const roomIndex = roomsData.rooms.findIndex(r => r.id === data.roomId);
      
      if (roomIndex !== -1) {
        roomsData.rooms[roomIndex].status = data.status;
        roomsData.rooms[roomIndex].ultimaAtualizacao = new Date().toISOString();
        
        if (saveRoomsData(roomsData)) {
          // Notifica todos os clientes conectados sobre a atualização
          io.emit('room_status_updated', {
            roomId: data.roomId,
            status: data.status,
            timestamp: new Date().toISOString()
          });
        }
      }
    }
  });
  
  // Desconexão do cliente
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Iniciar o servidor
server.listen(PORT, HOST, () => {
  console.log(`Servidor rodando em http://${HOST}:${PORT}`);
});
