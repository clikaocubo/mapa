# Painel de Gerenciamento de Salas

Este é um sistema web para gerenciamento de salas, com painel administrativo, integração via WebSocket (Socket.IO) e comunicação em tempo real.

---

## 🚀 Pré-requisitos

Para rodar o projeto corretamente, você precisa ter:

- [Node.js](https://nodejs.org/) (versão 14 ou superior recomendada)
- [NPM](https://www.npmjs.com/) (instalado junto com o Node.js)
- Um navegador moderno (Chrome, Firefox, Edge)
- O arquivo **`socket.io.js`** no caminho **`C:\socket.io\socket.io.js`**

> ⚠️ O projeto depende do arquivo `socket.io.js` estar disponível localmente em `C:\socket.io`. Certifique-se de que esse caminho existe e o arquivo está presente.

---

## 📁 Estrutura do projeto

- `index.html`: interface principal do painel de salas
- `admin.html`: painel de administração das salas
- `script.js`: script principal da aplicação
- `socket-manager.js`: gerenciador de conexão WebSocket
- `server.js` servidor Node.js

---

## ⚙️ Como executar o projeto localmente

### 🔹 No terminal, execute:

```
npm install
node server.js
```

---

### 🔹 Acesse:

```
http://localhost:80/login.html
http://localhost:80/admin.html
http://localhost:80
```

## 🚀 Como implantar no Square Cloud

1. Certifique-se de que todos os arquivos do projeto estão prontos
2. Crie um arquivo ZIP com todos os arquivos (exceto a pasta `node_modules`)
3. Acesse o [Painel do Square Cloud](https://squarecloud.app/dashboard)
4. Clique em "Upload App" e selecione o arquivo ZIP
5. Aguarde a implantação ser concluída

### 🔧 Configurações do Square Cloud
Crie um arquivo chamado `.app` na raiz do projeto com o seguinte conteúdo:

```json
{
  "main": "server.js",
  "memory": 100,
  "description": "Mapa Interativo de Salas",
  "autoRestart": true,
  "start": "node server.js"
}
```

Isso configurará:
- **Main File**: `server.js`
- **Auto Restart**: Ativado
- **Port**: 80 (configurado automaticamente)
- **Host**: 0.0.0.0 (configurado automaticamente)