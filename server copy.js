const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const routes = require("./routes")
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Enable CORS
app.use(cors());

app.use(routes)

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        // Broadcast received message to all clients

        wss.clients.forEach((client) => {

            if (client !== ws && client.readyState === WebSocket.OPEN) {

                client.send(message);
            }
        });
    });

    ws.send('Connected to WebSocket server');
});

server.listen(3002, () => {
    console.log('WebSocket server is running on ws://localhost:3002');
});
