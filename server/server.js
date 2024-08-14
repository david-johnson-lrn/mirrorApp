const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const express = require('express');
const reports = require('./controllers/reportsRoute');
const assess = require('./controllers/assessRoute');
const author = require('./controllers/authorRoute');
const welcome = require('./controllers/welcomeRoute');
const cors = require('cors');
require('dotenv').config();


const PORT = process.env.PORT || 3001;


const app = express();

const server = http.createServer(app);

// Enable CORS
app.use(cors());

// parse requests of content-type: application/json
app.use(express.json());

// parse requests of content-type: application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.get('/welcome', async (req, res) => {
  try {
    console.log('Route /welcome has been called.');
    res.json(welcome());
  } catch (err) {
    res.status(500).json(err);
  }
});

app.get('/quiz-loader', async (req, res) => {
  try {
    console.log('Route /assess has been called.');
    res.json(assess());
  } catch (err) {
    res.status(500).json(err);
  }
});

app.get('/author-loader', async (req, res) => {
  try {
    console.log('Route /author has been called.');
    res.json(author());
  } catch (err) {
    res.status(500).json(err);
  }
});

app.get('/reports-loader', async (req, res) => {
  try {
    console.log('Route /reports has been called.');
    const quiz_user = req.headers.referer.slice(req.headers.referer.indexOf('=') + 1);
    res.json(reports(quiz_user));
  } catch (err) {
    res.status(500).json(err);
  }
});


app.post('/item', async (req, res) => {

  try {
    console.log('Request Body:', req.body);
    res.status(200).json({ message: 'Request received' });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json(err);
  }
});

// if in production then serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// All other GET requests not handled by the set routes will return the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    // Broadcast received message to all clients


    wss.clients.forEach((client) => {


      if (client !== ws && client.readyState === WebSocket.OPEN) {

        console.log(message)
        client.send(message);
      }
    });
  });

  ws.send('Connected to WebSocket server');
});

server.listen(3002, () => {
  console.log('WebSocket server is running on ws://localhost:3002');
});






app.listen(PORT, () => {
  console.log(
    `\n------------------------\n\nServer is running:   http://localhost:${PORT}      👀\n` +
    `\n------------------------\n`
  );
});
