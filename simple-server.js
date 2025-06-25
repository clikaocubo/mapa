const express = require('express');
const path = require('path');
const http = require('http');

const app = express();
const server = http.createServer(app);

// Middleware para servir arquivos estáticos
app.use(express.static(__dirname));

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Inicia o servidor na porta 3000
const PORT = 3000;
const HOST = 'localhost';

server.listen(PORT, HOST, () => {
  console.log(`Servidor rodando em http://${HOST}:${PORT}`);
  console.log(`Diretório: ${__dirname}`);
}).on('error', (err) => {
  console.error('Erro ao iniciar o servidor:', err.code);
  if (err.code === 'EADDRINUSE') {
    console.error(`A porta ${PORT} já está em uso.`);
    console.error('Tente encerrar outros processos que possam estar usando esta porta.');
  } else {
    console.error('Detalhes do erro:', err);
  }
});
