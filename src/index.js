require('dotenv').config()
const express = require('express');
const { route } = require('express/lib/application');
const bodyParser = require('body-parser');
const wss = require( './services/websocket.service.js' );
const { Client, Pool } = require('pg');


// Express app
const app = express();
app.use(bodyParser.json({
    type: "*/*"
}));

server = app.listen(80);
server.on('upgrade', (request, socket, head) => {
	wss.handleUpgrade(request, socket, head, socket => {
		wss.emit('connection', socket, request);
	});
});


// Express routes
const router = express.Router();

router.use((req, res, next) => {
  res.header('Access-Control-Allow-Methods', 'GET');
  next();
});

router.get('/', (req, res) => {
  res.status(200).send('Ok');
});

router.post('/messages', (req, res) => {
	console.log("POST to messages",req.body);
	res.status(200).send('Ok');
});

app.use("", router)

// db listener
const client = new Client({
	host: process.env.DATABASE_HOST,
	user: process.env.DATABASE_USER,
	password: process.env.DATABASE_PASSWORD,
	database: process.env.DB_NAME,
});

client.connect().then(() => {
	console.log('setup listener');
	client.query('LISTEN guests');
});

client.on('notification', function (msg) {
	console.log(msg);
	wss.clients.forEach((wsClient) => {
		wsClient.send(JSON.stringify(msg));
	});
});